import json
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('MatchPointProfiles')

def lambda_handler(event, context):
    method = event['httpMethod']
    
    if method == 'POST':
        body = json.loads(event['body'])
        user_id = event['requestContext']['authorizer']['claims']['sub']
        
        item = {
            'userId': user_id,
            'name': body['name'],
            'age': int(body['age']),
            'bio': body['bio'],
            'photo': body.get('photo', 'https://via.placeholder.com/300')
        }
        
        table.put_item(Item=item)
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Profile saved'})
        }
    
    elif method == 'GET':
        response = table.scan()
        profiles = response['Items']
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(profiles)
        }