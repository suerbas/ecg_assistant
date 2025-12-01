import React, { useState, createContext, useContext, ReactNode } from 'react';
import { AppState, PatientInfo, Vitals, ECGMeasurements, ScreenName, AnalysisResult } from './types';
import WelcomeScreen from './screens/WelcomeScreen';
import PatientInfoScreen from './screens/PatientInfoScreen';
import VitalSignsScreen from './screens/VitalSignsScreen';
import ECGCaptureScreen from './screens/ECGCaptureScreen';
import MeasurementScreen from './screens/MeasurementScreen';
import AnalysisScreen from './screens/AnalysisScreen';
import ReportScreen from './screens/ReportScreen';

// --- Context Setup ---

interface AppContextType extends AppState {
  navigate: (screen: ScreenName) => void;
  updatePatientInfo: (info: Partial<PatientInfo>) => void;
  updateVitals: (vitals: Partial<Vitals>) => void;
  setCapturedImage: (image: string) => void;
  updateMeasurements: (measurements: Partial<ECGMeasurements>) => void;
  setAnalysis: (analysis: AnalysisResult) => void;
  resetApp: () => void;
}

const defaultState: AppState = {
  currentScreen: 'Welcome',
  patientInfo: { age: '', sex: '', symptoms: [], riskFactors: [] },
  vitals: { height: '', weight: '', bpSystolic: '', bpDiastolic: '', heartRate: '', temperature: '', oxygenSat: '' },
  capturedImage: null,
  measurements: {
    rrIntervalMs: '', prIntervalMs: '', qrsWidthMs: '', qtIntervalMs: '',
    stElevationMm: '0', stElevationLeads: '', tWaveInversion: false, tWaveInversionLeads: ''
  },
  analysis: null
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};

// --- App Provider ---

const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);

  const navigate = (screen: ScreenName) => setState(prev => ({ ...prev, currentScreen: screen }));
  
  const updatePatientInfo = (info: Partial<PatientInfo>) => 
    setState(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, ...info } }));

  const updateVitals = (vitals: Partial<Vitals>) => 
    setState(prev => ({ ...prev, vitals: { ...prev.vitals, ...vitals } }));

  const setCapturedImage = (image: string) => 
    setState(prev => ({ ...prev, capturedImage: image }));

  const updateMeasurements = (measurements: Partial<ECGMeasurements>) => 
    setState(prev => ({ ...prev, measurements: { ...prev.measurements, ...measurements } }));

  const setAnalysis = (analysis: AnalysisResult) => 
    setState(prev => ({ ...prev, analysis }));

  const resetApp = () => setState(defaultState);

  return (
    <AppContext.Provider value={{ 
      ...state, 
      navigate, 
      updatePatientInfo, 
      updateVitals, 
      setCapturedImage, 
      updateMeasurements, 
      setAnalysis,
      resetApp 
    }}>
      {children}
    </AppContext.Provider>
  );
};

// --- Main Layout ---

const MainLayout = () => {
  const { currentScreen } = useApp();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl relative overflow-hidden">
      <main className="flex-1 flex flex-col relative h-full">
        {currentScreen === 'Welcome' && <WelcomeScreen />}
        {currentScreen === 'PatientInfo' && <PatientInfoScreen />}
        {currentScreen === 'VitalSigns' && <VitalSignsScreen />}
        {currentScreen === 'ECGCapture' && <ECGCaptureScreen />}
        {currentScreen === 'Measurement' && <MeasurementScreen />}
        {currentScreen === 'Analysis' && <AnalysisScreen />}
        {currentScreen === 'Report' && <ReportScreen />}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;