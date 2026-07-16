"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';

interface WebcamPoseEstimatorProps {
  onScanComplete: (result: { 
    image: string, 
    pose: poseDetection.Pose, 
    height: string, 
    weight: string, 
    goal: string 
  }) => void;
}

export default function WebcamPoseEstimator({ onScanComplete }: WebcamPoseEstimatorProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [step, setStep] = useState<'IDLE' | 'SCANNING' | 'DETAILS'>('IDLE');
  const [progress, setProgress] = useState(0);
  
  // Details State
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('');

  const latestPoseRef = useRef<poseDetection.Pose | null>(null);
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [recentScans, setRecentScans] = useState<Array<{ id: string; feedback?: string; postureScore?: number; createdAt: string | Date; [key: string]: unknown }>>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Video Constraints for Mobile & Desktop
  const videoConstraints = {
    facingMode: "user",
    width: { ideal: 720 },
    height: { ideal: 1280 },
    aspectRatio: { ideal: 0.5625 } // 9:16 for portrait feel
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
    
    // Draw lines
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

    // Draw dots
    pose.keypoints.forEach((keypoint) => {
      if (keypoint.score != null && keypoint.score > 0.3) {
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.shadowBlur = 0; // reset for dot
      }
    });
  };

  const handleUserMedia = useCallback(() => {
    console.log("Camera stream active");
    setError(null);
    
    // Set canvas dimensions once user media is ready
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
    setError("Camera access denied. Please check your browser permissions.");
  }, []);

  useEffect(() => {
    let animationId: number;
    let isActive = true;

    const renderLoop = async () => {
      if (!isActive) return;

      const video = webcamRef.current?.video;
      const detector = detectorRef.current;
      const canvas = canvasRef.current;

      if (
        isLoaded &&
        video &&
        video.readyState === 4 &&
        video.videoWidth > 0 &&
        detector &&
        canvas
      ) {
        // Ensure canvas stays in sync if resized
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        try {
          const poses = await detector.estimatePoses(video, {
            flipHorizontal: false 
          });
          
          const ctx = canvas.getContext("2d");
          if (ctx) {
            if (poses && poses.length > 0 && poses[0].keypoints.some(kp => (kp.score || 0) > 0.3)) {
              drawSkeletonUtils(poses[0], ctx);
              latestPoseRef.current = poses[0];
            } else {
              // Clear canvas if no pose is detected
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              latestPoseRef.current = null;
            }
          }
        } catch (err) {
          console.error("Pose detection error:", err);
        }
      }
      
      animationId = requestAnimationFrame(renderLoop);
    };

    if (isLoaded) {
      renderLoop();
    }

    return () => {
      isActive = false;
      cancelAnimationFrame(animationId);
    };
  }, [isLoaded]);

  // Scanning loop effect
  useEffect(() => {
    let scanInterval: NodeJS.Timeout;
    
    if (step === 'SCANNING' && isLoaded) {
        let progressVal = 0;
        let detectionCount = 0;
        setError(null);
        
        scanInterval = setInterval(() => {
            // Only progress if a pose is currently being detected
            if (latestPoseRef.current) {
                progressVal += 1.5;
                detectionCount++;
            } else {
                // Slower decay if person is lost, to give them time to come back
                progressVal = Math.max(0, progressVal - 0.5);
            }
            
            setProgress(Math.min(100, progressVal));

            if (progressVal >= 100) {
                clearInterval(scanInterval);
                
                if (detectionCount < 10) { // Ensure we had enough samples
                    setError("Lost tracking. Please stay still and ensure your full body is visible.");
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
    }
  }, [step, isLoaded]);

  const handleSubmit = () => {
     setError(null);
     if (!height || !weight || !goal) return;
     
     if (!latestPoseRef.current) {
        setError("AI could not detect your body landmarks. Please try scanning again.");
        return;
     }

     onScanComplete({
        image: capturedImage,
        pose: latestPoseRef.current,
        height,
        weight,
        goal
     });
  };

  const goals = [
     { id: 'Lose Weight', label: 'Lose Weight', icon: '🔥' },
     { id: 'Gain Weight', label: 'Gain Weight', icon: '📈' },
     { id: 'Build Muscle', label: 'Build Muscle', icon: '💪' },
     { id: 'Stay Fit', label: 'Stay Fit', icon: '⚡' },
  ];

  return (
    <div className="relative w-full max-w-lg mx-auto bg-black rounded-[2.5rem] overflow-hidden shadow-neon-strong border-2 border-brand/40 flex aspect-[3/4] justify-center items-center">
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black z-50">
           <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
           <span className="mt-4 font-heading tracking-[0.2em] text-xs uppercase text-brand/80">Initializing Neural Core</span>
        </div>
      )}

      {/* Grid Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-30"
           style={{ 
               backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.2) 1px, transparent 1px)', 
               backgroundSize: '30px 30px' 
           }}>
      </div>
      
      <Webcam
        ref={webcamRef}
        muted={true}
        playsInline
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        onUserMedia={handleUserMedia}
        onUserMediaError={handleUserMediaError}
        className="absolute w-full h-full object-cover"
        style={{
          transform: "scaleX(-1)", 
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute w-full h-full object-cover z-20 pointer-events-none"
        style={{
            transform: "scaleX(-1)",
        }}
      />
      
      {/* HUD Elements */}
      <div className="absolute inset-x-0 top-6 px-6 z-30 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-bold text-brand uppercase tracking-widest bg-brand/10 px-2 py-0.5 rounded border border-brand/20 backdrop-blur-sm">
            AI Core: Active
          </div>
          <div className="text-[8px] text-gray-400 uppercase tracking-widest ml-1 font-mono">
            Mode: MoveNet.Lightning
          </div>
        </div>
      </div>

      {/* Step UI Overlays */}
      <div className="absolute inset-x-0 bottom-0 p-8 z-40 bg-gradient-to-t from-black via-black/90 to-transparent">
        {step === 'IDLE' && (
           <div className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-wider text-center flex items-center gap-2 justify-center backdrop-blur-md">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                   {error}
                </div>
              )}
              <button 
                onClick={() => setStep('SCANNING')}
                className="w-full py-5 bg-brand text-white font-bold uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 shadow-neon-strong hover:bg-brand-light transition-all group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-20deg]" />
                <span className="relative z-10">Initialize Scan</span>
              </button>
           </div>
        )}

        {step === 'SCANNING' && (
           <div className="w-full space-y-4">
              <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-[0.3em] text-brand mb-1">
                 <span className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand animate-ping" />
                   Processing Skeleton
                 </span>
                 <span className="font-mono text-sm">{Math.floor(progress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 shrink-0">
                 <div 
                    className="h-full bg-brand shadow-[0_0_15px_#8b5cf6] transition-all duration-75 relative overflow-hidden"
                    style={{ width: `${progress}%` }}
                 >
                    <div className="absolute inset-0 bg-white/30 animate-[shimmer_1s_infinite]" />
                 </div>
              </div>
              <p className="text-center text-[8px] text-gray-500 uppercase tracking-widest">Keep your full body in the frame</p>
           </div>
        )}

        {/* Recent Scans Mini Tray */}
        {step === 'IDLE' && (
          <div className="mt-6 w-full opacity-60 hover:opacity-100 transition-opacity">
             <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Data History</span>
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-[10px] uppercase tracking-widest text-brand font-bold hover:text-brand-light transition-colors"
                >
                  {showHistory ? 'Close History' : 'Explore Archive'}
                </button>
             </div>
             
             {showHistory && (
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none pt-2">
                   {loadingHistory ? (
                      <div className="py-2 text-[10px] text-gray-500 uppercase tracking-widest animate-pulse">Retrieving Data...</div>
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
                          className="flex-shrink-0 w-28 p-3 bg-white/5 border border-white/10 rounded-2xl hover:border-brand/50 hover:bg-brand/5 transition-all cursor-pointer group"
                        >
                           <div className="text-[8px] text-gray-500 mb-1 font-mono">{new Date(scan.createdAt).toLocaleDateString()}</div>
                           <div className="text-[10px] font-bold text-white group-hover:text-brand flex justify-between items-center">
                              Score
                              <span className="text-brand font-mono">{scan.postureScore}</span>
                           </div>
                        </div>
                      ))
                   ) : (
                      <div className="py-2 text-[10px] text-gray-500 uppercase tracking-widest">Archive Empty</div>
                   )}
                </div>
             )}
          </div>
        )}
      </div>

      {/* Details Form Overlay */}
      {step === 'DETAILS' && (
          <div className="absolute inset-0 z-50 bg-black p-8 flex flex-col pt-12 animate-in fade-in zoom-in-95 duration-500 overflow-y-auto">
            <div className="text-center mb-10">
                <h3 className="text-3xl font-heading font-black uppercase text-brand tracking-tighter">Scan Success</h3>
                <div className="h-1 w-12 bg-brand mx-auto my-3 rounded-full" />
                <p className="text-gray-400 text-xs uppercase tracking-[0.2em] font-bold">Biometric Data Collected</p>
            </div>

            {capturedImage && (
               <div className="relative w-40 h-52 mx-auto mb-10 rounded-[2rem] overflow-hidden border border-brand/30 shadow-neon-strong group">
                  <img src={capturedImage} alt="Capture Preview" className="w-full h-full object-cover grayscale brightness-110 saturate-0 scale-110 group-hover:scale-100 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-brand/10 mix-blend-color" />
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-40" />
                  <div className="absolute bottom-3 left-0 w-full text-center">
                      <span className="text-[8px] font-mono text-brand bg-black/80 px-2 py-1 rounded-full uppercase tracking-tighter">Sample ID: #POS-9X</span>
                  </div>
               </div>
            )}
            
            <div className="space-y-6 max-w-sm mx-auto w-full">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-widest text-brand font-bold ml-1">Height (cm)</label>
                        <input 
                            type="number" 
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            placeholder="180"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold placeholder:text-gray-700 focus:border-brand focus:ring-1 focus:ring-brand/20 focus:outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-widest text-brand font-bold ml-1">Weight (kg)</label>
                        <input 
                            type="number" 
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="75"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold placeholder:text-gray-700 focus:border-brand focus:ring-1 focus:ring-brand/20 focus:outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="block text-[10px] uppercase tracking-widest text-brand font-bold ml-1">Select Directive</label>
                    <div className="grid grid-cols-2 gap-3">
                        {goals.map((g) => (
                           <button
                             key={g.id}
                             onClick={() => setGoal(g.id)}
                             className={`p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden ${
                                goal === g.id 
                                ? 'bg-brand/10 border-brand text-brand shadow-neon' 
                                : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                             }`}
                           >
                             {goal === g.id && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />}
                             <span className="text-xl group-hover:scale-110 transition-transform">{g.icon}</span> 
                             {g.label}
                           </button>
                        ))}
                    </div>
                </div>

                {error && (
                   <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-bold text-center mb-4 uppercase tracking-wider animate-in slide-in-from-top-2">
                      Error: {error}
                      <button 
                         onClick={() => setStep('IDLE')}
                         className="block mx-auto mt-2 underline font-black"
                      >
                         Restart Neural Scan
                      </button>
                   </div>
                )}

                <div className="flex flex-col gap-3 pt-4">
                  <button 
                    onClick={handleSubmit}
                    disabled={!height || !weight || !goal}
                    className="w-full py-5 bg-brand text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-neon-strong hover:bg-brand-light transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed group"
                  >
                     Analyze Data & Generate Plan
                  </button>
                  <button 
                    onClick={() => {
                        setStep('IDLE');
                        setCapturedImage('');
                        setProgress(0);
                    }}
                    className="w-full py-2 bg-transparent text-gray-600 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-all"
                  >
                     Discard Sample
                  </button>
                </div>
            </div>
         </div>
      )}
      
      {/* Scanning Laser Line */}
      {step === 'SCANNING' && (
        <div className="absolute top-0 left-0 w-full h-[2px] z-30 bg-brand shadow-[0_0_20px_#8b5cf6] animate-[scan_2s_ease-in-out_infinite]" />
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

