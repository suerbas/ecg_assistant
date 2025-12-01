import React, { useRef, useEffect, useState } from 'react';
import { useApp } from '../App';
import { ArrowLeft, Camera, RefreshCw } from 'lucide-react';

const ECGCaptureScreen = () => {
  const { navigate, setCapturedImage } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [status, setStatus] = useState("Align ECG in box");
  const [progress, setProgress] = useState(0);

  // Constants for stability check
  const STABILITY_THRESHOLD = 20; // Lower is stricter
  const REQUIRED_STABLE_FRAMES = 30; // ~1 second at 30fps

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

  // Logic to simulate "smart capture" by checking pixel difference between frames
  // In a real production web app, we'd use a more robust CV library, but this works for demo
  const lastFrameData = useRef<Uint8ClampedArray | null>(null);
  const stableFrameCount = useRef(0);
  const animationFrameId = useRef<number>();

  const checkStability = () => {
    if (!videoRef.current || !canvasRef.current || capturing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = 300; // Small resolution for processing speed
      canvas.height = 150;
      
      // Draw center crop of video
      const sx = (video.videoWidth - 600) / 2;
      const sy = (video.videoHeight - 300) / 2;
      // Safety check for negative source dimensions if video is small
      if(sx >= 0 && sy >= 0) {
          ctx.drawImage(video, sx, sy, 600, 300, 0, 0, 300, 150);
      } else {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      if (lastFrameData.current) {
        let diff = 0;
        // Sample every 10th pixel for performance
        for (let i = 0; i < frameData.length; i += 40) {
          diff += Math.abs(frameData[i] - lastFrameData.current[i]);
        }
        const avgDiff = diff / (frameData.length / 40);

        if (avgDiff < STABILITY_THRESHOLD) {
          stableFrameCount.current += 1;
        } else {
          stableFrameCount.current = 0;
        }

        const currentProgress = Math.min((stableFrameCount.current / REQUIRED_STABLE_FRAMES) * 100, 100);
        setProgress(currentProgress);

        if (stableFrameCount.current > REQUIRED_STABLE_FRAMES) {
          captureImage();
          return; // Stop loop
        }
      }

      lastFrameData.current = frameData;
    }

    animationFrameId.current = requestAnimationFrame(checkStability);
  };

  const captureImage = () => {
    if (!videoRef.current || capturing) return;
    setCapturing(true);
    setStatus("Processing...");
    cancelAnimationFrame(animationFrameId.current!);

    // High res capture
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
        // Draw full frame
        ctx.drawImage(video, 0, 0);

        // Simple Image Enhancement (Simulating Expo Image Manipulator)
        // 1. Convert to grayscale & Increase Contrast
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const contrast = 1.5; // Factor
        const intercept = 128 * (1 - contrast);

        for (let i = 0; i < data.length; i += 4) {
            // Grayscale
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            // Contrast
            const newColor = (avg * contrast) + intercept;
            data[i] = newColor;     // R
            data[i + 1] = newColor; // G
            data[i + 2] = newColor; // B
        }
        ctx.putImageData(imageData, 0, 0);

        // Crop to the center "Box"
        // The box in UI is roughly w-full h-64. 
        // We approximate the center portion of the high-res image.
        const cropCanvas = document.createElement('canvas');
        const cropWidth = canvas.width * 0.8;
        const cropHeight = cropWidth * 0.5; // Aspect ratio 2:1
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
            
            const base64 = cropCanvas.toDataURL('image/jpeg', 0.8);
            setCapturedImage(base64);
            stopCamera();
            setTimeout(() => navigate('Measurement'), 500);
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
      
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Overlay UI */}
      <div className="absolute inset-0 flex flex-col justify-between z-20 p-4">
        <div className="flex justify-between items-center pt-2">
            <button onClick={() => navigate('VitalSigns')} className="p-2 bg-black/40 rounded-full backdrop-blur-md text-white">
                <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="px-3 py-1 bg-black/40 rounded-full backdrop-blur-md">
                <span className="text-white text-sm font-medium">{status}</span>
            </div>
            <div className="w-10"></div>
        </div>

        {/* Alignment Box */}
        <div className="flex-1 flex items-center justify-center">
            <div className={`relative w-full max-w-sm aspect-[2/1] border-2 rounded-xl transition-colors duration-200 ${progress > 80 ? 'border-green-400 bg-green-400/10' : 'border-white/70 bg-white/5'}`}>
                {/* Corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white -mt-[2px] -ml-[2px]"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white -mt-[2px] -mr-[2px]"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white -mb-[2px] -ml-[2px]"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white -mb-[2px] -mr-[2px]"></div>
                
                {/* Progress Bar */}
                <div className="absolute bottom-2 left-4 right-4 h-1 bg-gray-500/50 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-green-500 transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>

        {/* Controls */}
        <div className="pb-8 flex justify-center items-center gap-8">
            <button 
                onClick={captureImage}
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 active:bg-white/40 transition-all"
            >
                <div className="w-16 h-16 bg-white rounded-full"></div>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ECGCaptureScreen;