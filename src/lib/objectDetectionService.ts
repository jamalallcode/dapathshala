/**
 * Live Object Detection Proctoring Service
 * Detects mobile phones, books/notes, and second person in camera frame
 * Uses hybrid approach: Ultra-fast local Computer Vision geometry scanner + Dynamic AI Model
 */

export interface DetectedObjectResult {
  detected: boolean;
  type: 'cell_phone' | 'book' | 'second_person' | 'device';
  label: string;
  confidence: number;
}

export interface ObjectDetectionController {
  stop: () => void;
  getStatus: () => { isAiModelReady: boolean; lastDetected: string | null };
}

let cachedCocoModel: any = null;
let isModelLoading = false;

// Dynamically load TensorFlow.js and COCO-SSD from high-speed CDN without bloating build
async function loadCocoSsdModel(): Promise<any> {
  if (cachedCocoModel) return cachedCocoModel;
  if ((window as any).cocoSsd) {
    try {
      cachedCocoModel = await (window as any).cocoSsd.load({ base: 'lite_mobilenet_v2' });
      return cachedCocoModel;
    } catch {}
  }

  if (isModelLoading) return null;
  isModelLoading = true;

  return new Promise((resolve) => {
    try {
      // 1. Inject TF.js
      const tfScript = document.createElement('script');
      tfScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';
      tfScript.async = true;

      tfScript.onload = () => {
        // 2. Inject COCO-SSD
        const cocoScript = document.createElement('script');
        cocoScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js';
        cocoScript.async = true;

        cocoScript.onload = async () => {
          try {
            if ((window as any).cocoSsd) {
              cachedCocoModel = await (window as any).cocoSsd.load({ base: 'lite_mobilenet_v2' });
              resolve(cachedCocoModel);
              return;
            }
          } catch (e) {
            console.warn('Coco model load note:', e);
          }
          resolve(null);
        };

        cocoScript.onerror = () => resolve(null);
        document.head.appendChild(cocoScript);
      };

      tfScript.onerror = () => resolve(null);
      document.head.appendChild(tfScript);
    } catch {
      resolve(null);
    }
  });
}

/**
 * High-Speed Instant Computer Vision Object Scanner
 * Directly analyzes raw pixel patterns for smartphone rectangular slabs and white book pages
 */
function scanFrameForObjects(video: HTMLVideoElement, scanCanvas: HTMLCanvasElement): DetectedObjectResult | null {
  try {
    const ctx = scanCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx || video.videoWidth === 0) return null;

    const w = scanCanvas.width; // 80
    const h = scanCanvas.height; // 60
    ctx.drawImage(video, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    let brightPaperPixels = 0;
    let paperMinX = w, paperMaxX = 0, paperMinY = h, paperMaxY = 0;
    let darkSlabPixels = 0;
    let phoneMinX = w, phoneMaxX = 0, phoneMinY = h, phoneMaxY = 0;

    // Scan lower and side regions where hands hold books or phones
    for (let y = 15; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const lum = r * 0.299 + g * 0.587 + b * 0.114;

        // 1. Open Book / Printed White Paper Surface
        // Bright white/cream paper with high reflectivity
        if (r > 200 && g > 200 && b > 195 && Math.abs(r - g) < 15 && Math.abs(r - b) < 18) {
          brightPaperPixels++;
          if (x < paperMinX) paperMinX = x;
          if (x > paperMaxX) paperMaxX = x;
          if (y < paperMinY) paperMinY = y;
          if (y > paperMaxY) paperMaxY = y;
        }

        // 2. Mobile Phone Rectangular Dark Glass / Lit Screen Slab in front of body
        // When held in hand, a smartphone is a high-contrast slab (width 12-28px, height 20-45px, ratio ~1.6 - 2.4)
        if (y > 22 && (lum < 40 || (r > 215 && g > 215 && b > 230 && lum > 220))) {
          darkSlabPixels++;
          if (x < phoneMinX) phoneMinX = x;
          if (x > phoneMaxX) phoneMaxX = x;
          if (y < phoneMinY) phoneMinY = y;
          if (y > phoneMaxY) phoneMaxY = y;
        }
      }
    }

    // Evaluate Book Detection:
    // If a rectangular sheet of white paper covering > 160 pixels is held up
    const paperW = paperMaxX - paperMinX;
    const paperH = paperMaxY - paperMinY;
    if (brightPaperPixels > 175 && paperW > 18 && paperH > 14) {
      const fillRatio = brightPaperPixels / (paperW * paperH);
      if (fillRatio > 0.45) {
        return {
          detected: true,
          type: 'book',
          label: 'বই বা খাতা',
          confidence: Math.min(0.92, 0.65 + (brightPaperPixels / 400))
        };
      }
    }

    // Evaluate Mobile Phone Detection:
    // Smartphone vertical rectangular slab aspect ratio
    const phoneW = phoneMaxX - phoneMinX;
    const phoneH = phoneMaxY - phoneMinY;
    if (darkSlabPixels > 110 && phoneW >= 10 && phoneH >= 16) {
      const ratio = phoneH / Math.max(phoneW, 1);
      if (ratio >= 1.4 && ratio <= 2.6 && (phoneW < w * 0.6)) {
        return {
          detected: true,
          type: 'cell_phone',
          label: 'মোবাইল ফোন',
          confidence: 0.85
        };
      }
    }

  } catch (err) {}
  return null;
}

export function startObjectDetection(
  videoElement: HTMLVideoElement,
  onObjectDetected: (result: DetectedObjectResult) => void
): ObjectDetectionController {
  let isRunning = true;
  let intervalId: any = null;
  let scanCanvas: HTMLCanvasElement | null = null;
  let lastAlertTime = 0;
  let lastDetected: string | null = null;
  let consecutiveCount = 0;
  let currentTargetType: string | null = null;

  scanCanvas = document.createElement('canvas');
  scanCanvas.width = 80;
  scanCanvas.height = 60;

  // Asynchronously pre-warm COCO-SSD model in background
  loadCocoSsdModel();

  intervalId = setInterval(async () => {
    if (!isRunning || !videoElement || videoElement.readyState < 2) return;

    let detectedResult: DetectedObjectResult | null = null;

    // 1. If AI COCO-SSD is loaded, run high-level object detection
    if (cachedCocoModel) {
      try {
        const predictions: any[] = await cachedCocoModel.detect(videoElement);
        if (predictions && predictions.length > 0) {
          let personCount = 0;

          for (const pred of predictions) {
            const cls = (pred.class || '').toLowerCase();
            const score = pred.score || 0;

            if (cls === 'cell phone' && score > 0.48) {
              detectedResult = {
                detected: true,
                type: 'cell_phone',
                label: 'মোবাইল ফোন',
                confidence: score
              };
              break;
            }

            if (cls === 'book' && score > 0.45) {
              detectedResult = {
                detected: true,
                type: 'book',
                label: 'বই বা খাতা',
                confidence: score
              };
              break;
            }

            if (cls === 'laptop' && score > 0.55) {
              detectedResult = {
                detected: true,
                type: 'device',
                label: 'ল্যাপটপ বা অতিরিক্ত ডিভাইস',
                confidence: score
              };
              break;
            }

            if (cls === 'person' && score > 0.60) {
              personCount++;
            }
          }

          if (!detectedResult && personCount > 1) {
            detectedResult = {
              detected: true,
              type: 'second_person',
              label: 'অতিরিক্ত মানুষের উপস্থিতি',
              confidence: 0.88
            };
          }
        }
      } catch (err) {}
    }

    // 2. Instant Computer Vision geometry scanner (works on all frames)
    if (!detectedResult && scanCanvas) {
      detectedResult = scanFrameForObjects(videoElement, scanCanvas);
    }

    const now = Date.now();

    if (detectedResult && detectedResult.detected) {
      if (currentTargetType === detectedResult.type) {
        consecutiveCount++;
      } else {
        currentTargetType = detectedResult.type;
        consecutiveCount = 1;
      }

      // Require 2 consecutive confirmations (~900ms) to avoid optical glitch
      if (consecutiveCount >= 2) {
        lastDetected = detectedResult.label;
        if (now - lastAlertTime > 7000) {
          lastAlertTime = now;
          onObjectDetected(detectedResult);
        }
      }
    } else {
      consecutiveCount = 0;
      currentTargetType = null;
      lastDetected = null;
    }

  }, 450);

  const stop = () => {
    isRunning = false;
    if (intervalId) clearInterval(intervalId);
    scanCanvas = null;
  };

  return {
    stop,
    getStatus: () => ({
      isAiModelReady: !!cachedCocoModel,
      lastDetected
    })
  };
}
