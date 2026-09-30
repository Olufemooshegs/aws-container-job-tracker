# ─────────────────────────────────────────────────────────────
# Random password for RDS master user
# 32 chars, no special chars that break shell/URL encoding
# ─────────────────────────────────────────────────────────────
resource "random_password" "db" {
  length           = 32
  special          = false # avoid :/?#[]@ etc. that break URLs
  override_special = ""
}

# ─────────────────────────────────────────────────────────────
# Random JWT secret for the app
# ─────────────────────────────────────────────────────────────
resource "random_password" "jwt" {
  length  = 64
  special = false
}

# ─────────────────────────────────────────────────────────────
# DB credentials secret (username, password, host, port, dbname)
# The host/port are filled in by the RDS module via a second
# secret version, but we store the base here.
# ─────────────────────────────────────────────────────────────
resource "aws_secretsmanager_secret" "db" {
  name                    = "${var.project_name}-${var.environment}-db"
  description             = "RDS Postgres credentials"
  recovery_window_in_days = 0 # allow immediate deletion (dev only)

  tags = var.tags
}

resource "aws_secretsmanager_secret_version" "db" {
  secret_id = aws_secretsmanager_secret.db.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db.result
    dbname   = var.db_name
    # host + port get filled in when RDS is created (see rds module)
  })
}

# ─────────────────────────────────────────────────────────────
# JWT secret
# ─────────────────────────────────────────────────────────────
resource "aws_secretsmanager_secret" "jwt" {
  name                    = "${var.project_name}-${var.environment}-jwt"
  description             = "JWT signing key for FastAPI"
  recovery_window_in_days = 0

  tags = var.tags
}

resource "aws_secretsmanager_secret_version" "jwt" {
  secret_id     = aws_secretsmanager_secret.jwt.id
  secret_string = random_password.jwt.result
}
