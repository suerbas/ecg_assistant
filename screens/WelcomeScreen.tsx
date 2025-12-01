import React, { useState } from 'react';
import { useApp } from '../App';
import { Activity, ShieldAlert, ArrowRight } from 'lucide-react';

const WelcomeScreen = () => {
  const { navigate } = useApp();
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white p-6 justify-between animate-fade-in">
      <div className="mt-12 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <Activity className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">EKG Assistant</h1>
        <p className="text-lg text-gray-500 font-medium">Theory + Practice</p>
        <div className="mt-8 space-y-4 text-left">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-1">Smart Capture</h3>
                <p className="text-sm text-blue-700">Auto-align and enhance ECG paper traces.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <h3 className="font-semibold text-green-900 mb-1">Guided Analysis</h3>
                <p className="text-sm text-green-700">Measure intervals and stratify risk.</p>
            </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 flex gap-3">
            <ShieldAlert className="w-6 h-6 text-orange-600 flex-shrink-0" />
            <div className="text-xs text-orange-800 leading-relaxed">
                <strong>LEGAL DISCLAIMER:</strong> This tool is for educational purposes and clinical decision support only. It does not provide medical diagnosis or treatment. Always correlate with clinical findings and professional medical judgment.
            </div>
        </div>

        <button 
            onClick={() => navigate('PatientInfo')}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-lg active:scale-[0.98]"
        >
            Start New Analysis
            <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;