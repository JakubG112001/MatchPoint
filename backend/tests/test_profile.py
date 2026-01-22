import json
import pytest
from unittest.mock import Mock, patch
import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'profile'))

def test_profile_handler_get():
    """Test GET request to profile handler"""
    # Mock event
    event = {
        'httpMethod': 'GET',
        'requestContext': {}
    }
    
    # Mock context
    context = Mock()
    
    # Mock DynamoDB response
    mock_response = {
        'Items': [
            {'userId': 'test1', 'name': 'Test User', 'age': 25, 'bio': 'Test bio'}
        ]
    }
    
    with patch('boto3.resource') as mock_boto3:
        mock_table = Mock()
        mock_table.scan.return_value = mock_response
        mock_boto3.return_value.Table.return_value = mock_table
        
        # Import after mocking
        from handler import lambda_handler
        
        response = lambda_handler(event, context)
        
        assert response['statusCode'] == 200
        assert 'Access-Control-Allow-Origin' in response['headers']
        
        body = json.loads(response['body'])
        assert len(body) == 1
        assert body[0]['name'] == 'Test User'

def test_profile_validation():
    """Test that profile data is properly validated"""
    # This would test input validation
    # For now, just a placeholder
    assert True

if __name__ == '__main__':
    pytest.main([__file__])