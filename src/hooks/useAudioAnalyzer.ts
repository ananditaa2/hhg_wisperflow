import { useState, useEffect, useRef, useCallback } from 'react';
import { TelemetryData } from '../types';

export function useAudioAnalyzer() {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0);
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    isRecording: false,
    wordsSpoken: 0,
    currentWpm: 0,
    flowMultiplier: 1.0,
    keystrokesSaved: 0,
    sessionDuration: 0,
    volumeLevel: 0
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const frequencyDataRef = useRef<Uint8Array>(new Uint8Array(64));
  const isSpeakingRef = useRef<boolean>(false);
  const wordsCounterRef = useRef<number>(0);
  const speechCyclesRef = useRef<number>(0);

  // Play synthesized tone for feedback
  const playTone = useCallback((freq: number = 440, type: OscillatorType = 'sine', duration: number = 0.15) => {
    try {
      const ctx = audioContextRef.current || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext unavailable or restricted
    }
  }, []);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      setIsActive(true);
      playTone(600, 'triangle', 0.1);

      // Session Duration Timer
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        const elapsedSecs = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
        const words = wordsCounterRef.current;
        const wpm = Math.round((words / elapsedSecs) * 60);
        const multiplier = Math.max(1.0, Number((wpm / 45).toFixed(1)));
        const savedKeys = words * 5.2; // approx 5.2 chars per word

        setTelemetry(prev => ({
          ...prev,
          isRecording: true,
          wordsSpoken: words,
          currentWpm: Math.min(220, Math.max(0, wpm || (isSpeakingRef.current ? 150 : 0))),
          flowMultiplier: multiplier,
          keystrokesSaved: Math.round(savedKeys),
          sessionDuration: elapsedSecs,
        }));
      }, 500);

      // Animation loop for audio sampling
      const updateData = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(frequencyDataRef.current as any);

        // Calculate average amplitude
        let sum = 0;
        for (let i = 0; i < frequencyDataRef.current.length; i++) {
          sum += frequencyDataRef.current[i];
        }
        const avg = sum / frequencyDataRef.current.length;
        const normalizedVol = Math.min(100, Math.round((avg / 255) * 100 * 2.2));
        setVolume(normalizedVol);

        // Voice Activity Detection (VAD) simulation
        if (normalizedVol > 18) {
          if (!isSpeakingRef.current) {
            isSpeakingRef.current = true;
          }
          speechCyclesRef.current += 1;
          if (speechCyclesRef.current % 12 === 0) {
            wordsCounterRef.current += 1;
          }
        } else {
          isSpeakingRef.current = false;
        }

        animFrameRef.current = requestAnimationFrame(updateData);
      };

      updateData();
    } catch {
      // Fallback: If microphone access is denied or unavailable, use simulated audio synthesis
      console.warn('Microphone permission not granted; falling back to interactive simulation mode.');
      setIsActive(true);
      playTone(480, 'sine', 0.1);

      // Simulate natural speech wave
      let phase = 0;
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        const elapsedSecs = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
        wordsCounterRef.current += Math.random() > 0.3 ? 1 : 0;
        const words = wordsCounterRef.current;
        const wpm = Math.round((words / elapsedSecs) * 60) || 145;

        setTelemetry(prev => ({
          ...prev,
          isRecording: true,
          wordsSpoken: words,
          currentWpm: wpm,
          flowMultiplier: Number((wpm / 45).toFixed(1)),
          keystrokesSaved: Math.round(words * 5.2),
          sessionDuration: elapsedSecs,
        }));
      }, 600);

      const simulateAudio = () => {
        phase += 0.08;
        const simVol = Math.floor(Math.sin(phase) * 35 + 40 + Math.random() * 20);
        setVolume(simVol);

        for (let i = 0; i < frequencyDataRef.current.length; i++) {
          frequencyDataRef.current[i] = Math.max(
            0,
            Math.min(255, Math.floor(Math.sin(phase + i * 0.2) * 100 + simVol * 1.5))
          );
        }

        animFrameRef.current = requestAnimationFrame(simulateAudio);
      };
      simulateAudio();
    }
  }, [playTone]);

  const stopListening = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsActive(false);
    setVolume(0);
    setTelemetry(prev => ({ ...prev, isRecording: false, currentWpm: 0 }));
    playTone(320, 'sine', 0.1);
  }, [playTone]);

  const injectSpeechInput = useCallback((text: string) => {
    const wordCount = text.trim().split(/\s+/).length;
    wordsCounterRef.current += wordCount;
    const words = wordsCounterRef.current;
    const wpm = Math.min(210, Math.max(140, Math.round(155 + Math.random() * 25)));
    const multiplier = Number((wpm / 45).toFixed(1));
    const savedKeys = Math.round(words * 5.2);

    setTelemetry(prev => ({
      ...prev,
      wordsSpoken: words,
      currentWpm: wpm,
      flowMultiplier: multiplier,
      keystrokesSaved: savedKeys,
      sessionDuration: Math.max(prev.sessionDuration, 14)
    }));
    playTone(580, 'triangle', 0.1);
  }, [playTone]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isActive,
    volume,
    telemetry,
    frequencyDataRef,
    startListening,
    stopListening,
    injectSpeechInput,
    playTone
  };
}
