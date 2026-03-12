provider "aws" {
  region = "ap-northeast-2"
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "../../AWS/lex_lambda_handler.py"
  output_path = "lex_lambda_function.zip"
}


# 1. VPC 및 인터넷 대문 (이미 있는 것 유지)
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = { Name = "EyeBrow-VPC" }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "EyeBrow-IGW" }
}

# 2. 서브넷 (Conflict 방지를 위해 기존 이름 'public_subnet', 'private_subnet' 유지)
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ap-northeast-2a"
  map_public_ip_on_launch = true
  tags = { Name = "EyeBrow-Public-Subnet" }
}

resource "aws_subnet" "private_subnet" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "ap-northeast-2c"
  map_public_ip_on_launch = true
  tags = { Name = "EyeBrow-Private-Subnet" }
}

# 3. 라우팅 설정 (나혜님이 찾으신 '비활성화됨'을 '활성화됨'으로 바꾸는 핵심)
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

# [추가] 프라이빗 서브넷도 대문과 연결하여 RDS가 어디 있든 인터넷이 되게 함
resource "aws_route_table_association" "private_assoc" {
  subnet_id      = aws_subnet.private_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

# 4. 보안 그룹 (기존 이름 'web_sg' 유지하여 ENI 충돌 방지)
resource "aws_security_group" "web_sg" {
  name   = "eye-brow-web-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Spring Boot 포트
  }

  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # DB 포트 (MySQL)
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 5. RDS 인스턴스 (기존 이름 'db_subnet' 유지)
resource "aws_db_instance" "database" {
  allocated_storage      = 20
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = "db.t3.micro"
  db_name                = "eyebrow_db"
  username               = "nahye_admin"
  password               = "nahye1234" 
  skip_final_snapshot    = true
  publicly_accessible    = true # 이 설정과 위의 라우팅 테이블이 만나야 외부 접속이 됩니다.
  vpc_security_group_ids = [aws_security_group.web_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.db_subnet.name
}

resource "aws_db_subnet_group" "db_subnet" {
  name       = "eyebrow-db-subnet-group"
  subnet_ids = [aws_subnet.public_subnet.id, aws_subnet.private_subnet.id]
}

# 6. 삭제된 EC2 및 S3 복구
resource "aws_instance" "app_server" {
  ami                    = "ami-0c9c942bd7bf113a2"
  instance_type          = "t3.medium"
  subnet_id              = aws_subnet.public_subnet.id
  vpc_security_group_ids = [aws_security_group.web_sg.id]
  tags = { Name = "EyeBrow-App-Server" }
}

resource "aws_s3_bucket" "image_storage" {
  bucket = "brow-architect-storage-nahye"
  force_destroy = true
}

# S3 CORS 설정 (브라우저에서 이미지 엑박 방지)
resource "aws_s3_bucket_cors_configuration" "image_storage_cors" {
  bucket = aws_s3_bucket.image_storage.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = [
      "http://localhost:5173", # 로컬 개발용
      "http://a7f1bcb371edf40c98e81362a1275c97-1744008740.ap-northeast-2.elb.amazonaws.com" # 현재 ELB 주소
    ]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# S3 퍼블릭 액세스 차단 해제
resource "aws_s3_bucket_public_access_block" "image_storage_public_access" {
  bucket = aws_s3_bucket.image_storage.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 모든 사람 읽기 권한 정책 추가
resource "aws_s3_bucket_policy" "allow_public_read" {
  bucket = aws_s3_bucket.image_storage.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.image_storage.arn}/*"
      },
    ]
  })
  depends_on = [aws_s3_bucket_public_access_block.image_storage_public_access]
}

resource "aws_lexv2models_bot" "brow_architect_bot" {
  name                        = "BrowArchitectBot"
  role_arn                    = "arn:aws:iam::973759794851:role/aws-service-role/lexv2.amazonaws.com/AWSServiceRoleForLexV2Bots_H45R3CI972O"
  idle_session_ttl_in_seconds = 300
  data_privacy {
    child_directed = false
  }
}

resource "aws_lexv2models_bot_locale" "ko_kr" {
  bot_id                           = aws_lexv2models_bot.brow_architect_bot.id
  bot_version                      = "DRAFT"
  locale_id                        = "ko_KR"
  n_lu_intent_confidence_threshold  = 0.40
}

resource "aws_lexv2models_intent" "analyze_intent" {
  bot_id      = aws_lexv2models_bot.brow_architect_bot.id
  bot_version = "DRAFT"
  locale_id   = aws_lexv2models_bot_locale.ko_kr.locale_id
  name        = "AnalyzeEyebrow"

  sample_utterance {
    utterance = "눈썹 분석해줘"
  }
  sample_utterance {
    utterance = "분석 시작"
  }
}

output "rds_endpoint" { value = aws_db_instance.database.endpoint }

# 7. EKS IAM Roles
resource "aws_iam_role" "eks_cluster_role" {
  name = "brow-architect-cluster-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "eks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster_role.name
}

resource "aws_iam_role" "eks_node_role" {
  name = "brow-architect-node-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_worker_node_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_node_role.name
}

resource "aws_iam_role_policy_attachment" "eks_cni_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_node_role.name
}

resource "aws_iam_role_policy_attachment" "ecr_read_only" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks_node_role.name
}

resource "aws_iam_role_policy_attachment" "s3_access" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
  role       = aws_iam_role.eks_node_role.name
}

resource "aws_iam_role_policy_attachment" "lex_access" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonLexFullAccess"
  role       = aws_iam_role.eks_node_role.name
}


# 8. EKS Cluster
resource "aws_eks_cluster" "main" {
  name     = "brow-architect-cluster"
  role_arn = aws_iam_role.eks_cluster_role.arn

  vpc_config {
    subnet_ids = [aws_subnet.public_subnet.id, aws_subnet.private_subnet.id]
  }

  depends_on = [aws_iam_role_policy_attachment.eks_cluster_policy]
}

# 9. EKS Node Group
resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "brow-architect-nodes"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      = [aws_subnet.public_subnet.id, aws_subnet.private_subnet.id]

  scaling_config {
    desired_size = 2
    max_size     = 3
    min_size     = 1
  }

  instance_types = ["t3.medium"]

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.ecr_read_only,
  ]
}

# 10. Lex Fulfillment Lambda
resource "aws_iam_role" "lex_lambda_role" {
  name = "lex-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lex_lambda_role.name
}

resource "aws_lambda_function" "lex_fulfillment_lambda" {
  filename      = "lex_lambda_function.zip"
  function_name = "lex_lambda_handler"
  role          = aws_iam_role.lex_lambda_role.arn
  handler       = "lex_lambda_handler.lambda_handler"
  runtime       = "python3.12"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
}

resource "aws_lambda_permission" "allow_lex" {
  statement_id  = "AllowExecutionFromLex"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lex_fulfillment_lambda.function_name
  principal     = "lex.amazonaws.com"
}

