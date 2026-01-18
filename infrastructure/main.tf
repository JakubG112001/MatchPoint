terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_dynamodb_table" "profiles" {
  name           = "MatchPointProfiles"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }
}

resource "aws_dynamodb_table" "swipes" {
  name           = "MatchPointSwipes"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"
  range_key      = "targetId"

  attribute {
    name = "userId"
    type = "S"
  }
  
  attribute {
    name = "targetId"
    type = "S"
  }
}

resource "aws_dynamodb_table" "matches" {
  name           = "MatchPointMatches"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "matchId"

  attribute {
    name = "matchId"
    type = "S"
  }
}

resource "aws_iam_role" "lambda_role" {
  name = "matchpoint-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_policy" {
  name = "matchpoint-lambda-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.profiles.arn,
          aws_dynamodb_table.swipes.arn,
          aws_dynamodb_table.matches.arn
        ]
      }
    ]
  })
}

data "archive_file" "profile_zip" {
  type        = "zip"
  source_dir  = "../backend/profile"
  output_path = "profile.zip"
}

data "archive_file" "swipe_zip" {
  type        = "zip"
  source_dir  = "../backend/swipe"
  output_path = "swipe.zip"
}

data "archive_file" "matches_zip" {
  type        = "zip"
  source_dir  = "../backend/matches"
  output_path = "matches.zip"
}

resource "aws_lambda_function" "profile_handler" {
  filename         = data.archive_file.profile_zip.output_path
  function_name    = "matchpoint-profile"
  role            = aws_iam_role.lambda_role.arn
  handler         = "handler.lambda_handler"
  runtime         = "python3.9"
  source_code_hash = data.archive_file.profile_zip.output_base64sha256
}

resource "aws_lambda_function" "swipe_handler" {
  filename         = data.archive_file.swipe_zip.output_path
  function_name    = "matchpoint-swipe"
  role            = aws_iam_role.lambda_role.arn
  handler         = "handler.lambda_handler"
  runtime         = "python3.9"
  source_code_hash = data.archive_file.swipe_zip.output_base64sha256
}

resource "aws_lambda_function" "matches_handler" {
  filename         = data.archive_file.matches_zip.output_path
  function_name    = "matchpoint-matches"
  role            = aws_iam_role.lambda_role.arn
  handler         = "handler.lambda_handler"
  runtime         = "python3.9"
  source_code_hash = data.archive_file.matches_zip.output_base64sha256
}

resource "aws_api_gateway_rest_api" "matchpoint_api" {
  name = "matchpoint-api"
}

resource "aws_api_gateway_resource" "profiles" {
  rest_api_id = aws_api_gateway_rest_api.matchpoint_api.id
  parent_id   = aws_api_gateway_rest_api.matchpoint_api.root_resource_id
  path_part   = "profiles"
}

resource "aws_api_gateway_method" "profiles_get" {
  rest_api_id   = aws_api_gateway_rest_api.matchpoint_api.id
  resource_id   = aws_api_gateway_resource.profiles.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "profiles_get" {
  rest_api_id = aws_api_gateway_rest_api.matchpoint_api.id
  resource_id = aws_api_gateway_resource.profiles.id
  http_method = aws_api_gateway_method.profiles_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.profile_handler.invoke_arn
}

resource "aws_lambda_permission" "profiles_get" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.profile_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.matchpoint_api.execution_arn}/*/*"
}

resource "aws_api_gateway_deployment" "matchpoint_api" {
  depends_on = [
    aws_api_gateway_integration.profiles_get
  ]

  rest_api_id = aws_api_gateway_rest_api.matchpoint_api.id
  stage_name  = "prod"
}

output "api_gateway_url" {
  value = "${aws_api_gateway_rest_api.matchpoint_api.execution_arn}/prod"
}

resource "aws_s3_bucket" "frontend" {
  bucket = "matchpoint-frontend-${random_string.bucket_suffix.result}"
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false

  depends_on = [aws_s3_bucket.frontend]
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  depends_on = [aws_s3_bucket_public_access_block.frontend]
}

resource "aws_cloudfront_distribution" "frontend" {
  origin {
    domain_name = aws_s3_bucket_website_configuration.frontend.website_endpoint
    origin_id   = "S3-${aws_s3_bucket.frontend.bucket}"
    
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.frontend.bucket}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

output "cloudfront_url" {
  value = aws_cloudfront_distribution.frontend.domain_name
}

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

output "s3_bucket_name" {
  value = aws_s3_bucket.frontend.bucket
}

output "s3_website_url" {
  value = aws_s3_bucket_website_configuration.frontend.website_endpoint
}