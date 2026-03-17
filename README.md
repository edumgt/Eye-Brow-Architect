# Eye-Brow Architect: AI 기반 퍼스널 아이브로우 스타일링 솔루션

> **"당신만의 최적화된 아름다움을 설계합니다."**  
> Eye-Brow Architect는 AI 얼굴 분석 기술과 Amazon Lex 지능형 상담을 결합하여, 사용자의 얼굴형에 가장 어울리는 눈썹 스타일을 제안하고 가상 가이드를 제공하는 클라우드 네이티브 웹 애플리케이션입니다.

---

## 💡 프로젝트 동기: 전문 지식과 기술의 융합 (Vision & Fusion)

본 프로젝트는 **메이크업 전공자의 미적 감각**과 **웹 개발자의 기술력**을 결합한 탄탄한 도메인 지식 기반의 서비스입니다.  

*   **전문성의 확장**: 과거의 전문 지식을 버리는 것이 아닌, IT 기술로 재해석하여 나만이 만들 수 있는 독보적인 서비스를 목표로 했습니다.
*   **융합적 가치**: 정밀한 분석 알고리즘에는 전공자 특유의 미적 로직을, 시스템 구현에는 개발자로서의 집요한 노력을 담았습니다.
*   **진정성**: 비전공자로서 새로운 길을 걷고 있지만, 과거와 현재 모든 자리에서 최선을 다해온 저의 **'열정의 증명'**입니다.

---

## 1) 주요 기능 (Key Features)

1.  **지능형 뷰티 컨설팅 (Amazon Lex V2)**
    *   **Context-Aware 상담**: 사용자의 상황(면접, 데이트, 데일리 등)에 따라 Lex 봇이 의도(Intent)를 파악하여 최적화된 스타일 제안.
    *   **Multi-turn Dialog**: 자연어 처리를 통한 대화형 인터페이스를 통해 복잡한 요구사항도 단계별로 수집 및 처리.
    *   **Error Handling**: 사용자의 오입력에 대한 슬롯 필링(Slot Filling) 및 재질의 로직을 통한 매끄러운 사용자 경험 제공.

2.  **정밀 얼굴 분석 전문 엔진 (Python/FastAPI)**
    *   **Rekognition 연동**: AWS Rekognition을 사용하여 얼굴의 30개 이상 특징점(Landmarks) 및 회전 각도(Roll, Pitch, Yaw) 정밀 추출.
    *   **황금비율 알고리즘**: 추출된 좌표를 기반으로 눈썹, 눈, 콧망울 간의 $1:1.5$ 황금비율을 수학적으로 계산.
    *   **얼굴형 판별 시스템**: 분석된 데이터를 바탕으로 5대 주요 얼굴형(달걀형, 둥근형, 긴형, 각진형, 역삼각형)을 판정하고 최적의 스타일 매칭.

3.  **실시간 가상 메이크업 오버레이 (Virtual Overlay)**
    *   **Canvas Drawing**: React와 HTML5 Canvas API를 사용하여 사용자의 사진 위에 분석된 좌표 기반의 다이나믹 가이드라인 생성.
    *   **정밀 좌표 렌더링**: 분석된 눈썹의 시작점, 산, 끝점 좌표를 시각화하여 사용자가 오차 없이 메이크업을 할 수 있도록 보조.
    *   **비결 보기 (Overlay Toggle)**: 원본 사진과 분석 가이드라인이 적용된 시뮬레이션 결과를 실시간으로 비교 확인 가능.

4.  **클라우드 네이티브 아키텍처 (EKS/IaC/Security)**
    *   **Security-First Networking**: Public Subnet과 Private Subnet을 엄격히 분리하여 데이터 보호.
    *   **ALB Ingress Controller**: 모든 외부 트래픽을 Application Load Balancer(ALB)로 수용하여 경로 기반 라우팅 수행.
    *   **NAT Gateway**: Private Subnet 내의 자원들이 S3, Lex, Rekognition 등 외부 AWS 서비스와 안전하게 통신할 수 있는 아웃바운드 보안 통로 구축.
    *   **Infrastructure as Code (Terraform)**: 모든 클라우드 인프라를 코드로 관리하여 재현성 및 배포 안정성 극대화.

---

## 2) 시스템 아키텍처 (System Architecture)

![시스템 아키텍처](md/revised_architecture.png)

> **Security & Efficiency**: Public/Private 서브넷 분리와 ALB를 통한 트래픽 관리, NAT Gateway를 통한 보안 아웃바운드 통신을 지원하는 전문적인 클라우드 아키텍처입니다.

---

## 3) 기술 스택 (Tech Stack)

| Category | Technology |
| :--- | :--- |
| **Backend** | Java 21, Spring Boot 3.2.3, Python 3.12 (FastAPI), Maven |
| **Frontend** | React, JavaScript (ES6+), Vanilla CSS, HTML5 Canvas API |
| **Cloud (AWS)** | Amazon EKS, S3, RDS (MySQL), Lex V2, Rekognition, Lambda |
| **DevOps/Infra** | Terraform, Docker, Docker-Compose, GitHub Actions (CI/CD) |
| **Database** | MySQL 8.0, Hibernate/JPA (ORM), PostgreSQL (Compatibility) |

---

## 4) 환경 구분 (Environment)

*   **Local**: Docker Compose를 활용하여 전체 MSA 환경을 로컬 PC에서 1분 만에 구동.
*   **Dev (K8s)**: Minikube 또는 로컬 Kubernetes 환경에서 오버레이(Overlay) 설정을 통한 배포 테스트.
*   **Production (AWS EKS)**: 실제 도메인과 부하 분산(ALB)이 적용된 고가용성 운영 환경.

---

## 5) 개발환경 k8s 구성과 AWS 구성 구분

### 6-1. Dev Kubernetes
*   **Local Registry**: 로컬 이미지를 활용하여 빠른 개발 피드백 루프 생성.
*   **NodePort**: 외부 로드밸런서 없이 로컬 포트 포워딩을 통한 서비스 접근.

### 6-2. Amazon EKS (Production)
*   **Managed Node Groups**: AWS에서 최적화된 EC2 노드 그룹 운영.
*   **ALB Ingress Controller**: AWS 애플리케이션 로드밸런서와 연동하여 HTTPS 및 경로 기반 라우팅 지원.
*   **VPC CNI**: Pod에 실제 VPC IP를 할당하여 네트워킹 성능 최적화.

---

## 6) Docker 실행

### 7-1. 실행
```powershell
# 이미지 빌드 및 컨테이너 백그라운드 실행
docker-compose up -d --build
```

### 7-2. 접속 및 확인
*   **Frontend**: `http://localhost:3000` (React)
*   **Backend API**: `http://localhost:8080/api` (Spring Boot)
*   **AI Service**: `http://localhost:8000/docs` (FastAPI Swagger)

---

## 7) Kubernetes 실행 (Local/Dev)

로컬 개발 환경에서의 쿠버네티스 오케스트레이션 구동 방식입니다. 

### 8-1. Deployment & Service 배포
`kubectl apply`를 통해 프런트엔드, 백엔드, AI 서비스의 오브젝트를 생성합니다.
```powershell
kubectl apply -f AWS/eks_deployment.yaml
```

### 8-2. Ingress 설정 확인
외부 트래픽 진입점인 Ingress 상태를 모니터링합니다.
```powershell
kubectl get ingress
```

---

## 8) Amazon EKS 운영 가이드 (Production)

실제 AWS 운영 환경에서의 무중단 배포 및 확장을 위한 설정입니다.

### 9-1. 가용성 및 확장성 설정 (HPA)
트래픽 급증 시 Pod을 자동으로 확장하도록 설정되어 있습니다.
*   **HPA**: CPU 사용률 60% 이상 시 최대 10개까지 자동 확장.
*   **Node Groups**: t3.medium 인스턴스를 활용하여 안정적인 연산 성능 확보.

### 9-2. 이미지 빌드 및 푸시 자동화 스크립트
```powershell
# ECR 이미지 태깅 및 전송
docker build -t brow-architect-backend .
docker tag brow-architect-backend:latest [ACCOUNT_ID].dkr.ecr.ap-northeast-2.amazonaws.com/brow-architect-backend:latest
docker push [ACCOUNT_ID].dkr.ecr.ap-northeast-2.amazonaws.com/brow-architect-backend:latest
```

---

## 9) CI/CD 파이프라인 구성 (GitHub Actions)

본 프로젝트는 완성도 높은 CI/CD 환경을 구축하여 코드 변경 시 자동으로 배포됩니다.

1.  **Build**: Maven을 통한 Java 소스 빌드 및 Jar 생성.
2.  **Dockerization**: 최적화된 Dockerfile을 기반으로 멀티 스테이징 빌드 수행.
3.  **Push**: AWS ECR(Elastic Container Registry)로 버전 태깅 후 업로드.
4.  **Deploy**: Kubernetes Manifest를 업데이트하여 EKS 클러스터에 Rolling Update 수행.

---

## 10) Mermaid 다이어그램

### 12-1. 환경별 배포 흐름
개발자로부터 실제 운영 환경까지의 견고한 배포 파이프라인 구조입니다.

```mermaid
flowchart LR
    DEV[Developer]
    LOCAL[local<br/>Docker Compose]
    DEVK8S[dev<br/>minikube/k8s]
    STAGE[stage<br/>EKS + ALB]
    PROD[prod<br/>EKS + ALB]
    APIGW[API Gateway<br/>optional edge]
    LAMBDA[Lambda<br/>async jobs]

    DEV --> LOCAL
    LOCAL --> DEVK8S
    DEVK8S --> STAGE
    STAGE --> PROD
    STAGE -. optional .-> APIGW
    APIGW -. invokes .-> LAMBDA
```

### 12-2. EKS 런타임 및 네트워크 구조
고가용성과 보안을 보장하는 Amazon VPC 기반의 트래픽 흐름입니다.

```mermaid
flowchart TD
    USER[Browser]
    ALB[ALB Ingress Controller]
    
    subgraph Public_Subnet ["Public Subnet"]
        F_SVC[Service: Frontend]
        NAT[NAT Gateway]
    end

    subgraph Private_Subnet ["Private Subnet"]
        B_SVC[Service: Backend]
        AI_SVC[Service: AI-Service]
        DB[(Amazon RDS MySQL)]
    end

    S3[(Amazon S3)]
    Lex[[Amazon Lex V2]]
    Reko[[Amazon Rekognition]]

    USER --> ALB
    ALB --> F_SVC
    ALB --> B_SVC
    
    B_SVC --> AI_SVC
    B_SVC --> DB
    
    %% NAT를 통한 외부 통신
    B_SVC -- via NAT --> S3
    B_SVC -- via NAT --> Lex
    AI_SVC -- via NAT --> Reko
```

### 12-3. AI 얼굴 분석 및 상담 시퀀스
사용자 요청부터 AI 분석 및 챗봇 응답까지의 복합 프로세스입니다.

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Backend
    participant AIService
    participant Lex
    participant NAT as NAT Gateway
    participant AWSResources as AWS Services (S3/Rekonition)

    User->>Browser: 상담 메시지/사진 전송
    Browser->>Backend: 대화 요청
    Backend->>NAT: 아웃바운드 요청
    NAT->>Lex: 대화 의도 분석 요청
    Lex-->>Backend: 응답 수신
    Backend-->>Browser: 가이드 발화 응답
    
    Browser->>S3: 이미지 원본 업로드
    Browser->>Backend: 분석 프로세스 시작 (URL 전달)
    Backend->>AIService: 얼굴형 판별 요청
    AIService->>NAT: 특징점 추출 요청
    NAT->>AWSResources: Rekognition 호출
    AWSResources-->>AIService: 좌표 데이터 리턴
    AIService->>AIService: 황금비율 수학적 계산
    AIService-->>Backend: 분석 결과 DTO 반환
    Backend-->>Browser: 최종 결과 JSON 응답
    Browser-->>User: 가상 오버레이 시각화
```

### 12-4. Database ERD (엔티티 관계도)
시스템의 데이터 구조와 관계를 나타낸 설계도입니다.

```mermaid
erDiagram
    Users ||--o{ Analysis_Results : "performs"
    Users ||--o{ Makeup_Posts : "writes"
    Users ||--o{ Scraps : "collects"
    Makeup_Posts ||--o{ Scraps : "is stored in"

    Users {
        int user_id PK
        varchar email "UNIQUE"
        varchar password
        varchar nickname
        text profile_image_url
        text face_image_url
        text bio
        timestamp created_at
    }

    Analysis_Results {
        int analysis_id PK
        int user_id FK "Users(user_id) CASCADE"
        varchar face_shape
        boolean is_latest "Default: TRUE"
        json eyebrow_coords
        float eye_distance
        float forehead_width
        timestamp created_at
    }

    Makeup_Posts {
        int post_id PK
        int user_id FK "Users(user_id) SET NULL"
        varchar title
        text description
        text image_url
        varchar makeup_type
        varchar target_face_shape
        varchar tpo_tag
        int view_count "Default: 0"
        int like_count "Default: 0"
        timestamp created_at
    }

    Scraps {
        int scrap_id PK
        int user_id FK "Users(user_id) CASCADE"
        int post_id FK "Makeup_Posts(post_id) CASCADE"
        timestamp created_at "UNIQUE(user_id, post_id)"
    }
```



---

## 11) 주요 API 명세 및 통신 구조

백엔드와 프런트엔드 간의 핵심 데이터 교환 인터페이스입니다.

| Method | Endpoint | Description | Payload/Response |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/lex/chat` | Amazon Lex 지능형 상담 요청 | `{ message: "..." }` |
| **POST** | `/api/analyze` | AI 얼굴 특징 및 황금비율 분석 | `{ imageUrl: "..." }` |
| **GET** | `/api/history` | 사용자별 분석 이력 및 통계 조회 | `List<AnalysisResponse>` |
| **GET** | `/api/styles` | 얼굴형 맞춤 추천 스타일 리스트 | `List<StyleResponse>` |

---

## 12) 화면 캡처 및 서비스 증적

### 14-1. 서비스 실행 화면 (Browser)
| 서비스 단계 | 화면 이미지 |
| :--- | :--- |
| **메인 대시보드** | ![메인](md/image/스크린샷%202026-03-11%20123353.png) |


| **Lex 지능형 상담** | ![챗봇](md/image/스크린샷%202026-03-11%20123410.png) |
| **얼굴 분석 리포트** | ![분석](md/image/image-9.png) |
| **사용자 이력 관리** | ![마이페이지](md/image/스크린샷%202026-03-11%20140924.png) |

### 14-2. AWS 인프라 운영 증적 (Console)
| AWS 리소스 | 콘솔 증적 리포트 |
| :--- | :--- |
| **Amazon EKS** | ![EKS](md/image/스크린샷%202026-03-11%20141925.png) |
| **Amazon ECR** | ![ECR](md/image/스크린샷%202026-03-11%20141949.png) |
| **Amazon S3/ALB** | ![Network](md/image/image-10.png) |
| **Amazon Lex V2** | ![Lex](md/image/image-11.png) |
| **Amazon RDS** | ![RDS](md/image/image-6.png) |

---

## 13) 주요 경로 (Project Structure Summary)
*   **`src/main/java/.../analysis/`**: AWS Lex 연동 컨트롤러 및 지능형 상담 서비스 로직
*   **`AI_Service/`**: FastAPI 기반 파이썬 얼굴 분석 엔진 및 알고리즘 구현부
*   **`Frontend/`**: React 라이브러리 기반 UI 및 HTML5 Canvas 드로잉 엔진
*   **`AWS/`**: EKS 클러스터용 Kubernetes Deployment/Service YAML 명세
*   **`docs/architecture/`**: Terraform(IaC)을 활용한 AWS 리소스 프로비저닝 코드

