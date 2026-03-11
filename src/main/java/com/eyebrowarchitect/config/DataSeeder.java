package com.eyebrowarchitect.config;

import com.eyebrowarchitect.design.MakeupPost;
import com.eyebrowarchitect.design.MakeupPostRepository;
import com.eyebrowarchitect.history.AnalysisHistory;
import com.eyebrowarchitect.history.AnalysisHistoryRepository;
import com.eyebrowarchitect.product.Product;
import com.eyebrowarchitect.product.ProductRepository;
import com.eyebrowarchitect.user.User;
import com.eyebrowarchitect.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.Objects;

@Configuration
public class DataSeeder {

        @Bean
        public CommandLineRunner initData(final MakeupPostRepository repository, final UserRepository userRepository,
                        final ProductRepository productRepository, final AnalysisHistoryRepository historyRepository) {
                return args -> {
                        // [1] 디자인 추천 데이터 시딩 (Makeup_Posts)
                        if (repository.count() == 0L) {
                                repository.save(Objects.requireNonNull(MakeupPost.builder()
                                                .targetFaceShape("긴 얼굴")
                                                .title("일자 눈썹")
                                                .description("긴 얼굴은 가로 선을 강조하는 일자 눈썹이 얼굴 길이를 보완해 줍니다.")
                                                .imageUrl("/guides/straight_brow.png")
                                                .makeupType("눈썹 추천")
                                                .build()));

                                repository.save(Objects.requireNonNull(MakeupPost.builder()
                                                .targetFaceShape("둥근 얼굴")
                                                .title("아치형 눈썹")
                                                .description("둥근 얼굴은 눈썹산을 살린 아치형 눈썹이 얼굴을 더 갸름하게 보이게 합니다.")
                                                .imageUrl("/guides/arch_brow.png")
                                                .makeupType("눈썹 추천")
                                                .build()));

                                repository.save(Objects.requireNonNull(MakeupPost.builder()
                                                .targetFaceShape("계란형")
                                                .title("기본 눈썹")
                                                .description("축복받은 계란형은 어떤 눈썹도 잘 어울리지만, 부드러운 곡선형을 추천합니다.")
                                                .imageUrl("/guides/basic_brow.png")
                                                .makeupType("눈썹 추천")
                                                .build()));

                                repository.save(Objects.requireNonNull(MakeupPost.builder()
                                                .targetFaceShape("각진 얼굴")
                                                .title("부드러운 아치형 눈썹")
                                                .description("각진 얼굴은 인상을 부드럽게 만들어주는 완만한 아치형 눈썹이 어울립니다.")
                                                .imageUrl("/guides/soft_arch_brow.png")
                                                .makeupType("눈썹 추천")
                                                .build()));
                        }

                        // [2] 추천 제품 데이터 확충
                        if (productRepository.count() <= 2L) { // 기존 2개 이하일 때만 추가
                                productRepository.save(Objects.requireNonNull(Product.builder()
                                                .name("베어 엣지 슬림 브로우")
                                                .brand("에스쁘아")
                                                .price(12000)
                                                .imageUrl("https://image.oliveyoung.co.kr/uploads/images/goods/10/0000/0015/0500/G000000150500_1.jpg")
                                                .recommendedColor("라이트 브라운")
                                                .productLink("https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=G000000150500")
                                                .build()));

                                productRepository.save(Objects.requireNonNull(Product.builder()
                                                .name("킬 브로우 오토 하드 브로우 펜실")
                                                .brand("클리오")
                                                .price(20000)
                                                .imageUrl("https://image.oliveyoung.co.kr/uploads/images/goods/10/0000/0014/0826/G000000140826_1.jpg")
                                                .recommendedColor("다크 브라운")
                                                .productLink("https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=G000000140826")
                                                .build()));

                                productRepository.save(Objects.requireNonNull(Product.builder()
                                                .name("스키니 메스 브로우 마스카라")
                                                .brand("릴리바이레드")
                                                .price(9000)
                                                .imageUrl("https://image.oliveyoung.co.kr/uploads/images/goods/10/0000/0014/0651/G000000140651_1.jpg")
                                                .recommendedColor("애쉬 브라운")
                                                .productLink("https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=G000000140651")
                                                .build()));

                                productRepository.save(Objects.requireNonNull(Product.builder()
                                                .name("헤비 로테이션 컬러링 브로우")
                                                .brand("키스미")
                                                .price(15000)
                                                .imageUrl("https://image.oliveyoung.co.kr/uploads/images/goods/10/0000/0013/0204/G000000130204_1.jpg")
                                                .recommendedColor("라이트 브라운")
                                                .productLink("https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=G000000130204")
                                                .build()));

                                productRepository.save(Objects.requireNonNull(Product.builder()
                                                .name("아이브로우 관리 핀셋")
                                                .brand("필리밀리")
                                                .price(4500)
                                                .imageUrl("https://image.oliveyoung.co.kr/uploads/images/goods/10/0000/0014/0523/G000000140523_1.jpg")
                                                .recommendedColor("다크 그레이")
                                                .productLink("https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=G000000140523")
                                                .build()));

                                productRepository.save(Objects.requireNonNull(Product.builder()
                                                .name("드로잉 아이브로우")
                                                .brand("에뛰드")
                                                .price(3000)
                                                .imageUrl("https://image.oliveyoung.co.kr/uploads/images/goods/10/0000/0012/0351/G000000120351_1.jpg")
                                                .recommendedColor("다크 그레이")
                                                .productLink("https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=G000000120351")
                                                .build()));

                                productRepository.save(Objects.requireNonNull(Product.builder()
                                                .name("이지 터치 오토 아이브로우")
                                                .brand("토니모리")
                                                .price(4000)
                                                .imageUrl("https://image.oliveyoung.co.kr/uploads/images/goods/10/0000/0011/0458/G000000110458_1.jpg")
                                                .recommendedColor("다크 브라운")
                                                .productLink("https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=G000000110458")
                                                .build()));

                                productRepository.save(Objects.requireNonNull(Product.builder()
                                                .name("프로 디자인 아이브로우 파우더")
                                                .brand("미샤")
                                                .price(14000)
                                                .imageUrl("https://image.oliveyoung.co.kr/uploads/images/goods/10/0000/0010/0987/G000000100987_1.jpg")
                                                .recommendedColor("애쉬 브라운")
                                                .productLink("https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=G000000100987")
                                                .build()));
                        }

                        // [3] 테스트 유저 및 분석 데이터 시딩 (userId 1로 고정되도록 초기화)
                        if (userRepository.count() == 0L) {
                                User user = userRepository.save(Objects.requireNonNull(User.builder()
                                                .email("test@example.com")
                                                .password("1234")
                                                .nickname("나혜")
                                                .faceShape("긴 얼굴")
                                                .faceImageUrl(
                                                                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop")
                                                .eyebrowCoords(
                                                                "{\"start\":{\"x\":150,\"y\":200},\"peak\":{\"x\":350,\"y\":120},\"end\":{\"x\":550,\"y\":200}}")
                                                .hairColor("Brown")
                                                .pupilColor("Dark Brown")
                                                .bio("안녕하세요, 테스트 유저입니다.")
                                                .build()));

                                // [4] 분석 히스토리 시딩
                                historyRepository.save(Objects.requireNonNull(AnalysisHistory.builder()
                                                .user(user)
                                                .faceShape("긴 얼굴")
                                                .eyebrowCoords(
                                                                "{\"start\":{\"x\":150,\"y\":200},\"peak\":{\"x\":350,\"y\":120},\"end\":{\"x\":550,\"y\":200}}")
                                                .imageUrl(
                                                                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop")
                                                .recommendedDesign("Bold Arch")
                                                .recommendedColor("다크 브라운")
                                                .isLatest(true)
                                                .build()));

                                historyRepository.save(Objects.requireNonNull(AnalysisHistory.builder()
                                                .user(user)
                                                .faceShape("달걀형")
                                                .eyebrowCoords(
                                                                "{\"start\":{\"x\":100,\"y\":150},\"peak\":{\"x\":300,\"y\":100},\"end\":{\"x\":500,\"y\":150}}")
                                                .imageUrl(
                                                                "https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=1000&auto=format&fit=crop")
                                                .recommendedDesign("Natural Chic")
                                                .recommendedColor("라이트 브라운")
                                                .isLatest(false)
                                                .build()));
                        }
                };
        }
}
