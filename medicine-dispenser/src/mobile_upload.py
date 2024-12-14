import os
import boto3
import base64
from prescription_parser import PrescriptionParser, PrescriptionDetails
from prescription_handler import PrescriptionHandler
from PIL import Image
import io
import json
from datetime import date, datetime
import uuid
from decimal import Decimal
import time

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)

class S3ImageProcessor:
    def __init__(self):
        self.s3 = boto3.client('s3')
        self.BUCKET_NAME = 'medicine-dispenser-prescriptions'
        self.processed_images = set()

    def create_bucket_if_not_exists(self):
        try:
            print("\nChecking S3 bucket...")
            self.s3.head_bucket(Bucket=self.BUCKET_NAME)
            print(f"Bucket {self.BUCKET_NAME} exists")
        except:
            print(f"Creating bucket {self.BUCKET_NAME}...")
            self.s3.create_bucket(
                Bucket=self.BUCKET_NAME,
                CreateBucketConfiguration={'LocationConstraint': 'us-west-2'}
            )
            print("Bucket created successfully")

    def poll_bucket_for_images(self):
        print("\nPolling S3 bucket for new images...")
        try:
            response = self.s3.list_objects_v2(Bucket=self.BUCKET_NAME)
            if 'Contents' in response:
                for obj in response['Contents']:
                    key = obj['Key']
                    if key.endswith(('.jpg', '.jpeg', '.png')) and key not in self.processed_images:
                        print(f"New image found: {key}")
                        self.processed_images.add(key)
                        self.process_image_from_s3(key)
        except Exception as e:
            print(f"Error polling S3 bucket: {e}")
            raise e

    def process_image_from_s3(self, key):
        try:
            print("\nDownloading image from S3...")
            obj = self.s3.get_object(Bucket=self.BUCKET_NAME, Key=key)
            img_data = obj['Body'].read()

            print("Processing image...")
            img = Image.open(io.BytesIO(img_data))
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')

            img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=85)
            buffer.seek(0)

            print("Re-uploading optimized image to S3...")
            optimized_key = f"optimized_{key}"
            self.s3.upload_fileobj(buffer, self.BUCKET_NAME, optimized_key)

            url = self.s3.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.BUCKET_NAME, 'Key': optimized_key},
                ExpiresIn=3600
            )

            print(f"Image optimized and uploaded: {url}")
            self.handle_prescription_processing(url)
        except Exception as e:
            print(f"Error processing image: {e}")
            raise e

    def handle_prescription_processing(self, s3_url):
        try:
            prescription_handler = PrescriptionHandler()
            parser = PrescriptionParser()

            print("\nCleaning up existing prescriptions...")
            prescription_handler.cleanup_old_prescriptions()
            print("Cleanup completed")

            print("\nParsing prescription from S3 URL...")
            prescription = parser.parse_prescription(s3_url)

            print("\nSaving prescription to DynamoDB...")
            prescription_id = prescription_handler.save_prescription(prescription)
            print(f"Prescription saved with ID: {prescription_id}")

            print("\nGenerating schedule...")
            schedule = prescription_handler.get_daily_schedule()
            print("\nToday's Schedule:")
            print(json.dumps(schedule, indent=2, cls=CustomJSONEncoder))

            summary = {
                "status": "success",
                "prescription_id": prescription_id,
                "upload_time": datetime.now().isoformat(),
                "medication": prescription.medication_name,
                "next_dose": schedule[0] if schedule else None
            }
            print("\nProcessing Summary:")
            print(json.dumps(summary, indent=2, cls=CustomJSONEncoder))

        except Exception as e:
            print(f"Error handling prescription processing: {e}")
            raise e

if __name__ == "__main__":
    processor = S3ImageProcessor()
    processor.create_bucket_if_not_exists()

    try:
        while True:
            processor.poll_bucket_for_images()
            time.sleep(10)
    except KeyboardInterrupt:
        print("\nPolling stopped by user.")
