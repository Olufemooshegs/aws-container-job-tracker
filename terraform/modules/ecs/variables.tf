variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "task_security_group_id" {
  type = string
}

variable "target_group_arn" {
  type = string
}

variable "image_url" {
  type = string
}

variable "task_execution_role_arn" {
  type = string
}

variable "task_role_arn" {
  type = string
}

variable "db_host" {
  type        = string
  description = "RDS hostname (plain, not sensitive)"
}

variable "db_secret_arn" {
  type        = string
  description = "ARN of Secrets Manager secret with DB credentials JSON"
}

variable "jwt_secret_arn" {
  type = string
}

variable "cors_origins" {
  type        = string
  description = "Comma-separated allowed origins"
}

variable "cpu" {
  type    = number
  default = 256
}

variable "memory" {
  type    = number
  default = 512
}

variable "desired_count" {
  type    = number
  default = 1
}

variable "container_port" {
  type    = number
  default = 8000
}

variable "log_retention_days" {
  type    = number
  default = 7
}

variable "tags" {
  type    = map(string)
  default = {}
}
