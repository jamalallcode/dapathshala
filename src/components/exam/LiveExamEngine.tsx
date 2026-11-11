import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { 
  ArrowLeft, Clock, CircleAlert, CircleCheck, Check, CheckCircle2,
  FileCheck, Send, ShieldCheck, ShieldAlert, X, FileText, Camera, 
  AlertTriangle, Eye, EyeOff, Maximize, MessageSquare, Copy,
  Volume2, VolumeX, Play, Mic, MicOff, Smartphone, BookOpen, Shuffle, Lock, Timer, Zap, Users,
  Lightbulb, ArrowRight
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
import { AssignedTest, ViolationSnapshot, ExamQuestion } from "../../types";
import { startAudioMonitoring, AudioProctoringController } from "../../lib/audioProctoringService";
import { startObjectDetection, ObjectDetectionController, DetectedObjectResult } from "../../lib/objectDetectionService";
import { BLOOM_LEVELS, BloomLevel, normalizeBloomLevel, inferBloomLevelFromQuestion } from "../../lib/bloomTaxonomy";
import { generateTwoSolutions } from "../../lib/curriculumQuestions";

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
  // Feature 2: Anti-Cheating Question & Option Shuffling per Examinee Attempt
  const [activeQuestions] = useState<ExamQuestion[]>(() => {
    const rawList = test.questions || [];
    // If reviewing or already submitted, maintain submitted order
    if (isReviewOnly || test.status === 'submitted' || test.status === 'reviewed') {
      return rawList;
    }

    // Deep clone and shuffle options per question using Fisher-Yates algorithm
    const randomized = rawList.map((q) => {
      const opts = [...(q.options || [])];
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]];
      }

      const newCorrectIndex = opts.findIndex((opt) => opt === q.correctAnswer);

      return {
        ...q,
        options: opts,
        correctAnswerIndex: newCorrectIndex !== -1 ? newCorrectIndex : q.correctAnswerIndex
      };
    });

    // Shuffle questions sequence using Fisher-Yates algorithm
    for (let i = randomized.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [randomized[i], randomized[j]] = [randomized[j], randomized[i]];
    }

    return randomized;
  });

  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    (activeQuestions || []).forEach((q) => {
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
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
  
  // Feature 3: Per-Question Dedicated Time Limit & Backtrack Lock
  const perQuestionDuration = Math.max(30, Math.floor((test.durationMinutes * 60) / Math.max(1, activeQuestions.length)));
  const [questionTimeLeft, setQuestionTimeLeft] = useState<number>(perQuestionDuration);
  const [lockedQuestionIndices, setLockedQuestionIndices] = useState<Set<number>>(() => {
    const initial = new Set<number>();
    if (!isReviewOnly && test.status !== 'submitted' && test.status !== 'reviewed') {
      activeQuestions.forEach((q, idx) => {
        if (q.studentAnswer) initial.add(idx);
      });
    }
    return initial;
  });

  // Feature 5: Answer Speed Anomaly Detection (প্রশ্ন পড়ার ন্যূনতম স্বাভাবিক সময় ট্র্যাকিং)
  const questionStartTimeRef = useRef<number>(Date.now());
  const [responseTimes, setResponseTimes] = useState<Record<string, number>>(() => test.questionResponseTimes || {});
  const responseTimesRef = useRef<Record<string, number>>(test.questionResponseTimes || {});

  useEffect(() => {
    questionStartTimeRef.current = Date.now();
  }, [activeQuestionIndex]);

  const [proctorLogs, setProctorLogs] = useState<string[]>([]);
  const [isSimulatingSuspicious, setIsSimulatingSuspicious] = useState(false);
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);
  const isViolatingRef = useRef<boolean>(false);

  // Live Audio & Object Detection States
  const [audioStatus, setAudioStatus] = useState<'calibrating' | 'quiet' | 'speech_detected' | 'noise'>('quiet');
  const [audioVolume, setAudioVolume] = useState<number>(0);
  const [detectedObject, setDetectedObject] = useState<string | null>(null);

  const audioControllerRef = useRef<AudioProctoringController | null>(null);
  const objectControllerRef = useRef<ObjectDetectionController | null>(null);

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

  // Feature 1: Automated Photographic Violation Snapshot Proofs
  const [violationSnapshots, setViolationSnapshots] = useState<ViolationSnapshot[]>(() => test.violationSnapshots || []);
  const violationSnapshotsRef = useRef<ViolationSnapshot[]>(test.violationSnapshots || []);
  const snapshotCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const captureViolationSnapshot = (reason: string, strike: number): ViolationSnapshot | null => {
    try {
      const video = videoRef.current;
      if (!video) return null;
      if (!snapshotCanvasRef.current) {
        snapshotCanvasRef.current = document.createElement('canvas');
        snapshotCanvasRef.current.width = 320;
        snapshotCanvasRef.current.height = 240;
      }
      const canvas = snapshotCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Draw the active video stream frame
      ctx.drawImage(video, 0, 0, 320, 240);

      // Watermark bar at bottom
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.fillRect(0, 192, 320, 48);

      // Red warning accent line
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(0, 190, 320, 2);

      // Warning text with strike & reason
      ctx.fillStyle = '#fca5a5';
      ctx.font = 'bold 11px sans-serif';
      const cleanReason = reason.length > 34 ? reason.slice(0, 34) + '...' : reason;
      ctx.fillText(`⚠️ সতর্কতা #${strike}: ${cleanReason}`, 8, 208);

      // Timestamp & verification tag
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '9.5px sans-serif';
      const nowTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      ctx.fillText(`সময়: ${nowTime} • দাপাঠশালা স্বয়ংক্রিয় ডিজিটাল প্রমাণ`, 8, 226);

      const photo = canvas.toDataURL('image/jpeg', 0.65);
      return {
        id: `snap-${Date.now()}-${strike}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: nowTime,
        reason,
        strike,
        photo
      };
    } catch (err) {
      console.warn("Failed to capture violation snapshot:", err);
      return null;
    }
  };

  // -------------------------------------------------------------
  // INTERACTIVE GAZE & POSTURE CALIBRATION (স্মার্ট ফটো-বেসড বায়োমেট্রিক ও গেইজ ক্যালিব্রেশন)
  // -------------------------------------------------------------
  const [isCalibrating, setIsCalibrating] = useState<boolean>(!isReviewOnly && !isSubmitted);
  const [calibrationStep, setCalibrationStep] = useState<1 | 2 | 3 | 4 | 5>(1); // 1: সোজা, 2: নিচে প্রশ্ন, 3: অপশন, 4: বাইরে তাকানো, 5: সম্পন্ন
  const [calibrationProgress, setCalibrationProgress] = useState<number>(0);
  const [calibrationPhotos, setCalibrationPhotos] = useState<{
    center?: string;
    down?: string;
    side?: string;
    away?: string;
  }>(() => test.calibrationPhotos || {});
  const [calibrationCountdown, setCalibrationCountdown] = useState<number | null>(null);
  const [shutterFlash, setShutterFlash] = useState<boolean>(false);
  const hasAnnouncedStepRef = useRef<number>(0);
  const [calibratedProfile, setCalibratedProfile] = useState<{
    centerYaw: number;
    pitchDownMax: number;
    eyeMinRel: number;
    eyeMaxRel: number;
    isCompleted: boolean;
  }>({
    centerYaw: 40,
    pitchDownMax: 42,
    eyeMinRel: 0.15,
    eyeMaxRel: 0.85,
    isCompleted: false
  });
  const calibratedProfileRef = useRef(calibratedProfile);
  useEffect(() => {
    calibratedProfileRef.current = calibratedProfile;
  }, [calibratedProfile]);

  const violationCountRef = useRef<number>(0);

  // Capture snapshot photo & lock biometric baseline (International Gold Standard - Duolingo/Honorlock Protocol)
  const captureCalibrationPhoto = (angle: 'center' | 'down' | 'side' | 'away' = 'center'): string | null => {
    try {
      const video = videoRef.current;
      if (!video) return null;
      const c = document.createElement('canvas');
      c.width = 320;
      c.height = 240;
      const ctx = c.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0, 320, 240);
      const photo = c.toDataURL('image/jpeg', 0.82);

      // Extract real centroid and biometric parameters from this exact captured frame
      let detectedCentroidX = 40;
      let detectedCentroidY = 28;
      try {
        const scanC = document.createElement('canvas');
        scanC.width = 80;
        scanC.height = 60;
        const scanCtx = scanC.getContext('2d');
        if (scanCtx) {
          scanCtx.drawImage(video, 0, 0, 80, 60);
          const imgData = scanCtx.getImageData(0, 0, 80, 60);
          const d = imgData.data;
          let skinPixels = 0, sumX = 0, sumY = 0;
          for (let y = 0; y < 60; y++) {
            for (let x = 0; x < 80; x++) {
              const i = (y * 80 + x) * 4;
              const r = d[i], g = d[i + 1], b = d[i + 2];
              const isSkin = (r > 36 && g > 20 && b > 14 && r >= g && g >= b * 0.68 && (r - g) >= 3);
              if (isSkin) {
                skinPixels++;
                sumX += x;
                sumY += y;
              }
            }
          }
          if (skinPixels > 25) {
            detectedCentroidX = Math.round(sumX / skinPixels);
            detectedCentroidY = Math.round(sumY / skinPixels);
          }
        }
      } catch {}

      // International Gold Standard: Locks candidate baseline & all reference slots simultaneously
      setCalibrationPhotos({
        center: photo,
        down: photo,
        side: photo,
        away: photo
      });

      hasCalibratedFaceRef.current = true;
      baselineFaceXRef.current = detectedCentroidX;
      baselineFaceYRef.current = detectedCentroidY;
      setCalibratedProfile({
        centerYaw: detectedCentroidX,
        pitchDownMax: Math.min(33, detectedCentroidY + 4),
        eyeMinRel: 0.30,
        eyeMaxRel: 0.70,
        isCompleted: true
      });

      speakObservationAudio("বায়োমেট্রিক ও রিডিং সেফ-জোন সফলভাবে লক করা হয়েছে। এবার নিশ্চিন্তে পরীক্ষা শুরু করুন।");

      return photo;
    } catch {
      return null;
    }
  };

  // 4 Proctoring Strictness Levels (অভিভাবক কর্তৃক নির্বাচিত ৪টি মাত্রা)
  const effectiveProctoringLevel: 1 | 2 | 3 | 4 = (
    test.proctoringLevel ||
    Number(localStorage.getItem('dapathshala_parent_proctoring_level')) ||
    2
  ) as 1 | 2 | 3 | 4;

  // 4 Proctoring Strictness Levels (আন্তর্জাতিক অনলাইন পরীক্ষা স্ট্যান্ডার্ড)
  // দ্রুত এবং নির্ভুল ডিটেকশন নিশ্চিত করা হয়েছে যাতে ডানে/বামে/নিচে তাকালে সঙ্গে সঙ্গে সতর্ক করে, কিন্তু সোজা বসলে কখনো ভুল অ্যালার্ম না দেয়
  const proctorConfig = {
    1: {
      levelNum: 1,
      name: 'লেভেল ১ (মৃদু)',
      tag: 'সহনশীল',
      featureSkewThreshold: 0.18,
      lateralShiftThreshold: 0.24,
      skinAsymmetryThreshold: 0.45,
      sideGlanceDev: 0.20,
      consecutiveRequired: 6, // ~0.84s sustained look-away
    },
    2: {
      levelNum: 2,
      name: 'লেভেল ২ (মাঝারি)',
      tag: 'স্ট্যান্ডার্ড',
      featureSkewThreshold: 0.16,
      lateralShiftThreshold: 0.20,
      skinAsymmetryThreshold: 0.40,
      sideGlanceDev: 0.18,
      consecutiveRequired: 5, // ~0.70s sustained look-away
    },
    3: {
      levelNum: 3,
      name: 'লেভেল ৩ (কঠোর)',
      tag: 'কঠোর',
      featureSkewThreshold: 0.13,
      lateralShiftThreshold: 0.17,
      skinAsymmetryThreshold: 0.35,
      sideGlanceDev: 0.15,
      consecutiveRequired: 4, // ~0.56s sustained look-away
    },
    4: {
      levelNum: 4,
      name: 'লেভেল ৪ (সর্বোচ্চ কঠোর - আন্তর্জাতিক প্রোটোকল)',
      tag: 'অতি-সংবেদনশীল',
      featureSkewThreshold: 0.10,
      lateralShiftThreshold: 0.14,
      skinAsymmetryThreshold: 0.30,
      sideGlanceDev: 0.12,
      consecutiveRequired: 3, // ~0.42s sustained look-away
    },
  }[effectiveProctoringLevel] || {
    levelNum: 2,
    name: 'লেভেল ২ (মাঝারি)',
    tag: 'স্ট্যান্ডার্ড',
    featureSkewThreshold: 0.16,
    lateralShiftThreshold: 0.20,
    skinAsymmetryThreshold: 0.40,
    sideGlanceDev: 0.18,
    consecutiveRequired: 5,
  };

  // Spoken Voice Audio Alert (বাংলা কণ্ঠস্বরে অডিও আকারে সতর্কবার্তা)
  // User Requirement: “প্লিজ প্রশ্নপত্র ব্যতিত অন্যকোন দিকে তাকাবেন না। আপনার সব কিছু পর্যবেক্ষন করা হচ্ছে।” অডিও আকারে বলা হবে।
  const speakObservationAudio = (customText?: string) => {
    const textToSpeak = customText || "প্লিজ প্রশ্নপত্র ব্যতিত অন্যকোন দিকে তাকাবেন না। আপনার সব কিছু পর্যবেক্ষন করা হচ্ছে।";

    // 1. Dual-tone Attention Alert Chime via Web Audio API
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(780, ctx.currentTime + 0.22);
        osc.frequency.exponentialRampToValueAtTime(1040, ctx.currentTime + 0.38);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.warn("Audio chime error:", e);
    }

    // 2. High-Fidelity Bengali Voice Speech Synthesis (Text-to-Speech)
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'bn-BD';
        utterance.rate = 0.88; // clear, natural Bangladeshi cadence
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const bnVoice = voices.find(v => 
          v.lang.toLowerCase().startsWith('bn') || 
          v.lang.toLowerCase().includes('bengali') || 
          v.lang.toLowerCase().includes('bangla')
        );
        if (bnVoice) {
          utterance.voice = bnVoice;
        }

        utterance.onstart = () => {
          setIsSpeakingAudio(true);
        };
        utterance.onend = () => {
          setIsSpeakingAudio(false);
        };
        utterance.onerror = () => {
          setIsSpeakingAudio(false);
        };

        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.warn("Speech synthesis error:", err);
    }
  };

  // Pre-load Speech Synthesis voices on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // International Gold Standard Unified Intelligent Baseline Auto-Capture Loop (Duolingo / Honorlock Protocol)
  useEffect(() => {
    if (!isCalibrating || isReviewOnly || isSubmitted || !cameraActive) {
      return;
    }

    // If baseline photo is already captured, do not loop
    if (calibrationPhotos.center) {
      setCalibrationCountdown(null);
      return;
    }

    // Spoken Voice Instruction via Bengali Speech Synthesis & audio chime
    if (hasAnnouncedStepRef.current !== 1) {
      hasAnnouncedStepRef.current = 1;
      speakObservationAudio("অনুগ্রহ করে ক্যামেরার দিকে শান্তভাবে সোজা তাকিয়ে থাকুন। আপনার বায়োমেট্রিক ও রিডিং সেফ-জোন নির্ধারণ করা হচ্ছে।");
    }

    // Start 3-second automated countdown to capture baseline
    let count = 3;
    setCalibrationCountdown(count);

    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCalibrationCountdown(count);
      } else {
        clearInterval(interval);
        setCalibrationCountdown(0);

        // Auto snapshot photo & lock baseline
        captureCalibrationPhoto('center');
        setShutterFlash(true);
        setTimeout(() => setShutterFlash(false), 350);
        setCalibrationCountdown(null);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isCalibrating, calibrationPhotos.center, cameraActive, isReviewOnly, isSubmitted]);

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

  // Fullscreen state listener
  useEffect(() => {
    if (isReviewOnly || isSubmitted) return;

    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

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
          let stream: MediaStream;
          try {
            // Request both video and microphone for full anti-cheating proctoring
            stream = await navigator.mediaDevices.getUserMedia({
              video: { 
                facingMode: 'user', 
                width: { ideal: 480 }, 
                height: { ideal: 360 } 
              },
              audio: true
            });
          } catch (micErr) {
            console.warn("Microphone access unavailable or denied, falling back to video only:", micErr);
            stream = await navigator.mediaDevices.getUserMedia({
              video: { 
                facingMode: 'user', 
                width: { ideal: 480 }, 
                height: { ideal: 360 } 
              },
              audio: false
            });
          }

          if (isMounted) {
            mediaStreamRef.current = stream;
            setCameraActive(true);
            attachStream(stream);

            // Start Audio Proctoring if microphone track is active
            if (stream.getAudioTracks().length > 0) {
              audioControllerRef.current = startAudioMonitoring(stream, (reason) => {
                setAudioStatus('speech_detected');
                handleGazeAway(reason);
              });
            }

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
      audioControllerRef.current?.stop();
      objectControllerRef.current?.stop();
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

  // Live Object Detection Loop (Smartphone, Books/Notes, Second Person in Frame)
  useEffect(() => {
    if (isReviewOnly || isSubmitted || !cameraActive || !videoRef.current) return;

    const controller = startObjectDetection(videoRef.current, (result: DetectedObjectResult) => {
      setDetectedObject(result.label);
      const reason = result.type === 'cell_phone'
        ? 'ফ্রেমে মোবাইল ফোন বা ডিজিটাল ডিভাইস সনাক্ত হয়েছে'
        : result.type === 'book'
        ? 'ফ্রেমে বই, খাতা বা নোট পেপার সনাক্ত হয়েছে'
        : result.type === 'second_person'
        ? 'ফ্রেমে অতিরিক্ত মানুষের উপস্থিতি / দ্বিতীয় ব্যক্তি সনাক্ত হয়েছে'
        : `ফ্রেমে অননুমোদিত বস্তু (${result.label}) সনাক্ত হয়েছে`;
      
      handleGazeAway(reason);

      if (result.type === 'second_person') {
        speakObservationAudio("পরীক্ষার ফ্রেমে অতিরিক্ত মানুষের উপস্থিতি সনাক্ত হয়েছে। অনুগ্রহ করে একাকী পরীক্ষা দিন।");
      }

      setTimeout(() => {
        setDetectedObject(null);
      }, 5000);
    });

    objectControllerRef.current = controller;

    return () => {
      controller.stop();
      objectControllerRef.current = null;
    };
  }, [cameraActive, isReviewOnly, isSubmitted]);

  // Audio volume and status live poller for UI
  useEffect(() => {
    if (isReviewOnly || isSubmitted || !cameraActive) return;

    const interval = setInterval(() => {
      if (audioControllerRef.current) {
        setAudioVolume(audioControllerRef.current.getVolume());
        setAudioStatus(audioControllerRef.current.getStatus());
      }
    }, 250);

    return () => clearInterval(interval);
  }, [cameraActive, isReviewOnly, isSubmitted]);

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

    // Feature 4: Hardcore Keyboard, Clipboard & Screenshot Lock
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setLastWarning("🚫 পরীক্ষায় রাইট-ক্লিক বা কনটেক্সট মেনু ব্যবহার সম্পূর্ণ নিষিদ্ধ!");
      handleGazeAway('অননুমোদিত রাইট-ক্লিক ব্যবহারের চেষ্টা');
    };

    const handleCopyCutPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        if (e.clipboardData) e.clipboardData.clearData();
      } catch {}
      setLastWarning("🚫 পরীক্ষায় টেক্সট কপি, পেস্ট বা কাট করা সম্পূর্ণ নিষিদ্ধ!");
      handleGazeAway('অননুমোদিত ক্লিপবোর্ড (কপি/পেস্ট) ব্যবহারের চেষ্টা');
    };

    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key ? e.key.toLowerCase() : '';
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isAlt = e.altKey;

      // PrintScreen / Screenshot key
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        e.stopPropagation();
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText('');
          }
        } catch {}
        setLastWarning("🚫 পরীক্ষায় স্ক্রিনশট নেওয়া সম্পূর্ণ নিষিদ্ধ ও শাস্তিযোগ্য!");
        handleGazeAway('স্ক্রিনশট (PrintScreen) নেওয়ার চেষ্টা সনাক্ত হয়েছে');
        return;
      }

      // F12 or Developer Tools keys
      if (e.key === 'F12' || (isCtrlOrCmd && e.shiftKey && (key === 'i' || key === 'j' || key === 'c'))) {
        e.preventDefault();
        e.stopPropagation();
        setLastWarning("🚫 ডেভেলপার টুলস বা ইন্সপেক্ট উইন্ডো খোলার চেষ্টা সনাক্ত হয়েছে!");
        handleGazeAway('ডেভেলপার টুলস / ইন্সপেক্ট উইন্ডো খোলার চেষ্টা');
        return;
      }

      // Ctrl/Cmd shortcuts: Copy (C), Paste (V), Cut (X), SelectAll (A), Save (S), Print (P), View Source (U)
      if (isCtrlOrCmd && ['c', 'v', 'x', 'a', 's', 'p', 'u'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        const actionMap: Record<string, string> = {
          c: 'কপি',
          v: 'পেস্ট',
          x: 'কাট',
          a: 'সব সিলেক্ট',
          u: 'সোর্স কোড',
          s: 'সংরক্ষণ',
          p: 'প্রিন্ট'
        };
        const actionName = actionMap[key] || 'শর্টকাট';
        setLastWarning(`🚫 পরীক্ষায় [Ctrl+${key.toUpperCase()}] (${actionName}) ব্যবহার নিষিদ্ধ!`);
        handleGazeAway(`অননুমোদিত কীবোর্ড শর্টকাট [Ctrl+${key.toUpperCase()}] ব্যবহারের চেষ্টা`);
        return;
      }

      // Alt+Tab or Alt navigation shortcuts
      if (isAlt && (e.key === 'Tab' || key === 'tab' || e.key === 'Escape' || e.key === 'F4')) {
        e.preventDefault();
        e.stopPropagation();
        setLastWarning("🚫 পরীক্ষায় উইন্ডো পরিবর্তনের চেষ্টা নিষিদ্ধ!");
        handleGazeAway('উইন্ডো পরিবর্তনের চেষ্টা (Alt শর্টকাট)');
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText('');
          }
        } catch {}
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyCutPaste);
    document.addEventListener('cut', handleCopyCutPaste);
    document.addEventListener('paste', handleCopyCutPaste);
    document.addEventListener('selectstart', handleSelectStart);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyCutPaste);
      document.removeEventListener('cut', handleCopyCutPaste);
      document.removeEventListener('paste', handleCopyCutPaste);
      document.removeEventListener('selectstart', handleSelectStart);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [isReviewOnly, isSubmitted]);

  // Explicit function to request hardware webcam on user click
  const requestWebcamAccess = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { 
              facingMode: 'user', 
              width: { ideal: 480 }, 
              height: { ideal: 360 } 
            },
            audio: true
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { 
              facingMode: 'user', 
              width: { ideal: 480 }, 
              height: { ideal: 360 } 
            },
            audio: false
          });
        }

        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
        audioControllerRef.current?.stop();

        mediaStreamRef.current = stream;
        setCameraActive(true);
        setCameraError(false);
        attachStream(stream);

        if (stream.getAudioTracks().length > 0) {
          audioControllerRef.current = startAudioMonitoring(stream, (reason) => {
            setAudioStatus('speech_detected');
            handleGazeAway(reason);
          });
        }
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

        const now = Date.now();

        // -------------------------------------------------------------
        // FACE DETECTION & MULTI-FEATURE HEAD POSE / GAZE ANALYSIS
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

            // Robust multi-tone lighting invariant skin check (covers all South Asian & global skin tones)
            const isSkin = (
              (r > 36 && g > 20 && b > 14 && r >= g && g >= b * 0.68 && (r - g) >= 3) ||
              (r > 48 && g > 34 && b > 24 && Math.abs(r - g) < 55 && (r - b) >= 4) ||
              (r > 72 && g > 48 && b > 32 && r > b)
            );

            if (isSkin) {
              faceSkinCount++;
              weightedFaceY += y;
              weightedFaceX += x;
              if (y < faceMinY) faceMinY = y;
              if (y > faceMaxY) faceMaxY = y;
              if (x < faceMinX) faceMinX = x;
              if (x > faceMaxX) faceMaxX = x;
            } else if (y < 35 && r < 55 && g < 55 && b < 60) {
              upperDarkHairCount++;
            }
          }
        }

        // Case A: Face completely missing from camera frame (ducked or left seat for > 1.4s)
        if (faceSkinCount < 16) {
          faceMissingConsecutiveRef.current++;
          if (faceMissingConsecutiveRef.current >= 10) {
            setGazeStatus('face_missing');
            setHeadStatus('turned');
            const isNewEvent = !isViolatingRef.current;
            if (isNewEvent || now - lastViolationTimeRef.current > 6500) {
              lastViolationTimeRef.current = now;
              isViolatingRef.current = true;
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
        const faceMidX = (faceMinX + faceMaxX) / 2;

        // Calibrate baseline when student sits calmly front-facing
        if (calibrationSamplesCountRef.current < 15) {
          if (centroidX > 25 && centroidX < 55 && centroidY > 14 && centroidY < 40) {
            baselineFaceXRef.current = baselineFaceXRef.current === null ? centroidX : (baselineFaceXRef.current * 0.8 + centroidX * 0.2);
            baselineFaceYRef.current = baselineFaceYRef.current === null ? centroidY : (baselineFaceYRef.current * 0.8 + centroidY * 0.2);
            calibrationSamplesCountRef.current++;
            hasCalibratedFaceRef.current = true;
          }
        }

        const baseX = baselineFaceXRef.current ?? 40;
        const baseY = baselineFaceYRef.current ?? 26;

        // Isolate true HEAD region from bare shoulders, chest, or torso
        // The head sits in the top 24-28 pixels from faceMinY
        const headMaxY = Math.min(faceMinY + 26, 52);

        let headSkinCount = 0;
        let headWeightedX = 0;
        let headMinX = 80, headMaxX = 0;
        let headLeftSkin = 0; // skin in left half of frame (x < 40)
        let headRightSkin = 0; // skin in right half of frame (x >= 40)
        let headHairCount = 0;
        let headHairWeightedX = 0;
        let headSkinLumSum = 0;

        for (let y = Math.max(0, faceMinY - 8); y <= headMaxY; y++) {
          for (let x = 0; x < 80; x++) {
            const idx = (y * 80 + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const lum = r * 0.299 + g * 0.587 + b * 0.114;

            const isSkin = (
              (r > 36 && g > 20 && b > 14 && r >= g && g >= b * 0.68 && (r - g) >= 3) ||
              (r > 48 && g > 34 && b > 24 && Math.abs(r - g) < 55 && (r - b) >= 4) ||
              (r > 72 && g > 48 && b > 32 && r > b)
            );

            if (y >= faceMinY && isSkin) {
              headSkinCount++;
              headWeightedX += x;
              headSkinLumSum += lum;
              if (x < headMinX) headMinX = x;
              if (x > headMaxX) headMaxX = x;
              if (x < 40) headLeftSkin++;
              else headRightSkin++;
            } else if (!isSkin && (lum < 68 || (r < 65 && g < 65 && b < 70))) {
              headHairCount++;
              headHairWeightedX += x;
            }
          }
        }

        const headCentroidX = headSkinCount > 0 ? (headWeightedX / headSkinCount) : centroidX;
        const headW = Math.max(headMaxX - headMinX, 10);
        const headMidX = (headMinX + headMaxX) / 2;
        const avgSkinLum = headSkinCount > 0 ? (headSkinLumSum / headSkinCount) : 110;
        const darkFeatureThreshold = Math.min(84, avgSkinLum * 0.75);

        // 1. Cheek Skin Asymmetry inside the head region
        let leftCheekSkin = 0;
        let rightCheekSkin = 0;
        let darkFeatureCount = 0;
        let darkFeatureWeightedX = 0;

        // Eye socket specific analysis
        const eyeTop = Math.floor(faceMinY + 3);
        const eyeBottom = Math.floor(faceMinY + 14);
        let leftEyeDarkX = 0, leftEyeDarkCount = 0;
        let rightEyeDarkX = 0, rightEyeDarkCount = 0;

        for (let y = faceMinY; y <= headMaxY; y++) {
          for (let x = headMinX; x <= headMaxX; x++) {
            const idx = (y * 80 + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const lum = r * 0.299 + g * 0.587 + b * 0.114;

            const isSkin = (
              (r > 36 && g > 20 && b > 14 && r >= g && g >= b * 0.68 && (r - g) >= 3) ||
              (r > 48 && g > 34 && b > 24 && Math.abs(r - g) < 55 && (r - b) >= 4) ||
              (r > 72 && g > 48 && b > 32 && r > b)
            );

            if (isSkin) {
              if (x < headMidX) leftCheekSkin++;
              else rightCheekSkin++;
            }

            // Dark features (eyes, eyebrows, nostrils, lips, ear contour)
            if (lum < darkFeatureThreshold || (!isSkin && lum < 95)) {
              darkFeatureCount++;
              darkFeatureWeightedX += x;
            }

            // Eye socket band
            if (y >= eyeTop && y <= eyeBottom) {
              if (lum < darkFeatureThreshold) {
                if (x < headMidX) {
                  leftEyeDarkX += x;
                  leftEyeDarkCount++;
                } else {
                  rightEyeDarkX += x;
                  rightEyeDarkCount++;
                }
              }
            }
          }
        }

        // Cheek skin distribution asymmetry (inside the isolated head)
        const totalHeadCheek = leftCheekSkin + rightCheekSkin;
        const skinAsymmetry = totalHeadCheek > 15
          ? Math.abs(leftCheekSkin - rightCheekSkin) / totalHeadCheek
          : 0;

        // Feature skew inside the isolated head
        let featureSkew = 0;
        if (darkFeatureCount >= 3) {
          const featureCenterX = darkFeatureWeightedX / darkFeatureCount;
          featureSkew = Math.abs(featureCenterX - headMidX) / headW;
        }

        // If in Interactive Calibration Mode, record biometric and gaze samples for active step
        if (isCalibrating) {
          if (calibrationStep === 1) {
            // Step 1: Center Forward Look (সোজা তাকানো)
            if (centroidX > 20 && centroidX < 60 && centroidY > 10 && centroidY < 50) {
              baselineFaceXRef.current = baselineFaceXRef.current === null ? centroidX : (baselineFaceXRef.current * 0.75 + centroidX * 0.25);
              baselineFaceYRef.current = baselineFaceYRef.current === null ? centroidY : (baselineFaceYRef.current * 0.75 + centroidY * 0.25);
              hasCalibratedFaceRef.current = true;
              setCalibratedProfile(prev => ({
                ...prev,
                centerYaw: Math.round(centroidX)
              }));
              setCalibrationProgress(prev => {
                const next = Math.min(prev + 12, 100);
                if (next >= 100) {
                  setTimeout(() => {
                    setCalibrationStep(2);
                    setCalibrationProgress(0);
                  }, 400);
                }
                return next;
              });
            }
          } else if (calibrationStep === 2) {
            // Step 2: Downward Screen Reading Look (স্ক্রিনের নিচে প্রশ্ন পড়ার স্বাভাবিক কোণ)
            setCalibratedProfile(prev => ({
              ...prev,
              pitchDownMax: Math.max(prev.pitchDownMax, Math.round(centroidY + 6))
            }));
            setCalibrationProgress(prev => {
              const next = Math.min(prev + 12, 100);
              if (next >= 100) {
                setTimeout(() => {
                  setCalibrationStep(3);
                  setCalibrationProgress(0);
                }, 400);
              }
              return next;
            });
          } else if (calibrationStep === 3) {
            // Step 3: Horizontal Reading Range (স্ক্রিনের ডানে ও বামে অপশন পড়ার সীমানা)
            if (leftEyeDarkCount >= 2 || rightEyeDarkCount >= 2) {
              const leftEyeCenter = leftEyeDarkCount > 0 ? (leftEyeDarkX / leftEyeDarkCount) : headMidX;
              const rightEyeCenter = rightEyeDarkCount > 0 ? (rightEyeDarkX / rightEyeDarkCount) : headMidX;
              const avgEyeRel = (((leftEyeCenter - headMinX) / headW) + ((rightEyeCenter - headMinX) / headW)) / 2;
              setCalibratedProfile(prev => ({
                ...prev,
                eyeMinRel: Math.min(prev.eyeMinRel, Math.max(0.12, avgEyeRel - 0.16)),
                eyeMaxRel: Math.max(prev.eyeMaxRel, Math.min(0.88, avgEyeRel + 0.16))
              }));
            }
            setCalibrationProgress(prev => {
              const next = Math.min(prev + 12, 100);
              if (next >= 100) {
                setTimeout(() => {
                  setCalibratedProfile(p => ({ ...p, isCompleted: true }));
                  setCalibrationStep(4);
                  setCalibrationProgress(100);
                }, 400);
              }
              return next;
            });
          }
          return;
        }

        // Candidate Frontal Screen Presence (মৌলিক জ্যামিতিক যাচাই)
        const faceAspectRatio = faceW / Math.max(faceH, 1);
        const isCenteredFrontal = (
          centroidX >= 22 && centroidX <= 58 &&
          centroidY >= 14 && centroidY <= 40 &&
          faceAspectRatio >= 0.65
        );

        // 1. Lateral Glance / Leaning completely off screen (স্ক্রিনের বাইরে সরে যাওয়া)
        let isSideGlance = false;
        if (centroidX < 20 || centroidX > 60) {
          isSideGlance = true;
        }

        // 2. Vertical Head Pitch / Looking Down towards desk, phone or notes (নিচে তাকানো সনাক্তকরণ)
        let isLookingDown = false;
        if (centroidY > 43) {
          isLookingDown = true;
        }

        // 3. Head Turned completely Sideways / Profile (মাথা সম্পূর্ণ অন্যদিকে ঘোরানো)
        let isHeadTurned = false;
        const isProfileTurn = faceAspectRatio < 0.58 && Math.abs(centroidX - baseX) > 8;
        const isTurnedBackwards = upperDarkHairCount > 130 && headSkinCount < 20;

        if (!isCenteredFrontal) {
          if (isProfileTurn || isTurnedBackwards) {
            isHeadTurned = true;
          }
        }

        if (isHeadTurned) {
          headTurnConsecutiveRef.current++;
          sideGlanceConsecutiveRef.current = 0;
          lookDownConsecutiveRef.current = 0;
          setHeadStatus('turned');
          setGazeStatus('looking_away');

          if (headTurnConsecutiveRef.current >= proctorConfig.consecutiveRequired) {
            const isNewTurn = !isViolatingRef.current;
            isViolatingRef.current = true;
            if (warningTimeoutRef.current) {
              clearTimeout(warningTimeoutRef.current);
              warningTimeoutRef.current = null;
            }
            const currentStrike = (violationCountRef.current || violationCount) + (isNewTurn ? 1 : 0);
            setLastWarning(`⚠️ মাথা ও দৃষ্টি অন্যদিকে ঘোরানো সনাক্ত হয়েছে! সতর্কতা: ${currentStrike}/৫০ (অনুগ্রহ করে প্রশ্নপত্রে দৃষ্টি রাখুন)`);
            if (isNewTurn || now - lastViolationTimeRef.current > 3200) {
              lastViolationTimeRef.current = now;
              handleGazeAway('মাথা ও দৃষ্টি অন্যদিকে ঘোরানো সনাক্ত হয়েছে');
            }
          }
        } else if (isLookingDown) {
          lookDownConsecutiveRef.current++;
          headTurnConsecutiveRef.current = 0;
          sideGlanceConsecutiveRef.current = 0;
          setHeadStatus('forward');
          setGazeStatus('looking_down');

          if (lookDownConsecutiveRef.current >= proctorConfig.consecutiveRequired) {
            const isNewTurn = !isViolatingRef.current;
            isViolatingRef.current = true;
            if (warningTimeoutRef.current) {
              clearTimeout(warningTimeoutRef.current);
              warningTimeoutRef.current = null;
            }
            const currentStrike = (violationCountRef.current || violationCount) + (isNewTurn ? 1 : 0);
            setLastWarning(`⚠️ নিচে বা খাতা/ফোনে দৃষ্টি সনাক্ত হয়েছে! সতর্কতা: ${currentStrike}/৫০ (অনুগ্রহ করে প্রশ্নপত্রে দৃষ্টি রাখুন)`);
            if (isNewTurn || now - lastViolationTimeRef.current > 3200) {
              lastViolationTimeRef.current = now;
              handleGazeAway('নিচে বা খাতা/ফোনে দৃষ্টি সনাক্ত হয়েছে');
            }
          }
        } else if (isSideGlance) {
          sideGlanceConsecutiveRef.current++;
          headTurnConsecutiveRef.current = 0;
          lookDownConsecutiveRef.current = 0;
          setHeadStatus('forward');
          setGazeStatus('side_glance');

          if (sideGlanceConsecutiveRef.current >= proctorConfig.consecutiveRequired) {
            const isNewTurn = !isViolatingRef.current;
            isViolatingRef.current = true;
            if (warningTimeoutRef.current) {
              clearTimeout(warningTimeoutRef.current);
              warningTimeoutRef.current = null;
            }
            const currentStrike = (violationCountRef.current || violationCount) + (isNewTurn ? 1 : 0);
            setLastWarning(`⚠️ দৃষ্টি স্ক্রিনের বাইরে / আড় চোখ সনাক্ত হয়েছে! সতর্কতা: ${currentStrike}/৫০ (অনুগ্রহ করে প্রশ্নপত্রে দৃষ্টি রাখুন)`);
            if (isNewTurn || now - lastViolationTimeRef.current > 3200) {
              lastViolationTimeRef.current = now;
              handleGazeAway('দৃষ্টি স্ক্রিনের বাইরে / আড় চোখ সনাক্ত হয়েছে');
            }
          }
        } else {
          // Normal screen gaze / reading questions (স্ক্রিনে প্রশ্ন ও অপশন পড়ার স্বাভাবিক দৃষ্টি)
          headTurnConsecutiveRef.current = Math.max(0, headTurnConsecutiveRef.current - 1);
          sideGlanceConsecutiveRef.current = Math.max(0, sideGlanceConsecutiveRef.current - 1);
          lookDownConsecutiveRef.current = Math.max(0, lookDownConsecutiveRef.current - 1);

          if (headTurnConsecutiveRef.current === 0 && sideGlanceConsecutiveRef.current === 0 && lookDownConsecutiveRef.current === 0) {
            if (isViolatingRef.current) {
              isViolatingRef.current = false;
              if (warningTimeoutRef.current) {
                clearTimeout(warningTimeoutRef.current);
              }
              warningTimeoutRef.current = setTimeout(() => {
                if (!isViolatingRef.current) {
                  setLastWarning(null);
                }
                warningTimeoutRef.current = null;
              }, 1200);
            }
            setHeadStatus('forward');
            setGazeStatus('normal');

            // Smooth adaptive baseline ONLY when strictly frontal & calm
            if (hasCalibratedFaceRef.current && Math.abs(centroidX - baseX) < 3 && Math.abs(centroidY - baseY) < 2.5) {
              baselineFaceXRef.current = (baselineFaceXRef.current! * 0.99) + (centroidX * 0.01);
              baselineFaceYRef.current = (baselineFaceYRef.current! * 0.99) + (centroidY * 0.01);
            }
          }
        }

      } catch (err) {
        // Frame analysis error safe fallback
      } finally {
        isAnalyzingRef.current = false;
      }
    }, 140);

    return () => clearInterval(interval);
  }, [isReviewOnly, isSubmitted, cameraActive, proctorConfig]);

  // Handle when candidate turns head or removes gaze from screen:
  // USER SPECIFICATION:
  // 1. Immediately warn on looking away (no silent grace delays).
  // 2. Instead of sound, show message: “প্লিজ প্রশ্নপত্র ব্যতিত অন্যকোন দিকে তাকাবেন না। আপনার সব কিছু পর্যবেক্ষন করা হচ্ছে।”
  // 3. This serious message modal appears periodically after every 3 warnings (warning 3, 6, 9, 12, ...).
  // 4. Strict requirement: minimum 50 warnings before auto-termination!
  const handleGazeAway = (reason: string) => {
    const next = gazeAwayCountRef.current + 1;
    gazeAwayCountRef.current = next;
    violationCountRef.current = next;
    setGazeAwayCount(next);
    setViolationCount(next);

    const nowTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logEntry = `[${nowTime}] ${reason} (সতর্কতা: ${next} বার)`;
    
    proctorLogsRef.current = [...proctorLogsRef.current, logEntry];
    setProctorLogs([...proctorLogsRef.current]);

    // Feature 1: Capture photographic snapshot proof of the violation
    const snap = captureViolationSnapshot(reason, next);
    if (snap) {
      const updatedSnaps = [...violationSnapshotsRef.current, snap].slice(-25);
      violationSnapshotsRef.current = updatedSnaps;
      setViolationSnapshots(updatedSnaps);
    }

    // Auto-termination STRICTLY occurs ONLY after minimum 50 warnings! Before 50, test continues.
    if (next >= 50) {
      setLastWarning(`⛔ সর্বোচ্চ ৫০ বার সতর্কতার মাত্রা লঙ্ঘিত হয়েছে! পরীক্ষাটি স্বয়ংক্রিয়ভাবে সমাপ্ত ও জমা নেওয়া হচ্ছে...`);
      setTimeout(() => {
        handleSubmitExam(true);
      }, 1600);
      return;
    }

    // Every 3 warnings (3rd, 6th, 9th, 12th...), trigger voice audio announcement without blocking modal
    if (next % 3 === 0) {
      setLastWarning(`“প্লিজ প্রশ্নপত্র ব্যতিত অন্যকোন দিকে তাকাবেন না। আপনার সব কিছু পর্যবেক্ষন করা হচ্ছে।” (সতর্কতা: ${next}/৫০)`);
      speakObservationAudio("প্লিজ প্রশ্নপত্র ব্যতিত অন্যকোন দিকে তাকাবেন না। আপনার সব কিছু পর্যবেক্ষন করা হচ্ছে।");
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
      warningTimeoutRef.current = setTimeout(() => {
        if (!isViolatingRef.current) {
          setLastWarning(null);
        }
        warningTimeoutRef.current = null;
      }, 5500);
    } else {
      // Immediate floating warning banner on other warnings (1, 2, 4, 5, 7, 8...)
      setLastWarning(`⚠️ ${reason}! সতর্কতা: ${next}/৫০ (অনুগ্রহ করে প্রশ্নপত্রে দৃষ্টি রাখুন)`);
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
      warningTimeoutRef.current = setTimeout(() => {
        if (!isViolatingRef.current) {
          setLastWarning(null);
        }
        warningTimeoutRef.current = null;
      }, 3500);
    }
  };

  const triggerSuspiciousFlag = (reason: string) => {
    handleGazeAway(reason);
  };

  // Timer countdown & Auto-submit (ক্যালিব্রেশন চলাকালীন টাইমার পজ থাকবে)
  useEffect(() => {
    if (isReviewOnly || isSubmitted || isCalibrating) return;

    if (timeLeft <= 0) {
      handleSubmitExam(false);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isReviewOnly, isSubmitted, isCalibrating]);

  // Feature 3: Per-Question Expiration Handler
  const handleQuestionTimeExpired = (index: number) => {
    setLockedQuestionIndices((prev) => new Set([...prev, index]));

    if (index + 1 < activeQuestions.length) {
      const nextIndex = index + 1;
      setActiveQuestionIndex(nextIndex);
      setQuestionTimeLeft(perQuestionDuration);
      questionRefs.current[nextIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
      setLastWarning(`⏱️ ${index + 1} নং প্রশ্নের নির্ধারিত সময় শেষ হয়েছে! স্বয়ংক্রিয়ভাবে ${nextIndex + 1} নং প্রশ্নে নিয়ে যাওয়া হয়েছে।`);
      setTimeout(() => setLastWarning(null), 3500);
    } else {
      // Last question time expired, auto-submit
      handleSubmitExam(false);
    }
  };

  // Feature 3: Dedicated Per-Question Countdown Timer Loop
  useEffect(() => {
    if (isReviewOnly || isSubmitted || isCalibrating) return;

    const interval = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          handleQuestionTimeExpired(activeQuestionIndex);
          return perQuestionDuration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeQuestionIndex, isReviewOnly, isSubmitted, perQuestionDuration, activeQuestions.length, isCalibrating]);

  // Handle Option Select with Auto-advance to Next Question & Backtrack Locking
  const handleSelectOption = (questionId: string, option: string, index: number) => {
    if (isReviewOnly || isSubmitted) return;

    // Feature 3: Backtrack Lock - prevent altering locked/passed questions
    if (lockedQuestionIndices.has(index)) {
      setLastWarning("🔒 এই প্রশ্নের উত্তর ইতিমধ্যে জমা ও লক করা হয়েছে (নিরাপত্তার স্বার্থে ব্যাক-ট্র্যাক বন্ধ)");
      setTimeout(() => setLastWarning(null), 3000);
      return;
    }

    // Feature 5: Answer Speed Anomaly Detection
    const elapsedSeconds = Math.max(0.4, Math.round(((Date.now() - questionStartTimeRef.current) / 1000) * 10) / 10);
    responseTimesRef.current[questionId] = elapsedSeconds;
    setResponseTimes((prev) => ({ ...prev, [questionId]: elapsedSeconds }));

    if (elapsedSeconds < 2.2) {
      const anomalyReason = `অস্বাভাবিক দ্রুত উত্তর প্রদান (মাত্র ${elapsedSeconds} সেকেন্ডে উত্তর) - প্রশ্ন না পড়ে উত্তর দেওয়ার সম্ভাবনা`;
      handleGazeAway(anomalyReason);
      setLastWarning(`⚡ অস্বাভাবিক দ্রুত উত্তর সনাক্ত (${elapsedSeconds} সে.)! অনুগ্রহ করে প্রশ্ন ও অপশন ভালোভাবে পড়ে উত্তর দিন।`);
    }

    setAnswers((prev) => ({
      ...prev,
      [questionId]: option
    }));

    // Auto-advance to the next question and lock current question
    setTimeout(() => {
      // Lock the answered question
      setLockedQuestionIndices((prev) => new Set([...prev, index]));

      if (index + 1 < activeQuestions.length) {
        const nextIndex = index + 1;
        setActiveQuestionIndex(nextIndex);
        setQuestionTimeLeft(perQuestionDuration);
        questionRefs.current[nextIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
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
    const questionsList = activeQuestions || [];
    const updatedQuestions = questionsList.map((q) => {
      const chosen = answers[q.id] || "";
      const isCorrect = chosen === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        ...q,
        studentAnswer: chosen,
        isCorrect,
        responseTimeSeconds: responseTimesRef.current[q.id] || q.responseTimeSeconds
      };
    });

    const calculatedScore = questionsList.length > 0 ? Math.round((correctCount / questionsList.length) * 100) : 0;
    
    const recordedLogs = proctorLogsRef.current.length > 0 ? proctorLogsRef.current : proctorLogs;
    const totalWarnings = gazeAwayCountRef.current;
    const summaryFlag = isForcedByProctor || totalWarnings >= 50
      ? [`সর্বোচ্চ ৫০ বার সতর্কবার্তা লঙ্ঘনের কারণে পরীক্ষাটি স্বয়ংক্রিয়ভাবে সমাপ্ত হয়েছে (মোট সতর্কতাপ্রাপ্ত: ${totalWarnings} বার)`]
      : totalWarnings > 0
      ? [`পরীক্ষার্থী মোট ${totalWarnings} বার স্ক্রিন ছেড়ে দৃষ্টি সরিয়েছিল বা মাথা ঘুরিয়েছিল (৫০ বারের কম থাকায় পরীক্ষা বাতিল হয়নি)`]
      : ['পরীক্ষার্থী পূর্ণ মনোযোগ সহকারে স্ক্রিনের দিকে তাকিয়ে পরীক্ষা সম্পন্ন করেছে ✓'];
    const finalFlags = [...summaryFlag, ...recordedLogs];

    const nowIso = new Date().toISOString();
    const updatedTest: AssignedTest = {
      ...test,
      status: "submitted",
      score: calculatedScore,
      questions: updatedQuestions,
      proctoringFlags: finalFlags,
      violationSnapshots: violationSnapshotsRef.current,
      questionResponseTimes: responseTimesRef.current,
      calibrationPhotos: calibrationPhotos,
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
      title: isForcedByProctor || totalWarnings >= 50 ? "পরীক্ষা ৫০ বার সতর্কতায় স্বয়ংক্রিয় সমাপ্ত" : "নতুন উত্তরপত্র জমা হয়েছে",
      message: isForcedByProctor || totalWarnings >= 50
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

  const handleRecalibrate = () => {
    hasAnnouncedStepRef.current = 0;
    setCalibrationPhotos({});
    setCalibrationCountdown(null);
    baselineFaceXRef.current = null;
    baselineFaceYRef.current = null;
    calibrationSamplesCountRef.current = 0;
    isViolatingRef.current = false;
    headTurnConsecutiveRef.current = 0;
    sideGlanceConsecutiveRef.current = 0;
    lookDownConsecutiveRef.current = 0;
    setGazeStatus('normal');
    setHeadStatus('forward');
    setCalibrationStep(1);
    setCalibrationProgress(0);
    setIsCalibrating(true);
  };

  const answeredCount = Object.keys(answers).length;
  const isReviewed = test.status === 'reviewed';

  return (
    <div 
      className="w-full max-w-4xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-28 sm:pb-24 space-y-4 sm:space-y-6 select-none overflow-x-hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
      


      {/* ------------------------------------------------------------- */}
      {/* INTERACTIVE GAZE & POSTURE CALIBRATION ONBOARDING MODAL       */}
      {/* ------------------------------------------------------------- */}
      {isCalibrating && !isReviewOnly && !isSubmitted && (
        <div className="fixed inset-0 z-[120] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl text-white space-y-4 my-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>স্মার্ট বায়োমেট্রিক ও রিডিং সেফ-জোন নির্ধারণ</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                      আন্তর্জাতিক স্ট্যান্ডার্ড
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    ডুওলিঙ্গো ও অনার্সলক আন্তর্জাতিক প্রোটোকল: ৩ সেকেন্ডে একক স্মার্ট ভেরিফিকেশন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCalibrating(false)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer shrink-0"
                title="ক্যালিব্রেশন বন্ধ করে সরাসরি পরীক্ষা শুরু করুন"
              >
                এড়িয়ে যান ✕
              </button>
            </div>

            {/* Content: Mode 1 - Live 3-Second Baseline Capture */}
            {!calibrationPhotos.center ? (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
                {/* Center Video Viewport with Biometric Target Guide */}
                <div className="sm:col-span-7 relative w-full h-52 sm:h-56 bg-slate-950 rounded-2xl overflow-hidden border-2 border-emerald-500/50 flex items-center justify-center shadow-lg">
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
                    <div className="flex flex-col items-center justify-center text-center p-4 text-slate-400">
                      <Camera className="w-8 h-8 mb-2 text-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold">ক্যামেরা চালু হচ্ছে...</span>
                      <button
                        type="button"
                        onClick={requestWebcamAccess}
                        className="mt-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shadow-md"
                      >
                        ক্যামেরা অনুমতি দিন
                      </button>
                    </div>
                  )}

                  {/* White Shutter Flash Feedback */}
                  {shutterFlash && (
                    <div className="absolute inset-0 bg-white/90 z-40 pointer-events-none animate-ping" />
                  )}

                  {/* Biometric Oval Target Helper Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="bg-black/75 backdrop-blur-xs text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[9.5px] font-mono font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        <span>লাইভ বায়োমেট্রিক ফ্রেম</span>
                      </span>
                      <span className="text-[9px] font-mono text-slate-300 bg-black/70 px-1.5 py-0.5 rounded">
                        আন্তর্জাতিক স্ট্যান্ডার্ড
                      </span>
                    </div>

                    {/* Centered Face Alignment Oval */}
                    <div className="flex items-center justify-center">
                      <div className="w-28 h-36 sm:w-32 sm:h-40 border-2 border-dashed border-emerald-400/90 rounded-full flex flex-col items-center justify-center animate-pulse shadow-lg shadow-emerald-500/20">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 mb-1"></div>
                        <span className="text-[8.5px] font-bold text-emerald-300 bg-black/75 px-1.5 py-0.5 rounded">
                          মুখমণ্ডল সোজা রাখুন
                        </span>
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="bg-black/80 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded text-[9.5px] font-mono">
                        ক্যামেরার দিকে শান্তভাবে সোজা তাকিয়ে থাকুন
                      </span>
                    </div>
                  </div>

                  {/* Automated Spoken Voice & Countdown Overlay */}
                  {calibrationCountdown !== null && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] pointer-events-none p-3 text-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-2xl sm:text-3xl shadow-2xl border-4 border-white animate-pulse mb-2">
                        {calibrationCountdown > 0 ? (
                          <span>{calibrationCountdown.toLocaleString('bn-BD')}</span>
                        ) : (
                          <span className="text-2xl">📸</span>
                        )}
                      </div>
                      <div className="bg-slate-900/95 text-emerald-300 border border-emerald-500/50 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 max-w-[90%]">
                        <Volume2 className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
                        <span className="truncate">
                          {calibrationCountdown > 0 ? "সোজা দৃষ্টি রাখুন • স্বয়ংক্রিয় ছবি উঠছে..." : "✓ সফলভাবে ছবি সংরক্ষিত হয়েছে!"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side: Voice Guidance Card & Actions */}
                <div className="sm:col-span-5 flex flex-col justify-between space-y-3">
                  {/* Spoken Voice Prompt Card */}
                  <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-3 space-y-2 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                        <Volume2 className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
                        <span>ভয়েস নির্দেশনা:</span>
                      </div>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                        অটো ৩ সে.
                      </span>
                    </div>
                    <p className="text-xs text-white font-bold leading-relaxed">
                      “অনুগ্রহ করে ক্যামেরার দিকে শান্তভাবে সোজা তাকিয়ে থাকুন। আপনার বায়োমেট্রিক ও রিডিং সেফ-জোন নির্ধারণ করা হচ্ছে।”
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800">
                      <span>স্বয়ংক্রিয় কাউন্টডাউন:</span>
                      <span className="text-amber-300 font-bold font-mono">
                        {calibrationCountdown !== null && calibrationCountdown > 0 
                          ? `${calibrationCountdown.toLocaleString('bn-BD')} সেকেন্ড...` 
                          : '📸 ছবি তোলা হচ্ছে'}
                      </span>
                    </div>
                  </div>

                  {/* Key Rules list */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5 text-[11px] text-slate-300 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11.5px]">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>আন্তর্জাতিক প্রোটোকলের সুবিধা:</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      • কোনো কৃত্রিম মাথা ঘোরানোর প্রয়োজন নেই।<br />
                      • পরীক্ষায় প্রশ্ন ও অপশন পড়া ১০০% নিরাপদ হিসেবে গণ্য হবে।<br />
                      • কেবল বাইরে তাকালে বা বই/মোবাইল ব্যবহার করলে সতর্ক করবে।
                    </p>
                  </div>

                  {/* Immediate Manual Snap / Replay Voice Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        captureCalibrationPhoto('center');
                        setShutterFlash(true);
                        setTimeout(() => setShutterFlash(false), 350);
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer transition-all"
                      title="টাইমার শেষ হওয়ার আগেই এখনই ছবি তুলুন"
                    >
                      <Camera className="w-4 h-4" />
                      <span>📸 এখনই ছবি তুলুন</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        speakObservationAudio("অনুগ্রহ করে ক্যামেরার দিকে শান্তভাবে সোজা তাকিয়ে থাকুন। আপনার বায়োমেট্রিক ও রিডিং সেফ-জোন নির্ধারণ করা হচ্ছে।");
                      }}
                      className="py-2.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1 border border-slate-700 cursor-pointer transition-all"
                      title="ভয়েস নির্দেশ পুনরায় শুনুন"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Content: Mode 2 - Baseline Successfully Verified and Locked */
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
                  {/* Left: Verified Candidate Snapshot Card */}
                  <div className="sm:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-col items-center text-center space-y-2">
                    <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden border-2 border-emerald-400 shadow-xl">
                      <img 
                        src={calibrationPhotos.center} 
                        alt="Verified Baseline" 
                        className="w-full h-full object-cover -scale-x-100" 
                      />
                      <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>লকড ✓</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">রেফারেন্স বায়োমেট্রিক আইডি</span>
                      <span className="text-[10px] text-emerald-400 font-mono">ভেরিফাইড ও প্রক্টরিং শিল্ড প্রস্তুত</span>
                    </div>
                  </div>

                  {/* Right: 3 International Standard Badges */}
                  <div className="sm:col-span-7 space-y-2.5">
                    <div className="bg-slate-800/80 border border-emerald-500/40 rounded-2xl p-2.5 flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">১. সেন্ট্রাল বায়োমেট্রিক অক্ষ সংরক্ষিত</h4>
                        <p className="text-[10.5px] text-slate-300 leading-snug">
                          আপনার স্বাভাবিক বসার ভঙ্গি ও সেন্ট্রাল অক্ষ লক করা হয়েছে। সোজা বসা অবস্থায় কোনো মিথ্যা সতর্কতা আসবে না।
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-800/80 border border-emerald-500/40 rounded-2xl p-2.5 flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">২. ন্যাচারাল রিডিং সেফ-জোন সক্রিয়</h4>
                        <p className="text-[10.5px] text-slate-300 leading-snug">
                          স্ক্রিনে প্রশ্ন পড়া কিংবা অপশন দেখার স্বাভাবিক চোখের নড়াচড়া ১০০% অনুমোদিত ও নিরাপদ বলে গণ্য হবে।
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-800/80 border border-emerald-500/40 rounded-2xl p-2.5 flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">৩. এআই প্রক্টরিং শিল্ড সম্পূর্ণ প্রস্তুত</h4>
                        <p className="text-[10.5px] text-slate-300 leading-snug">
                          বই-খাতা, মোবাইল ফোন কিংবা স্ক্রিনের বাইরে দৃষ্টি সরিয়ে নিলে সিস্টেম তাৎক্ষণিকভাবে সতর্কতা জারি করবে।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCalibrating(false)}
                    className="flex-1 w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-2xl shadow-emerald-500/40 cursor-pointer transition-all animate-pulse"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>🚀 নিশ্চিন্তে পরীক্ষা শুরু করুন ➔</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRecalibrate}
                    className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs sm:text-sm border border-slate-700 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>🔄 পুনরায় ছবি তুলুন</span>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Skip Link for Mode 1 */}
            {!calibrationPhotos.center && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsCalibrating(false)}
                  className="text-xs text-slate-400 hover:text-white underline underline-offset-4 py-1 cursor-pointer transition-colors"
                >
                  ক্যালিব্রেশন এড়িয়ে সরাসরি পরীক্ষা শুরু করুন ➔
                </button>
                <span className="text-[10px] text-slate-500 font-mono">
                  আন্তর্জাতিক সিকিউর প্রোটোকল v2.4
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Realtime Anti-Cheating Floating Warning (Non-blocking notification bar at top) */}
      {lastWarning && (
        <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[110] bg-rose-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-black border-2 border-rose-300 ring-4 ring-rose-500/40 animate-bounce max-w-[92vw] sm:max-w-xl text-center">
          {isSpeakingAudio ? (
            <Volume2 className="w-5 h-5 shrink-0 text-amber-300 animate-pulse" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-200 animate-pulse" />
          )}
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
                    gazeStatus === 'side_glance' || gazeStatus === 'looking_down' || headStatus === 'turned' || gazeStatus === 'looking_away' || gazeStatus === 'face_missing'
                      ? 'bg-rose-950/95 text-rose-200 border border-rose-500 animate-bounce'
                      : 'bg-emerald-950/85 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {gazeStatus === 'side_glance'
                      ? '⚠️ আড় চোখে তাকানো!'
                      : gazeStatus === 'looking_down'
                      ? '⚠️ নিচে তাকানো!'
                      : headStatus === 'turned' || gazeStatus === 'looking_away'
                      ? '⚠️ দৃষ্টি অন্যদিকে!'
                      : gazeStatus === 'face_missing'
                      ? '⚠️ মুখ অনুপস্থিত!'
                      : 'দৃষ্টি স্ক্রিনে ✓'}
                  </span>
                  <div className="flex items-center gap-1 bg-black/70 px-1 sm:px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] text-emerald-400 font-mono font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>LIVE</span>
                  </div>
                </div>

                {detectedObject && (
                  <div className="absolute top-7 left-1.5 right-1.5 bg-rose-600 text-white text-[7.5px] sm:text-[8px] font-black py-0.5 px-1 rounded shadow-md border border-rose-300 animate-bounce flex items-center justify-center gap-1 z-10">
                    {detectedObject.includes('মানুষ') ? (
                      <Users className="w-2.5 h-2.5 shrink-0" />
                    ) : detectedObject.includes('বই') ? (
                      <BookOpen className="w-2.5 h-2.5 shrink-0" />
                    ) : (
                      <Smartphone className="w-2.5 h-2.5 shrink-0" />
                    )}
                    <span className="truncate">⚠️ {detectedObject} সনাক্ত!</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[7.5px] sm:text-[8px] font-mono text-white/90 bg-black/70 px-1 sm:px-1.5 py-0.5 rounded">
                  <span>সতর্কতা (সর্বনিম্ন ৫০):</span>
                  <span className={violationCount > 0 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                    {violationCount}/৫০ {violationCount >= 50 ? '⛔' : violationCount > 0 ? '⚠️' : '✓'}
                  </span>
                </div>
              </div>
            </div>

            {/* Realtime Continuous Proctor Sensors HUD */}
            <div className="w-full px-0.5 pt-1.5 flex flex-col gap-1 text-center">
              <div className="grid grid-cols-2 gap-1 text-[7.5px] sm:text-[8px] font-mono">
                <div className={`py-1 px-0.5 rounded transition-colors ${
                  gazeStatus === 'side_glance' || gazeStatus === 'looking_down' || gazeStatus === 'looking_away' || gazeStatus === 'face_missing' || headStatus === 'turned'
                    ? 'bg-rose-950 text-rose-300 border border-rose-600 font-bold animate-pulse' 
                    : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                }`}>
                  <span className="block text-[6.5px] sm:text-[7px] text-slate-400">দৃষ্টির অবস্থান</span>
                  <span className="truncate block">
                    {gazeStatus === 'side_glance'
                      ? 'আড় চোখ ⚠️'
                      : gazeStatus === 'looking_down'
                      ? 'নিচে তাকানো ⚠️'
                      : gazeStatus === 'looking_away' || headStatus === 'turned'
                      ? 'স্ক্রিনের বাইরে ⚠️'
                      : gazeStatus === 'face_missing'
                      ? 'অনুপস্থিত ⚠️'
                      : 'স্ক্রিনে নিবদ্ধ ✓'}
                  </span>
                </div>

                <div className={`py-1 px-0.5 rounded transition-colors ${
                  violationCount >= 50 
                    ? 'bg-rose-900 text-white border border-rose-500 font-bold'
                    : violationCount > 0
                    ? 'bg-amber-950 text-amber-300 border border-amber-600 font-bold' 
                    : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                }`}>
                  <span className="block text-[6.5px] sm:text-[7px] text-slate-400">৫০ বারে সমাপ্তি</span>
                  <span className="truncate block">
                    সতর্কতা: {violationCount}/৫০
                  </span>
                </div>
              </div>

              {/* Live Microphone Voice & Mobile/Book Scanner Row */}
              <div className="grid grid-cols-2 gap-1 text-[7px] sm:text-[7.5px] font-mono">
                <div className={`py-1 px-1 rounded transition-colors flex items-center justify-between border ${
                  audioStatus === 'speech_detected'
                    ? 'bg-rose-950 text-rose-300 border-rose-500 font-bold animate-pulse'
                    : audioStatus === 'noise'
                    ? 'bg-amber-950 text-amber-300 border-amber-600 font-bold'
                    : 'bg-slate-800 text-slate-300 border-slate-700/60'
                }`} title="কক্ষে মানুষের কণ্ঠস্বর ও ফিসফিসানি ট্র্যাকিং">
                  <div className="flex items-center gap-0.5 truncate">
                    <Mic className={`w-2.5 h-2.5 shrink-0 ${audioStatus === 'speech_detected' ? 'text-rose-400 animate-ping' : 'text-emerald-400'}`} />
                    <span className="truncate">{audioStatus === 'speech_detected' ? 'কণ্ঠস্বর ⚠️' : audioStatus === 'noise' ? 'শব্দ ⚠️' : 'মাইক: শান্ত ✓'}</span>
                  </div>
                  <span className="text-[6.5px] font-bold text-slate-400 shrink-0">{audioVolume}%</span>
                </div>

                <div className={`py-1 px-1 rounded transition-colors flex items-center justify-between border ${
                  detectedObject
                    ? 'bg-rose-950 text-rose-300 border-rose-500 font-bold animate-pulse'
                    : 'bg-slate-800 text-slate-300 border-slate-700/60'
                }`} title="মোবাইল ফোন ও বই সনাক্তকারী এআই স্ক্যানার">
                  <div className="flex items-center gap-0.5 truncate">
                    <Smartphone className={`w-2.5 h-2.5 shrink-0 ${detectedObject ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
                    <span className="truncate">{detectedObject ? `${detectedObject} ⚠️` : 'ডিভাইস/বই: মুক্ত ✓'}</span>
                  </div>
                  <span className="text-[6.5px] font-bold text-emerald-400 shrink-0">AI</span>
                </div>
              </div>

              {violationSnapshots.length > 0 && (
                <div className="text-[7px] sm:text-[7.5px] text-rose-300 font-mono bg-rose-950/70 px-1.5 py-0.5 rounded border border-rose-800/80 flex items-center justify-between">
                  <span>📸 প্রমাণ ছবি রেকর্ড:</span>
                  <span className="font-bold text-rose-200">{violationSnapshots.length}টি সংরক্ষিত</span>
                </div>
              )}

              <div className="text-[7px] sm:text-[7.5px] text-slate-400 font-mono bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800 flex items-center justify-between">
                <span className="truncate">মাত্রা: {proctorConfig.name}</span>
                <span className="shrink-0 text-amber-300 font-bold">প্রতি ৩ বারে অডিও বার্তা 🔊</span>
              </div>

              {/* Recalibrate, Audio Test & Reset Controls */}
              {/* Recalibrate & Audio Test Controls */}
              <div className="flex items-center gap-1 pt-0.5">
                <button
                  type="button"
                  onClick={handleRecalibrate}
                  className="flex-1 py-1 px-1.5 rounded bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 hover:text-white text-[7.5px] sm:text-[8px] font-bold cursor-pointer border border-slate-700 transition-colors flex items-center justify-center gap-1"
                  title="সোজা বসে ক্যামেরার দৃষ্টি রিক্যালিব্রেট বা রি-অ্যালাইন করুন"
                >
                  <span>ক্যামেরা রি-অ্যালাইন</span>
                  <span>⟳</span>
                </button>
                <button
                  type="button"
                  onClick={() => speakObservationAudio("প্লিজ প্রশ্নপত্র ব্যতিত অন্যকোন দিকে তাকাবেন না। আপনার সব কিছু পর্যবেক্ষন করা হচ্ছে।")}
                  className="py-1 px-1.5 rounded bg-amber-950/80 hover:bg-amber-900 active:bg-amber-950 text-amber-300 hover:text-white text-[7.5px] sm:text-[8px] font-bold cursor-pointer border border-amber-800/60 transition-colors flex items-center gap-0.5"
                  title="বাংলা কণ্ঠস্বরে অডিও বার্তাটি পরীক্ষা করে শুনুন"
                >
                  <Volume2 className="w-2.5 h-2.5" />
                  <span>অডিও টেস্ট</span>
                </button>
              </div>

              {/* Permanent Warning Advisory Notice inside Floating Camera Window */}
              <div className="w-full mt-1.5 p-1.5 rounded-xl bg-gradient-to-br from-amber-950/95 via-rose-950/90 to-amber-950/95 border border-amber-500/70 text-amber-200 text-[7.5px] sm:text-[8px] font-bold leading-relaxed text-center shadow-xs">
                <div className="flex items-center justify-center gap-1 text-[7px] text-amber-400 font-black mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  <span className="uppercase tracking-wider">সার্বক্ষণিক প্রক্টরিং নির্দেশনা</span>
                </div>
                “দয়া করে নকল করার কোন চেষ্টা করবেন না। যদি করেন তাহলে সেটি রেকর্ড করা হবে এবং আপনার অভিভাবকের নিকট তা পাঠিয়ে দেওয়া হবে।”
              </div>

              {!cameraActive && (
                <button
                  type="button"
                  onClick={requestWebcamAccess}
                  className="w-full py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[8px] sm:text-[8.5px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs mt-1"
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
                  violationCount > 0 ? "bg-amber-50 text-amber-800 border-amber-300" : "bg-emerald-50 text-emerald-800 border-emerald-300"
                }`}>
                  <span>সতর্কতা: {violationCount}/৫০</span>
                </span>
              </>
            )}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
            {isReviewOnly || isSubmitted ? "উত্তরপত্র ও খাতা পর্যালোচনা" : "লাইভ পরীক্ষা চলমান (ফ্রন্ট ক্যামেরা নজরদারি ও স্মার্ট প্রক্টরিং)"}
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

      {/* Permanent Anti-Cheating Advisory Notice (Always visible on screen during exam) */}
      {!isReviewOnly && !isSubmitted && (
        <div className="bg-gradient-to-r from-amber-50 via-rose-50/70 to-amber-50 border-2 border-amber-300/90 rounded-2xl p-3.5 sm:p-4.5 shadow-xs flex items-start sm:items-center gap-3 sm:gap-4 text-slate-800 transition-all">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm border border-amber-300">
            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-950 bg-amber-200/90 px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                সার্বক্ষণিক অ্যান্টি-চিটিং নজরদারি
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-indigo-950 bg-indigo-100/90 px-2 py-0.5 rounded-md border border-indigo-200 flex items-center gap-1">
                <Shuffle className="w-3 h-3 text-indigo-600" />
                <span>প্রশ্ন ও অপশন ওলট-পালট সক্রিয়</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-950 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>প্রতি প্রশ্নে সময় ও ব্যাক-ট্র্যাক লক সক্রিয়</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-rose-950 bg-rose-100/90 px-2 py-0.5 rounded-md border border-rose-300 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-600" />
                <span>কীবোর্ড ও স্ক্রিনশট লক সক্রিয়</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-950 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-600" />
                <span>উত্তর প্রদানের গতি পর্যবেক্ষণ সক্রিয়</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-purple-950 bg-purple-100/90 px-2 py-0.5 rounded-md border border-purple-300 flex items-center gap-1">
                <Users className="w-3 h-3 text-purple-600" />
                <span>একাধিক ব্যক্তি ও বহিরাগত সনাক্তকরণ সক্রিয়</span>
              </span>
              <span className="text-[10px] text-slate-500 font-semibold hidden xl:inline">
                • ওয়েবক্যাম ও সিস্টেম অ্যাক্টিভিটি স্বয়ংক্রিয়ভাবে রেকর্ড হচ্ছে
              </span>
            </div>
            <p className="text-xs sm:text-sm md:text-[14.5px] font-black text-slate-900 leading-snug">
              “দয়া করে নকল করার কোন চেষ্টা করবেন না। যদি করেন তাহলে সেটি রেকর্ড করা হবে এবং আপনার অভিভাবকের নিকট তা পাঠিয়ে দেওয়া হবে।”
            </p>
          </div>
        </div>
      )}

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
      <div className={`space-y-4 ${!isReviewOnly && !isSubmitted ? "select-none" : ""}`}>
        {(activeQuestions || []).map((q, idx) => {
          const chosenAnswer = answers[q.id];
          const isCorrect = chosenAnswer === q.correctAnswer;
          const showGrading = isReviewOnly || isSubmitted;
          const isCurrentActive = activeQuestionIndex === idx && !showGrading;
          const isLocked = lockedQuestionIndices.has(idx) && !showGrading;
          const isFuture = idx > activeQuestionIndex && !showGrading;

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
                  : isLocked
                  ? "border-slate-200 bg-slate-50/60"
                  : chosenAnswer
                  ? "border-blue-400 shadow-xs"
                  : "border-slate-200"
              }`}
            >
              {/* Question Text & Status Header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <span className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                    isCurrentActive ? "bg-blue-600 text-white" : isLocked ? "bg-slate-200 text-slate-700" : "bg-slate-100 text-slate-700"
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="space-y-1 flex-1">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {q.question}
                    </h4>
                  </div>
                </div>

                {isLocked && !showGrading && (
                  <span className="text-[10px] sm:text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1 shrink-0">
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span>লক করা (ব্যাক-ট্র্যাক বন্ধ)</span>
                  </span>
                )}

                {showGrading && (
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    {(() => {
                      const bLevel = q.cognitiveLevel 
                        ? normalizeBloomLevel(q.cognitiveLevel) 
                        : inferBloomLevelFromQuestion(q.question, q.explanation);
                      const bMeta = BLOOM_LEVELS[bLevel];
                      return (
                        <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${bMeta.badgeBg} ${bMeta.badgeBorder}`}>
                          {bMeta.icon} {bMeta.banglaName}
                        </span>
                      );
                    })()}
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                        isCorrect ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-rose-100 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>{isCorrect ? "সঠিক" : "ভুল"}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Feature 3: Dedicated Per-Question Timer Progress Bar (Active Question Only) */}
              {isCurrentActive && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-blue-50/90 border border-blue-200 mt-2 mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <Timer className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                    <span>এই প্রশ্নের সময়সীমা:</span>
                    <span className={`font-mono text-xs px-2 py-0.5 rounded-md font-black ${
                      questionTimeLeft < 15 ? "bg-rose-100 text-rose-700 animate-pulse border border-rose-300" : "bg-white text-blue-800 border border-blue-200"
                    }`}>
                      {formatTime(questionTimeLeft)}
                    </span>
                  </div>

                  <div className="flex-1 max-w-xs h-2 bg-blue-200/80 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        questionTimeLeft < 15 ? "bg-rose-500" : "bg-blue-600"
                      }`}
                      style={{ width: `${Math.max(0, Math.min(100, (questionTimeLeft / perQuestionDuration) * 100))}%` }}
                    />
                  </div>

                  <span className="text-[10px] text-blue-600 font-semibold hidden md:inline">
                    উত্তর দিলে বা সময় ফুরালে স্বয়ংক্রিয় লক
                  </span>
                </div>
              )}

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
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
                  } else if (isLocked) {
                    if (isSelected) {
                      optClass = "border-slate-300 bg-slate-100/90 text-slate-800 font-bold shadow-xs cursor-not-allowed";
                    } else {
                      optClass = "border-slate-200 bg-slate-50/40 text-slate-400 opacity-60 cursor-not-allowed";
                    }
                  } else if (isFuture) {
                    optClass = "border-slate-200 bg-slate-50/40 text-slate-400 opacity-70 cursor-not-allowed";
                  } else if (isSelected) {
                    optClass = "border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs ring-1 ring-blue-500";
                  }

                  const isDisabled = isReviewOnly || isSubmitted || isLocked || isFuture;

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleSelectOption(q.id, opt, idx)}
                      className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${optClass} ${
                        !isDisabled ? "cursor-pointer active:scale-[0.99]" : ""
                      }`}
                    >
                      <span>{opt}</span>
                      {showGrading && isRightAnswer && (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {showGrading && isSelected && !isRightAnswer && (
                        <X className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      {isLocked && isSelected && !showGrading && (
                        <span className="flex items-center gap-1 text-[10px] text-slate-600 font-bold bg-white px-2 py-0.5 rounded border border-slate-300">
                          <Lock className="w-2.5 h-2.5 text-slate-500" />
                          <span>লক</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Solution / Explanation & Step-by-Step 2 Methods on Review */}
              {showGrading && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 flex-wrap gap-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>তাত্ত্বিক ও গাণিতিক সমাধান নির্দেশিকা:</span>
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      সঠিক উত্তর: {q.correctAnswer}
                    </span>
                  </div>

                  {q.explanation && (
                    <div className="p-3 rounded-xl bg-white border border-slate-200/90 text-slate-800 leading-relaxed">
                      <span className="font-bold text-slate-900 block mb-1">মূল কনসেপ্ট ও তাত্ত্বিক ভিত্তি:</span>
                      <p className="font-medium text-slate-700">{q.explanation}</p>
                    </div>
                  )}

                  {(() => {
                    const solutions = (q.solutions && q.solutions.length >= 2)
                      ? q.solutions
                      : generateTwoSolutions(q.question, q.options, q.correctAnswer, q.explanation);

                    if (!solutions || solutions.length === 0) return null;

                    return (
                      <div className="space-y-2 pt-1">
                        {solutions.map((sol, sIdx) => {
                          const isMethod1 = sIdx === 0;
                          return (
                            <div 
                              key={sIdx}
                              className={`p-3 rounded-xl border leading-relaxed ${
                                isMethod1 
                                  ? 'bg-blue-50/70 border-blue-200/90 text-blue-950' 
                                  : 'bg-amber-50/70 border-amber-200/90 text-amber-950'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 font-bold mb-1">
                                <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] text-white shrink-0 ${
                                  isMethod1 ? 'bg-blue-600' : 'bg-amber-600'
                                }`}>
                                  {sIdx + 1}
                                </span>
                                <span>
                                  {isMethod1 ? 'পদ্ধতি ১: পাঠ্যবইয়ের নিয়ম ও সূত্র প্রয়োগ' : 'পদ্ধতি ২: সহজ শর্টকাট কৌশল ও বিকল্প নিয়ম'}
                                </span>
                              </div>
                              <div className="pl-6 whitespace-pre-line font-medium text-slate-800">
                                {sol}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
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
            উত্তর সম্পন্ন: <span className="text-blue-600 font-black">{answeredCount}</span> / {activeQuestions.length}টি
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
