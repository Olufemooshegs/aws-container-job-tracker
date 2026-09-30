# ─────────────────────────────────────────────────────────────
# 1. VPC
# ─────────────────────────────────────────────────────────────
module "vpc" {
  source = "../../modules/vpc"

  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = "10.0.0.0/16"
  az_count     = 2
}

# ─────────────────────────────────────────────────────────────
# 2. Secrets
# ─────────────────────────────────────────────────────────────
module "secrets" {
  source = "../../modules/secrets"

  project_name = var.project_name
  environment  = var.environment
}

# ─────────────────────────────────────────────────────────────
# 3. ECR
# ─────────────────────────────────────────────────────────────
module "ecr" {
  source = "../../modules/ecr"

  repository_name = "${var.project_name}-${var.environment}"
}

# ─────────────────────────────────────────────────────────────
# 4. Shared app security group
# ─────────────────────────────────────────────────────────────
resource "aws_security_group" "app" {
  name        = "${var.project_name}-${var.environment}-app-sg"
  description = "Shared SG for ECS tasks + RDS access"
  vpc_id      = module.vpc.vpc_id

  tags = {
    Name = "${var.project_name}-${var.environment}-app-sg"
  }
}

resource "aws_security_group_rule" "app_to_rds" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = aws_security_group.app.id
  source_security_group_id = aws_security_group.app.id
  description              = "Self-reference: tasks in this SG can reach each other on 5432"
}

resource "aws_security_group_rule" "app_egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.app.id
  description       = "All outbound"
}

resource "aws_security_group_rule" "alb_to_app" {
  type                     = "ingress"
  from_port                = 8000
  to_port                  = 8000
  protocol                 = "tcp"
  security_group_id        = aws_security_group.app.id
  source_security_group_id = module.alb.security_group_id
  description              = "Container port from ALB"
}

# ─────────────────────────────────────────────────────────────
# 5. IAM
# ─────────────────────────────────────────────────────────────
module "iam" {
  source = "../../modules/iam"

  project_name = var.project_name
  environment  = var.environment
  secret_arns  = [module.secrets.db_secret_arn, module.secrets.jwt_secret_arn]
}

# ─────────────────────────────────────────────────────────────
# 6. ALB
# ─────────────────────────────────────────────────────────────
module "alb" {
  source = "../../modules/alb"

  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  health_check_path = "/health"
}

# ─────────────────────────────────────────────────────────────
# 7. RDS
# ─────────────────────────────────────────────────────────────
module "rds" {
  source = "../../modules/rds"

  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
  subnet_ids   = module.vpc.private_subnet_ids

  allowed_security_group_ids = [aws_security_group.app.id]

  db_name     = "jobtracker"
  db_username = "jobtracker"
  db_password = module.secrets.db_password
}

# ─────────────────────────────────────────────────────────────
# 8. S3 website — serves the React build
#    api_url is injected as a runtime config.js in the bucket
# ─────────────────────────────────────────────────────────────
module "s3_website" {
  source = "../../modules/s3_website"

  bucket_name = "${var.project_name}-${var.environment}-${data.aws_caller_identity.current.account_id}"
  build_dir   = "../../../frontend/dist"
  api_url     = module.alb.alb_url
}

# ─────────────────────────────────────────────────────────────
# 9. ECS
# ─────────────────────────────────────────────────────────────
module "ecs" {
  source = "../../modules/ecs"

  project_name           = var.project_name
  environment            = var.environment
  private_subnet_ids     = module.vpc.private_subnet_ids
  task_security_group_id = aws_security_group.app.id
  target_group_arn       = module.alb.target_group_arn

  image_url               = "${module.ecr.repository_url}:${var.image_tag}"
  task_execution_role_arn = module.iam.execution_role_arn
  task_role_arn           = module.iam.task_role_arn

  db_host        = module.rds.address
  db_secret_arn  = module.secrets.db_secret_arn
  jwt_secret_arn = module.secrets.jwt_secret_arn

  cors_origins = "http://${module.s3_website.website_endpoint},http://localhost:5173"

  cpu           = 256
  memory        = 512
  desired_count = 1
}
