package com.eyebrowarchitect.design;

import com.eyebrowarchitect.product.Product;
import com.eyebrowarchitect.product.ProductRepository;
import com.eyebrowarchitect.user.User;
import com.eyebrowarchitect.user.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MakeupPostService {

    private final UserRepository userRepository;
    private final MakeupPostRepository makeupPostRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public DesignResponseDto getRecommendation(final Integer userId) {
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        final String faceShape = user.getFaceShape();
        if (faceShape == null || faceShape.isEmpty()) {
            throw new RuntimeException("얼굴형 분석 결과가 없습니다. 먼저 사진을 업로드해 주세요.");
        }

        MakeupPost post = makeupPostRepository.findByTargetFaceShape(faceShape)
                .orElseGet(() -> MakeupPost.builder()
                        .postId(-1)
                        .title("기본 추천 스타일")
                        .description("사용자의 얼굴형을 더 정밀하게 분석하여 곧 최적의 스타일을 추천해 드릴 예정입니다.")
                        .targetFaceShape(faceShape)
                        .imageUrl("/guides/basic_brow.png")
                        .build());

        // 1. 퍼스널 컬러 매칭 로직 (머리카락 색상 기준)
        String pencilColor = matchPencilColor(user.getHairColor());

        // 2. 해당 컬러의 추천 제품 목록 조회
        List<Product> products = productRepository.findByRecommendedColor(pencilColor);

        // 3. 지능형 맞춤 조언 생성
        String advice = generateTailoredAdvice(user.getFaceShape(), user.getEyebrowCoords());

        return DesignResponseDto.builder()
                .postId(post.getPostId())
                .targetFaceShape(post.getTargetFaceShape())
                .title(post.getTitle())
                .description(post.getDescription())
                .imageUrl(post.getImageUrl())
                .recommendedPencilColor(pencilColor)
                .products(products)
                .analysisAdvice(advice)
                .build();
    }

    @Transactional(readOnly = true)
    public List<DesignResponseDto> getAllPosts() {
        return makeupPostRepository.findAll().stream()
                .map(post -> DesignResponseDto.builder()
                        .postId(post.getPostId())
                        .targetFaceShape(post.getTargetFaceShape())
                        .title(post.getTitle())
                        .description(post.getDescription())
                        .imageUrl(post.getImageUrl())
                        .build())
                .collect(Collectors.toList());
    }

    private String matchPencilColor(String hairColor) {
        if (hairColor == null)
            return "다크 브라운"; // 기본값

        return switch (hairColor.toLowerCase()) {
            case "black", "dark" -> "다크 그레이";
            case "brown", "natural" -> "다크 브라운";
            case "light", "blonde" -> "라이트 브라운";
            case "ash", "grey" -> "애쉬 브라운";
            default -> "다크 브라운";
        };
    }

    private String generateTailoredAdvice(String faceShape, String coordStr) {
        if (coordStr == null || coordStr.isEmpty())
            return faceShape + "형에 어울리는 아이브로우 스타일을 추천드립니다.";

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(coordStr);
            JsonNode eyeliner = root.path("eyeliner");

            StringBuilder sb = new StringBuilder();
            sb.append("나혜님의 ").append(faceShape).append("을 위한 정밀 분석 결과입니다: ");

            // 1. 얼굴형별 기본 조언
            switch (faceShape) {
                case "둥근 얼굴형" -> sb.append("얼굴이 둥근 편이라 눈썹 산을 살짝 높게 잡으면 얼굴이 더 갸름해 보입니다. ");
                case "긴 얼굴형" -> sb.append("얼굴의 길이를 보완하기 위해 가로로 긴 일자형 눈썹을 추천합니다. ");
                case "계란형" -> sb.append("이상적인 얼굴형이므로 어떤 눈썹이든 잘 어울리지만, 자연스러운 아치형이 매력을 더해줍니다. ");
                case "각진 얼굴형" -> sb.append("각진 턱선을 부드러워 보이게 하려면 눈썹 산을 둥글게 굴려주세요. ");
                default -> sb.append("균형 잡힌 눈썹 매칭을 제안합니다. ");
            }

            // 2. 눈매 분석 (아이라인 좌표 활용)
            if (eyeliner.has("left") && eyeliner.get("left").isArray() && eyeliner.get("left").size() > 7) {
                JsonNode leftEye = eyeliner.get("left");
                double innerY = leftEye.get(0).path("y").asDouble(); // 33번 (안쪽)
                double outerY = leftEye.get(7).path("y").asDouble(); // 133번 (바깥쪽)

                if (outerY > innerY + 0.005) {
                    sb.append("현재 눈매가 살짝 처져 보이므로, 아이라인 꼬리를 5~10도 정도 위로 빼주시면 생기 있는 인상이 됩니다.");
                } else if (outerY < innerY - 0.005) {
                    sb.append("눈매가 올라간 편이시네요. 아이라인 꼬리를 수평보다 아주 살짝 낮게 내려 그려주시면 부드러운 눈매가 완성됩니다.");
                } else {
                    sb.append("눈매의 수평 밸런스가 아주 좋습니다. 눈매를 따라 자연스럽게 아이라인을 채워주세요.");
                }
            } else {
                sb.append("눈매 분석을 위해 더 정밀한 정면 사진을 활용하시면 더욱 디테일한 아이라인 상담이 가능합니다.");
            }

            return sb.toString();
        } catch (Exception e) {
            log.warn("Advice generation failed: {}", e.getMessage());
            return faceShape + "형에 최적화된 메이크업 가이드입니다.";
        }
    }
}
