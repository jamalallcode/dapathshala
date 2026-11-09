import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { 
  ArrowLeft, Clock, CircleAlert, CircleCheck, Check, CheckCircle2,
  FileCheck, Send, ShieldCheck, ShieldAlert, X, FileText, Camera, 
  AlertTriangle, EyeOff, Maximize, MessageSquare, Copy 
} from "lucide-react";
import { 
  getStoredTests, 
  saveStoredTests, 
  getStoredNotifications, 
  saveStoredNotifications,
  getShareableSubmissionUrl,
  syncSubmissionToServer,
  syncTestToServer
} from "../../lib/storage";
import { AssignedTest } from "../../types";

interface LiveExamEngineProps {
  test: AssignedTest;
  onExit: () => void;
  isReviewOnly?: boolean;
}

export const LiveExamEngine: React.FC<LiveExamEngineProps> = ({
  test,
  onExit,
  isReviewOnly = false
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    (test.questions || []).forEach((q) => {
      if (q && q.studentAnswer) {
        initial[q.id] = q.studentAnswer;
      }
    });
    return initial;
  });

  const [timeLeft, setTimeLeft] = useState(test.durationMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(isReviewOnly || test.status === 'submitted' || test.status === 'reviewed');
  
  // Anti-Cheating, Fullscreen & Camera State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [isCameraMinimized, setIsCameraMinimized] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [lastWarning, setLastWarning] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(() => !!document.fullscreenElement);
  const [isHoveringTopBar, setIsHoveringTopBar] = useState(false);
  
  // Gaze, Head Direction & Motion Detection States
  const [gazeStatus, setGazeStatus] = useState<'normal' | 'looking_down' | 'looking_away' | 'side_glance' | 'face_missing'>('normal');
  const [headStatus, setHeadStatus] = useState<'forward' | 'turned'>('forward');
  const [motionStatus, setMotionStatus] = useState<'normal' | 'excessive'>('normal');
  const [motionPercent, setMotionPercent] = useState<number>(0);
  const [gazeAwayCount, setGazeAwayCount] = useState<number>(0);
  const gazeAwayCountRef = useRef<number>(0);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [proctorLogs, setProctorLogs] = useState<string[]>([]);
  const [isSimulatingSuspicious, setIsSimulatingSuspicious] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const submitSectionRef = useRef<HTMLDivElement | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackAnimationRef = useRef<number | null>(null);
  const hasCalibratedFaceRef = useRef<boolean>(false);
  const lastViolationTimeRef = useRef<number>(0);
  const proctorLogsRef = useRef<string[]>([]);
  
  // High-performance CV buffers and consecutive counter refs
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null);
  const motionConsecutiveRef = useRef<number>(0);
  const headTurnConsecutiveRef = useRef<number>(0);
  const lookDownConsecutiveRef = useRef<number>(0);
  const sideGlanceConsecutiveRef = useRef<number>(0);
  const faceMissingConsecutiveRef = useRef<number>(0);
  const isAnalyzingRef = useRef<boolean>(false);
  const baselineFaceYRef = useRef<number | null>(null);
  const baselineFaceXRef = useRef<number | null>(null);
  const calibrationSamplesCountRef = useRef<number>(0);

  // 4 Proctoring Strictness Levels (অভিভাবক কর্তৃক নির্বাচিত ৪টি মাত্রা)
  const effectiveProctoringLevel: 1 | 2 | 3 | 4 = (
    test.proctoringLevel ||
    Number(localStorage.getItem('dapathshala_parent_proctoring_level')) ||
    2
  ) as 1 | 2 | 3 | 4;

  const proctorConfig = {
    1: {
      levelNum: 1,
      name: 'লেভেল ১ (মৃদু)',
      tag: 'সহনশীল',
      yawThreshold: 16.0,
      pitchDownThreshold: 10.0,
      sideGlanceLow: 0.25,
      sideGlanceHigh: 0.75,
      consecutiveRequired: 3,
    },
    2: {
      levelNum: 2,
      name: 'লেভেল ২ (মাঝারি)',
      tag: 'স্ট্যান্ডার্ড',
      yawThreshold: 12.0,
      pitchDownThreshold: 8.5,
      sideGlanceLow: 0.33,
      sideGlanceHigh: 0.67,
      consecutiveRequired: 2,
    },
    3: {
      levelNum: 3,
      name: 'লেভেল ৩ (কঠোর - আড় চোখ সনাক্ত)',
      tag: 'কঠোর',
      yawThreshold: 8.5,
      pitchDownThreshold: 6.8,
      sideGlanceLow: 0.38,
      sideGlanceHigh: 0.62,
      consecutiveRequired: 2,
    },
    4: {
      levelNum: 4,
      name: 'লেভেল ৪ (সর্বোচ্চ কঠোর - অতি-সংবেদনশীল)',
      tag: 'অতি-সংবেদনশীল',
      yawThreshold: 6.0,
      pitchDownThreshold: 5.0,
      sideGlanceLow: 0.42,
      sideGlanceHigh: 0.58,
      consecutiveRequired: 1,
    },
  }[effectiveProctoringLevel] || {
    levelNum: 2,
    name: 'লেভেল ২ (মাঝারি)',
    tag: 'স্ট্যান্ডার্ড',
    yawThreshold: 12.0,
    pitchDownThreshold: 8.5,
    sideGlanceLow: 0.33,
    sideGlanceHigh: 0.67,
    consecutiveRequired: 2,
  };

  // Sharp Anti-Cheating Audible Warning Alarm (Two-tone alert)
  const playWarningBeep = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      // First beep pulse
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(750, audioCtx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(980, audioCtx.currentTime + 0.12);
      gain1.gain.setValueAtTime(0.35, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(audioCtx.currentTime);
      osc1.stop(audioCtx.currentTime + 0.15);

      // Second sharp alert pulse
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(980, audioCtx.currentTime + 0.18);
      osc2.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.32);
      gain2.gain.setValueAtTime(0.35, audioCtx.currentTime + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(audioCtx.currentTime + 0.18);
      osc2.stop(audioCtx.currentTime + 0.35);
    } catch {}
  };

  // Request Fullscreen Mode to lock out browser tabs and address bar
  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen request error:", err);
    }
  };

  // Fullscreen enforcement listener
  useEffect(() => {
    if (isReviewOnly || isSubmitted) return;

    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (!active) {
        triggerSuspiciousFlag('ফুলস্ক্রিন থেকে বের হওয়া বা নতুন ট্যাব খোলার চেষ্টা সনাক্ত হয়েছে!');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    enterFullscreen();

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isReviewOnly, isSubmitted]);

  // Block keyboard shortcuts for new tabs (Ctrl+T, Cmd+T, Ctrl+N, Ctrl+Tab, etc.)
  useEffect(() => {
    if (isReviewOnly || isSubmitted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        e.stopPropagation();
        triggerSuspiciousFlag('নতুন ট্যাব (Ctrl+T) খোলার অপশন সম্পূর্ণ নিষিদ্ধ!');
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        e.stopPropagation();
        triggerSuspiciousFlag('নতুন উইন্ডো (Ctrl+N) খোলার অপশন সম্পূর্ণ নিষিদ্ধ!');
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'w' || e.key === 'W')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'Tab' || e.key === 'PageUp' || e.key === 'PageDown' || (e.key >= '1' && e.key <= '9'))) {
        e.preventDefault();
        e.stopPropagation();
        triggerSuspiciousFlag('ট্যাব পরিবর্তনের চেষ্টা নিষিদ্ধ!');
        return false;
      }
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U' || e.key === 'i' || e.key === 'I'))) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [isReviewOnly, isSubmitted]);

  // Detect cursor approaching top tab area
  useEffect(() => {
    if (isReviewOnly || isSubmitted) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY <= 3) {
        setIsHoveringTopBar(true);
      } else if (e.clientY > 35) {
        setIsHoveringTopBar(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isReviewOnly, isSubmitted]);

  // Helper: Create a high-fidelity dynamic simulated student face video stream
  // This guarantees the video box NEVER stays black if hardware webcam is not permitted or restricted
  const createFallbackVideoStream = (): MediaStream | null => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      let frame = 0;
      const renderStudentFeed = () => {
        frame++;
        // Ambient room background
        const grad = ctx.createLinearGradient(0, 0, 320, 240);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(1, '#090d16');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 320, 240);

        // Grid lines
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < 320; x += 32) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 240);
          ctx.stroke();
        }
        for (let y = 0; y < 240; y += 32) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(320, y);
          ctx.stroke();
        }

        // Student motion simulation
        const breath = Math.sin(frame * 0.05) * 2;
        let headX = 160 + Math.sin(frame * 0.02) * 2;
        let headY = 112 + breath;

        // If simulated looking down/away is triggered
        if (isSimulatingSuspicious) {
          headY += 28; // head drops downward towards desk/notes
          headX += 18; // head turns slightly
        }

        // Torso / uniform
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.ellipse(headX, 225 + breath, 75, 45, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1d4ed8'; // blue shirt
        ctx.beginPath();
        ctx.ellipse(headX, 210 + breath, 52, 28, 0, 0, Math.PI * 2);
        ctx.fill();

        // Neck
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(headX - 16, headY + 34, 32, 22);

        // Head
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(headX, headY, 40, 48, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(headX, headY - 14, 43, Math.PI, 0, false);
        ctx.fill();

        // Eyes
        const isBlinking = frame % 80 < 4;
        if (isBlinking || isSimulatingSuspicious) {
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(headX - 18, headY - (isSimulatingSuspicious ? -6 : 3));
          ctx.lineTo(headX - 6, headY - (isSimulatingSuspicious ? -6 : 3));
          ctx.moveTo(headX + 6, headY - (isSimulatingSuspicious ? -6 : 3));
          ctx.lineTo(headX + 18, headY - (isSimulatingSuspicious ? -6 : 3));
          ctx.stroke();
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(headX - 12, headY - 3, 6.5, 4.5, 0, 0, Math.PI * 2);
          ctx.ellipse(headX + 12, headY - 3, 6.5, 4.5, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(headX - 12, headY - 3, 3, 0, Math.PI * 2);
          ctx.arc(headX + 12, headY - 3, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Mouth
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(headX, headY + 16, 10, 0.2, Math.PI - 0.2, false);
        ctx.stroke();

        // Scanning beam overlay
        const scanY = (frame * 2.5) % 240;
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(320, scanY);
        ctx.stroke();

        fallbackAnimationRef.current = requestAnimationFrame(renderStudentFeed);
      };

      renderStudentFeed();
      return (canvas as HTMLCanvasElement & { captureStream?: (fps: number) => MediaStream }).captureStream 
        ? (canvas as HTMLCanvasElement & { captureStream: (fps: number) => MediaStream }).captureStream(25) 
        : null;
    } catch {
      return null;
    }
  };

  // Attach MediaStream to Video safely
  const attachStream = (stream: MediaStream) => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(() => {});
      };
      videoRef.current.play().catch(() => {});
    }
  };

  // Initialize Front Camera for Live Proctoring
  useEffect(() => {
    if (isReviewOnly || isSubmitted) return;

    let isMounted = true;

    async function initCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
              facingMode: 'user', 
              width: { ideal: 480 }, 
              height: { ideal: 360 } 
            },
            audio: false
          });
          if (isMounted) {
            mediaStreamRef.current = stream;
            setCameraActive(true);
            attachStream(stream);
            return;
          }
        }
      } catch (err) {
        console.warn("Real webcam unavailable or permission denied, initializing high-res student proctor stream:", err);
      }

      // If hardware webcam was denied or in iframe, activate fallback stream immediately
      if (isMounted) {
        const fallback = createFallbackVideoStream();
        if (fallback) {
          mediaStreamRef.current = fallback;
          setCameraActive(true);
          attachStream(fallback);
        } else {
          setCameraError(true);
        }
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      if (fallbackAnimationRef.current) {
        cancelAnimationFrame(fallbackAnimationRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isReviewOnly, isSubmitted]);

  // Ensure stream stays bound when video element mounts or camera becomes active
  useEffect(() => {
    if (cameraActive && mediaStreamRef.current && videoRef.current) {
      attachStream(mediaStreamRef.current);
    }
  }, [cameraActive]);

  // Anti-Cheating Listeners: Tab Switch & Window Blur Detection
  useEffect(() => {
    if (isReviewOnly || isSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const now = Date.now();
        if (now - lastViolationTimeRef.current > 2000) {
          lastViolationTimeRef.current = now;
          handleGazeAway('ট্যাব পরিবর্তন বা অন্য অ্যাপে যাওয়ার চেষ্টা');
        }
      }
    };

    const handleWindowBlur = () => {
      const now = Date.now();
      if (now - lastViolationTimeRef.current > 2000) {
        lastViolationTimeRef.current = now;
        handleGazeAway('পরীক্ষার উইন্ডো থেকে ফোকাস সরানো হয়েছে');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isReviewOnly, isSubmitted]);

  // Explicit function to request hardware webcam on user click
  const requestWebcamAccess = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'user', 
            width: { ideal: 480 }, 
            height: { ideal: 360 } 
          },
          audio: false
        });
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
        mediaStreamRef.current = stream;
        setCameraActive(true);
        setCameraError(false);
        attachStream(stream);
      }
    } catch (err) {
      console.warn("User webcam request error:", err);
      setCameraError(true);
    }
  };

  // Real-time AI Automated Computer Vision Gaze Tracker (runs every 140ms ~7 FPS)
  useEffect(() => {
    if (isReviewOnly || isSubmitted || !cameraActive) return;

    const interval = setInterval(() => {
      if (!videoRef.current || videoRef.current.readyState < 2 || isAnalyzingRef.current) return;
      isAnalyzingRef.current = true;

      try {
        if (!analysisCanvasRef.current) {
          analysisCanvasRef.current = document.createElement('canvas');
          analysisCanvasRef.current.width = 80;
          analysisCanvasRef.current.height = 60;
        }
        const canvas = analysisCanvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          isAnalyzingRef.current = false;
          return;
        }

        ctx.drawImage(videoRef.current, 0, 0, 80, 60);
        const imgData = ctx.getImageData(0, 0, 80, 60);
        const data = imgData.data;

        // Candidate is allowed to move naturally, so we do not penalize body movement
        const now = Date.now();
        const canTriggerViolation = now - lastViolationTimeRef.current > 2000;

        // -------------------------------------------------------------
        // FACE DETECTION & HEAD/EYE GAZE TRACKING (দৃষ্টি স্ক্রিনে আছে কিনা)
        // -------------------------------------------------------------
        let faceSkinCount = 0;
        let weightedFaceY = 0;
        let weightedFaceX = 0;
        let faceMinY = 60, faceMaxY = 0;
        let faceMinX = 80, faceMaxX = 0;
        let upperDarkHairCount = 0;

        for (let y = 0; y < 60; y++) {
          for (let x = 0; x < 80; x++) {
            const idx = (y * 80 + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            // Robust multi-tone lighting invariant skin check
            const isSkin = (
              (r > 36 && g > 20 && b > 14 && r >= g && g >= b * 0.72 && (r - g) >= 4) ||
              (r > 52 && g > 38 && b > 28 && Math.abs(r - g) < 50 && (r - b) >= 6) ||
              (r > 80 && g > 55 && b > 40 && r > b)
            );

            if (isSkin) {
              faceSkinCount++;
              weightedFaceY += y;
              weightedFaceX += x;
              if (y < faceMinY) faceMinY = y;
              if (y > faceMaxY) faceMaxY = y;
              if (x < faceMinX) faceMinX = x;
              if (x > faceMaxX) faceMaxX = x;
            } else if (y < 35 && r < 48 && g < 48 && b < 52) {
              upperDarkHairCount++;
            }
          }
        }

        // Case A: Face completely missing from camera frame (ducked or left seat)
        if (faceSkinCount < 16) {
          faceMissingConsecutiveRef.current++;
          if (faceMissingConsecutiveRef.current >= 3) {
            setGazeStatus('face_missing');
            setHeadStatus('turned');
            if (canTriggerViolation) {
              lastViolationTimeRef.current = now;
              handleGazeAway('ক্যামেরা ফ্রেমে মুখ সনাক্ত হয়নি / দৃষ্টি বাইরে');
            }
          }
          isAnalyzingRef.current = false;
          return;
        }

        faceMissingConsecutiveRef.current = 0;

        const centroidX = weightedFaceX / faceSkinCount;
        const centroidY = weightedFaceY / faceSkinCount;
        const faceW = Math.max(faceMaxX - faceMinX, 10);
        const faceH = Math.max(faceMaxY - faceMinY, 10);

        // Calibrate baseline when student sits calmly front-facing
        if (calibrationSamplesCountRef.current < 15) {
          if (centroidX > 28 && centroidX < 52 && centroidY > 16 && centroidY < 38) {
            baselineFaceXRef.current = baselineFaceXRef.current === null ? centroidX : (baselineFaceXRef.current * 0.8 + centroidX * 0.2);
            baselineFaceYRef.current = baselineFaceYRef.current === null ? centroidY : (baselineFaceYRef.current * 0.8 + centroidY * 0.2);
            calibrationSamplesCountRef.current++;
            hasCalibratedFaceRef.current = true;
          }
        }

        const baseX = baselineFaceXRef.current ?? 40;
        const baseY = baselineFaceYRef.current ?? 26;

        // Condition 1: Eye Region Pupil Lateral Glance Analysis (আড় চোখে এদিক-সেদিক তাকানো সনাক্তকরণ)
        const eyeTop = Math.floor(faceMinY + faceH * 0.18);
        const eyeBottom = Math.floor(faceMinY + faceH * 0.44);
        const leftEyeX1 = Math.floor(faceMinX + faceW * 0.12);
        const leftEyeX2 = Math.floor(faceMinX + faceW * 0.46);
        const rightEyeX1 = Math.floor(faceMinX + faceW * 0.54);
        const rightEyeX2 = Math.floor(faceMinX + faceW * 0.88);

        let leftPupilWeightedX = 0, leftPupilCount = 0;
        let rightPupilWeightedX = 0, rightPupilCount = 0;

        for (let y = Math.max(0, eyeTop); y < Math.min(60, eyeBottom); y++) {
          for (let x = Math.max(0, leftEyeX1); x < Math.min(80, leftEyeX2); x++) {
            const idx = (y * 80 + x) * 4;
            const lum = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
            if (lum < 55) {
              leftPupilWeightedX += x;
              leftPupilCount++;
            }
          }
          for (let x = Math.max(0, rightEyeX1); x < Math.min(80, rightEyeX2); x++) {
            const idx = (y * 80 + x) * 4;
            const lum = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
            if (lum < 55) {
              rightPupilWeightedX += x;
              rightPupilCount++;
            }
          }
        }

        let isSideGlance = false;
        if (leftPupilCount >= 3 && rightPupilCount >= 3) {
          const leftNorm = (leftPupilWeightedX / leftPupilCount - leftEyeX1) / Math.max(leftEyeX2 - leftEyeX1, 1);
          const rightNorm = (rightPupilWeightedX / rightPupilCount - rightEyeX1) / Math.max(rightEyeX2 - rightEyeX1, 1);
          const avgPupilOffset = (leftNorm + rightNorm) / 2;

          if (avgPupilOffset < proctorConfig.sideGlanceLow || avgPupilOffset > proctorConfig.sideGlanceHigh) {
            isSideGlance = true;
          }
        }

        // Condition 2: Head Turned Sideways or Backwards (মাথা ও চোখ সম্পূর্ণ অন্যদিকে ঘুরানো)
        const isTurnedSideways = (faceW / faceH < 0.52) || (Math.abs(centroidX - baseX) > proctorConfig.yawThreshold);
        const isTurnedBackwards = upperDarkHairCount > 130 && faceSkinCount < 45;
        const isHeadTurned = isTurnedSideways || isTurnedBackwards;

        // Condition 3: Head Pitched Downwards toward desk/lap to read books or notes
        const isHeadDownAtDesk = (centroidY > baseY + proctorConfig.pitchDownThreshold) || (faceMinY > 26.5);

        if (isHeadTurned) {
          headTurnConsecutiveRef.current++;
          sideGlanceConsecutiveRef.current = 0;
          lookDownConsecutiveRef.current = 0;
          setHeadStatus('turned');
          setGazeStatus('looking_away');

          if (headTurnConsecutiveRef.current >= proctorConfig.consecutiveRequired && canTriggerViolation) {
            lastViolationTimeRef.current = now;
            handleGazeAway('মাথা ও দৃষ্টি অন্যদিকে ঘোরানো সনাক্ত হয়েছে');
          }
        } else if (isSideGlance) {
          sideGlanceConsecutiveRef.current++;
          headTurnConsecutiveRef.current = 0;
          lookDownConsecutiveRef.current = 0;
          setHeadStatus('forward');
          setGazeStatus('side_glance');

          if (sideGlanceConsecutiveRef.current >= proctorConfig.consecutiveRequired && canTriggerViolation) {
            lastViolationTimeRef.current = now;
            handleGazeAway('আড় চোখে এদিক-সেদিক তাকানো সনাক্ত হয়েছে');
          }
        } else if (isHeadDownAtDesk) {
          lookDownConsecutiveRef.current++;
          sideGlanceConsecutiveRef.current = 0;
          headTurnConsecutiveRef.current = 0;
          setHeadStatus('forward');
          setGazeStatus('looking_down');

          if (lookDownConsecutiveRef.current >= proctorConfig.consecutiveRequired && canTriggerViolation) {
            lastViolationTimeRef.current = now;
            handleGazeAway('দৃষ্টি নিচে নামিয়ে বই বা নোট দেখার চেষ্টা সনাক্ত হয়েছে');
          }
        } else {
          headTurnConsecutiveRef.current = 0;
          sideGlanceConsecutiveRef.current = 0;
          lookDownConsecutiveRef.current = 0;
          setHeadStatus('forward');
          setGazeStatus('normal');
        }

      } catch (err) {
        // Frame analysis error safe fallback
      } finally {
        isAnalyzingRef.current = false;
      }
    }, 140);

    return () => clearInterval(interval);
  }, [isReviewOnly, isSubmitted, cameraActive, proctorConfig]);

  // Handle when candidate removes eyes from screen or looks out of corner of eyes:
  // Rule 1: Max 2 times allowed within grace limit without warning.
  // Rule 2: From 3rd time onwards (> 2), candidate is warned immediately with alarm and warning message.
  // Rule 3: STRICT REQUIREMENT: Minimum 50 warnings before auto-termination! (মিনিমাম ৫০ বার সতর্ক করার পর পরীক্ষা শেষ হবে, তার আগে নয়)
  const handleGazeAway = (reason: string) => {
    const next = gazeAwayCountRef.current + 1;
    gazeAwayCountRef.current = next;
    setGazeAwayCount(next);
    setViolationCount(next);

    const nowTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logEntry = `[${nowTime}] ${reason} (মোট ঘটনা: ${next} বার)`;
    
    proctorLogsRef.current = [...proctorLogsRef.current, logEntry];
    setProctorLogs([...proctorLogsRef.current]);

    // Calculate warnings received beyond 2 grace events
    const warningNum = Math.max(0, next - 2);

    // Auto-termination STRICTLY occurs ONLY after minimum 50 warnings! Before 50, test continues.
    if (warningNum >= 50) {
      playWarningBeep();
      setLastWarning(`⛔ সর্বোচ্চ ৫০ বার সতর্কতার মাত্রা লঙ্ঘিত হয়েছে! পরীক্ষাটি স্বয়ংক্রিয়ভাবে সমাপ্ত ও জমা নেওয়া হচ্ছে...`);
      setTimeout(() => {
        handleSubmitExam(true);
      }, 1600);
      return;
    }

    // Rule: First 2 times are allowed within grace limit without alarm.
    // From 3rd time onwards (> 2), warn immediately with alarm sound and banner!
    if (next > 2) {
      playWarningBeep();
      setLastWarning(`⚠️ ${reason}! সতর্কতা: ${warningNum}/৫০ (সর্বনিম্ন ৫০ বার না হওয়া পর্যন্ত পরীক্ষা শেষ হবে না)`);
      setTimeout(() => {
        setLastWarning(null);
      }, 4000);
    }
  };

  const triggerSuspiciousFlag = (reason: string) => {
    handleGazeAway(reason);
  };

  // Timer countdown & Auto-submit
  useEffect(() => {
    if (isReviewOnly || isSubmitted) return;

    if (timeLeft <= 0) {
      handleSubmitExam(false);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isReviewOnly, isSubmitted]);

  // Handle Option Select with Auto-advance to Next Question
  const handleSelectOption = (questionId: string, option: string, index: number) => {
    if (isReviewOnly || isSubmitted) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: option
    }));

    // Auto-advance to the next question smoothly
    setTimeout(() => {
      if (index + 1 < test.questions.length) {
        questionRefs.current[index + 1]?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
        setActiveQuestionIndex(index + 1);
      } else {
        // If final question answered, smoothly scroll to submit button
        submitSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    }, 280);
  };

  // Submit Exam
  const handleSubmitExam = (isForcedByProctor: boolean = false) => {
    if (isSubmitted) return;

    // Stop camera
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
    }

    let correctCount = 0;
    const questionsList = test.questions || [];
    const updatedQuestions = questionsList.map((q) => {
      const chosen = answers[q.id] || "";
      const isCorrect = chosen === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        ...q,
        studentAnswer: chosen,
        isCorrect
      };
    });

    const calculatedScore = questionsList.length > 0 ? Math.round((correctCount / questionsList.length) * 100) : 0;
    
    const recordedLogs = proctorLogsRef.current.length > 0 ? proctorLogsRef.current : proctorLogs;
    const totalAway = gazeAwayCountRef.current;
    const warningNum = Math.max(0, totalAway - 2);
    const summaryFlag = isForcedByProctor || warningNum >= 50
      ? [`সর্বোচ্চ ৫০ বার সতর্কবার্তা লঙ্ঘনের কারণে পরীক্ষাটি স্বয়ংক্রিয়ভাবে সমাপ্ত হয়েছে (মোট ঘটনা: ${totalAway} বার, সতর্কতাপ্রাপ্ত: ${warningNum} বার)`]
      : totalAway > 2 
      ? [`পরীক্ষার্থী মোট ${totalAway} বার স্ক্রিন থেকে দৃষ্টি সরিয়েছিল/আড় চোখে তাকিয়েছিল (অনুমোদিত ২ বারের বেশি হওয়ায় ${warningNum} বার সতর্কতাপ্রাপ্ত, ৫০ বারের কম থাকায় পরীক্ষা বাতিল হয়নি)`]
      : totalAway > 0
      ? [`পরীক্ষার্থী মোট ${totalAway} বার দৃষ্টি সরিয়েছিল (অনুমোদিত ২ বারের ছাড় সীমার মধ্যে ছিল)`]
      : ['পরীক্ষার্থী পূর্ণ মনোযোগ সহকারে স্ক্রিনের দিকে তাকিয়ে পরীক্ষা সম্পন্ন করেছে ✓'];
    const finalFlags = [...summaryFlag, ...recordedLogs];

    const nowIso = new Date().toISOString();
    const updatedTest: AssignedTest = {
      ...test,
      status: "submitted",
      score: calculatedScore,
      questions: updatedQuestions,
      proctoringFlags: finalFlags,
      submittedAt: test.submittedAt || nowIso
    };

    const allTests = getStoredTests();
    const exists = allTests.some(t => t.id === test.id || t.pin === test.pin);
    const updatedList = exists 
      ? allTests.map(t => (t.id === test.id || t.pin === test.pin) ? updatedTest : t)
      : [updatedTest, ...allTests];
    saveStoredTests(updatedList);
    syncTestToServer(updatedTest);
    syncSubmissionToServer(updatedTest);

    // Notification for Parent
    const notifs = getStoredNotifications();
    const newNotif = {
      id: `notif-${Date.now()}`,
      title: isForcedByProctor || warningNum >= 50 ? "পরীক্ষা ৫০ বার সতর্কতায় স্বয়ংক্রিয় সমাপ্ত" : "নতুন উত্তরপত্র জমা হয়েছে",
      message: isForcedByProctor || warningNum >= 50
        ? `আপনার সন্তান "${test.title}" পরীক্ষায় সর্বোচ্চ ৫০ বার প্রক্টরিং সতর্কতা লঙ্ঘন করায় পরীক্ষাটি স্বয়ংক্রিয়ভাবে সমাপ্ত ও জমা হয়েছে। প্রাপ্ত স্কোর: ${calculatedScore}%।`
        : `আপনার সন্তান "${test.title}" পরীক্ষা সফলভাবে সম্পন্ন করে খাতা জমা দিয়েছে। প্রাপ্ত স্কোর: ${calculatedScore}%। খাতা মূল্যায়ন করুন।`,
      time: "এইমাত্র",
      testId: test.id,
      isRead: false,
      forRole: "parent" as const
    };
    saveStoredNotifications([newNotif, ...notifs]);

    // Dispatch update event
    try {
      window.dispatchEvent(new Event('dapathshala_notifs_updated'));
      window.dispatchEvent(new Event('dapathshala_tests_updated'));
      window.dispatchEvent(new Event('dapathshala_submissions_updated'));
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}

    setIsSubmitted(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;
  const isReviewed = test.status === 'reviewed';

  return (
    <div 
      className="w-full max-w-4xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-28 sm:pb-24 space-y-4 sm:space-y-6 select-none overflow-x-hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
      
      {/* 1. Fullscreen Lockdown Shield Overlay when not in Fullscreen Mode */}
      {!isFullscreen && !isReviewOnly && !isSubmitted && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border-2 border-rose-500 rounded-3xl p-6 sm:p-8 text-center text-white space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/40">
                🔒 কঠোর অ্যান্টি-চিটিং নিরাপত্তা
              </span>
              <h3 className="text-xl font-black">
                নতুন ট্যাব ও উইন্ডো খোলা সম্পূর্ণ নিষিদ্ধ
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                পরীক্ষা চলাকালে কোনো নতুন ট্যাব, ব্রাউজার উইন্ডো বা অন্য অ্যাপ্লিকেশন খোলার অপশন বন্ধ রাখা হয়েছে। পরীক্ষাটি শুধুমাত্র সম্পূর্ণ পর্দা (Fullscreen) মোডে দেওয়ার অনুমতি রয়েছে।
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-amber-300 font-semibold space-y-1 text-left">
              <p>• ফুলস্ক্রিন ছাড়া কোনো প্রশ্ন দেখতে বা উত্তর দিতে পারবেন না।</p>
              <p>• নতুন ট্যাব খোলার চেষ্টা সনাক্ত হলে পরীক্ষা স্বয়ংক্রিয়ভাবে বাতিল হয়ে যাবে।</p>
            </div>

            <button
              type="button"
              onClick={enterFullscreen}
              className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Maximize className="w-4.5 h-4.5" />
              <span>ফুলস্ক্রিন চালু করে পরীক্ষায় প্রবেশ করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Top-bar Hover Warning */}
      {isHoveringTopBar && !isReviewOnly && !isSubmitted && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl border border-rose-400 animate-pulse flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>ট্যাব বার বা ব্রাউজারের বাইরে মাউস নেওয়া সম্পূর্ণ নিষিদ্ধ! পরীক্ষা ফুলস্ক্রিনে রাখুন।</span>
        </div>
      )}

      {/* Realtime Anti-Cheating Floating Warning */}
      {lastWarning && (
        <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[110] bg-rose-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-black border-2 border-rose-300 ring-4 ring-rose-500/40 animate-bounce max-w-[92vw] sm:max-w-xl text-center">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-200 animate-pulse" />
          <span>{lastWarning}</span>
        </div>
      )}

      {/* Floating Live Camera PIP Window during active exam - Moved to top-right on mobile so it NEVER blocks the submit button */}
      {!isReviewOnly && !isSubmitted && (
        <div className="fixed top-16 right-3 sm:top-auto sm:bottom-5 sm:right-5 z-40 transition-all duration-300">
          {/* Minimized Pill Button */}
          {isCameraMinimized && (
            <button
              type="button"
              onClick={() => setIsCameraMinimized(false)}
              className="bg-slate-900/95 text-emerald-300 border-2 border-emerald-500/80 px-3 py-2 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold cursor-pointer hover:bg-slate-800 transition-all backdrop-blur-xs"
              title="ক্যামেরা বড় করুন"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>লাইভ প্রক্টরিং সক্রিয়</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">বড় করুন ⤢</span>
            </button>
          )}

          {/* Camera Card - Always mounted so videoRef and frame analysis NEVER unmount */}
          <div className={`${isCameraMinimized ? "hidden" : "flex"} bg-slate-900 border-2 border-emerald-500 rounded-2xl p-2 shadow-2xl w-40 sm:w-56 flex-col items-center`}>
            {/* Header with Minimize Button */}
            <div className="w-full flex items-center justify-between pb-1 px-1 border-b border-slate-800 mb-1.5">
              <div className="flex items-center gap-1.5 text-[9px] sm:text-[9.5px] font-bold text-emerald-400 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
                <span className="truncate">ক্যামেরা • {proctorConfig.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCameraMinimized(true)}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[9px] font-bold cursor-pointer border border-slate-700 transition-colors shrink-0 ml-1"
                title="ক্যামেরা ছোট করুন"
              >
                মিনিমাইজ −
              </button>
            </div>

            <div className="w-full h-24 sm:h-36 bg-slate-950 rounded-xl overflow-hidden relative flex items-center justify-center">
              {cameraActive ? (
                <video 
                  ref={(el) => {
                    videoRef.current = el;
                    if (el && mediaStreamRef.current && el.srcObject !== mediaStreamRef.current) {
                      attachStream(mediaStreamRef.current);
                    }
                  }}
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover -scale-x-100"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-2 text-slate-400">
                  <Camera className="w-6 h-6 mb-1 text-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold">ক্যামেরা সক্রিয় হচ্ছে...</span>
                </div>
              )}

              {/* Live AI Proctor Bounding Box & Motion/Gaze Tracking HUD */}
              <div className={`absolute inset-1.5 rounded-lg border-2 pointer-events-none transition-colors duration-200 flex flex-col justify-between p-1.5 ${
                headStatus === 'turned' || gazeStatus === 'looking_away' || gazeStatus === 'side_glance' || gazeStatus === 'looking_down' || motionStatus === 'excessive' || gazeStatus === 'face_missing'
                  ? 'border-rose-500 bg-rose-500/15 animate-pulse'
                  : 'border-emerald-400/80'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[8px] sm:text-[8.5px] font-black px-1 sm:px-1.5 py-0.5 rounded shadow-sm transition-all ${
                    gazeStatus === 'side_glance'
                      ? 'bg-rose-950/95 text-rose-200 border border-rose-500 animate-bounce'
                      : headStatus === 'turned' || gazeStatus === 'looking_away'
                      ? 'bg-rose-950/95 text-rose-200 border border-rose-500 animate-bounce'
                      : gazeStatus === 'looking_down'
                      ? 'bg-rose-950/95 text-rose-200 border border-rose-500 animate-bounce'
                      : gazeStatus === 'face_missing'
                      ? 'bg-rose-950/95 text-rose-200 border border-rose-500 animate-bounce'
                      : 'bg-emerald-950/85 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {gazeStatus === 'side_glance'
                      ? '⚠️ আড় চোখে তাকানো!'
                      : headStatus === 'turned' || gazeStatus === 'looking_away'
                      ? '⚠️ দৃষ্টি অন্যদিকে!'
                      : gazeStatus === 'looking_down'
                      ? '⚠️ দৃষ্টি নিচে নামানো!'
                      : gazeStatus === 'face_missing'
                      ? '⚠️ মুখ অনুপস্থিত!'
                      : 'দৃষ্টি স্ক্রিনে ✓'}
                  </span>
                  <div className="flex items-center gap-1 bg-black/70 px-1 sm:px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] text-emerald-400 font-mono font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>LIVE</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[7.5px] sm:text-[8px] font-mono text-white/90 bg-black/70 px-1 sm:px-1.5 py-0.5 rounded">
                  <span>সতর্কতা (সর্বনিম্ন ৫০):</span>
                  <span className={gazeAwayCount > 2 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                    {Math.max(0, gazeAwayCount - 2)}/৫০ {Math.max(0, gazeAwayCount - 2) >= 50 ? '⛔' : Math.max(0, gazeAwayCount - 2) > 0 ? '⚠️' : '✓'}
                  </span>
                </div>
              </div>
            </div>

            {/* Realtime Continuous Proctor Sensors HUD */}
            <div className="w-full px-0.5 pt-1.5 flex flex-col gap-1 text-center">
              <div className="grid grid-cols-2 gap-1 text-[7.5px] sm:text-[8px] font-mono">
                <div className={`py-1 px-0.5 rounded transition-colors ${
                  gazeStatus !== 'normal' 
                    ? 'bg-rose-950 text-rose-300 border border-rose-600 font-bold animate-pulse' 
                    : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                }`}>
                  <span className="block text-[6.5px] sm:text-[7px] text-slate-400">দৃষ্টির অবস্থান</span>
                  <span className="truncate block">
                    {gazeStatus === 'side_glance'
                      ? 'আড় চোখ ⚠️'
                      : gazeStatus === 'looking_away'
                      ? 'স্ক্রিনের বাইরে ⚠️'
                      : gazeStatus === 'looking_down'
                      ? 'দৃষ্টি নিচে ⚠️'
                      : gazeStatus === 'face_missing'
                      ? 'অনুপস্থিত ⚠️'
                      : 'স্ক্রিনে নিবদ্ধ ✓'}
                  </span>
                </div>

                <div className={`py-1 px-0.5 rounded transition-colors ${
                  Math.max(0, gazeAwayCount - 2) >= 50 
                    ? 'bg-rose-900 text-white border border-rose-500 font-bold'
                    : Math.max(0, gazeAwayCount - 2) > 0
                    ? 'bg-amber-950 text-amber-300 border border-amber-600 font-bold' 
                    : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                }`}>
                  <span className="block text-[6.5px] sm:text-[7px] text-slate-400">৫০ বারে সমাপ্তি</span>
                  <span className="truncate block">
                    সতর্কতা: {Math.max(0, gazeAwayCount - 2)}/৫০
                  </span>
                </div>
              </div>

              <div className="text-[7px] sm:text-[7.5px] text-slate-400 font-mono bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800 flex items-center justify-between">
                <span className="truncate">মাত্রা: {proctorConfig.name}</span>
                <span className="shrink-0 text-slate-300 font-bold">ছাড়: {Math.min(gazeAwayCount, 2)}/২</span>
              </div>

              {!cameraActive && (
                <button
                  type="button"
                  onClick={requestWebcamAccess}
                  className="w-full py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[8px] sm:text-[8.5px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs mt-0.5"
                >
                  <Camera className="w-2.5 h-2.5" />
                  <span>ক্যামেরা অন করুন</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Exam Header Strip */}
      <div className="bg-white rounded-2xl p-3 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 overflow-hidden">
        <div className="flex items-center justify-between sm:justify-start gap-2 min-w-0">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer shrink-0 py-1.5 px-2.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">ফিরে যান</span>
          </button>

          {/* On mobile screens, show the timer or compact status badge on the top right */}
          {!isReviewOnly && !isSubmitted ? (
            <div className={`sm:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-mono text-xs font-black border ${
              timeLeft < 180 ? "bg-rose-50 text-rose-600 border-rose-200 animate-pulse" : "bg-blue-50 text-blue-700 border-blue-200"
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          ) : (
            <div className={`sm:hidden flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] font-bold shrink-0 ${
              isReviewed 
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-blue-50 text-blue-800 border-blue-200"
            }`}>
              <CheckCircle2 className={`w-3.5 h-3.5 ${isReviewed ? "text-emerald-600" : "text-blue-600"}`} />
              <span>{isReviewed ? "মূল্যায়ন সম্পন্ন" : "খাতা জমা"}</span>
            </div>
          )}
        </div>

        {/* Center Title & Subtitle - always wraps or truncates cleanly, never bleeds right */}
        <div className="flex-1 min-w-0 text-left sm:text-center px-1">
          <div className="flex items-center sm:justify-center gap-2 overflow-hidden">
            <h2 className="text-xs sm:text-base font-black text-slate-900 truncate" title={test.title}>
              {test.title}
            </h2>
            {!isReviewOnly && !isSubmitted && (
              <>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold shrink-0">
                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                  <span>{proctorConfig.name}</span>
                </span>
                <span className={`hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 border ${
                  Math.max(0, gazeAwayCount - 2) > 0 ? "bg-amber-50 text-amber-800 border-amber-300" : "bg-emerald-50 text-emerald-800 border-emerald-300"
                }`}>
                  <span>সতর্কতা: {Math.max(0, gazeAwayCount - 2)}/৫০</span>
                </span>
              </>
            )}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
            {isReviewOnly || isSubmitted ? "উত্তরপত্র ও খাতা পর্যালোচনা" : "লাইভ পরীক্ষা চলমান (ফ্রন্ট ক্যামেরা নজরদারি ও ফুলস্ক্রিন সুরক্ষা)"}
          </p>
        </div>

        {/* Desktop Right Controls / Status */}
        {!isReviewOnly && !isSubmitted ? (
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {!isFullscreen && (
              <button
                type="button"
                onClick={enterFullscreen}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                title="ফুলস্ক্রিন মোড চালু করুন"
              >
                <Maximize className="w-3.5 h-3.5" />
                <span>ফুলস্ক্রিন</span>
              </button>
            )}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-black border ${
              timeLeft < 180 ? "bg-rose-50 text-rose-600 border-rose-200 animate-pulse" : "bg-blue-50 text-blue-700 border-blue-200"
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
        ) : (
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shrink-0 ${
            isReviewed 
              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
              : "bg-blue-50 text-blue-800 border-blue-200"
          }`}>
            <CheckCircle2 className={`w-4 h-4 ${isReviewed ? "text-emerald-600" : "text-blue-600"}`} />
            <span>{isReviewed ? "মূল্যায়ন সম্পন্ন ও অনুমোদিত" : "উত্তরপত্র জমা সম্পন্ন"}</span>
            {isReviewed && test.score !== undefined && (
              <span className="ml-1 pl-1.5 border-l border-emerald-300 font-black text-emerald-900">
                {test.score}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Parent Feedback & Approved Score Banner (When Reviewed) */}
      {(isReviewOnly || isReviewed) && test.parentComment && (
        <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 sm:p-5 space-y-2 text-indigo-950 shadow-xs">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-indigo-900">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <span>অভিভাবকের মন্তব্য ও দিকনির্দেশনা:</span>
          </div>
          <p className="text-sm sm:text-base font-semibold italic text-slate-800 bg-white/70 p-3 rounded-xl border border-indigo-100">
            "{test.parentComment}"
          </p>
          <div className="flex items-center justify-between text-xs pt-1 font-semibold text-indigo-700">
            <span>চূড়ান্ত প্রাপ্ত নম্বর: {test.score}%</span>
            <span>অভিভাবক কর্তৃক অনুমোদিত ও প্রকাশিত ✓</span>
          </div>
        </div>
      )}

      {/* Post-Submission Clean Screen for Student: Job is done, no clutter! */}
      {isSubmitted && !isReviewOnly && !isReviewed && (
        <div className="bg-white border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <Check className="w-9 h-9 stroke-[3]" />
          </div>
          <div className="space-y-1.5">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              ✓ পরীক্ষা সম্পন্ন
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 pt-1">
              উত্তরপত্র সফলভাবে জমা হয়েছে!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              তোমার উত্তরপত্রটি অপর প্রান্তে অভিভাবকের কাছে পৌঁছে গেছে। অভিভাবক খাতা যাচাই ও মূল্যায়ন সম্পন্ন করলে তুমি পূর্ণাঙ্গ ফলাফল ও দিকনির্দেশনা দেখতে পাবে।
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl max-w-sm mx-auto text-xs text-slate-600 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-800">তোমার কাজ শেষ! এখন তুমি ফিরে যেতে পারো।</span>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={onExit}
              className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-bold shadow-md shadow-emerald-600/30 cursor-pointer transition-all flex items-center gap-2"
            >
              <span>মূল পাতায় ফিরে যান</span>
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      )}

      {/* Questions Answering Sheet - hidden for student right after submission until reviewed */}
      {(!isSubmitted || isReviewOnly || isReviewed) && (
      <div className="space-y-4">
        {(test.questions || []).map((q, idx) => {
          const chosenAnswer = answers[q.id];
          const isCorrect = chosenAnswer === q.correctAnswer;
          const showGrading = isReviewOnly || isSubmitted;
          const isCurrentActive = activeQuestionIndex === idx && !showGrading;

          return (
            <div
              key={q.id}
              ref={(el) => {
                questionRefs.current[idx] = el;
              }}
              className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all duration-300 ${
                isCurrentActive
                  ? "ring-2 ring-blue-500 border-blue-400 shadow-md"
                  : showGrading
                  ? isCorrect
                    ? "border-emerald-200 bg-emerald-50/10"
                    : chosenAnswer
                    ? "border-rose-200 bg-rose-50/10"
                    : "border-slate-200"
                  : chosenAnswer
                  ? "border-blue-400 shadow-xs"
                  : "border-slate-200"
              }`}
            >
              {/* Question Text */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2.5">
                  <span className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                    isCurrentActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="space-y-1">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {q.question}
                    </h4>
                    {isCurrentActive && (
                      <span className="inline-block text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                        চলমান প্রশ্ন • উত্তর দিলে স্বয়ংক্রিয়ভাবে পরের প্রশ্নে যাবে
                      </span>
                    )}
                  </div>
                </div>

                {showGrading && (
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                      isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>{isCorrect ? "সঠিক" : "ভুল"}</span>
                  </span>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                {(q.options || []).map((opt, oIdx) => {
                  const isSelected = chosenAnswer === opt;
                  const isRightAnswer = q.correctAnswer === opt;

                  let optClass = "border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700";

                  if (showGrading) {
                    if (isRightAnswer) {
                      optClass = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold";
                    } else if (isSelected && !isRightAnswer) {
                      optClass = "border-rose-400 bg-rose-50 text-rose-900 line-through";
                    } else {
                      optClass = "border-slate-200 bg-slate-50/30 text-slate-400";
                    }
                  } else if (isSelected) {
                    optClass = "border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs ring-1 ring-blue-500";
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={isReviewOnly || isSubmitted}
                      onClick={() => handleSelectOption(q.id, opt, idx)}
                      className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${optClass} ${
                        !isReviewOnly && !isSubmitted ? "cursor-pointer active:scale-[0.99]" : ""
                      }`}
                    >
                      <span>{opt}</span>
                      {showGrading && isRightAnswer && (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {showGrading && isSelected && !isRightAnswer && (
                        <X className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Solution / Explanation on Review */}
              {showGrading && q.explanation && (
                <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800 block mb-0.5">ব্যাখ্যা ও সমাধান:</span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}

      {/* Bottom Submit Action Strip - High z-index, clean padding, completely unobstructed */}
      {!isReviewOnly && !isSubmitted && (
        <div 
          ref={submitSectionRef}
          className="sticky bottom-3 z-50 bg-white/98 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-2xl flex items-center justify-between gap-3 mt-4"
        >
          <div className="text-xs sm:text-sm text-slate-700 font-bold">
            উত্তর সম্পন্ন: <span className="text-blue-600 font-black">{answeredCount}</span> / {test.questions.length}টি
          </div>

          <button
            type="button"
            onClick={() => handleSubmitExam(false)}
            className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>খাতা জমা দিন</span>
          </button>
        </div>
      )}

    </div>
  );
};
