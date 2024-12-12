import React, { useState } from 'react';
import { Upload, Camera } from 'lucide-react';
import { validateFile } from '../../utils/fileUtils';
import CameraCapture from './CameraCapture';

interface UploadZoneProps {
  onFileSelect: (files: FileList) => void;
  isProcessing: boolean;
}

export default function UploadZone({ onFileSelect, isProcessing }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && validateFile(files[0])) {
      onFileSelect(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (validateFile(e.target.files[0])) {
        onFileSelect(e.target.files);
      }
    }
  };

  const handleCameraCapture = (file: File) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    onFileSelect(dataTransfer.files);
  };

  return (
    <>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Upload Prescription</h3>
        <p className="text-gray-500 mb-4">
          Drag and drop your prescription here, or choose an option below
        </p>
        <p className="text-sm text-gray-400 mb-4">
          Supported formats: JPEG, PNG, HEIC, PDF (max 10MB)
        </p>
        
        <div className="flex justify-center space-x-4">
          <input
            type="file"
            id="fileInput"
            className="hidden"
            accept=".jpg,.jpeg,.png,.heic,.pdf"
            onChange={handleFileInput}
            disabled={isProcessing}
          />
          <label
            htmlFor="fileInput"
            className={`flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 cursor-pointer'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Select Files</span>
          </label>
          
          <button
            onClick={() => setShowCamera(true)}
            disabled={isProcessing}
            className={`flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg transition-colors ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Take Photo</span>
          </button>
        </div>
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  );
}