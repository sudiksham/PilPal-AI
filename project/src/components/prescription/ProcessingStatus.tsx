import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingStatusProps {
  fileName: string;
  progress: number;
}

export default function ProcessingStatus({ fileName, progress }: ProcessingStatusProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{fileName}</span>
        <span className="text-sm text-gray-500">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center mt-2 text-sm text-gray-500">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Processing prescription...
      </div>
    </div>
  );
}