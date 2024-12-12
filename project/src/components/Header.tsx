import React, { useState } from 'react';
import { Pill, Bell, FileText } from 'lucide-react';
import AlarmList from './alarms/AlarmList';

export default function Header() {
  const [showAlarms, setShowAlarms] = useState(false);

  return (
    <>
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Pill className="h-8 w-8" />
              <h1 className="text-2xl font-bold">PilPal AI</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <button 
                onClick={() => setShowAlarms(true)}
                className="flex items-center space-x-2 hover:text-blue-200 transition"
              >
                <Bell className="h-5 w-5" />
                <span>Alarms</span>
              </button>
              <button className="flex items-center space-x-2 hover:text-blue-200 transition">
                <FileText className="h-5 w-5" />
                <span>Prescriptions</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <AlarmList 
        isOpen={showAlarms}
        onClose={() => setShowAlarms(false)}
      />
    </>
  );
}