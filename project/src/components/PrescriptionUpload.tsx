import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import UploadZone from './prescription/UploadZone';
import ProcessingStatus from './prescription/ProcessingStatus';
import PrescriptionPreview from './prescription/PrescriptionPreview';
import { Medicine } from '../types';

interface ExtractedData {
  medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
}

export default function PrescriptionUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const createDefaultReminders = (): Medicine[] => {
    const now = new Date();
    return [
      {
        id: `paracetamol-${Date.now()}`,
        name: "Paracetamol",
        dosage: "500mg",
        frequency: "As needed",
        timeSlots: ["08:00", "14:00", "20:00"],
        startDate: now.toISOString().split('T')[0],
        notes: "Take for fever or pain. Maximum 4 doses in 24 hours."
      },
      {
        id: `ors-${Date.now()}`,
        name: "ORS (Oral Rehydration Solution)",
        dosage: "1 sachet",
        frequency: "As needed",
        timeSlots: ["09:00", "15:00", "21:00"],
        startDate: now.toISOString().split('T')[0],
        notes: "Dissolve in clean water. Take for dehydration or diarrhea."
      }
    ];
  };

  const handleFileSelect = async (files: FileList) => {
    const file = files[0];
    setSelectedFile(file);
    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(i);
      }

      // Simulate AI processing result
      const mockExtractedData = {
        medicines: [
          {
            name: "Amoxicillin",
            dosage: "500mg",
            frequency: "3 times daily"
          },
          {
            name: "Ibuprofen",
            dosage: "400mg",
            frequency: "as needed"
          }
        ]
      };

      setExtractedData(mockExtractedData);
      
      // Add default reminders
      const defaultReminders = createDefaultReminders();
      const existingMedicines = JSON.parse(localStorage.getItem('medicines') || '[]');
      localStorage.setItem('medicines', JSON.stringify([...existingMedicines, ...defaultReminders]));
      
      setIsProcessing(false);
      toast.success('Prescription processed with Paracetamol and ORS reminders added!');
    } catch (error) {
      toast.error('Error processing prescription');
      setIsProcessing(false);
      setSelectedFile(null);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setExtractedData(null);
    setIsProcessing(false);
    setProgress(0);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {!selectedFile && (
        <UploadZone
          onFileSelect={handleFileSelect}
          isProcessing={isProcessing}
        />
      )}

      {selectedFile && isProcessing && (
        <ProcessingStatus
          fileName={selectedFile.name}
          progress={progress}
        />
      )}

      {selectedFile && !isProcessing && (
        <PrescriptionPreview
          file={selectedFile}
          onRemove={handleRemove}
          extractedData={extractedData}
        />
      )}
    </div>
  );
}