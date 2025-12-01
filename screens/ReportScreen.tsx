import React from 'react';
import { useApp } from '../App';
import { FileText, Download, RotateCcw } from 'lucide-react';
import { jsPDF } from 'jspdf';

const ReportScreen = () => {
  const { navigate, resetApp, patientInfo, vitals, analysis, measurements, capturedImage } = useApp();

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 15;
    let y = margin;

    // Header
    doc.setFontSize(22);
    doc.text("EKG Assistant Report", margin, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
    doc.text("Disclaimer: Educational use only. Not a medical diagnosis.", margin, y + 5);
    y += 15;

    // Patient Info
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.text("Patient Demographics", margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Age: ${patientInfo.age || 'N/A'}`, margin, y);
    doc.text(`Sex: ${patientInfo.sex || 'N/A'}`, margin + 60, y);
    y += 6;
    doc.text(`Symptoms: ${patientInfo.symptoms.join(', ') || 'None'}`, margin, y);
    y += 6;
    doc.text(`Risk Factors: ${patientInfo.riskFactors.join(', ') || 'None'}`, margin, y);
    y += 10;

    // Vitals
    doc.setFontSize(14);
    doc.text("Vitals", margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`BP: ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg`, margin, y);
    doc.text(`HR: ${vitals.heartRate} bpm`, margin + 60, y);
    y += 6;
    doc.text(`O2 Sat: ${vitals.oxygenSat}%`, margin, y);
    y += 10;

    // Analysis
    if (analysis) {
        doc.setFontSize(14);
        doc.text("EKG Analysis Results", margin, y);
        y += 8;
        
        // Risk Level
        doc.setFontSize(12);
        doc.setTextColor(analysis.riskLevel === 'HIGH' ? 200 : 0, 0, 0);
        doc.text(`Risk Assessment: ${analysis.riskLevel}`, margin, y);
        doc.setTextColor(0);
        y += 8;

        doc.setFontSize(10);
        doc.text(`Rhythm: ${analysis.rhythm}`, margin, y);
        doc.text(`Calculated HR: ${analysis.calculatedHeartRate}`, margin + 80, y);
        y += 6;
        doc.text(`QTc: ${analysis.qtc}ms (${analysis.qtInterpretation})`, margin, y);
        y += 6;
        doc.text(`PR: ${measurements.prIntervalMs}ms (${analysis.prInterpretation})`, margin, y);
        y += 6;
        doc.text(`QRS: ${measurements.qrsWidthMs}ms (${analysis.qrsInterpretation})`, margin, y);
        y += 6;
        doc.text(`ST Segment: ${analysis.stInterpretation}`, margin, y);
        y += 10;

        doc.setFontSize(12);
        doc.text("Clinical Notes:", margin, y);
        y += 6;
        doc.setFontSize(10);
        analysis.summary.forEach(line => {
            doc.text(`• ${line}`, margin + 5, y);
            y += 5;
        });
    }

    // Image (if fits)
    if (capturedImage) {
        y += 10;
        if (y > 200) {
            doc.addPage();
            y = 20;
        }
        doc.text("Captured Trace:", margin, y);
        y += 5;
        // Add image (simple compress)
        doc.addImage(capturedImage, 'JPEG', margin, y, 180, 90);
    }

    doc.save(`ekg-report-${Date.now()}.pdf`);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
       <div className="bg-gray-900 p-6 shadow-sm text-white">
        <h2 className="text-2xl font-bold mb-1">Final Report</h2>
        <p className="text-gray-400 text-sm">Review summary and export.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm">Patient Status</p>
                <h3 className={`text-xl font-bold ${analysis?.riskLevel === 'HIGH' ? 'text-red-600' : analysis?.riskLevel === 'MODERATE' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {analysis?.riskLevel} RISK
                </h3>
            </div>
            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="text-gray-600" />
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b">
                <h4 className="font-semibold">Summary Findings</h4>
            </div>
            <div className="p-4 space-y-2 text-sm text-gray-600">
                <p><span className="font-medium text-gray-900">Rhythm:</span> {analysis?.rhythm}</p>
                <p><span className="font-medium text-gray-900">Heart Rate:</span> {analysis?.calculatedHeartRate} bpm</p>
                <p><span className="font-medium text-gray-900">QTc:</span> {analysis?.qtc} ms</p>
                <p><span className="font-medium text-gray-900">ST-T:</span> {analysis?.stInterpretation}</p>
                {analysis?.summary.length ? (
                    <div className="mt-3 bg-gray-50 p-3 rounded">
                        <p className="font-medium text-gray-900 mb-1">Notes:</p>
                        <ul className="list-disc pl-4 space-y-1">
                             {analysis.summary.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                ) : null}
            </div>
        </div>

        {capturedImage && (
            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                <p className="px-2 py-2 font-medium text-sm">Trace Capture</p>
                <img src={capturedImage} alt="Trace" className="w-full h-32 object-cover rounded bg-black" />
            </div>
        )}

      </div>

      <div className="p-4 bg-white border-t space-y-3">
        <button 
            onClick={generatePDF}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg"
        >
            <Download className="w-5 h-5" />
            Save as PDF
        </button>
        <button 
            onClick={resetApp}
            className="w-full bg-white text-gray-700 border border-gray-300 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
        >
            <RotateCcw className="w-4 h-4" />
            Start New Analysis
        </button>
      </div>
    </div>
  );
};

export default ReportScreen;