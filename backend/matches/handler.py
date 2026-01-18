import json
import boto3
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb')
matches_table = dynamodb.Table('MatchPointMatches')
profiles_table = dynamodb.Table('MatchPointProfiles')

def lambda_handler(event, context):
    user_id = event['requestContext']['authorizer']['claims']['sub']
    
    response = matches_table.scan(
        FilterExpression=Attr('user1').eq(user_id) | Attr('user2').eq(user_id)
    )
    
    matches = []
    for match in response['Items']:
        other_user_id = match['user2'] if match['user1'] == user_id else match['user1']
        
        profile_response = profiles_table.get_item(Key={'userId': other_user_id})
        if 'Item' in profile_response:
            matches.append(profile_response['Item'])
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(matches)
    }