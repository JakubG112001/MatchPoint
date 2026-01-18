import json
import boto3
from datetime import datetime
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
swipes_table = dynamodb.Table('MatchPointSwipes')
matches_table = dynamodb.Table('MatchPointMatches')

def lambda_handler(event, context):
    body = json.loads(event['body'])
    user_id = event['requestContext']['authorizer']['claims']['sub']
    target_id = body['targetId']
    direction = body['direction']
    
    swipes_table.put_item(Item={
        'userId': user_id,
        'targetId': target_id,
        'direction': direction,
        'timestamp': datetime.now().isoformat()
    })
    
    if direction == 'right':
        response = swipes_table.query(
            KeyConditionExpression=Key('userId').eq(target_id),
            FilterExpression=Key('targetId').eq(user_id) & Key('direction').eq('right')
        )
        
        if response['Items']:
            matches_table.put_item(Item={
                'matchId': f"{min(user_id, target_id)}#{max(user_id, target_id)}",
                'user1': user_id,
                'user2': target_id,
                'timestamp': datetime.now().isoformat()
            })
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'match': True})
            }
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'match': False})
    }