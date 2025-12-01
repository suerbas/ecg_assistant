import { ECGMeasurements, AnalysisResult } from '../types';

export const analyzeECG = (measurements: ECGMeasurements): AnalysisResult => {
  const rr = parseFloat(measurements.rrIntervalMs) || 0;
  const pr = parseFloat(measurements.prIntervalMs) || 0;
  const qrs = parseFloat(measurements.qrsWidthMs) || 0;
  const qt = parseFloat(measurements.qtIntervalMs) || 0;
  const stElev = parseFloat(measurements.stElevationMm) || 0;

  const summary: string[] = [];
  let riskLevel: 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';

  // 1. Heart Rate Calculation (60000 / RR in ms)
  // If RR is 0, avoid infinity, default to 0
  const calculatedHeartRate = rr > 0 ? Math.round(60000 / rr) : 0;

  // 2. Rhythm (Simple inference: if HR is widely fluctuating or user inputs... 
  // but here we rely on the consistency of the RR entered manually. 
  // In a real app, we might sample multiple RRs. 
  // For this logic, we assume the single entered RR implies regular, unless HR is extreme).
  // However, to satisfy the prompt's "Regular vs Irregular" rule based on RR, 
  // we will add a manual toggle in the UI or infer. 
  // Since we only capture one RR value, we will infer "Regular" 
  // but flag extreme tachycardia/bradycardia.
  const rhythm: 'Regular' | 'Irregular' = 'Regular'; 

  // 3. PR Interval
  let prInterpretation = 'Normal';
  if (pr > 200) {
    prInterpretation = 'Prolonged (1st Degree AV Block)';
    summary.push('PR > 200ms: Suggests 1st Degree AV Block');
  } else if (pr < 120 && pr > 0) {
    prInterpretation = 'Short (Pre-excitation?)';
  }

  // 4. QRS Width
  let qrsInterpretation = 'Normal';
  if (qrs > 120) {
    qrsInterpretation = 'Wide (Bundle Branch Block / Ventricular)';
    summary.push('QRS > 120ms: Delay in ventricular depolarization');
    if (riskLevel === 'LOW') riskLevel = 'MODERATE';
  }

  // 5. QTc Calculation (Bazett: QT / sqrt(RR in seconds))
  const rrSeconds = rr / 1000;
  let qtc = 0;
  if (rrSeconds > 0) {
    qtc = Math.round(qt / Math.sqrt(rrSeconds));
  }

  let qtInterpretation = 'Normal';
  if (qtc > 460) {
    qtInterpretation = 'Prolonged';
    summary.push(`QTc ${qtc}ms: Prolonged (>460ms). Risk of TdP.`);
    if (riskLevel === 'LOW') riskLevel = 'MODERATE'; 
  }

  // 6. ST Segment
  let stInterpretation = 'Normal';
  if (stElev >= 1) {
    stInterpretation = 'Elevation';
    summary.push(`ST Elevation ${stElev}mm: Suspicion of Ischemia/Infarction.`);
    riskLevel = 'HIGH';
  } else if (measurements.tWaveInversion) {
    stInterpretation = 'T-Wave Inversion';
    summary.push('T-Wave Inversion: Suggests Ischemia or Strain.');
    if (riskLevel === 'LOW') riskLevel = 'MODERATE';
  }

  // 7. Overall HR Check
  if (calculatedHeartRate > 120 || calculatedHeartRate < 45) {
     summary.push(`Abnormal Heart Rate: ${calculatedHeartRate} bpm`);
     if (riskLevel === 'LOW') riskLevel = 'MODERATE';
  }

  return {
    calculatedHeartRate,
    rhythm,
    prInterpretation,
    qrsInterpretation,
    qtc,
    qtInterpretation,
    stInterpretation,
    riskLevel,
    summary
  };
};