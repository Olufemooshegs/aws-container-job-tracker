variable "repository_name" {
  type = string
}

variable "image_tag_mutability" {
  type    = string
  default = "MUTABLE"
}

variable "keep_last_images" {
  type    = number
  default = 10
}

variable "tags" {
  type    = map(string)
  default = {}
}
