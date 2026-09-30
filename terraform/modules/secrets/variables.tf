variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "db_username" {
  type    = string
  default = "jobtracker"
}

variable "db_name" {
  type    = string
  default = "jobtracker"
}

variable "tags" {
  type    = map(string)
  default = {}
}
