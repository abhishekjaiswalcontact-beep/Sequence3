"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { Upload, Camera, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface WebcamPoseEstimatorProps {
  onScanComplete: (result: { 
    image: string; 
    pose: poseDetection.Pose | null; 
    height: string; 
    weight: string; 
    goal: string;
    gender?: string;
  }) => void;
}

export default function WebcamPoseEstimator({ onScanComplete }: WebcamPoseEstimatorProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [scanMode, setScanMode] = useState<'UPLOAD' | 'CAMERA'>('UPLOAD');
  const [isLoaded, setIsLoaded] = useState(false);
  const [step, setStep] = useState<'IDLE' | 'SCANNING' | 'PROCESSING_UPLOAD' | 'DETAILS'>('IDLE');
  const [progress, setProgress] = useState(0);
  
  // Details State
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('72');
  const [goal, setGoal] = useState('Build Muscle');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');

  const latestPoseRef = useRef<poseDetection.Pose | null>(null);
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [recentScans, setRecentScans] = useState<Array<{ id: string; feedback?: string; postureScore?: number; createdAt: string | Date; [key: string]: unknown }>>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Video Constraints
  const videoConstraints = {
    facingMode: "user",
    width: { ideal: 720 },
    height: { ideal: 1280 },
    aspectRatio: { ideal: 0.5625 }
  };

  // Fetch History
  const fetchHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch(`/api/scan/history?t=${new Date().getTime()}`);
      if (res.ok) {
        const data = await res.json();
        setRecentScans(data);
      }
    } catch (e) {
      console.error("Failed to load history", e);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (step === 'IDLE') {
      fetchHistory();
    }
  }, [step, fetchHistory]);

  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);

  useEffect(() => {
    const setupModel = async () => {
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        
        const detectorConfig = { 
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true
        };
        detectorRef.current = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
        setIsLoaded(true);
      } catch (err) {
        console.error("TFJS Initialization Error:", err);
        setError("AI initialization failed. Please reload the page.");
      }
    };

    setupModel();

    return () => {
      if (detectorRef.current) {
        detectorRef.current.dispose();
      }
    };
  }, []);

  const drawSkeletonUtils = (pose: poseDetection.Pose, ctx: CanvasRenderingContext2D) => {
    const adjacentKeyPoints = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw skeleton lines
    ctx.beginPath();
    adjacentKeyPoints.forEach(([i, j]) => {
      const kp1 = pose.keypoints[i];
      const kp2 = pose.keypoints[j];
      if (kp1.score != null && kp1.score > 0.3 && kp2.score != null && kp2.score > 0.3) {
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
      }
    });
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#8b5cf6'; // Brand neon purple
    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 15;
    ctx.stroke();

    // Draw landmark dots
    pose.keypoints.forEach((keypoint) => {
      if (keypoint.score != null && keypoint.score > 0.3) {
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
  };

  const handleUserMedia = useCallback(() => {
    setError(null);
    if (webcamRef.current?.video) {
      const video = webcamRef.current.video;
      const { videoWidth, videoHeight } = video;
      
      if (canvasRef.current) {
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
      }
    }
  }, []);

  const handleUserMediaError = useCallback((err: string | DOMException) => {
    console.error("Camera access error:", err);
    setError("Camera access unavailable. Switch to Photo Upload mode above to proceed!");
  }, []);

  // Real-time camera loop
  useEffect(() => {
    let animationId: number;
    let isActive = true;

    const renderLoop = async () => {
      if (!isActive) return;

      const video = webcamRef.current?.video;
      const detector = detectorRef.current;
      const canvas = canvasRef.current;

      if (
        scanMode === 'CAMERA' &&
        isLoaded &&
        video &&
        video.readyState === 4 &&
        video.videoWidth > 0 &&
        detector &&
        canvas
      ) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        try {
          if (!isActive || !detectorRef.current) return;
          const poses = await detector.estimatePoses(video, {
            flipHorizontal: false 
          });
          
          if (!isActive) return;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            if (poses && poses.length > 0 && poses[0].keypoints.some(kp => (kp.score || 0) > 0.3)) {
              drawSkeletonUtils(poses[0], ctx);
              latestPoseRef.current = poses[0];
            } else {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              latestPoseRef.current = null;
            }
          }
        } catch (err) {
          console.error("Pose detection error:", err);
        }
      }
      
      if (isActive) {
        animationId = requestAnimationFrame(renderLoop);
      }
    };

    if (isLoaded && scanMode === 'CAMERA') {
      renderLoop();
    }

    return () => {
      isActive = false;
      cancelAnimationFrame(animationId);
    };
  }, [isLoaded, scanMode]);

  // Scanning loop effect for live camera
  useEffect(() => {
    let scanInterval: NodeJS.Timeout;
    
    if (step === 'SCANNING' && isLoaded && scanMode === 'CAMERA') {
      let progressVal = 0;
      let detectionCount = 0;
      setError(null);
      
      scanInterval = setInterval(() => {
        if (latestPoseRef.current) {
          progressVal += 1.5;
          detectionCount++;
        } else {
          progressVal = Math.max(0, progressVal - 0.5);
        }
        
        setProgress(Math.min(100, progressVal));

        if (progressVal >= 100) {
          clearInterval(scanInterval);
          
          if (detectionCount < 8) {
            setError("Tracking lost. Keep your full body clearly in frame and try again.");
            setStep('IDLE');
            return;
          }

          const imageSrc = webcamRef.current?.getScreenshot() || '';
          setCapturedImage(imageSrc);
          setStep('DETAILS');
        }
      }, 50); 
    }

    return () => {
      if (scanInterval) clearInterval(scanInterval);
    };
  }, [step, isLoaded, scanMode]);

  // Handle Image File Upload (Drag & Drop or File Picker)
  const processUploadedFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      setError("Please select a valid image file (JPEG, PNG, WEBP).");
      return;
    }

    setError(null);
    setStep('PROCESSING_UPLOAD');

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUri = e.target?.result as string;
      if (!dataUri) {
        setError("Failed to read image file.");
        setStep('IDLE');
        return;
      }

      setCapturedImage(dataUri);

      // Create an image element to run MoveNet pose detector
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      img.src = dataUri;
      img.onload = async () => {
        try {
          if (detectorRef.current) {
            const poses = await detectorRef.current.estimatePoses(img, {
              flipHorizontal: false,
            });
            if (poses && poses.length > 0) {
              latestPoseRef.current = poses[0];
            } else {
              latestPoseRef.current = null;
            }
          }
        } catch (poseErr) {
          console.warn("Client pose estimation on uploaded image:", poseErr);
          latestPoseRef.current = null;
        } finally {
          setStep('DETAILS');
        }
      };
      img.onerror = () => {
        setStep('DETAILS');
      };
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    setError(null);
    if (!height || !weight || !goal) return;

    onScanComplete({
      image: capturedImage,
      pose: latestPoseRef.current,
      height,
      weight,
      goal,
      gender,
    });
  };

  const goals = [
    { id: 'Build Muscle', label: 'Build Muscle', icon: '💪' },
    { id: 'Lose Weight', label: 'Lose Weight', icon: '🔥' },
    { id: 'Gain Weight', label: 'Gain Weight', icon: '📈' },
    { id: 'Stay Fit', label: 'Stay Fit', icon: '⚡' },
  ];

  return (
    <div className="relative w-full max-w-lg mx-auto bg-black rounded-[2.5rem] overflow-hidden shadow-neon-strong border-2 border-brand/40 flex flex-col justify-between min-h-[580px]">
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black z-50">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          <span className="mt-4 font-heading tracking-[0.2em] text-xs uppercase text-brand/80">Initializing Neural Core</span>
        </div>
      )}

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none opacity-30"
        style={{ 
          backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.2) 1px, transparent 1px)', 
          backgroundSize: '30px 30px' 
        }}
      />

      {/* Mode Selector Header */}
      {step === 'IDLE' && (
        <div className="relative z-30 p-4 border-b border-white/10 bg-black/70 backdrop-blur-md flex justify-between items-center">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full">
            <button
              onClick={() => { setScanMode('UPLOAD'); setError(null); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                scanMode === 'UPLOAD'
                  ? 'bg-brand text-white shadow-md shadow-brand/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Upload size={14} /> Upload Photo
            </button>
            <button
              onClick={() => { setScanMode('CAMERA'); setError(null); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                scanMode === 'CAMERA'
                  ? 'bg-brand text-white shadow-md shadow-brand/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Camera size={14} /> Live Camera
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <div className="relative flex-1 flex flex-col justify-center items-center overflow-hidden">
        {scanMode === 'CAMERA' ? (
          <>
            <Webcam
              ref={webcamRef}
              muted={true}
              playsInline
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
              className="absolute w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            <canvas
              ref={canvasRef}
              className="absolute w-full h-full object-cover z-20 pointer-events-none"
              style={{ transform: "scaleX(-1)" }}
            />
          </>
        ) : (
          step === 'IDLE' && (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-full p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/[0.02] transition-colors relative z-20 group"
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/jpeg,image/png,image/webp" 
                className="hidden" 
                onChange={handleFileChange}
              />
              
              <div className="w-20 h-20 rounded-3xl bg-brand/10 border-2 border-brand/40 flex items-center justify-center text-brand mb-6 shadow-neon group-hover:scale-105 group-hover:border-brand transition-all">
                <Upload size={32} className="animate-bounce" />
              </div>

              <h3 className="text-xl font-heading font-black uppercase text-white tracking-wide mb-2">
                Drop Body Photo Here
              </h3>
              <p className="text-gray-400 text-xs max-w-xs leading-relaxed mb-6">
                Upload a front-facing full-body or upper-torso photo (JPEG, PNG, WEBP) for individualized visual AI inspection.
              </p>

              <button 
                type="button"
                className="px-6 py-3 bg-brand/20 border border-brand/50 text-brand rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand hover:text-white transition-all shadow-sm"
              >
                Select Photo from Device
              </button>
            </div>
          )
        )}

        {/* Processing Upload State */}
        {step === 'PROCESSING_UPLOAD' && (
          <div className="absolute inset-0 z-30 bg-black/90 flex flex-col items-center justify-center text-center p-6">
            <div className="w-14 h-14 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-heading font-bold text-white uppercase tracking-wider text-sm">Inspecting Body Image</p>
            <p className="text-gray-500 text-xs mt-1">Extracting skeletal landmarks & visual structure...</p>
          </div>
        )}
      </div>

      {/* HUD Bar */}
      <div className="relative px-6 py-2 z-30 flex justify-between items-center bg-black/80 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest font-mono">
            Vision Core: Active
          </span>
        </div>
        <span className="text-[9px] text-brand uppercase tracking-widest font-mono font-bold">
          Multimodal 2.0
        </span>
      </div>

      {/* Step UI Overlays */}
      <div className="relative p-6 z-40 bg-gradient-to-t from-black via-black/95 to-black/80 border-t border-white/10">
        {step === 'IDLE' && scanMode === 'CAMERA' && (
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold text-center flex items-center gap-2 justify-center">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}
            <button 
              onClick={() => setStep('SCANNING')}
              className="w-full py-4 bg-brand text-white font-bold uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 shadow-neon-strong hover:bg-brand-light transition-all group overflow-hidden relative"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles size={16} /> Initialize Live Scan
              </span>
            </button>
          </div>
        )}

        {step === 'SCANNING' && scanMode === 'CAMERA' && (
          <div className="w-full space-y-4">
            <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-[0.3em] text-brand mb-1">
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand animate-ping" />
                Mapping Skeletal Landmarks
              </span>
              <span className="font-mono text-sm">{Math.floor(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 shrink-0">
              <div 
                className="h-full bg-brand shadow-[0_0_15px_#8b5cf6] transition-all duration-75 relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-[shimmer_1s_infinite]" />
              </div>
            </div>
            <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest">
              Stand steady with your full body visible in the frame
            </p>
          </div>
        )}

        {/* Recent Scans Tray */}
        {step === 'IDLE' && (
          <div className="mt-4 w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Past Scans</span>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="text-[10px] uppercase tracking-widest text-brand font-bold hover:text-brand-light transition-colors"
              >
                {showHistory ? 'Hide History' : 'View Archive'}
              </button>
            </div>
            
            {showHistory && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none pt-1">
                {loadingHistory ? (
                  <div className="py-2 text-[10px] text-gray-500 uppercase tracking-widest animate-pulse">Loading past scans...</div>
                ) : recentScans.length > 0 ? (
                  recentScans.map((scan) => (
                    <div 
                      key={scan.id}
                      onClick={() => {
                        sessionStorage.setItem('latestScanData', JSON.stringify({
                          ...scan,
                          postureFeedback: scan.feedback
                        }));
                        window.location.href = '/scan/results';
                      }}
                      className="flex-shrink-0 w-32 p-3 bg-white/5 border border-white/10 rounded-xl hover:border-brand/50 hover:bg-brand/5 transition-all cursor-pointer group"
                    >
                      <div className="text-[9px] text-gray-500 mb-1 font-mono">{new Date(scan.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs font-bold text-white group-hover:text-brand flex justify-between items-center">
                        Score
                        <span className="text-brand font-mono">{scan.postureScore}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-2 text-[10px] text-gray-500 uppercase tracking-widest">No previous scans found</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Details Form Overlay */}
      {step === 'DETAILS' && (
        <div className="absolute inset-0 z-50 bg-black p-6 flex flex-col pt-8 animate-in fade-in zoom-in-95 duration-300 overflow-y-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/15 border border-brand/30 text-brand text-xs font-bold uppercase tracking-wider mb-2">
              <CheckCircle2 size={13} /> Photo Captured
            </div>
            <h3 className="text-2xl font-heading font-black uppercase text-white tracking-tight">
              Biometric Profile
            </h3>
            <p className="text-gray-400 text-xs">
              Confirm your metrics for precise body composition and nutrition calculations.
            </p>
          </div>

          {capturedImage && (
            <div className="relative w-32 h-40 mx-auto mb-6 rounded-2xl overflow-hidden border-2 border-brand/40 shadow-neon group shrink-0">
              <Image 
                src={capturedImage} 
                alt="Capture Preview" 
                fill 
                className="object-cover"
                unoptimized
              />
              <div className="absolute bottom-1 left-0 w-full text-center bg-black/70 py-0.5">
                <span className="text-[8px] font-mono text-brand uppercase tracking-wider">Ready for AI</span>
              </div>
            </div>
          )}
          
          <div className="space-y-4 max-w-sm mx-auto w-full">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-widest text-brand font-bold ml-1">Height (cm)</label>
                <input 
                  type="number" 
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="175"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-bold placeholder:text-gray-700 focus:border-brand focus:ring-1 focus:ring-brand/20 focus:outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-widest text-brand font-bold ml-1">Weight (kg)</label>
                <input 
                  type="number" 
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="72"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-bold placeholder:text-gray-700 focus:border-brand focus:ring-1 focus:ring-brand/20 focus:outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-widest text-brand font-bold ml-1">Biological Profile</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Male', 'Female', 'Other'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      gender === g
                        ? 'bg-brand/20 border-brand text-brand'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal Directive */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-brand font-bold ml-1">Primary Directive</label>
              <div className="grid grid-cols-2 gap-2">
                {goals.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id)}
                    className={`p-3 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      goal === g.id 
                        ? 'bg-brand/20 border-brand text-brand shadow-neon' 
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <span className="text-base">{g.icon}</span> 
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2.5 pt-2">
              <button 
                onClick={handleSubmit}
                disabled={!height || !weight || !goal}
                className="w-full py-4 bg-brand text-white font-black uppercase tracking-[0.18em] rounded-2xl shadow-neon-strong hover:bg-brand-light transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed group"
              >
                Analyze Structure & Generate Plan
              </button>
              <button 
                onClick={() => {
                  setStep('IDLE');
                  setCapturedImage('');
                  setProgress(0);
                }}
                className="w-full py-2 bg-transparent text-gray-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-all"
              >
                Discard & Rescan
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}


