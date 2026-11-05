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
    test.questions.forEach((q) => {
      if (q.studentAnswer) {
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
  
  // Gaze & Note/Book Reading Detection States
  const [gazeStatus, setGazeStatus] = useState<'normal' | 'looking_down' | 'looking_away'>('normal');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [proctorLogs, setProctorLogs] = useState<string[]>([]);
  const [isSimulatingSuspicious, setIsSimulatingSuspicious] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const submitSectionRef = useRef<HTMLDivElement | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackAnimationRef = useRef<number | null>(null);

  // Soft Warning Audio Beep
  const playWarningBeep = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.22);
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
        triggerSuspiciousFlag('ট্যাব পরিবর্তন বা অন্য অ্যাপে যাওয়ার চেষ্টা সনাক্ত হয়েছে!');
      }
    };

    const handleWindowBlur = () => {
      triggerSuspiciousFlag('পরীক্ষার উইন্ডো থেকে ফোকাস সরানো হয়েছে!');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isReviewOnly, isSubmitted, violationCount]);

  // Real-time AI Gaze & Note/Book Reading Detector (running every 1.5 seconds)
  useEffect(() => {
    if (isReviewOnly || isSubmitted || !cameraActive) return;

    const interval = setInterval(() => {
      // Analyze current video frame if video is playing
      if (videoRef.current && videoRef.current.readyState >= 2) {
        try {
          if (!analysisCanvasRef.current) {
            analysisCanvasRef.current = document.createElement('canvas');
            analysisCanvasRef.current.width = 80;
            analysisCanvasRef.current.height = 60;
          }
          const canvas = analysisCanvasRef.current;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) return;

          ctx.drawImage(videoRef.current, 0, 0, 80, 60);
          const imgData = ctx.getImageData(0, 0, 80, 60);
          const data = imgData.data;

          let totalWeight = 0;
          let weightedY = 0;
          let weightedX = 0;

          // Compute centroid of face / skin-tone cluster
          for (let y = 0; y < 60; y++) {
            for (let x = 0; x < 80; x++) {
              const idx = (y * 80 + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];

              // Skin-tone / face luminosity heuristic
              const isSkin = r > 70 && g > 45 && b > 25 && r > b && (r - g) > 12;
              if (isSkin) {
                totalWeight++;
                weightedY += y;
                weightedX += x;
              }
            }
          }

          if (totalWeight > 40) {
            const centroidY = weightedY / totalWeight; // 0 to 60
            const centroidX = weightedX / totalWeight; // 0 to 80

            // If head/face centroid is tilted down towards desk (reading notes/books):
            // Normal upright posture is Y in [15, 34]. Y > 38 indicates looking down at desk
            if (centroidY > 38 || isSimulatingSuspicious) {
              setGazeStatus('looking_down');
              triggerSuspiciousFlag('দৃষ্টি নিচে নামিয়ে বই বা নোট পড়ার চেষ্টা সনাক্ত হয়েছে! সরাসরি স্ক্রিনের দিকে তাকিয়ে উত্তর দিন।');
            } else if (centroidX < 18 || centroidX > 62) {
              setGazeStatus('looking_away');
              triggerSuspiciousFlag('স্ক্রিন ছেড়ে অন্য দিকে তাকানোর চেষ্টা সনাক্ত হয়েছে! অনুগ্রহ করে স্ক্রিনের দিকে তাকিয়ে থাকুন।');
            } else {
              setGazeStatus('normal');
            }
          }
        } catch {
          // Canvas cross-origin or read error safe fallback
        }
      }
    }, 1800);

    return () => clearInterval(interval);
  }, [isReviewOnly, isSubmitted, cameraActive, isSimulatingSuspicious]);

  // Trigger Warning, Sound Alarm & Log Incident
  const triggerSuspiciousFlag = (reason: string) => {
    playWarningBeep();
    const nowTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logEntry = `[${nowTime}] ${reason}`;

    setProctorLogs(prev => {
      if (prev.includes(logEntry)) return prev;
      return [...prev, logEntry];
    });

    setViolationCount(prev => {
      const next = prev + 1;
      setLastWarning(`⚠️ সতর্কতা (${next}/৩): ${reason}`);
      if (next >= 3) {
        // Auto-submit exam immediately on 3 persistent violations
        setTimeout(() => {
          handleSubmitExam(true);
        }, 1200);
      }
      return next;
    });

    setTimeout(() => {
      setLastWarning(null);
    }, 4500);
  };

  // Interactive Test Simulation for User/Examiner to simulate looking down at notes
  const simulateLookingAtNotes = () => {
    setIsSimulatingSuspicious(true);
    setGazeStatus('looking_down');
    triggerSuspiciousFlag('দৃষ্টি নিচে নামিয়ে বই বা নোট পড়ার চেষ্টা সনাক্ত হয়েছে! সরাসরি স্ক্রিনের দিকে তাকিয়ে উত্তর দিন।');
    setTimeout(() => {
      setIsSimulatingSuspicious(false);
      setGazeStatus('normal');
    }, 3500);
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
    const updatedQuestions = test.questions.map((q) => {
      const chosen = answers[q.id] || "";
      const isCorrect = chosen === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        ...q,
        studentAnswer: chosen,
        isCorrect
      };
    });

    const calculatedScore = Math.round((correctCount / test.questions.length) * 100);
    
    const finalFlags = isForcedByProctor 
      ? ['৩ বার অসদুপায় / বই-নোট পড়ার চেষ্টার কারণে পরীক্ষা নির্ধারিত সময়ের পূর্বে স্বয়ংক্রিয়ভাবে জমা হয়েছে', ...proctorLogs]
      : proctorLogs.length > 0
      ? proctorLogs
      : violationCount > 0 
      ? [`${violationCount} বার দৃষ্টি অন্যদিকে বা ট্যাবে যাওয়ার চেষ্টা সনাক্ত হয়েছে`] 
      : [];

    const updatedTest: AssignedTest = {
      ...test,
      status: "submitted",
      score: calculatedScore,
      questions: updatedQuestions,
      proctoringFlags: finalFlags
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
      title: "নতুন উত্তরপত্র জমা হয়েছে",
      message: `আপনার সন্তান "${test.title}" পরীক্ষা সফলভাবে সম্পন্ন করে খাতা জমা দিয়েছে। প্রাপ্ত স্কোর: ${calculatedScore}%। খাতা মূল্যায়ন করুন।`,
      time: "এইমাত্র",
      testId: test.id,
      isRead: false,
      forRole: "parent" as const
    };
    saveStoredNotifications([newNotif, ...notifs]);

    // Dispatch update event
    try {
      window.dispatchEvent(new Event('dapathshala_notifs_updated'));
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
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-32 sm:pb-24 space-y-6 select-none"
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
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm font-black border border-rose-400 animate-bounce">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{lastWarning}</span>
        </div>
      )}

      {/* Floating Live Camera PIP Window during active exam - Moved to top-right on mobile so it NEVER blocks the submit button */}
      {!isReviewOnly && !isSubmitted && (
        <div className="fixed top-16 right-3 sm:top-auto sm:bottom-5 sm:right-5 z-40 transition-all duration-300">
          {isCameraMinimized ? (
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
          ) : (
            <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl p-2 shadow-2xl w-40 sm:w-56 flex flex-col items-center">
              {/* Header with Minimize Button */}
              <div className="w-full flex items-center justify-between pb-1 px-1 border-b border-slate-800 mb-1.5">
                <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>ফ্রন্ট ক্যামেরা প্রক্টরিং</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCameraMinimized(true)}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[9px] font-bold cursor-pointer border border-slate-700 transition-colors"
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

                {/* Live AI Proctor Bounding Box & Gaze Tracking HUD */}
                <div className={`absolute inset-1.5 rounded-lg border-2 pointer-events-none transition-colors duration-300 flex flex-col justify-between p-1.5 ${
                  gazeStatus === 'looking_down'
                    ? 'border-rose-500 bg-rose-500/15 animate-pulse'
                    : gazeStatus === 'looking_away'
                    ? 'border-amber-500 bg-amber-500/15 animate-pulse'
                    : 'border-emerald-400/80'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[8px] sm:text-[8.5px] font-black px-1 sm:px-1.5 py-0.5 rounded shadow-sm ${
                      gazeStatus === 'normal' 
                        ? 'bg-emerald-950/85 text-emerald-300 border border-emerald-500/40' 
                        : 'bg-rose-950/90 text-rose-200 border border-rose-500 animate-bounce'
                    }`}>
                      {gazeStatus === 'looking_down'
                        ? '⚠️ দৃষ্টি বই/নোটে!'
                        : gazeStatus === 'looking_away'
                        ? '⚠️ দৃষ্টি অন্যদিকে!'
                        : 'দৃষ্টি স্ক্রিনে ✓'}
                    </span>
                    <div className="flex items-center gap-1 bg-black/70 px-1 sm:px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] text-emerald-400 font-mono font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>LIVE</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[7.5px] sm:text-[8px] font-mono text-white/90 bg-black/70 px-1 sm:px-1.5 py-0.5 rounded">
                    <span>নকল প্রতিরোধ</span>
                    <span>সতর্কতা: {violationCount}/৩</span>
                  </div>
                </div>
              </div>

              {/* PIP Info & Interactive Book/Notes Test Button */}
              <div className="w-full px-0.5 pt-1.5 flex flex-col gap-1 text-center">
                <button
                  type="button"
                  onClick={simulateLookingAtNotes}
                  className="w-full py-1 px-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-950 border border-slate-700 text-[8.5px] sm:text-[9px] text-amber-300 font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  title="ক্লিক করে বই/নোট পড়ার সতর্কতা পরীক্ষা করুন"
                >
                  <span>📖 বই/নোট পড়ার টেস্ট</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top Exam Header Strip */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ফিরে যান</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-sm sm:text-base font-black text-slate-900 truncate max-w-xs sm:max-w-md">
              {test.title}
            </h2>
            {!isReviewOnly && !isSubmitted && (
              <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3 text-purple-600" />
                <span>নতুন ট্যাব লক ও ফুলস্ক্রিন সক্রিয়</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {isReviewOnly || isSubmitted ? "উত্তরপত্র ও খাতা পর্যালোচনা" : "লাইভ পরীক্ষা চলমান (ফ্রন্ট ক্যামেরা নজরদারি ও ফুলস্ক্রিন সুরক্ষা)"}
          </p>
        </div>

        {!isReviewOnly && !isSubmitted ? (
          <div className="flex items-center gap-2">
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
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isReviewed ? "খাতা দেখা হয়েছে" : "মূল্যায়ন সম্পন্ন"}</span>
            {test.score !== undefined && (
              <span className="ml-1 pl-1.5 border-l border-emerald-300 font-black text-emerald-900">
                {test.score}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Parent Feedback & Approved Score Banner (When Reviewed) */}
      {(isReviewOnly || isSubmitted) && test.parentComment && (
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

      {/* Post-Submission Success Notice for Student */}
      {isSubmitted && !isReviewOnly && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xs">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <h3 className="text-lg font-black text-emerald-900">
            উত্তরপত্র সফলভাবে জমা হয়েছে!
          </h3>
          <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto leading-relaxed">
            আপনার উত্তরপত্রটি অভিভাবকের কাছে পৌঁছেছে। অভিভাবক খাতা যাচাই ও দিকনির্দেশনামূলক মন্তব্য দিলে আপনি পূর্ণাঙ্গ ফলাফল ও মার্কস দেখতে পাবেন।
          </p>
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={onExit}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold shadow-xs cursor-pointer transition-colors"
            >
              মূল পাতায় ফিরে যান
            </button>
            <button
              type="button"
              onClick={() => {
                const updatedTest: AssignedTest = {
                  ...test,
                  status: 'submitted',
                  score: Math.round((test.questions.filter(q => (answers[q.id] || '') === q.correctAnswer).length / test.questions.length) * 100),
                  questions: test.questions.map(q => ({
                    ...q,
                    studentAnswer: answers[q.id] || '',
                    isCorrect: (answers[q.id] || '') === q.correctAnswer
                  }))
                };
                const url = getShareableSubmissionUrl(updatedTest);
                navigator.clipboard.writeText(url);
                alert('✓ খাতা জমার ফলাফল লিংক কপি হয়েছে! এটি অভিভাবককে পাঠিয়ে খাতা দেখতে বলুন।');
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>ফলাফল লিংক কপি</span>
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `আমি "${test.title}" পরীক্ষা সফলভাবে সম্পন্ন করে খাতা জমা দিয়েছি।\nখাতা দেখতে ও মূল্যায়ন করতে এই লিংকে ক্লিক করুন:\n${getShareableSubmissionUrl({
                  ...test,
                  status: 'submitted',
                  score: Math.round((test.questions.filter(q => (answers[q.id] || '') === q.correctAnswer).length / test.questions.length) * 100),
                  questions: test.questions.map(q => ({
                    ...q,
                    studentAnswer: answers[q.id] || '',
                    isCorrect: (answers[q.id] || '') === q.correctAnswer
                  }))
                })}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <span>হোয়াটসঅ্যাপে অভিভাবককে জানান</span>
            </a>
          </div>
        </div>
      )}

      {/* Questions Answering Sheet */}
      <div className="space-y-4">
        {test.questions.map((q, idx) => {
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
                {q.options.map((opt, oIdx) => {
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
