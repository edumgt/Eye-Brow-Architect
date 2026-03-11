terraform apply
terraform destroy


📂 1. Frontend (사용자 화면 & 촬영 가이드)
사용자가 직접 보게 될 웹 페이지와 촬영 가이드 로직이 담긴 파일들입니다.

index.html: 메인 웹 페이지 레이아웃 (채팅창, 카메라 화면, 결과 노출 영역).

style.css: 웹 디자인 및 카메라 가이드 오버레이 스타일 설정.

canvas_handler.js: Canvas API를 활용한 실시간 촬영 가이드 및 분석 결과 시각화 로직.

lex_client.js: 사용자의 대화와 사진을 Amazon Lex 및 S3와 통신하게 해주는 프론트엔드 통신 모듈.

📂 2. Backend - FastAPI (핵심 분석 두뇌)
EKS 서버 내에서 돌아가며 AI 분석과 나혜님의 전문가 로직을 처리하는 파일들입니다.

main.py: FastAPI 서버의 입구로, 요청을 받고 결과를 보내주는 메인 엔트리 포인트.

analysis_logic.py: 나혜님이 정의한 13가지 상황/분위기 및 좌표 기반 메이크업 추천 알고리즘 파일.

aws_manager.py: Amazon Rekognition 호출 및 S3 이미지 접근을 담당하는 AWS SDK (Boto3) 모듈.

database.py: **MySQL(RDS)**과의 연결 및 분석 결과 저장을 담당하는 DB 관리 파일.

📂 3. AWS Lambda & Infrastructure (다리 및 설정)
서비스 간 데이터를 연결하고 인프라를 구축하는 설정 파일들입니다.

lex_lambda_handler.py: Amazon Lex와 EKS 사이에서 데이터를 중계하는 AWS Lambda 코드.

Dockerfile: 파이썬 백엔드 앱을 컨테이너로 만들기 위한 설정 파일.

eks_deployment.yaml: 쿠버네티스(EKS)에 서버를 어떻게 띄울지 정의한 명세서.

📂 4. DevOps (배포 자동화)
GitHub에 코드를 올렸을 때 자동으로 AWS로 날려주는 자동화 파일입니다.

.github/workflows/deploy.yml: GitHub Actions를 이용한 Blue-Green 무중단 배포 자동화 스크립트.

📂 5. 프로젝트 문서 (기획 및 관리)
지금 우리가 정리한 기획 내용들이 담긴 관리용 문서들입니다.

requirements_summary.md: 프로젝트 요구사항 및 기획 요약서.

project_plan.md: 인프라 로드맵 및 운영 계획서.

service_logic.md: 상세 분석 로직 및 서비스 흐름도.