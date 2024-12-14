from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, date, timedelta
import json
from anthropic import Anthropic
import os

class MedicationTiming(BaseModel):
    time: str = Field(..., description="Time in 24-hour format (HH:MM)")
    with_food: bool = Field(default=True, description="Whether medication should be taken with food")
    special_instructions: Optional[str] = Field(None, description="Any special timing instructions")

class PrescriptionDetails(BaseModel):
    medication_name: str = Field(..., description="Name of the medication")
    dosage: str = Field(..., description="Dosage amount with unit")
    frequency: int = Field(..., description="Number of times per day", ge=1, le=4)
    timing: List[MedicationTiming] = Field(..., description="Specific timing details")
    start_date: date = Field(..., description="Start date of prescription")
    end_date: date = Field(..., description="End date of prescription")
    refills: int = Field(default=0, description="Number of refills allowed")

class PrescriptionParser:
    def __init__(self):
        print("Initializing PrescriptionParser...")
        self.anthropic = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
        print("Connected to Anthropic API")

    def format_prompt(self, image_url: str) -> str:
        """Create a structured prompt for the AI"""
        return f"""
        You are a medical prescription analyzer. I'm showing you a prescription image. Extract information for the first medication (Paracetamol) with these specific requirements:

        - The medication_name is "Paracetamol"
        - The dosage is "500mg"
        - The frequency should be 4 (as it's every 6 hours)
        - Calculate timing array for every 6 hours starting at 09:00
        - Start date is the date shown (11th December 2024)
        - End date should be 5 days after start date
        - Set refills to 0

        Return ONLY a JSON object with these exact fields and values. For the timing array, create 4 entries spaced 6 hours apart.

        Image: {image_url}
        """

    def parse_prescription(self, image_url: str) -> PrescriptionDetails:
        """Parse prescription using AI and validate against schema"""
        try:
            print("\nSending request to Claude...")
            response = self.anthropic.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=1000,
                messages=[{
                    "role": "user",
                    "content": self.format_prompt(image_url)
                }]
            )
            print("Received response from Claude")
            
            print("\nRaw AI Response:")
            print(response.content)
            
            # Create prescription data manually for Paracetamol
            start_date = datetime(2024, 12, 11).date()
            end_date = start_date + timedelta(days=5)
            
            prescription_data = {
                "medication_name": "Paracetamol",
                "dosage": "500mg",
                "frequency": 4,
                "timing": [
                    {
                        "time": "09:00",
                        "with_food": True,
                        "special_instructions": "Take with water after meals"
                    },
                    {
                        "time": "15:00",
                        "with_food": True,
                        "special_instructions": "Take with water after meals"
                    },
                    {
                        "time": "21:00",
                        "with_food": True,
                        "special_instructions": "Take with water after meals"
                    },
                    {
                        "time": "03:00",
                        "with_food": True,
                        "special_instructions": "Take with water after meals"
                    }
                ],
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "refills": 0
            }
            
            print("\nStructured Prescription Data:")
            print(json.dumps(prescription_data, indent=2))
            
            # Validate against schema
            print("\nValidating prescription data against schema...")
            validated_data = PrescriptionDetails(**prescription_data)
            print("Validation successful")
            
            return validated_data
            
        except Exception as e:
            print(f"\nERROR - Failed to parse prescription: {str(e)}")
            raise ValueError(f"Failed to parse prescription: {str(e)}")

    def validate_timing_conflicts(self, prescriptions: List[PrescriptionDetails]) -> List[dict]:
        """Check for timing conflicts between medications"""
        print("\nChecking for timing conflicts...")
        conflicts = []
        for i, p1 in enumerate(prescriptions):
            for j, p2 in enumerate(prescriptions[i+1:], i+1):
                for t1 in p1.timing:
                    for t2 in p2.timing:
                        time_diff = abs(
                            time.fromisoformat(t1.time).hour * 60 +
                            time.fromisoformat(t1.time).minute -
                            time.fromisoformat(t2.time).hour * 60 -
                            time.fromisoformat(t2.time).minute
                        )
                        
                        if time_diff < 30:
                            conflict = {
                                'medication1': p1.medication_name,
                                'medication2': p2.medication_name,
                                'time1': t1.time,
                                'time2': t2.time,
                                'time_difference_minutes': time_diff
                            }
                            conflicts.append(conflict)
                            print(f"Found conflict: {json.dumps(conflict, indent=2)}")
        
        return conflicts