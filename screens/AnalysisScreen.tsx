import React, { useEffect } from 'react';
import { useApp } from '../App';
import { analyzeECG } from '../utils/ecgLogic';
import { ArrowRight, AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';

const AnalysisScreen = () => {
  const { navigate, measurements, setAnalysis, analysis } = useApp();

  useEffect(() => {
    const result = analyzeECG(measurements);
    setAnalysis(result);
  }, [measurements, setAnalysis]);

  if (!analysis) return <div className="p-10 text-center">Analyzing...</div>;

  const bgColors = {
    'LOW': 'bg-green-50 border-green-200',
    'MODERATE': 'bg-yellow-50 border-yellow-200',
    'HIGH': 'bg-red-50 border-red-200'
  };

  const textColors = {
    'LOW': 'text-green-800',
    'MODERATE': 'text-yellow-800',
    'HIGH': 'text-red-800'
  };

  const Icons = {
    'LOW': CheckCircle,
    'MODERATE': AlertTriangle,
    'HIGH': AlertOctagon
  };

  const RiskIcon = Icons[analysis.riskLevel];

  return (
    <div className="flex flex-col h-full bg-gray-50">
       <div className="bg-white p-4 shadow-sm z-10 border-b">
        <h2 className="text-xl font-bold text-gray-800 text-center">Diagnostic Support</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Risk Card */}
        <div className={`p-6 rounded-2xl border-2 flex flex-col items-center text-center shadow-sm ${bgColors[analysis.riskLevel]}`}>
            <RiskIcon className={`w-16 h-16 mb-2 ${textColors[analysis.riskLevel]}`} />
            <h1 className={`text-2xl font-bold ${textColors[analysis.riskLevel]}`}>
                {analysis.riskLevel} RISK
            </h1>
            <p className="text-sm font-medium opacity-80 mt-1 max-w-[200px]">
                {analysis.riskLevel === 'HIGH' ? 'Possible STEMI or Dangerous Arrhythmia' : 
                 analysis.riskLevel === 'MODERATE' ? 'Abnormal ECG requiring consultation' : 
                 'No critical abnormalities found'}
            </p>
        </div>

        {/* Detailed Findings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
                <h3 className="font-semibold text-gray-700">Automated Interpretation</h3>
            </div>
            <div className="divide-y">
                <ResultRow label="Heart Rate" value={`${analysis.calculatedHeartRate} bpm`} />
                <ResultRow label="Rhythm" value={analysis.rhythm} />
                <ResultRow label="PR Interval" value={analysis.prInterpretation} highlight={analysis.prInterpretation !== 'Normal'} />
                <ResultRow label="QRS Complex" value={analysis.qrsInterpretation} highlight={analysis.qrsInterpretation !== 'Normal'} />
                <ResultRow label="QTc" value={`${analysis.qtc} ms (${analysis.qtInterpretation})`} highlight={analysis.qtc > 460} />
                <ResultRow label="ST-T Changes" value={analysis.stInterpretation} highlight={analysis.stInterpretation !== 'Normal'} />
            </div>
        </div>
        
        {/* Summary Messages */}
        {analysis.summary.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Clinical Notes</h3>
                <ul className="list-disc pl-5 space-y-1">
                    {analysis.summary.map((note, idx) => (
                        <li key={idx} className="text-sm text-gray-600">{note}</li>
                    ))}
                </ul>
            </div>
        )}

      </div>

      <div className="p-4 bg-white border-t">
        <button 
            onClick={() => navigate('Report')}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-lg"
        >
            View Full Report
            <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const ResultRow = ({ label, value, highlight }: any) => (
    <div className="flex justify-between p-4">
        <span className="text-gray-500 font-medium">{label}</span>
        <span className={`font-semibold ${highlight ? 'text-red-600' : 'text-gray-900'}`}>{value}</span>
    </div>
);

export default AnalysisScreen;