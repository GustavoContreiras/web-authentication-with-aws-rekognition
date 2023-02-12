provider "aws" {
  profile = "default"
  region = "us-east-1"
}

resource "aws_s3_bucket" "b" {
  bucket = "web-authentication-with-aws-rekognition"

  tags = {
    Name        = "Web authentication with AWS Rekognition"
    Environment = "Dev"
  }
}

resource "aws_s3_bucket_acl" "example" {
  bucket = aws_s3_bucket.b.id
  acl    = "private"
}