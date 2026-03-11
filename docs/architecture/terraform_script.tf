provider "aws" {
  region = "ap-northeast-2"
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