from diagrams import Diagram, Cluster
from diagrams.aws.compute import Lambda
from diagrams.aws.network import APIGateway
from diagrams.aws.security import Cognito
from diagrams.aws.storage import S3
from diagrams.aws.database import Dynamodb

with Diagram("MatchPoint Architecture", show=True, direction="LR"):

    user = S3("User Browser / Mobile") 

    s3_frontend = S3("S3 + CloudFront")
    cognito = Cognito("Cognito Auth")
    api = APIGateway("API Gateway")
    backend = Lambda("Lambda Functions")
    db = Dynamodb("DynamoDB")
    images = S3("S3 Images")

    user >> s3_frontend >> api >> backend
    user >> cognito >> api
    backend >> db
    backend >> images
