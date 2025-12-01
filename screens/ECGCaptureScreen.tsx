import React, { useRef, useEffect, useState } from 'react';
import { useApp } from '../App';
import { ArrowLeft, Zap, ZapOff, Info } from 'lucide-react';

const ECGCaptureScreen = () => {
  const { navigate, setCapturedImage } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [status, setStatus] = useState("Align ECG trace in box");
  const [progress, setProgress] = useState(0);
  const [isAutoCapture, setIsAutoCapture] = useState(true); // Default to true, but toggleable
  const [flash, setFlash] = useState(false);

  // Constants for stability check
  const STABILITY_THRESHOLD = 25; 
  const REQUIRED_STABLE_FRAMES = 40; // Increased to ~1.3s for less "sudden" captures

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        requestAnimationFrame(checkStability);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setStatus("Camera access denied");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const lastFrameData = useRef<Uint8ClampedArray | null>(null);
  const stableFrameCount = useRef(0);
  const animationFrameId = useRef<number>();

  const checkStability = () => {
    if (!videoRef.current || !canvasRef.current || capturing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = 300; 
      canvas.height = 150;
      
      const sx = (video.videoWidth - 600) / 2;
      const sy = (video.videoHeight - 300) / 2;
      
      if(sx >= 0 && sy >= 0) {
          ctx.drawImage(video, sx, sy, 600, 300, 0, 0, 300, 150);
      } else {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      if (lastFrameData.current && isAutoCapture) {
        let diff = 0;
        for (let i = 0; i < frameData.length; i += 40) {
          diff += Math.abs(frameData[i] - lastFrameData.current[i]);
        }
        const avgDiff = diff / (frameData.length / 40);

        if (avgDiff < STABILITY_THRESHOLD) {
          stableFrameCount.current += 1;
          setStatus("Hold steady...");
        } else {
          stableFrameCount.current = 0;
          setStatus("Align ECG trace in box");
        }

        const currentProgress = Math.min((stableFrameCount.current / REQUIRED_STABLE_FRAMES) * 100, 100);
        setProgress(currentProgress);

        if (stableFrameCount.current > REQUIRED_STABLE_FRAMES) {
          captureImage();
          return; 
        }
      } else if (!isAutoCapture) {
          setProgress(0);
          setStatus("Tap button to capture");
      }

      lastFrameData.current = frameData;
    }

    animationFrameId.current = requestAnimationFrame(checkStability);
  };

  const captureImage = () => {
    if (!videoRef.current || capturing) return;
    
    // Trigger visual flash
    setFlash(true);
    setTimeout(() => setFlash(false), 150);

    setCapturing(true);
    setStatus("Enhancing Image...");
    
    if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
        ctx.drawImage(video, 0, 0);

        // Image Processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const contrast = 1.3; 
        const intercept = 128 * (1 - contrast);

        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const newColor = (avg * contrast) + intercept;
            data[i] = newColor;     
            data[i + 1] = newColor; 
            data[i + 2] = newColor; 
        }
        ctx.putImageData(imageData, 0, 0);

        // Crop Center
        const cropCanvas = document.createElement('canvas');
        const cropWidth = canvas.width * 0.8;
        const cropHeight = cropWidth * 0.5; 
        cropCanvas.width = cropWidth;
        cropCanvas.height = cropHeight;
        
        const cropCtx = cropCanvas.getContext('2d');
        if(cropCtx) {
            cropCtx.drawImage(
                canvas, 
                (canvas.width - cropWidth) / 2, 
                (canvas.height - cropHeight) / 2, 
                cropWidth, 
                cropHeight, 
                0, 0, 
                cropWidth, cropHeight
            );
            
            const base64 = cropCanvas.toDataURL('image/jpeg', 0.85);
            setCapturedImage(base64);
            
            // Add a slight delay so user sees "Enhancing..." message
            setTimeout(() => {
                stopCamera();
                navigate('Measurement');
            }, 800);
        }
    }
  };

  return (
    <div className="flex flex-col h-full bg-black relative">
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Flash Overlay */}
      <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-150 ${flash ? 'opacity-100' : 'opacity-0'} z-50`} />
      
      <canvas ref={canvasRef} className="hidden" />

      {/* Overlay UI */}
      <div className="absolute inset-0 flex flex-col justify-between z-20 p-4 safe-area-top">
        {/* Header Controls */}
        <div className="flex justify-between items-center pt-2">
            <button onClick={() => navigate('VitalSigns')} className="p-3 bg-black/40 rounded-full backdrop-blur-md text-white hover:bg-black/60 transition-colors">
                <ArrowLeft className="w-6 h-6" />
            </button>
            
            {/* Auto Toggle */}
            <button 
                onClick={() => setIsAutoCapture(!isAutoCapture)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border transition-all ${isAutoCapture ? 'bg-green-500/20 border-green-400 text-green-100' : 'bg-black/40 border-white/20 text-white'}`}
            >
                {isAutoCapture ? <Zap className="w-4 h-4 fill-green-100" /> : <ZapOff className="w-4 h-4" />}
                <span className="text-xs font-bold uppercase">{isAutoCapture ? 'Auto On' : 'Manual'}</span>
            </button>
        </div>

        {/* Alignment Box Area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className={`relative w-full max-w-sm aspect-[2/1] border-2 rounded-xl transition-colors duration-200 shadow-[0_0_100px_rgba(0,0,0,0.5)] ${progress > 80 ? 'border-green-400 bg-green-400/5' : 'border-white/80 bg-white/5'}`}>
                {/* Corners */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white -mt-[2px] -ml-[2px]"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white -mt-[2px] -mr-[2px]"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white -mb-[2px] -ml-[2px]"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white -mb-[2px] -mr-[2px]"></div>
                
                {/* Center Crosshair */}
                <div className="absolute top-1/2 left-1/2 w-4 h-4 -ml-2 -mt-2 border-l border-t border-white/30" />
                <div className="absolute top-1/2 left-1/2 w-4 h-4 -ml-2 -mt-2 border-r border-b border-white/30 transform rotate-180" />

                {/* Status Badge inside box */}
                <div className="absolute -top-10 left-0 right-0 flex justify-center">
                    <div className="bg-black/60 text-white text-sm font-semibold px-3 py-1 rounded-full backdrop-blur border border-white/10">
                        {status}
                    </div>
                </div>
                
                {/* Progress Bar (Only show if Auto) */}
                {isAutoCapture && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div 
                            className="h-full bg-green-500 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(74,222,128,0.8)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>
            
            {/* Help Text */}
            <div className="flex items-center gap-2 text-white/70 bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                <Info size={14} />
                <span className="text-xs">
                    {isAutoCapture ? "Hold steady to auto-capture" : "Align trace and tap button"}
                </span>
            </div>
        </div>

        {/* Shutter Control */}
        <div className="pb-8 flex justify-center items-center">
            <button 
                onClick={captureImage}
                disabled={capturing}
                className="group relative w-20 h-20 flex items-center justify-center transition-transform active:scale-95"
            >
                <div className="absolute inset-0 rounded-full border-4 border-white opacity-100 group-active:scale-110 transition-transform duration-200"></div>
                <div className="w-16 h-16 bg-white rounded-full shadow-lg group-active:bg-gray-200 transition-colors"></div>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ECGCaptureScreen;