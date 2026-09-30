terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  backend "s3" {
    bucket         = "visitor-counter-tfstate-377c5a71"
    key            = "job-tracker/dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "visitor-counter-tf-lock"
    encrypt        = true
  }
}
