package com.eyebrowarchitect.analysis;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.lexruntimev2.LexRuntimeV2Client;
import software.amazon.awssdk.services.lexruntimev2.model.RecognizeTextRequest;
import software.amazon.awssdk.services.lexruntimev2.model.RecognizeTextResponse;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

@Slf4j
@Service
@RequiredArgsConstructor
public class LexService {

    @Value("${amazon.lex.botId:DUMMY_BOT}")
    private String botId;

    @Value("${amazon.lex.botAliasId:DUMMY_ALIAS}")
    private String botAliasId;

    @Value("${amazon.lex.localeId:ko_KR}")
    private String localeId;

    @Value("${spring.cloud.aws.region.static:ap-northeast-2}")
    private String region;

    @Value("${spring.cloud.aws.credentials.access-key:NONE}")
    private String accessKey;

    @Value("${spring.cloud.aws.credentials.secret-key:NONE}")
    private String secretKey;

    private LexRuntimeV2Client lexClient;

    @PostConstruct
    public void init() {
        // 우선순위: application.properties > AWS_ACCESS_KEY_ID > AWS_ACCESS_KEY
        String finalAccessKey = !"NONE".equals(accessKey) ? accessKey : System.getenv("AWS_ACCESS_KEY_ID");
        if (finalAccessKey == null)
            finalAccessKey = System.getenv("AWS_ACCESS_KEY");

        String finalSecretKey = !"NONE".equals(secretKey) ? secretKey : System.getenv("AWS_SECRET_KEY");
        if (finalSecretKey == null)
            finalSecretKey = System.getenv("AWS_SECRET_ACCESS_KEY");
        if (finalSecretKey == null)
            finalSecretKey = System.getenv("AWS_SECRET_KEY");

        if (finalAccessKey != null && finalSecretKey != null && !finalAccessKey.isEmpty()
                && !"NONE".equals(finalAccessKey)) {
            log.info("AWS Lex 클라이언트를 명시적 자격 증명으로 초기화합니다. (BotID: {}, AliasID: {})",
                    botId, botAliasId);

            this.lexClient = LexRuntimeV2Client.builder()
                    .region(Region.of(region))
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(finalAccessKey.trim(), finalSecretKey.trim())))
                    .build();
        } else {
            log.info("AWS Lex 클라이언트를 기본 체인(IAM Role 등)으로 초기화합니다. (BotID: {}, AliasID: {})",
                    botId, botAliasId);
            this.lexClient = LexRuntimeV2Client.builder()
                    .region(Region.of(region))
                    .build();
        }
    }

    public String getResponse(String sessionId, String text) {
        log.info("Lex 요청 수신 [Session: {}, Text: {}]", sessionId, text);

        // 실제 AWS Lex 연동
        try {
            System.out.println(
                    "DEBUG: Lex Call Attempt - BotID: " + botId + ", AliasID: " + botAliasId + ", Text: " + text);
            RecognizeTextRequest request = RecognizeTextRequest.builder()
                    .botId(botId)
                    .botAliasId(botAliasId)
                    .localeId(localeId)
                    .sessionId("sid-" + sessionId)
                    .text(text)
                    .build();

            RecognizeTextResponse response = lexClient.recognizeText(request);

            String intentName = response.sessionState().intent().name();
            String state = response.sessionState().intent().state().toString();
            log.info("Lex 응답 수신 [Intent: {}, State: {}]", intentName, state);

            // 1. Lex가 직접 응답을 준 경우
            if (response.messages() != null && !response.messages().isEmpty()) {
                String botResponse = response.messages().get(0).content();
                log.info("Lex 제공 메시지: {}", botResponse);
                return botResponse;
            }

            // 2. Lex가 응답을 주지 못했지만 상태가 ReadyForFulfillment인 경우
            if ("ReadyForFulfillment".equals(state)) {
                log.info("대화가 성공적으로 완료단계(Fulfillment)에 도달했습니다.");
                return getHybridResponse(text);
            }

            // 3. 그 외의 경우 하이브리드 로직
            return getHybridResponse(text);

        } catch (Exception e) {
            System.out.println("DEBUG: Lex Call Failed!");
            e.printStackTrace(System.out);
            log.error("Lex 응답 중 오류 발생: {}", e.getMessage(), e);
            return "상담 서비스 연동 중 일시적인 문제가 발생했습니다. (AWS Lex Connection Error)";
        }
    }

    /**
     * Lex가 답변을 주지 못할 때 실행되는 지능형 하이브리드 답변 생성기
     */
    private String getHybridResponse(String text) {
        String cleanText = text.replaceAll("\\s", "");

        if (cleanText.contains("면접") || cleanText.contains("회사") || cleanText.contains("출근")) {
            return "나혜님의 얼굴형 분석 데이터에 기반하여 신뢰감을 주는 '하이 아치' 스타일의 **정밀 분석 좌표 가이드**를 오른쪽 화면에 배치했습니다. 점선을 따라 보정된 위치를 확인해 보세요. ✨";
        }
        if (cleanText.contains("데이트") || cleanText.contains("소개팅") || cleanText.contains("사랑")) {
            return "데이트를 위해 부드러운 느낌을 극대화한 '내추럴 롱 아치' 스타일의 **분석 좌표 가이드**를 설계했습니다. 오른쪽 스튜디오에서 나혜님의 눈썹분석 점들을 확인해 보실 수 있어요. ❤️";
        }
        if (cleanText.contains("분석") || cleanText.contains("결과") || cleanText.contains("내얼굴")) {
            return "나혜님의 기본 얼굴형 분석 결과는 상단 '분석 결과 요약 보기 📸'에서 확인 가능합니다. 저는 해당 데이터를 바탕으로 상황별 최적의 좌표 가이드를 제안해 드려요. 😊";
        }
        if (cleanText.contains("안녕") || cleanText.contains("하이") || cleanText.contains("누구")) {
            return "안녕하세요, 나혜님! 뷰티 아키텍트입니다. 나혜님만의 고유한 매력을 살려주는 정밀 분석 좌표와 메이크업 가이드를 제안해 드릴게요. 어떤 고민이 있으신가요? 😊";
        }

        // 기본 Fallback
        String[] fallbacks = {
                "오늘 가시는 곳이나 원하는 분위기를 말씀해 주시면, 나혜님께 딱 맞는 눈썹 분석 좌표 가이드를 로드해 드릴게요! ✨",
                "뷰티 아키텍트가 분석 중입니다. 어떤 메이크업이 고민이신지 알려주시면 전문적인 좌표 설계를 시작할게요. 😊",
                "나혜님의 매력을 살려줄 스타일을 찾고 있어요. '소개팅'이나 '출근' 같은 상황을 알려주시면 최적의 분석 좌표를 보여드릴게요. 🧐"
        };
        return fallbacks[(int) (Math.random() * fallbacks.length)];
    }

    @PreDestroy
    public void tearDown() {
        if (lexClient != null) {
            lexClient.close();
        }
    }
}
