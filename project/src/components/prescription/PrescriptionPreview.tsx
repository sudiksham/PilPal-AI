import React from 'react';
import { FileText, X, Check, Bell } from 'lucide-react';
import { formatFileSize } from '../../utils/fileUtils';

interface PrescriptionPreviewProps {
  file: File;
  onRemove: () => void;
  extractedData?: {
    medicines: Array<{
      name: string;
      dosage: string;
      frequency: string;
    }>;
  };
}

export default function PrescriptionPreview({ file, onRemove, extractedData }: PrescriptionPreviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <FileText className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <h4 className="font-medium text-gray-900">{file.name}</h4>
            <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {extractedData && (
        <div className="mt-4 border-t pt-4">
          <h5 className="font-medium text-gray-900 mb-2 flex items-center">
            <Check className="w-4 h-4 text-green-500 mr-2" />
            Extracted Medicines
          </h5>
          <ul className="space-y-2">
            {extractedData.medicines.map((medicine, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-center justify-between">
                <span>{medicine.name} - {medicine.dosage} ({medicine.frequency})</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start space-x-3">
            <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Default reminders added:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Paracetamol (500mg) - For fever and pain</li>
                <li>ORS - For hydration and diarrhea</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}