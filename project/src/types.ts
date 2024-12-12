export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timeSlots: string[];
  startDate: string;
  endDate?: string;
  notes?: string;
  prescriptionId?: string;
}

export interface Prescription {
  id: string;
  uploadDate: string;
  imageUrl: string;
  medicines: Medicine[];
}