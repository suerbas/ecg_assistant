import React, { useState, useRef } from 'react';
import { useApp } from '../App';
import { ArrowLeft, MoveHorizontal, Check, Settings2, ArrowDownToLine, Ruler, Info } from 'lucide-react';

const MeasurementScreen = () => {
  const { navigate, capturedImage, measurements, updateMeasurements } = useApp();
  
  // Caliper state
  const [caliper1, setCaliper1] = useState(30); // percent
  const [caliper2, setCaliper2] = useState(70); // percent
  
  // Scale state: How many milliseconds is the full width of the view?
  const [totalViewMs, setTotalViewMs] = useState(2500);
  const [showCalibration, setShowCalibration] = useState(false);

  // Helper to handle dragging
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDrag = (e: React.MouseEvent | React.TouchEvent, setter: (val: number) => void) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    
    // Calculate percentage
    let percent = ((clientX - rect.left) / rect.width) * 100;
    percent = Math.max(0, Math.min(100, percent));
    setter(percent);
  };

  // Calculations
  const left = Math.min(caliper1, caliper2);
  const right = Math.max(caliper1, caliper2);
  const diffPercent = right - left;
  
  const measuredMs = Math.round((diffPercent / 100) * totalViewMs);
  const smallBoxes = (measuredMs / 40).toFixed(1);

  const isValid = measurements.rrIntervalMs && measurements.qtIntervalMs && measurements.qrsWidthMs;

  const applyMeasurement = (field: keyof typeof measurements) => {
    updateMeasurements({ [field]: measuredMs.toString() });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
       <div className="bg-white p-4 shadow-sm flex items-center gap-3 z-10 border-b">
        <button onClick={() => navigate('ECGCapture')} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div>
            <h2 className="text-xl font-bold text-gray-800 leading-none">Measurement</h2>
            <p className="text-xs text-gray-500 mt-1">Manual Verification</p>
        </div>
      </div>

      <div className="bg-blue-600 text-white px-4 py-2 text-xs flex items-center justify-between">
         <span className="flex items-center gap-2"><Info size={14}/> 1. Drag calipers to measure</span>
         <span className="flex items-center gap-2"><ArrowDownToLine size={14}/> 2. Tap buttons to save</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        
        {/* --- Image & Caliper Container --- */}
        <div className="relative bg-gray-900 overflow-hidden select-none h-80 touch-none group border-b border-gray-800 shadow-inner" ref={containerRef}>
            
            {/* Grid Overlay (Visual aid) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none z-0" 
                 style={{ 
                     backgroundImage: `linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)`,
                     backgroundSize: `${(40 / totalViewMs) * 100}% 10px`
                 }} 
            />

            {capturedImage ? (
                <img src={capturedImage} alt="ECG" className="w-full h-full object-contain opacity-70" draggable={false} />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 flex-col gap-2">
                    <Ruler size={32} />
                    <span>No Image Captured</span>
                </div>
            )}
            
            {/* --- Caliper 1 (Red) --- */}
            <div 
                className="absolute top-0 bottom-0 w-1 bg-rose-500 cursor-ew-resize z-20 flex flex-col items-center hover:bg-rose-400 transition-colors shadow-[0_0_10px_rgba(244,63,94,0.6)]"
                style={{ left: `${caliper1}%` }}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => handleDrag(e, setCaliper1)}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseMove={(e) => e.buttons === 1 && handleDrag(e, setCaliper1)}
            >
                 <div className="absolute top-0 p-4 -ml-4 w-10 h-full touch-action-none" /> {/* Expanded Hit area */}
                 <div className="w-9 h-9 bg-rose-500 rounded-full shadow-lg flex items-center justify-center mt-2 ring-2 ring-white/50 backdrop-blur-sm">
                    <MoveHorizontal size={16} className="text-white"/>
                 </div>
                 {/* Decorative dots on line */}
                 <div className="flex-1 w-px bg-white/30 my-2"></div>
            </div>

             {/* --- Caliper 2 (Blue) --- */}
             <div 
                className="absolute top-0 bottom-0 w-1 bg-sky-500 cursor-ew-resize z-20 flex flex-col items-center hover:bg-sky-400 transition-colors shadow-[0_0_10px_rgba(14,165,233,0.6)]"
                style={{ left: `${caliper2}%` }}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => handleDrag(e, setCaliper2)}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseMove={(e) => e.buttons === 1 && handleDrag(e, setCaliper2)}
            >
                <div className="absolute top-0 p-4 -ml-4 w-10 h-full touch-action-none" /> {/* Expanded Hit area */}
                <div className="w-9 h-9 bg-sky-500 rounded-full shadow-lg flex items-center justify-center mt-2 ring-2 ring-white/50 backdrop-blur-sm">
                    <MoveHorizontal size={16} className="text-white"/>
                </div>
                 {/* Decorative dots on line */}
                 <div className="flex-1 w-px bg-white/30 my-2"></div>
            </div>

            {/* --- Measurement Indicator (Connecting Line) --- */}
            <div 
                className="absolute top-1/2 flex items-center justify-center pointer-events-none z-10"
                style={{ left: `${left}%`, width: `${diffPercent}%`, transform: 'translateY(-50%)' }}
            >
                {/* Dashed Connecting Line */}
                <div className="absolute w-full border-t-2 border-dashed border-yellow-300 drop-shadow-md"></div>

                {/* Vertical Ticks at ends */}
                <div className="absolute left-0 h-6 w-0.5 bg-yellow-300 -top-3 shadow-sm rounded-full" />
                <div className="absolute right-0 h-6 w-0.5 bg-yellow-300 -top-3 shadow-sm rounded-full" />
                
                {/* Floating Label */}
                <div className="bg-gray-900/95 text-white px-3 py-1.5 rounded-lg shadow-xl border border-yellow-500/30 flex flex-col items-center whitespace-nowrap z-30 transform -translate-y-8 backdrop-blur-sm">
                    <div className="flex items-baseline gap-1">
                        <span className="font-bold text-lg text-yellow-400 font-mono tracking-tight">{measuredMs}</span>
                        <span className="text-xs text-yellow-200 font-medium">ms</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium bg-white/10 px-1.5 rounded mt-0.5">{smallBoxes} boxes</span>
                </div>
            </div>

            {/* Scale Control Toggle */}
            <button 
                onClick={() => setShowCalibration(!showCalibration)}
                className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-md transition-colors z-30 flex items-center gap-1"
            >
                <Settings2 size={14} />
                <span className="text-xs font-medium">Calibrate</span>
            </button>
        </div>
        
        {/* --- Calibration Slider Panel --- */}
        {showCalibration && (
            <div className="bg-gray-800 p-3 text-white animate-fade-in-down border-b border-gray-700">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Zoom In (1s)</span>
                    <span className="text-yellow-400 font-bold">Scale: {totalViewMs}ms Width</span>
                    <span>Zoom Out (5s)</span>
                </div>
                <input 
                    type="range" 
                    min="1000" 
                    max="5000" 
                    step="100"
                    value={totalViewMs}
                    onChange={(e) => setTotalViewMs(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <p className="text-[10px] text-gray-500 mt-1 text-center">Adjust until the small boxes in image match ~40ms logic.</p>
            </div>
        )}

        {/* --- Quick Actions & Inputs --- */}
        <div className="p-4 space-y-5">
            
            {/* Quick Apply Buttons */}
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 shadow-sm">
                <p className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-1">
                    <ArrowDownToLine size={12} /> Apply {measuredMs}ms to:
                </p>
                <div className="flex gap-2">
                    {['RR', 'PR', 'QRS', 'QT'].map((type) => (
                        <button
                            key={type}
                            onClick={() => applyMeasurement(
                                type === 'RR' ? 'rrIntervalMs' : 
                                type === 'PR' ? 'prIntervalMs' : 
                                type === 'QRS' ? 'qrsWidthMs' : 'qtIntervalMs'
                            )}
                            className="flex-1 py-2 bg-white text-blue-700 text-xs font-bold rounded-lg shadow-sm border border-blue-200 hover:bg-blue-600 hover:text-white transition-colors active:scale-95"
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Manual Inputs Form */}
            <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-800 mb-3 text-sm">Interval Values</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">RR Interval</label>
                            <input type="number" value={measurements.rrIntervalMs} onChange={e => updateMeasurements({rrIntervalMs: e.target.value})} className="w-full p-2 border rounded mt-1 outline-none focus:border-blue-500 font-mono text-sm transition-colors" placeholder="e.g. 800" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">PR Interval</label>
                            <input type="number" value={measurements.prIntervalMs} onChange={e => updateMeasurements({prIntervalMs: e.target.value})} className="w-full p-2 border rounded mt-1 outline-none focus:border-blue-500 font-mono text-sm transition-colors" placeholder="e.g. 160" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">QRS Width</label>
                            <input type="number" value={measurements.qrsWidthMs} onChange={e => updateMeasurements({qrsWidthMs: e.target.value})} className="w-full p-2 border rounded mt-1 outline-none focus:border-blue-500 font-mono text-sm transition-colors" placeholder="e.g. 90" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">QT Interval</label>
                            <input type="number" value={measurements.qtIntervalMs} onChange={e => updateMeasurements({qtIntervalMs: e.target.value})} className="w-full p-2 border rounded mt-1 outline-none focus:border-blue-500 font-mono text-sm transition-colors" placeholder="e.g. 380" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-800 mb-3 text-sm">Morphology</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">ST Elevation (mm)</span>
                                <input type="number" value={measurements.stElevationMm} onChange={e => updateMeasurements({stElevationMm: e.target.value})} className="w-20 p-2 border rounded text-right font-mono text-sm" />
                            </label>
                            {parseFloat(measurements.stElevationMm) > 0 && (
                                 <input type="text" placeholder="Leads (e.g. II, III, aVF)" value={measurements.stElevationLeads} onChange={e => updateMeasurements({stElevationLeads: e.target.value})} className="w-full mt-2 p-2 border rounded text-sm" />
                            )}
                        </div>
                        
                        <div className="flex items-center justify-between border-t pt-3">
                            <span className="text-sm font-medium text-gray-700">T-Wave Inversion?</span>
                            <button 
                                onClick={() => updateMeasurements({tWaveInversion: !measurements.tWaveInversion})}
                                className={`w-12 h-6 rounded-full transition-colors relative ${measurements.tWaveInversion ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${measurements.tWaveInversion ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t">
        <button 
            disabled={!isValid}
            onClick={() => navigate('Analysis')}
            className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-colors ${
                isValid ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
        >
            Analyze ECG
            <Check className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MeasurementScreen;