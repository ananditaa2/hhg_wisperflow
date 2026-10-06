import { useState, useEffect, useRef, useCallback } from 'react';
import { TelemetryData } from '../types';

export function useAudioAnalyzer() {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string>('');
  const [volume, setVolume] = useState<number>(0);
  const [sampleRate, setSampleRate] = useState<number>(44100);
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    isRecording: false,
    wordsSpoken: 0,
    currentWpm: 0,
    keystrokesSaved: 0,
    sessionDuration: 0,
    volumeLevel: 0
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const pitchAnalyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const frequencyDataRef = useRef<Uint8Array>(new Uint8Array(64));
  const timeDomainDataRef = useRef<Uint8Array>(new Uint8Array(4096).fill(128));
  const wordsCounterRef = useRef<number>(0);
  const sessionStartRef = useRef<number | null>(null);

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

  const startListening = useCallback(async (): Promise<boolean> => {
    setAudioError('');
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone capture is not supported in this browser.');
      }
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

      const pitchAnalyser = ctx.createAnalyser();
      pitchAnalyser.fftSize = 4096;
      pitchAnalyser.smoothingTimeConstant = 0.8;
      pitchAnalyserRef.current = pitchAnalyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      source.connect(pitchAnalyser);

      frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      timeDomainDataRef.current = new Uint8Array(pitchAnalyser.fftSize).fill(128);
      setSampleRate(ctx.sampleRate);
      sessionStartRef.current = Date.now();
      wordsCounterRef.current = 0;
      setIsActive(true);
      setTelemetry(prev => ({
        ...prev,
        isRecording: true,
        wordsSpoken: 0,
        currentWpm: 0,
        keystrokesSaved: 0,
        sessionDuration: 0
      }));
      playTone(600, 'triangle', 0.1);

      // Session Duration Timer
      timerRef.current = window.setInterval(() => {
        const elapsedSecs = Math.max(1, Math.floor((Date.now() - (sessionStartRef.current ?? Date.now())) / 1000));
        const words = wordsCounterRef.current;
        const wpm = Math.round((words / elapsedSecs) * 60);
        const savedKeys = words * 5.2; // approx 5.2 chars per word

        setTelemetry(prev => ({
          ...prev,
          isRecording: true,
          wordsSpoken: words,
          currentWpm: Math.max(0, wpm),
          keystrokesSaved: Math.round(savedKeys),
          sessionDuration: elapsedSecs,
        }));
      }, 500);

      // Animation loop for audio sampling
      const updateData = () => {
        if (!analyserRef.current || !pitchAnalyserRef.current) return;
        analyserRef.current.getByteFrequencyData(frequencyDataRef.current as any);
        pitchAnalyserRef.current.getByteTimeDomainData(timeDomainDataRef.current as any);

        // Calculate average amplitude
        let sum = 0;
        for (let i = 0; i < frequencyDataRef.current.length; i++) {
          sum += frequencyDataRef.current[i];
        }
        const avg = sum / frequencyDataRef.current.length;
        const normalizedVol = Math.min(100, Math.round((avg / 255) * 100 * 2.2));
        setVolume(normalizedVol);

        animFrameRef.current = requestAnimationFrame(updateData);
      };

      updateData();
      return true;
    } catch (error) {
      const message = error instanceof DOMException && error.name === 'NotAllowedError'
        ? 'Microphone access was denied. Allow microphone access in your browser settings and try again.'
        : error instanceof Error
          ? error.message
          : 'Microphone is unavailable in this browser.';
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      animFrameRef.current = null;
      timerRef.current = null;
      sessionStartRef.current = null;
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      audioContextRef.current = null;
      analyserRef.current = null;
      pitchAnalyserRef.current = null;
      frequencyDataRef.current.fill(0);
      timeDomainDataRef.current.fill(128);
      setAudioError(message);
      setIsActive(false);
      setVolume(0);
      setTelemetry(prev => ({ ...prev, isRecording: false, currentWpm: 0 }));
      return false;
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
    sessionStartRef.current = null;
    setVolume(0);
    frequencyDataRef.current.fill(0);
    timeDomainDataRef.current.fill(128);
    setTelemetry(prev => ({ ...prev, isRecording: false, currentWpm: 0 }));
    playTone(320, 'sine', 0.1);
  }, [playTone]);

  const injectSpeechInput = useCallback((text: string) => {
    const cleanedText = text.trim();
    if (!cleanedText || !sessionStartRef.current) return;
    const wordCount = cleanedText.split(/\s+/).length;
    wordsCounterRef.current += wordCount;
    const words = wordsCounterRef.current;
    const elapsedSecs = Math.max(1, Math.floor((Date.now() - sessionStartRef.current) / 1000));
    const wpm = Math.round((words / elapsedSecs) * 60);
    const savedKeys = Math.round(words * 5.2);

    setTelemetry(prev => ({
      ...prev,
      wordsSpoken: words,
      currentWpm: wpm,
      keystrokesSaved: savedKeys,
      sessionDuration: Math.max(prev.sessionDuration, elapsedSecs)
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
    audioError,
    volume,
    telemetry,
    frequencyDataRef,
    timeDomainDataRef,
    sampleRate,
    startListening,
    stopListening,
    injectSpeechInput,
    playTone
  };
}
