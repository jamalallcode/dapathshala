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
      }
    }

    // NOTE: Crude pixel luminance (lum < 40) is NEVER used to guess mobile phones,
    // as it falsely flags student dark/checkered shirts as phones.
    // Genuine mobile phone detection is handled strictly by the trained AI neural model (COCO-SSD).

    // Evaluate Book / Sheet Detection:
    // Only if a distinct high-reflectivity bright white sheet/page is held up directly in front of camera
    const paperW = paperMaxX - paperMinX;
    const paperH = paperMaxY - paperMinY;
    if (brightPaperPixels > 240 && paperW > 24 && paperH > 18) {
      const fillRatio = brightPaperPixels / (paperW * paperH);
      if (fillRatio > 0.55) {
        return {
          detected: true,
          type: 'book',
          label: 'বই বা খাতা',
          confidence: Math.min(0.92, 0.70 + (brightPaperPixels / 500))
        };
      }
    }

    // 3. Multi-Face / Second Person / Bystander Detection
    // To prevent false alarms from shadows, shirt folds, or background warm colors,
    // we never flag second person on raw skin count alone without a distinct high-confidence separated head contour.
    // Real second person detection requires genuine high-confidence AI verification or prominent separated facial landmarks.
    // (Brittle 35-pixel flank heuristics removed to eliminate false alarms)
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

            if (cls === 'cell phone' && score > 0.60) {
              detectedResult = {
                detected: true,
                type: 'cell_phone',
                label: 'মোবাইল ফোন',
                confidence: score
              };
              break;
            }

            if (cls === 'book' && score > 0.58) {
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

            if (cls === 'person' && score > 0.76) {
              personCount++;
            }
          }

          if (!detectedResult && personCount > 1) {
            const personBoxes = predictions.filter(
              (p: any) => (p.class || '').toLowerCase() === 'person' && (p.score || 0) > 0.76 && p.bbox
            );

            if (personBoxes.length >= 2) {
              const p1 = personBoxes[0].bbox; // [x, y, w, h]
              const p2 = personBoxes[1].bbox;
              const vw = videoElement.videoWidth || 320;

              // Centers
              const c1X = p1[0] + p1[2] / 2;
              const c2X = p2[0] + p2[2] / 2;

              // Overlap & containment check (filters duplicate boxes of same candidate)
              const xOverlap = Math.max(0, Math.min(p1[0] + p1[2], p2[0] + p2[2]) - Math.max(p1[0], p2[0]));
              const yOverlap = Math.max(0, Math.min(p1[1] + p1[3], p2[1] + p2[3]) - Math.max(p1[1], p2[1]));
              const intersection = xOverlap * yOverlap;
              const minArea = Math.min(p1[2] * p1[3], p2[2] * p2[3]);
              const containment = minArea > 0 ? intersection / minArea : 0;

              // Must be distinctly separated individuals in the frame
              const isDistinctSecondPerson =
                Math.abs(c1X - c2X) > (vw * 0.22) &&
                containment < 0.28 &&
                p1[2] > (vw * 0.12) &&
                p2[2] > (vw * 0.12);

              if (isDistinctSecondPerson) {
                detectedResult = {
                  detected: true,
                  type: 'second_person',
                  label: 'অতিরিক্ত মানুষের উপস্থিতি',
                  confidence: 0.92
                };
              }
            }
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

      // Require sustained confirmation (at least 4 frames ~1.8s for second person to avoid flicker)
      const requiredFrames = detectedResult.type === 'second_person' ? 4 : 2;
      if (consecutiveCount >= requiredFrames) {
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
