# MatchPoint Architecture

## System Design

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Users     │───▶│  CloudFront  │───▶│     S3      │
│  (Global)   │    │    (CDN)     │    │ (Frontend)  │
└─────────────┘    └──────────────┘    └─────────────┘
                           │
                           ▼
                   ┌──────────────┐
                   │ API Gateway  │
                   │   (REST)     │
                   └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐    ┌─────────────┐
                   │   Lambda     │───▶│  DynamoDB   │
                   │ (Serverless) │    │   (NoSQL)   │
                   └──────────────┘    └─────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │   Cognito    │
                   │    (Auth)    │
                   └──────────────┘
```

## Data Flow

1. **User Access**: CloudFront serves static files from S3
2. **Authentication**: Cognito handles signup/login
3. **API Calls**: Frontend calls API Gateway endpoints
4. **Processing**: Lambda functions handle business logic
5. **Storage**: DynamoDB stores profiles, swipes, matches

## Scalability

- **Auto-scaling**: Lambda scales to zero when idle
- **Global**: CloudFront edge locations worldwide
- **Performance**: DynamoDB single-digit millisecond latency
- **Cost-effective**: Pay only for actual usage

## Security

- **Encryption**: HTTPS everywhere, DynamoDB encryption at rest
- **Authentication**: JWT tokens via Cognito
- **Authorization**: IAM roles with least privilege
- **Network**: API Gateway rate limiting

## Monitoring Points

- Lambda duration and error rates
- DynamoDB read/write capacity
- CloudFront cache hit ratio
- API Gateway 4xx/5xx errors
- Cognito authentication metrics