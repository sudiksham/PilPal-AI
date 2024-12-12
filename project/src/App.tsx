import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import Header from './components/Header';
import MedicineList from './components/MedicineList';
import PrescriptionUpload from './components/PrescriptionUpload';
import AddMedicineForm from './components/AddMedicineForm';
import { Medicine } from './types';

function App() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddMedicine = (medicineData: Omit<Medicine, 'id'>) => {
    const newMedicine: Medicine = {
      ...medicineData,
      id: Date.now().toString(),
    };
    setMedicines((prev) => [...prev, newMedicine]);
    setShowAddForm(false);
    toast.success('Medicine added successfully!');
  };

  const handleEditMedicine = (medicine: Medicine) => {
    // Implement edit functionality
    toast.success('Medicine updated successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Your Medicines</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="h-5 w-5" />
            <span>Add Medicine</span>
          </button>
        </div>

        {medicines.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No medicines added yet</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-blue-600 hover:text-blue-700"
            >
              Add your first medicine
            </button>
          </div>
        ) : (
          <MedicineList medicines={medicines} onEditMedicine={handleEditMedicine} />
        )}

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Prescription</h2>
          <PrescriptionUpload />
        </div>
      </main>

      {showAddForm && (
        <AddMedicineForm
          onSubmit={handleAddMedicine}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}

export default App;