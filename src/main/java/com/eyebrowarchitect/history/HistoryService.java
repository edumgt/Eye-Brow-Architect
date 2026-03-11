package com.eyebrowarchitect.history;

import com.eyebrowarchitect.analysis.RekognitionService;
import com.eyebrowarchitect.common.S3Service;
import com.eyebrowarchitect.user.MembershipService;
import com.eyebrowarchitect.user.User;
import com.eyebrowarchitect.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class HistoryService {
    private final AnalysisHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;
    private final MembershipService membershipService;
    private final RekognitionService rekognitionService;

    @org.springframework.beans.factory.annotation.Value("${ai.service.url:http://localhost:8000/analyze}")
    private String aiServiceUrl;

    @Transactional(readOnly = true)
    public List<AnalysisHistory> getHistoryList(Integer userId) {
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return historyRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional
    public AnalysisHistory saveHistory(Integer userId, AnalysisHistory history) {
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        history.setUser(user);
        return historyRepository.save(history);
    }

    @Transactional
    public void deleteHistory(Integer historyId) {
        historyRepository.deleteById(historyId);
    }

    @Transactional
    public void setMainHistory(Integer userId, Integer analysisId) {
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 기존 메인 해제 (일괄)
        historyRepository.findByUserAndIsLatestTrue(user)
                .forEach(h -> h.setLatest(false));

        // 새로운 메인 설정
        AnalysisHistory history = historyRepository.findById(Objects.requireNonNull(analysisId))
                .orElseThrow(() -> new RuntimeException("히스토리를 찾을 수 없습니다."));

        if (!Objects.equals(history.getUser().getUserId(), userId)) {
            throw new RuntimeException("본인의 히스토리만 메인으로 설정할 수 있습니다.");
        }

        history.setLatest(true);

        // User 엔티티의 faceImageUrl도 업데이트 (메인 사진으로 동기화)
        user.setFaceImageUrl(history.getImageUrl());
        user.setFaceShape(history.getFaceShape());
        user.setEyebrowCoords(history.getEyebrowCoords());

        historyRepository.save(history);
        userRepository.save(user);
    }

    @Transactional
    @SuppressWarnings("null")
    public AnalysisHistory uploadHistory(Integer userId, MultipartFile file) {
        log.info("[Analysis Start] User ID: {}, File: {}", userId, file.getOriginalFilename());

        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // Membership usage check
        membershipService.checkAndResetDailyUsage(user);
        if (!membershipService.canPerformAnalysis(user)) {
            log.warn("[Usage Limit] User {} exceeded daily limit", userId);
            throw new RuntimeException("일일 무료 분석 횟수(2회)를 초과했습니다. 멤버십을 업그레이드하세요!");
        }

        // --- [CRITICAL FIX] Read bytes once to prevent stream consumption ---
        byte[] sharedFileBytes;
        try {
            sharedFileBytes = file.getBytes();
            if (sharedFileBytes == null || sharedFileBytes.length == 0) {
                throw new RuntimeException("업로드된 파일이 비어 있습니다.");
            }
            log.info("[Data Prepared] Byte array size: {}", sharedFileBytes.length);
        } catch (IOException e) {
            log.error("[Data Failed] Failed to read file bytes: {}", e.getMessage());
            throw new RuntimeException("파일 데이터를 읽을 수 없습니다.");
        }

        String savedUrl = s3Service.uploadFile(sharedFileBytes, file.getOriginalFilename());
        log.info("[S3 Success] Image uploaded: {}", savedUrl);
        membershipService.incrementUsage(user);

        // Always set the newest upload as latest (기존 메인 일괄 해제)
        historyRepository.findByUserAndIsLatestTrue(user)
                .forEach(h -> h.setLatest(false));

        // --- Hybrid AI Analysis: Amazon Rekognition + MediaPipe ---
        String faceShape = "분석 실패 (기본값 설정)";
        String mockCoords = "{}";
        String recommendation = "분석 실패 (기본값 설정) 추천 스타일";

        try {
            // [1] Amazon Rekognition 호출
            log.info("[Step 1] Calling Amazon Rekognition...");
            String rekognitionInfo = null;
            try {
                software.amazon.awssdk.services.rekognition.model.DetectFacesResponse rekognitionResponse = rekognitionService
                        .detectFaces(sharedFileBytes);
                rekognitionInfo = rekognitionService.analyzeFaceShapeBasic(rekognitionResponse);
                log.info("[Step 1 Success] Rekognition Result: {}", rekognitionInfo);
                recommendation = "[" + rekognitionInfo + "] 상세 분석 진행 중...";
            } catch (Exception re) {
                log.error("[Step 1 Failed] Amazon Rekognition Error: {}", re.getMessage());
                recommendation = "Amazon AI 분석 실패: " + re.getMessage();
            }

            // [2] Python MediaPipe 호출
            log.info("[2] Calling Python MediaPipe Service (HttpClient) at: {}", aiServiceUrl);
            try {
                String boundary = "---" + System.currentTimeMillis();
                String fileName = file.getOriginalFilename();
                String contentType = file.getContentType();

                // Multipart 바디 수동 생성 (공유 바이트 사용)
                java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
                out.write(("--" + boundary + "\r\n").getBytes());
                out.write(("Content-Disposition: form-data; name=\"file\"; filename=\"" + fileName + "\"\r\n")
                        .getBytes());
                out.write(("Content-Type: " + contentType + "\r\n\r\n").getBytes());
                out.write(sharedFileBytes);
                out.write(("\r\n--" + boundary + "--\r\n").getBytes());
                byte[] bodyBytes = out.toByteArray();

                java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
                java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                        .uri(java.net.URI.create(aiServiceUrl))
                        .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                        .POST(java.net.http.HttpRequest.BodyPublishers.ofByteArray(bodyBytes))
                        .build();

                java.net.http.HttpResponse<String> httpResponse = client.send(request,
                        java.net.http.HttpResponse.BodyHandlers.ofString());

                if (httpResponse.statusCode() == 200) {
                    String responseBody = httpResponse.body();
                    java.util.Map<String, Object> responseMap = new com.fasterxml.jackson.databind.ObjectMapper()
                            .readValue(responseBody, java.util.Map.class);

                    if (responseMap.containsKey("error")) {
                        log.error("[Step 2 Error] AI Service Detail: {}", responseMap.get("error"));
                        faceShape = "분석 실패 (AI 처리 오류)";
                    } else {
                        faceShape = (String) responseMap.get("faceShape");
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

                        // [CRITICAL] 통합 좌표 저장 (눈썹 + 아이라인 + 얼굴 윤곽)
                        java.util.Map<String, Object> combinedCoords = new java.util.HashMap<>();
                        combinedCoords.put("eyebrows", responseMap.get("eyebrowCoords"));
                        combinedCoords.put("eyeliner", responseMap.get("eyelinerCoords"));
                        combinedCoords.put("faceOutline", responseMap.get("faceOutline"));
                        mockCoords = mapper.writeValueAsString(combinedCoords);

                        String aiRec = (String) responseMap.get("recommendation");
                        recommendation = (rekognitionInfo != null) ? "[" + rekognitionInfo + "] " + aiRec : aiRec;
                        log.info("[Step 2 Success] MediaPipe Result: {}", faceShape);
                    }
                } else {
                    log.error("[Step 2 Failed] HTTP Status: {}, Body: {}", httpResponse.statusCode(),
                            httpResponse.body());
                    faceShape = "분석 실패 (통신 오류 " + httpResponse.statusCode() + ")";
                }
            } catch (Exception me) {
                log.error("[Step 2 Failed] Python Service Exception: {}", me.getMessage(), me);
                if (faceShape.startsWith("분석 실패")) {
                    faceShape = "분석 실패 (AI 서버 연결 원활하지 않음)";
                }
            }
        } catch (Exception e) {
            log.error("[Critical Failure] AI Pipeline Error: {}", e.getMessage(), e);
            faceShape = "분석 실패 (치명적 오류)";
        }

        String advice = generateAnalysisAdvice(faceShape, mockCoords);

        AnalysisHistory history = AnalysisHistory.builder()
                .user(user)
                .imageUrl(savedUrl)
                .faceShape(faceShape)
                .eyebrowCoords(mockCoords)
                .recommendedDesign(faceShape + " 맞춤 디자인")
                .recommendedColor(null) // 하드코딩 제거 (사용자 요청)
                .recommendation(recommendation)
                .analysisAdvice(advice) // 지능형 조언 저장
                .isLatest(true)
                .build();

        AnalysisHistory saved = historyRepository.save(history);

        // Update User entity for global sync
        user.setFaceImageUrl(savedUrl);
        user.setFaceShape(faceShape);
        user.setEyebrowCoords(mockCoords);
        userRepository.save(user);

        return saved;
    }

    private String generateAnalysisAdvice(String faceShape, String coordStr) {
        if (coordStr == null || coordStr.isEmpty())
            return faceShape + "형 맞춤 가이드입니다.";

        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(coordStr);
            com.fasterxml.jackson.databind.JsonNode eyeliner = root.path("eyeliner");

            StringBuilder sb = new StringBuilder();
            sb.append("나혜님의 ").append(faceShape).append("을 위한 분석 결과입니다: ");

            switch (faceShape) {
                case "둥근 얼굴형" -> sb.append("눈썹 산을 높여서 얼굴을 더 갸름하게 연출해 보세요. ");
                case "긴 얼굴형" -> sb.append("가로로 긴 일자형 눈썹이 얼굴 길이를 보완해 줍니다. ");
                case "계란형" -> sb.append("자연스러운 아치형 눈썹으로 세련미를 더해 보세요. ");
                case "각진 얼굴형" -> sb.append("부드러운 곡선의 눈썹이 인상을 훨씬 유하게 만들어 줍니다. ");
                default -> sb.append("균형 잡힌 메이크업을 추천합니다. ");
            }

            if (eyeliner.has("left") && eyeliner.get("left").isArray() && eyeliner.get("left").size() > 7) {
                double innerY = eyeliner.get("left").get(0).path("y").asDouble();
                double outerY = eyeliner.get("left").get(7).path("y").asDouble();

                if (outerY > innerY + 0.005) {
                    sb.append("눈꼬리가 살짝 처진 눈매이므로, 라인을 끝에서 살짝 올려 그려 생기를 더해 보세요.");
                } else if (outerY < innerY - 0.005) {
                    sb.append("눈꼬리가 올라간 편이시네요. 라인을 수평으로 길게 빼면 훨씬 차분하고 깊은 눈매가 연출됩니다.");
                }
            }
            return sb.toString();
        } catch (Exception e) {
            return faceShape + "형에 최적화된 메이크업 가이드입니다.";
        }
    }
}
