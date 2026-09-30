variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "secret_arns" {
  type        = list(string)
  description = "Secrets the container needs to read at startup"
}

variable "tags" {
  type    = map(string)
  default = {}
}
