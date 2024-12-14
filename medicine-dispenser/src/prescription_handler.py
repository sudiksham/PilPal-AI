import boto3
import json
from datetime import datetime
from decimal import Decimal
from prescription_parser import PrescriptionDetails
from boto3.dynamodb.types import TypeDeserializer

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

class PrescriptionHandler:
    def __init__(self):
        print("Initializing AWS connections...")
        self.dynamodb = boto3.resource('dynamodb')
        self.iot = boto3.client('iot-data')
        self.prescriptions_table = self.dynamodb.Table('Prescriptions')
        print("AWS connections established")

    def decimal_to_float(self, obj):
        """Convert Decimal objects to float recursively"""
        if isinstance(obj, list):
            return [self.decimal_to_float(i) for i in obj]
        elif isinstance(obj, dict):
            return {k: self.decimal_to_float(v) for k, v in obj.items()}
        elif isinstance(obj, Decimal):
            return float(obj)
        return obj

    def save_prescription(self, prescription: PrescriptionDetails):
        """Save prescription to DynamoDB and configure device"""
        try:
            print("\nPreparing to save prescription to DynamoDB...")
            
            # Convert to dict and format dates properly
            prescription_dict = {
                'id': f"PRESC_{int(datetime.now().timestamp())}",
                'created_at': datetime.now().isoformat(),
                'medication_name': prescription.medication_name,
                'dosage': prescription.dosage,
                'frequency': prescription.frequency,
                'timing': [
                    {
                        'time': t.time,
                        'with_food': t.with_food,
                        'special_instructions': t.special_instructions
                    } for t in prescription.timing
                ],
                'start_date': prescription.start_date.isoformat(),
                'end_date': prescription.end_date.isoformat(),
                'refills': prescription.refills
            }
            
            print(f"\nSaving to DynamoDB with ID: {prescription_dict['id']}")
            print("Prescription data:")
            print(json.dumps(prescription_dict, indent=2, cls=DecimalEncoder))
            
            self.prescriptions_table.put_item(Item=prescription_dict)
            print("Successfully saved to DynamoDB")
            
            device_config = {
                'action': 'configure_alarms',
                'alarms': [
                    {
                        'medication_name': prescription.medication_name,
                        'dosage': prescription.dosage,
                        'time': timing.time,
                        'with_food': timing.with_food,
                        'special_instructions': timing.special_instructions
                    }
                    for timing in prescription.timing
                ]
            }
            
            print("\nSending configuration to IoT device:")
            print(json.dumps(device_config, indent=2))
            
            self.iot.publish(
                topic='medicine/dispenser/command',
                payload=json.dumps(device_config)
            )
            print("Successfully sent configuration to IoT device")
            
            return prescription_dict['id']
            
        except Exception as e:
            print(f"\nERROR - Failed to save prescription: {str(e)}")
            raise e

    def get_prescription(self, prescription_id: str):
        """Retrieve a prescription from DynamoDB"""
        try:
            print(f"\nRetrieving prescription {prescription_id} from DynamoDB...")
            response = self.prescriptions_table.get_item(Key={'id': prescription_id})
            prescription = response.get('Item')
            
            if prescription:
                prescription = self.decimal_to_float(prescription)
                print("Successfully retrieved prescription:")
                print(json.dumps(prescription, indent=2, cls=DecimalEncoder))
            else:
                print(f"No prescription found with ID: {prescription_id}")
            
            return prescription
            
        except Exception as e:
            print(f"\nERROR - Failed to retrieve prescription: {str(e)}")
            raise e

    def get_daily_schedule(self, date_str: str = None):
        """Get all medications scheduled for a specific date"""
        try:
            print("\nRetrieving daily schedule...")
            response = self.prescriptions_table.scan()
            prescriptions = response['Items']
            
            # Use a set to track unique prescription IDs we've already processed
            processed_prescriptions = set()
            schedule = []
            current_date = datetime.now().date() if date_str is None else datetime.strptime(date_str, '%Y-%m-%d').date()
            
            print(f"Processing schedule for date: {current_date}")
            
            # Sort prescriptions by created_at to get the most recent one
            prescriptions.sort(key=lambda x: x.get('created_at', ''), reverse=True)
            
            for prescription in prescriptions:
                prescription_id = prescription.get('id')
                
                # Skip if we've already processed this prescription
                if prescription_id in processed_prescriptions:
                    print(f"Skipping duplicate prescription ID: {prescription_id}")
                    continue
                    
                try:
                    # Handle different possible date formats
                    try:
                        start_date = datetime.strptime(prescription.get('start_date', ''), '%Y-%m-%d').date()
                        end_date = datetime.strptime(prescription.get('end_date', ''), '%Y-%m-%d').date()
                    except ValueError:
                        # Try parsing ISO format if simple format fails
                        start_date = datetime.fromisoformat(prescription.get('start_date', '')).date()
                        end_date = datetime.fromisoformat(prescription.get('end_date', '')).date()
                    
                    print(f"Date range: {start_date} to {end_date}")
                    
                    if start_date <= current_date <= end_date:
                        timing_list = prescription.get('timing', [])
                        medication_name = prescription.get('medication_name')
                        
                        # Add to processed set
                        processed_prescriptions.add(prescription_id)
                        
                        if isinstance(timing_list, list):
                            for timing in timing_list:
                                schedule_item = {
                                    'time': timing.get('time', '00:00'),
                                    'medication_name': medication_name,
                                    'dosage': prescription.get('dosage', 'Unknown'),
                                    'with_food': timing.get('with_food', False),
                                    'special_instructions': timing.get('special_instructions', ''),
                                    'prescription_id': prescription_id
                                }
                                schedule.append(schedule_item)
                                print(f"Added schedule item: {json.dumps(schedule_item, indent=2)}")
                                
                except Exception as e:
                    print(f"Warning: Skipping prescription due to error: {str(e)}")
                    continue
            
            schedule = self.decimal_to_float(schedule)
            sorted_schedule = sorted(schedule, key=lambda x: x['time'])
            
            print("\nFinal daily schedule:")
            print(json.dumps(sorted_schedule, indent=2, cls=DecimalEncoder))
            
            return sorted_schedule
            
        except Exception as e:
            print(f"\nERROR - Failed to get daily schedule: {str(e)}")
            raise e

    def cleanup_old_prescriptions(self):
        """Remove all existing prescriptions"""
        try:
            print("\nPerforming complete cleanup of prescriptions...")
            
            # Get all prescriptions
            response = self.prescriptions_table.scan()
            prescriptions = response['Items']
            
            if not prescriptions:
                print("No prescriptions to clean up")
                return
                
            print(f"Found {len(prescriptions)} prescriptions to delete")
            
            # Delete each prescription
            for prescription in prescriptions:
                prescription_id = prescription['id']
                print(f"Deleting prescription: {prescription_id}")
                
                try:
                    self.prescriptions_table.delete_item(
                        Key={'id': prescription_id}
                    )
                except Exception as e:
                    print(f"Error deleting prescription {prescription_id}: {e}")
                    continue
            
            print("Cleanup completed successfully")
            
        except Exception as e:
            print(f"\nERROR - Failed to cleanup prescriptions: {str(e)}")
            raise e

    def delete_prescription(self, prescription_id: str):
        """Delete a specific prescription"""
        try:
            print(f"Deleting prescription: {prescription_id}")
            self.prescriptions_table.delete_item(
                Key={'id': prescription_id}
            )
        except Exception as e:
            print(f"Error deleting prescription {prescription_id}: {e}")
            raise e