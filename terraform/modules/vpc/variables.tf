variable "project_name" {
  type        = string
  description = "Project name used for resource naming"
}

variable "environment" {
  type        = string
  description = "Environment name (dev, prod)"
}

variable "vpc_cidr" {
  type        = string
  default     = "10.0.0.0/16"
  description = "CIDR block for the VPC"
}

variable "az_count" {
  type        = number
  default     = 2
  description = "Number of availability zones to span"
}

variable "tags" {
  type    = map(string)
  default = {}
}