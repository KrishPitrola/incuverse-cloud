import boto3
import os
from datetime import datetime, timezone
from botocore.exceptions import ClientError

dynamodb = boto3.resource(
    "dynamodb",
    region_name=os.getenv("AWS_REGION", "ap-south-1"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

TABLE_NAME = os.getenv("DYNAMODB_TABLE_NAME", "incuverse-profiles")


def save_profile(user_id: str, profile_data: dict) -> dict:
    """Upsert user profile into DynamoDB."""
    table = dynamodb.Table(TABLE_NAME)
    item = {
        "user_id": user_id,
        "profile": profile_data,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    table.put_item(Item=item)
    return item


def get_profile(user_id: str) -> dict | None:
    """Fetch user profile from DynamoDB. Returns None if not found."""
    table = dynamodb.Table(TABLE_NAME)
    try:
        response = table.get_item(Key={"user_id": user_id})
        return response.get("Item")  # None if key missing
    except ClientError as e:
        print(f"[DynamoDB] get_profile error: {e}")
        return None