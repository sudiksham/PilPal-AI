import React from 'react';
import { Bell, Clock, Calendar, X } from 'lucide-react';
import { format } from 'date-fns';
import { Medicine } from '../../types';

interface AlarmListProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AlarmList({ isOpen, onClose }: AlarmListProps) {
  const medicines = JSON.parse(localStorage.getItem('medicines') || '[]') as Medicine[];
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-16">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center">
            <Bell className="w-5 h-5 mr-2 text-blue-600" />
            Medicine Alarms
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {medicines.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No medicine alarms set</p>
            </div>
          ) : (
            <div className="space-y-4">
              {medicines.map((medicine) => (
                <div key={medicine.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{medicine.name}</h3>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {medicine.dosage}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <div className="flex flex-wrap gap-2">
                        {medicine.timeSlots.map((time, index) => (
                          <span key={index} className="bg-gray-200 px-2 py-1 rounded">
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Started {format(new Date(medicine.startDate), 'MMM d, yyyy')}</span>
                    </div>
                    
                    {medicine.notes && (
                      <p className="text-gray-500 mt-2 italic">
                        {medicine.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}