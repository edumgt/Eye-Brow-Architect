# 프로젝트 요구사항 및 기획 요약 (Eye-Brow Architect)

이 문서는 **'Eye-Brow Architect'** 프로젝트의 핵심 목표, 주요 기능 및 기술 스택을 정리한 마스터 문서입니다. 전문가의 전공 지식과 AI 기술을 결합한 개인화 뷰티 솔루션을 지향합니다.

---

## 1. 프로젝트 개요
- **프로젝트 정의:** 개인화 AI 뷰티 솔루션 및 디자인 설계 도구.
- **핵심 가치:** 단순한 상담을 넘어 사용자의 얼굴형을 정밀 분석하고, 최적의 메이크업 가이드를 시각적으로 설계(Architect)합니다.
- **차별화 포인트:** EKS 기반의 분산 환경, Amazon Rekognition을 통한 정밀 진단, Canvas API를 활용한 가상 시뮬레이션 제공.

---

## 2. 주요 기능 리스트

### [회원 및 계정 관리]
- **얼굴 사진 등록:** 회원가입 시 분석을 위한 프로필 사진 등록 (선택 사항).
- **마이페이지:** 등록된 사진 수정 및 과거 AI 분석 이력(히스토리) 관리.

### [AI 정밀 진단 시스템]
- **특징점 추출:** Amazon Rekognition을 활용하여 눈매, 눈썹 위치 등 좌표 추출.
- **분석 알고리즘:** $1:1.5$ 황금비율 계산 및 5대 얼굴형(달걀, 둥근, 긴, 각진, 역삼각형) 판별.

### [메인 페이지 & 상담]
- **맞춤형 추천:** 사용자의 진단 데이터와 메이크업 스타일 간의 '궁합 점수' 및 개인화 매칭 결과 표시.
- **지능형 챗봇 (Lex):** TPO(시간, 장소, 상황)를 파악하며, **AWS Transcribe**를 통한 음성 상담 기능 지원.

### [가상 시뮬레이션 (Virtual Overlay) ⭐]
- **실시간 드로잉:** Canvas API를 활용하여 사용자 사진 위에 추천 가이드(눈썹/아이라인)를 직접 렌더링.
- **비교 기능:** 원본(Before)과 가이드 적용(After)을 한눈에 비교.

### [전문가 어드민 대시보드 ⭐]
- **데이터 관리:** 관리자가 새로운 메이크업 스타일 데이터를 직접 등록 및 관리.
- **로직 제어:** 분석 알고리즘의 가중치 및 추천 로직 설정을 실시간으로 제어.

---

## 3. 기술 스택 (Infrastructure & Tech Stack)

| 구분 | 주요 기술 / 서비스 |
| :--- | :--- |
| **Frontend** | React (Vite/JavaScript), Canvas API |
| **Backend** | Java/Spring Boot (Main), Python/FastAPI (AI/EKS) |
| **Cloud (AWS)** | VPC, EKS, Lambda, S3, RDS, Lex, Rekognition, Transcribe |
| **Database** | Amazon RDS (MySQL/PostgreSQL) |
| **DevOps** | Terraform (IaC), GitHub Actions (CI/CD), Blue-Green Deployment |

---

## 4. 핵심 전략 및 역량 증명
- **데이터 무결성:** Spring Boot의 `@Transactional`을 활용한 원자성 보장.
- **접근성 향상:** AWS Transcribe를 통한 음성 인식 기반의 '핸즈프리' 상담 인터페이스.
- **아키텍처 설계:** MSA 구조와 클라우드 네이티브 기술을 활용한 고가용성 인프라 운영.
