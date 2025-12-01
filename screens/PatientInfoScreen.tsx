import React from 'react';
import { useApp } from '../App';
import { SYMPTOMS_LIST, RISK_FACTORS_LIST } from '../types';
import { ArrowLeft, User, CheckCircle2 } from 'lucide-react';

const PatientInfoScreen = () => {
  const { navigate, patientInfo, updatePatientInfo } = useApp();

  const toggleItem = (list: string[], item: string, updater: (l: string[]) => void) => {
    if (list.includes(item)) {
      updater(list.filter(i => i !== item));
    } else {
      updater([...list, item]);
    }
  };

  const isFormValid = patientInfo.age && patientInfo.sex;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3 z-10">
        <button onClick={() => navigate('Welcome')} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">Patient Information</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Basic Info */}
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-800">Demographics</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Age</label>
                    <input 
                        type="number" 
                        value={patientInfo.age} 
                        onChange={e => updatePatientInfo({ age: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Years"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Sex</label>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {['Male', 'Female'].map(s => (
                            <button
                                key={s}
                                onClick={() => updatePatientInfo({ sex: s as any })}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                                    patientInfo.sex === s ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Symptoms */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Symptoms</h3>
            <div className="flex flex-wrap gap-2">
                {SYMPTOMS_LIST.map(symptom => {
                    const active = patientInfo.symptoms.includes(symptom);
                    return (
                        <button
                            key={symptom}
                            onClick={() => toggleItem(patientInfo.symptoms, symptom, l => updatePatientInfo({ symptoms: l }))}
                            className={`px-4 py-2 rounded-full text-sm border transition-all ${
                                active ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-600'
                            }`}
                        >
                            {symptom}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Risk Factors */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Risk Factors</h3>
            <div className="space-y-2">
                {RISK_FACTORS_LIST.map(factor => {
                    const active = patientInfo.riskFactors.includes(factor);
                    return (
                        <button
                            key={factor}
                            onClick={() => toggleItem(patientInfo.riskFactors, factor, l => updatePatientInfo({ riskFactors: l }))}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                                active ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-gray-200 text-gray-600'
                            }`}
                        >
                            <span>{factor}</span>
                            {active && <CheckCircle2 className="w-5 h-5" />}
                        </button>
                    );
                })}
            </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t">
        <button 
            disabled={!isFormValid}
            onClick={() => navigate('VitalSigns')}
            className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-colors ${
                isFormValid ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
        >
            Next: Vital Signs
            <ArrowLeft className="w-5 h-5 rotate-180" />
        </button>
      </div>
    </div>
  );
};

export default PatientInfoScreen;