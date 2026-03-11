# 프로젝트 인프라 및 운영 계획 (Roadmap & Infrastructure)

이 문서는 **'Eye-Brow Architect'** 프로젝트의 전체 로드맵, AWS 인프라 구성, 그리고 데이터 운영 전략을 다룹니다.

---

## 1. 프로젝트 전체 로드맵
1. **분석 로직 구상:** $1:1.5$ 황금비율 및 5대 얼굴형 판별 알고리즘 확정.
2. **AWS 기초 인프라 (TA):** VPC, S3, **Amazon Lex**, **AWS Transcribe** 기본 설정.
3. **데이터 및 API 연결:** RDS 인스턴스 생성 및 Lambda(중계), Spring Boot(메인), FastAPI(AI) 연동.
4. **애플리케이션 개발:** React 기반 프론트엔드 및 MSA 기반 백엔드 개발.
5. **배포 자동화:** GitHub Actions 기반 블루-그린 무중단 배포 시스템 구축.

---

## 2. 전체 시스템 설계도 (Architecture Design)

| 서비스 구성요소 | 설계 및 역할 |
| :--- | :--- |
| **Amazon Lex** | 사용자 대화 인터페이스 및 텍스트/음성 정보 수집 |
| **AWS Transcribe** | 사용자의 음성 상담(TPO 설명 등)을 텍스트로 변환 (STT) |
| **AWS Lambda** | Lex/Transcribe와 백엔드 간의 데이터 중계 및 전처리 |
| **EKS (Computing)** | Python 분석 에이전트 운영 및 Auto Scaling 적용 |
| **Spring Boot** | 메인 서비스 로직, 회원 관리 및 DB 트랜잭션 처리 |
| **Amazon RDS** | 사용자 정보, 분석 결과, 메이크업 스타일 데이터 관리 |
| **Amazon S3** | 사용자 사진, 오디오 데이터(임시), 메이크업 가이드 이미지 보관 |

---

## 3. 데이터베이스 최종 설계 (RDS)

| 테이블명 | 주요 컬럼 (Column) | 목적 |
| :--- | :--- | :--- |
| **Users** | `user_id`, `email`, `profile_image`, `role` | 회원 정보 및 프로필 사진 관리 |
| **Analysis_Results** | `analysis_id`, `user_id`, `face_shape`, `coordinates` | AI 추출 좌표 및 얼굴형 진단 결과 |
| **Makeup_Styles** | `style_id`, `name`, `tags`, `image_url` | 스타일 데이터 및 추천용 태그 관리 |
| **System_Config** | `config_id`, `weight_value`, `logic_type` | 알고리즘 가중치 및 시스템 설정 제어 |

---

## 4. 포트폴리오 핵심 전략

### [데이터 무결성 (Transaction Management)]
- **원자성 보장:** 회원가입 시 '사용자 저장'과 '초기 분석 결과 저장'이 동시에 성공해야 함.
- **Spring Boot @Transactional:** 에러 발생 시 자동 Rollback을 통해 데이터 꼬임 방지 및 신뢰성 확보.

### [음성 인식 상담 (AWS Transcribe)]
- **접근성:** 긴 TPO 설명을 말로 편하게 전달할 수 있는 '핸즈프리' 인터페이스 구현.
- **인프라 설정:** Lambda에 Transcribe 호출 권한 부여 및 오디오 임시 저장을 위한 S3 경로 운영.

### [배포 및 운영 자동화]
- **무중단 배포:** 블루-그린 전략으로 업데이트 중에도 끊김 없는 서비스 제공.
- **Terraform:** IaC를 통해 인프라 구축의 재현성과 관리 효율성 증대.

---

## 5. 보안 및 모니터링
- **IAM Role:** 서비스 간 최소 권한 원칙(Principle of Least Privilege) 적용.
- **CloudWatch:** API 호출 빈도, 분석 서버 부하, DB 커넥션 등 실시간 모니터링 및 알림.
