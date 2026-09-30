variable "bucket_name" {
  type = string
}

variable "build_dir" {
  type        = string
  description = "Path to the Vite build output (dist/)"
}

variable "api_url" {
  type        = string
  description = "URL of the backend API (ALB)"
}

variable "index_document" {
  type    = string
  default = "index.html"
}

variable "content_types" {
  type = map(string)
  default = {
    "html"  = "text/html"
    "css"   = "text/css"
    "js"    = "application/javascript"
    "json"  = "application/json"
    "svg"   = "image/svg+xml"
    "png"   = "image/png"
    "jpg"   = "image/jpeg"
    "jpeg"  = "image/jpeg"
    "ico"   = "image/x-icon"
    "woff"  = "font/woff"
    "woff2" = "font/woff2"
  }
}

variable "tags" {
  type    = map(string)
  default = {}
}
