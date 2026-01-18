

echo "🚀 Deploying MatchPoint to AWS..."

cd backend/profile && zip -r ../../infrastructure/profile.zip . && cd ../..
cd backend/swipe && zip -r ../../infrastructure/swipe.zip . && cd ../..
cd backend/matches && zip -r ../../infrastructure/matches.zip . && cd ../..

cd infrastructure
terraform init
terraform plan
terraform apply -auto-approve

API_URL=$(terraform output -raw api_gateway_url)
S3_BUCKET=$(terraform output -raw s3_website_url)

echo "✅ Infrastructure deployed!"
echo "📡 API Gateway: $API_URL"
echo "🌐 S3 Website: $S3_BUCKET"

cd ../frontend
aws s3 sync . s3://$(echo $S3_BUCKET | cut -d'.' -f1) --delete

echo "✅ Frontend uploaded!"
echo "🎉 MatchPoint is live at: http://$S3_BUCKET"