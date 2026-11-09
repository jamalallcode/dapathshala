/**
 * Live Audio Proctoring Service
 * Monitors room acoustics, voice, whisper and ambient noise levels using Web Audio API
 */

export interface AudioProctoringController {
  stop: () => void;
  getVolume: () => number; // 0 - 100
  getStatus: () => 'calibrating' | 'quiet' | 'speech_detected' | 'noise';
  isAudioActive: () => boolean;
}

export function startAudioMonitoring(
  stream: MediaStream,
  onSuspiciousAudio: (reason: string, level: number) => void
): AudioProctoringController {
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let intervalId: any = null;

  let currentVolume = 0;
  let currentStatus: 'calibrating' | 'quiet' | 'speech_detected' | 'noise' = 'calibrating';
  let isListening = false;

  let baselineRms = 0.015;
  let calibrationFrames = 0;
  let speechConsecutiveFrames = 0;
  let lastAudioAlertTime = 0;

  try {
    const audioTracks = stream.getAudioTracks();
    if (!audioTracks || audioTracks.length === 0) {
      return {
        stop: () => {},
        getVolume: () => 0,
        getStatus: () => 'quiet',
        isAudioActive: () => false
      };
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      return {
        stop: () => {},
        getVolume: () => 0,
        getStatus: () => 'quiet',
        isAudioActive: () => false
      };
    }

    audioContext = new AudioContextClass();
    source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.4;
    source.connect(analyser);

    isListening = true;

    const timeData = new Uint8Array(analyser.frequencyBinCount);
    const freqData = new Uint8Array(analyser.frequencyBinCount);

    intervalId = setInterval(() => {
      if (!analyser || !isListening) return;

      analyser.getByteTimeDomainData(timeData);
      analyser.getByteFrequencyData(freqData);

      // 1. Compute RMS Volume
      let sumSq = 0;
      for (let i = 0; i < timeData.length; i++) {
        const norm = (timeData[i] - 128) / 128;
        sumSq += norm * norm;
      }
      const rms = Math.sqrt(sumSq / timeData.length);
      currentVolume = Math.min(100, Math.round(rms * 250));

      // 2. Frequency Analysis for Human Voice / Whispering (approx 250Hz - 3400Hz)
      const sampleRate = audioContext?.sampleRate || 44100;
      const binWidth = sampleRate / 256;
      let voiceEnergy = 0;
      let totalEnergy = 0;

      for (let i = 1; i < freqData.length; i++) {
        const freq = i * binWidth;
        const val = freqData[i];
        totalEnergy += val;
        if (freq >= 250 && freq <= 3400) {
          voiceEnergy += val;
        }
      }

      const voiceRatio = totalEnergy > 0 ? voiceEnergy / totalEnergy : 0;
      const now = Date.now();

      // 3. Ambient Room Baseline Calibration (First 25 frames ~2.5 seconds)
      if (calibrationFrames < 25) {
        baselineRms = baselineRms * 0.85 + rms * 0.15;
        calibrationFrames++;
        currentStatus = 'calibrating';
        return;
      }

      // 4. Voice & Excessive Room Noise Trigger
      // Whisper or spoken voice has distinct frequency ratio (> 0.50) and elevated amplitude
      const voiceThreshold = Math.max(0.065, baselineRms * 2.8);
      const isVoiceSpike = rms > voiceThreshold && (voiceRatio > 0.48 || rms > 0.16);

      if (isVoiceSpike) {
        speechConsecutiveFrames++;
        currentStatus = voiceRatio > 0.52 ? 'speech_detected' : 'noise';

        // Requires ~1.2s of sustained voice or speaking to filter out momentary cough or mouse click
        if (speechConsecutiveFrames >= 11) {
          if (now - lastAudioAlertTime > 7500) {
            lastAudioAlertTime = now;
            const alertReason = voiceRatio > 0.55
              ? 'পরীক্ষার কক্ষে মানুষের কণ্ঠস্বর বা কথা বলার শব্দ সনাক্ত হয়েছে'
              : 'পরীক্ষার কক্ষে অনাকাঙ্ক্ষিত বা অতিরিক্ত শব্দ সনাক্ত হয়েছে';
            onSuspiciousAudio(alertReason, currentVolume);
          }
        }
      } else {
        speechConsecutiveFrames = Math.max(0, speechConsecutiveFrames - 1);
        currentStatus = 'quiet';
        // Continuous smooth background adaptation for relaxed rooms
        if (rms < 0.05) {
          baselineRms = baselineRms * 0.98 + rms * 0.02;
        }
      }
    }, 110);

  } catch (err) {
    console.warn('Audio proctoring initialization note:', err);
  }

  const stop = () => {
    isListening = false;
    if (intervalId) clearInterval(intervalId);
    if (source) {
      try { source.disconnect(); } catch {}
    }
    if (analyser) {
      try { analyser.disconnect(); } catch {}
    }
    if (audioContext && audioContext.state !== 'closed') {
      try { audioContext.close(); } catch {}
    }
  };

  return {
    stop,
    getVolume: () => currentVolume,
    getStatus: () => currentStatus,
    isAudioActive: () => isListening
  };
}
