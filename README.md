# MatchPoint - Serverless Dating App

> **Production-ready serverless application demonstrating cloud-native architecture, Infrastructure as Code, and DevOps best practices.**

[![AWS](https://img.shields.io/badge/AWS-Serverless-orange)](https://aws.amazon.com/)
[![Terraform](https://img.shields.io/badge/Terraform-IaC-purple)](https://terraform.io/)
[![Python](https://img.shields.io/badge/Python-Lambda-blue)](https://python.org/)

## Live Demo

**[Try MatchPoint Live](https://d26bpmuzz0jifo.cloudfront.net/)** - Fully functional dating app on AWS

## Architecture

**Serverless, scalable, cost-optimized**

- **Frontend**: S3 + CloudFront (Global CDN)
- **Backend**: API Gateway + Lambda (Auto-scaling)
- **Database**: DynamoDB (NoSQL, Pay-per-request)
- **Authentication**: AWS Cognito (Managed identity)
- **Infrastructure**: Terraform (100% IaC)

[Detailed Architecture](ARCHITECTURE.md) | [Deployment Guide](DEPLOYMENT.md)

## Key Features

- **Secure Authentication** - AWS Cognito with OAuth2
- **Responsive UI** - Works on all devices
- **Real-time Matching** - Instant swipe processing
- **Global Scale** - CloudFront edge locations
- **Cost Optimized** - Pay only for usage ($0-5/month)
- **Production Ready** - HTTPS, monitoring, error handling

## DevOps Highlights

### Infrastructure as Code
```bash
# Complete infrastructure deployment
terraform init
terraform apply
```

### Monitoring & Observability
- CloudWatch metrics for all services
- Lambda performance tracking
- DynamoDB capacity monitoring
- API Gateway error rates

### Security Best Practices
- HTTPS-only with CloudFront SSL
- IAM least-privilege roles
- No hardcoded secrets
- API Gateway rate limiting

### Cost Management
- Serverless = $0 when idle
- DynamoDB on-demand pricing
- CloudFront free tier optimization
- Resource tagging for cost tracking

## Quick Start

```bash
# Clone repository
git clone https://github.com/JakubG112001/MatchPoint.git
cd MatchPoint

# Deploy infrastructure
cd infrastructure/
terraform init
terraform apply

# Upload frontend
aws s3 sync ../frontend s3://$(terraform output -raw s3_bucket_name)
```

## Technical Stack

| Component | Technology | Purpose |
|-----------|------------|----------|
| **Frontend** | HTML/CSS/JS | User interface |
| **CDN** | CloudFront | Global content delivery |
| **API** | API Gateway | RESTful endpoints |
| **Compute** | Lambda | Serverless functions |
| **Database** | DynamoDB | NoSQL data storage |
| **Auth** | Cognito | User management |
| **IaC** | Terraform | Infrastructure automation |
| **Monitoring** | CloudWatch | Metrics and logging |

## Production Readiness

- [x] **Infrastructure as Code** - 100% Terraform
- [x] **Security** - HTTPS, IAM, no secrets in code
- [x] **Monitoring** - CloudWatch metrics and alarms
- [x] **Scalability** - Auto-scaling serverless architecture
- [x] **Cost Optimization** - Pay-per-use pricing model
- [x] **Documentation** - Comprehensive guides and runbooks
- [x] **Error Handling** - Graceful failure management

## Scalability & Performance

- **Auto-scaling**: Lambda scales from 0 to millions of requests
- **Global CDN**: Sub-100ms response times worldwide
- **NoSQL Database**: Single-digit millisecond latency
- **Cost-Effective**: Scales to zero when not in use

## Local Development

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup instructions.

## What This Demonstrates

### Cloud Engineering Skills
- Serverless architecture design
- AWS service integration
- Infrastructure automation
- Security best practices

### DevOps Expertise
- Infrastructure as Code (Terraform)
- Monitoring and observability
- Cost optimization strategies
- Production deployment practices

### Software Development
- RESTful API design
- Frontend/backend integration
- Database design and optimization
- Authentication and authorization

---

**Built by Jakub** - Demonstrating cloud engineering and DevOps expertise for production-ready applications.

Contact: [your-email@example.com] | LinkedIn: [linkedin.com/in/yourprofile] | Portfolio: [yourwebsite.com]