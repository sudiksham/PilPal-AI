import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import { Medicine } from '../types';
import { format } from 'date-fns';

interface MedicineListProps {
  medicines: Medicine[];
  onEditMedicine: (medicine: Medicine) => void;
}

export default function MedicineList({ medicines, onEditMedicine }: MedicineListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {medicines.map((medicine) => (
        <div
          key={medicine.id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          onClick={() => onEditMedicine(medicine)}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{medicine.name}</h3>
          <p className="text-gray-600 mb-4">{medicine.dosage}</p>
          
          <div className="flex items-center space-x-2 text-gray-500 mb-2">
            <Clock className="h-4 w-4" />
            <span>{medicine.frequency}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(medicine.startDate), 'MMM d, yyyy')}</span>
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {medicine.timeSlots.map((time, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                >
                  {time}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}