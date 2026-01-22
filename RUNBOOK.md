# MatchPoint Operations Runbook

## Monitoring & Alerting

### CloudWatch Dashboard
- **URL**: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=MatchPoint-Monitoring
- **Key Metrics**:
  - Lambda invocations, errors, duration
  - DynamoDB read/write capacity, throttling
  - API Gateway 4xx/5xx errors
  - CloudFront cache hit ratio

### Active Alarms
1. **Lambda Errors** - Triggers when >5 errors in 10 minutes
2. **Lambda Duration** - Triggers when average duration >10 seconds
3. **DynamoDB Throttling** - Triggers on any throttled requests
4. **API Gateway 4xx** - Triggers when >10 4xx errors in 10 minutes

## Common Issues & Solutions

### Issue: High Lambda Duration
**Symptoms**: Slow app response, duration alarms
**Diagnosis**:
```bash
aws logs filter-log-events --log-group-name /aws/lambda/matchpoint-profile --start-time $(date -d '1 hour ago' +%s)000
```
**Solutions**:
- Check DynamoDB performance
- Review Lambda memory allocation
- Optimize code for cold starts

### Issue: DynamoDB Throttling
**Symptoms**: 500 errors, throttling alarms
**Diagnosis**:
```bash
aws cloudwatch get-metric-statistics --namespace AWS/DynamoDB --metric-name ThrottledRequests --dimensions Name=TableName,Value=MatchPointProfiles --start-time $(date -d '1 hour ago' --iso-8601) --end-time $(date --iso-8601) --period 300 --statistics Sum
```
**Solutions**:
- Switch to provisioned capacity if needed
- Implement exponential backoff in Lambda
- Review access patterns

### Issue: API Gateway Errors
**Symptoms**: Frontend errors, 4xx/5xx alarms
**Diagnosis**:
```bash
aws logs filter-log-events --log-group-name API-Gateway-Execution-Logs_$(aws apigateway get-rest-apis --query 'items[?name==`matchpoint-api`].id' --output text)/prod
```
**Solutions**:
- Check Lambda function logs
- Verify API Gateway configuration
- Review CORS settings

### Issue: Frontend Not Loading
**Symptoms**: Blank page, 404 errors
**Diagnosis**:
```bash
aws s3 ls s3://$(terraform output -raw s3_bucket_name)
aws cloudfront get-distribution --id $(aws cloudfront list-distributions --query "DistributionList.Items[0].Id" --output text)
```
**Solutions**:
- Redeploy frontend: `aws s3 sync frontend/ s3://bucket-name`
- Invalidate CloudFront: `aws cloudfront create-invalidation --distribution-id ID --paths "/*"`

## Deployment Procedures

### Manual Deployment
```bash
# 1. Deploy infrastructure
cd infrastructure/
terraform plan
terraform apply

# 2. Deploy frontend
BUCKET=$(terraform output -raw s3_bucket_name)
aws s3 sync ../frontend s3://$BUCKET --delete

# 3. Invalidate cache
aws cloudfront create-invalidation --distribution-id $(aws cloudfront list-distributions --query "DistributionList.Items[0].Id" --output text) --paths "/*"
```

### Rollback Procedure
```bash
# 1. Revert to previous Terraform state
terraform plan -destroy
terraform apply -target=aws_lambda_function.profile_handler

# 2. Restore previous frontend version
aws s3 sync s3://backup-bucket s3://$(terraform output -raw s3_bucket_name)
```

## Health Checks

### Application Health
```bash
# Test API endpoints
curl -X GET "https://$(terraform output -raw api_gateway_url | cut -d'/' -f3)/profiles"

# Test frontend
curl -I "https://$(terraform output -raw cloudfront_url)"
```

### Infrastructure Health
```bash
# Check Lambda functions
aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `matchpoint`)].{Name:FunctionName,State:State}'

# Check DynamoDB tables
aws dynamodb list-tables --query 'TableNames[?starts_with(@, `MatchPoint`)]'
```

## Security Checklist

### Regular Security Tasks
- [ ] Review IAM policies monthly
- [ ] Check for unused resources
- [ ] Verify HTTPS-only access
- [ ] Review CloudTrail logs
- [ ] Update Lambda runtime versions

### Security Incident Response
1. **Identify** - Check CloudTrail for suspicious activity
2. **Contain** - Disable compromised resources
3. **Investigate** - Review logs and access patterns
4. **Recover** - Restore from known good state
5. **Learn** - Update security policies

## Cost Optimization

### Monthly Cost Review
```bash
# Get cost breakdown
aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-02-01 --granularity MONTHLY --metrics BlendedCost --group-by Type=DIMENSION,Key=SERVICE
```

### Cost Optimization Actions
- Monitor DynamoDB usage patterns
- Review Lambda memory allocation
- Optimize CloudFront caching
- Clean up unused resources

## Contact Information

**On-Call Engineer**: [Your Name]
**Escalation**: [Manager Name]
**AWS Support**: [Support Plan Level]

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2024-01-18 | Initial runbook creation | Jakub |
| | | |