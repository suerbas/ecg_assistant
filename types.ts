export type ScreenName = 
  | 'Welcome' 
  | 'PatientInfo' 
  | 'VitalSigns' 
  | 'ECGCapture' 
  | 'Measurement' 
  | 'Analysis' 
  | 'Report';

export interface PatientInfo {
  age: string;
  sex: 'Male' | 'Female' | '';
  symptoms: string[];
  riskFactors: string[];
}

export interface Vitals {
  height: string;
  weight: string;
  bpSystolic: string;
  bpDiastolic: string;
  heartRate: string;
  temperature: string;
  oxygenSat: string;
}

export interface ECGMeasurements {
  rrIntervalMs: string;
  prIntervalMs: string;
  qrsWidthMs: string;
  qtIntervalMs: string;
  stElevationMm: string;
  stElevationLeads: string;
  tWaveInversion: boolean;
  tWaveInversionLeads: string;
}

export interface AnalysisResult {
  calculatedHeartRate: number;
  rhythm: 'Regular' | 'Irregular';
  prInterpretation: string;
  qrsInterpretation: string;
  qtc: number;
  qtInterpretation: string;
  stInterpretation: string;
  riskLevel: 'HIGH' | 'MODERATE' | 'LOW';
  summary: string[];
}

export interface AppState {
  currentScreen: ScreenName;
  patientInfo: PatientInfo;
  vitals: Vitals;
  capturedImage: string | null; // Base64
  measurements: ECGMeasurements;
  analysis: AnalysisResult | null;
}

export const SYMPTOMS_LIST = [
  'Chest Pain', 'Palpitations', 'Dyspnea', 'Dizziness', 'Fever', 'Syncope'
];

export const RISK_FACTORS_LIST = [
  'Hypertension', 'Diabetes', 'Smoker', 'Hyperlipidemia', 'Family History CAD'
];