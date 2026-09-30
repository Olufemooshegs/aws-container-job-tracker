# ─────────────────────────────────────────────────────────────
# DB subnet group — tells RDS which subnets it can live in
# ─────────────────────────────────────────────────────────────
resource "aws_db_subnet_group" "this" {
  name       = "${var.project_name}-${var.environment}-db"
  subnet_ids = var.subnet_ids

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  })
}

# ─────────────────────────────────────────────────────────────
# Security group for the DB — allows Postgres from ECS only
# ─────────────────────────────────────────────────────────────
resource "aws_security_group" "db" {
  name        = "${var.project_name}-${var.environment}-db-sg"
  description = "Security group for RDS Postgres"
  vpc_id      = var.vpc_id

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-db-sg"
  })
}

resource "aws_security_group_rule" "db_ingress" {
  count                    = length(var.allowed_security_group_ids)
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = aws_security_group.db.id
  source_security_group_id = var.allowed_security_group_ids[count.index]
  description              = "Postgres from allowed SG"
}

# ─────────────────────────────────────────────────────────────
# The RDS instance
# ─────────────────────────────────────────────────────────────
resource "aws_db_instance" "this" {
  identifier     = "${var.project_name}-${var.environment}"
  engine         = "postgres"
  engine_version = "16.4"

  instance_class        = var.instance_class
  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.allocated_storage * 2

  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = false

  # HA — disabled in dev (doubles cost)
  multi_az = false

  # Backups — 1 day retention in dev
  backup_retention_period = 1
  backup_window           = "03:00-04:00"

  # Maintenance
  maintenance_window         = "sun:04:00-sun:05:00"
  auto_minor_version_upgrade = true

  # Dev settings — skip snapshot on delete
  skip_final_snapshot       = true
  final_snapshot_identifier = null
  deletion_protection       = false

  # Apply changes immediately in dev (prod would wait for window)
  apply_immediately = true

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-db"
  })
}
