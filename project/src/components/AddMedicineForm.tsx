import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Medicine } from '../types';

interface AddMedicineFormProps {
  onSubmit: (medicine: Omit<Medicine, 'id'>) => void;
  onClose: () => void;
}

export default function AddMedicineForm({ onSubmit, onClose }: AddMedicineFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    timeSlots: ['08:00'],
    startDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addTimeSlot = () => {
    setFormData((prev) => ({
      ...prev,
      timeSlots: [...prev.timeSlots, '12:00'],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Add New Medicine</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medicine Name
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-lg"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dosage
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-lg"
              value={formData.dosage}
              onChange={(e) => setFormData((prev) => ({ ...prev, dosage: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={formData.frequency}
              onChange={(e) => setFormData((prev) => ({ ...prev, frequency: e.target.value }))}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Slots
            </label>
            <div className="space-y-2">
              {formData.timeSlots.map((time, index) => (
                <input
                  key={index}
                  type="time"
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                  value={time}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      timeSlots: prev.timeSlots.map((t, i) =>
                        i === index ? e.target.value : t
                      ),
                    }))
                  }
                />
              ))}
              <button
                type="button"
                onClick={addTimeSlot}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Add Time Slot</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 border rounded-lg"
              value={formData.startDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, startDate: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Add Medicine
          </button>
        </form>
      </div>
    </div>
  );
}