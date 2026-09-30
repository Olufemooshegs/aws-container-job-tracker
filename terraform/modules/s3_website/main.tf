resource "aws_s3_bucket" "this" {
  bucket        = var.bucket_name
  force_destroy = true
  tags          = var.tags
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket                  = aws_s3_bucket.this.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "this" {
  bucket = aws_s3_bucket.this.id
  index_document {
    suffix = var.index_document
  }
}

data "aws_iam_policy_document" "public_read" {
  statement {
    sid    = "PublicReadGetObject"
    effect = "Allow"
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.this.arn}/*"]
  }
}

resource "aws_s3_bucket_policy" "this" {
  bucket     = aws_s3_bucket.this.id
  policy     = data.aws_iam_policy_document.public_read.json
  depends_on = [aws_s3_bucket_public_access_block.this]
}

# ─────────────────────────────────────────────────────────────
# Upload every file from dist/ EXCEPT config.js
# (config.js is injected separately with the real API URL)
# ─────────────────────────────────────────────────────────────
locals {
  files_to_upload = toset([
    for f in fileset(var.build_dir, "**") : f if f != "config.js"
  ])
}

resource "aws_s3_object" "files" {
  for_each = local.files_to_upload

  bucket = aws_s3_bucket.this.id
  key    = each.value
  source = "${var.build_dir}/${each.value}"
  etag   = filemd5("${var.build_dir}/${each.value}")
  content_type = lookup(
    var.content_types,
    element(split(".", each.value), length(split(".", each.value)) - 1),
    "application/octet-stream"
  )
}

# Inject runtime config with the real API URL
resource "aws_s3_object" "config_js" {
  bucket       = aws_s3_bucket.this.id
  key          = "config.js"
  content_type = "application/javascript"
  content      = "window.__API_URL__ = \"${var.api_url}\";"
  etag         = md5("window.__API_URL__ = \"${var.api_url}\";")
}
