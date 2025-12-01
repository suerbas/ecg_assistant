import React from 'react';
import { useApp } from '../App';
import { ArrowLeft, Thermometer, Activity, Heart, Scale } from 'lucide-react';

const InputField = ({ label, value, onChange, icon: Icon, unit }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Icon className="w-5 h-5" />
      </div>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="0"
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">{unit}</span>
    </div>
  </div>
);

const VitalSignsScreen = () => {
  const { navigate, vitals, updateVitals } = useApp();

  const isFormValid = vitals.bpSystolic && vitals.bpDiastolic && vitals.heartRate;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3">
        <button onClick={() => navigate('PatientInfo')} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">Vital Signs</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        
        <div className="bg-white p-5 rounded-xl shadow-sm mb-4">
            <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2">Hemodynamics</h3>
            <div className="grid grid-cols-2 gap-4">
                <InputField 
                    label="BP Systolic" 
                    value={vitals.bpSystolic} 
                    onChange={(v: string) => updateVitals({ bpSystolic: v })} 
                    icon={Activity} 
                    unit="mmHg" 
                />
                <InputField 
                    label="BP Diastolic" 
                    value={vitals.bpDiastolic} 
                    onChange={(v: string) => updateVitals({ bpDiastolic: v })} 
                    icon={Activity} 
                    unit="mmHg" 
                />
            </div>
            <InputField 
                label="Heart Rate" 
                value={vitals.heartRate} 
                onChange={(v: string) => updateVitals({ heartRate: v })} 
                icon={Heart} 
                unit="bpm" 
            />
            <InputField 
                label="O2 Saturation" 
                value={vitals.oxygenSat} 
                onChange={(v: string) => updateVitals({ oxygenSat: v })} 
                icon={Activity} 
                unit="%" 
            />
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2">Body Measurements</h3>
            <div className="grid grid-cols-2 gap-4">
                <InputField 
                    label="Height" 
                    value={vitals.height} 
                    onChange={(v: string) => updateVitals({ height: v })} 
                    icon={Scale} 
                    unit="cm" 
                />
                <InputField 
                    label="Weight" 
                    value={vitals.weight} 
                    onChange={(v: string) => updateVitals({ weight: v })} 
                    icon={Scale} 
                    unit="kg" 
                />
            </div>
            <InputField 
                label="Temperature" 
                value={vitals.temperature} 
                onChange={(v: string) => updateVitals({ temperature: v })} 
                icon={Thermometer} 
                unit="°C" 
            />
        </div>
      </div>

      <div className="p-4 bg-white border-t">
        <button 
            disabled={!isFormValid}
            onClick={() => navigate('ECGCapture')}
            className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-colors ${
                isFormValid ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
        >
            Next: Capture ECG
            <ArrowLeft className="w-5 h-5 rotate-180" />
        </button>
      </div>
    </div>
  );
};

export default VitalSignsScreen;