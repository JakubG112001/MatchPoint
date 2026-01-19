# MatchPoint Deployment Guide

## Prerequisites

- AWS CLI configured with appropriate permissions
- Terraform >= 1.0
- Python 3.9+

## Quick Deploy

```bash
git clone https://github.com/JakubG112001/MatchPoint.git
cd MatchPoint

cd infrastructure/
terraform init
terraform plan
terraform apply

aws s3 sync ../frontend s3://$(terraform output -raw s3_bucket_name)
```

## Architecture Components

- **Frontend**: S3 + CloudFront (Global CDN)
- **API**: API Gateway + Lambda (Serverless)
- **Database**: DynamoDB (NoSQL, Pay-per-request)
- **Auth**: AWS Cognito (Managed identity)
- **IaC**: Terraform (Infrastructure as Code)

## Cost Optimization

- Serverless architecture = $0 when idle
- DynamoDB on-demand pricing
- CloudFront free tier (1TB/month)
- Lambda free tier (1M requests/month)

**Estimated cost: $0-5/month**

## Security Features

- HTTPS-only (CloudFront SSL)
- IAM least-privilege roles
- API Gateway with Cognito auth
- No hardcoded secrets

## Monitoring

- CloudWatch metrics for all services
- Lambda performance tracking
- DynamoDB capacity monitoring
- API Gateway error rates

## Cleanup

```bash
terraform destroy
```