"""
s3_uploader.py — Upload PDF bytes to AWS S3 and return a pre-signed URL.
"""

import os
import uuid
from datetime import datetime

import boto3
from botocore.exceptions import BotoCoreError, ClientError


def upload_report_to_s3(pdf_bytes: bytes, user_id: str) -> str:
    """
    Upload PDF bytes to S3 and return a pre-signed download URL.

    Args:
        pdf_bytes: Raw PDF content.
        user_id:   Identifier for the requesting user (used as path prefix).

    Returns:
        Pre-signed URL (valid for PRESIGNED_URL_EXPIRY seconds, default 3600).

    Raises:
        RuntimeError: If the upload or URL generation fails.
    """
    aws_access_key_id     = os.environ["AWS_ACCESS_KEY_ID"]
    aws_secret_access_key = os.environ["AWS_SECRET_ACCESS_KEY"]
    region                = os.environ.get("AWS_REGION", "ap-south-1")
    bucket_name           = os.environ["S3_BUCKET_NAME"]
    expiry                = int(os.environ.get("PRESIGNED_URL_EXPIRY", 3600))

    # Build a unique S3 key
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    unique_id = uuid.uuid4().hex[:8]
    s3_key    = f"reports/{user_id}/{timestamp}_{unique_id}.pdf"

    try:
        s3_client = boto3.client(
            "s3",
            region_name=region,
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
        )

        s3_client.put_object(
            Bucket=bucket_name,
            Key=s3_key,
            Body=pdf_bytes,
            ContentType="application/pdf",
            # No ACL — bucket stays private; pre-signed URL grants temporary access
        )

        presigned_url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket_name, "Key": s3_key},
            ExpiresIn=expiry,
        )

        return presigned_url

    except (BotoCoreError, ClientError) as exc:
        raise RuntimeError(f"S3 upload failed: {exc}") from exc