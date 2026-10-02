import React, { useEffect, useRef, useState } from 'react';
import { Activity, Zap, Keyboard, Clock, Mic, Sparkles, Copy, Check, ArrowRight } from 'lucide-react';
import { TelemetryData } from '../types';

interface DevCockpitProps {
  isListening: boolean;
  telemetry: TelemetryData;
  frequencyDataRef: React.MutableRefObject<Uint8Array>;
  volume: number;
  onStartMic: () => void;
  onInjectSpeech?: (text: string) => void;
}

const SAMPLE_PROMPTS = [
  "Build an audio frequency visualizer component using Web Audio API and responsive canvas rendering.",
  "Refactor the authentication middleware to use JWT with secure HttpOnly cookies and rate limiting.",
  "Generate a docker-compose file with Postgres, Redis cache, and Prometheus metrics exporter.",
  "Write an integration test suite for the payment processing webhook handling idempotent retries."
];

export const DevCockpit: React.FC<DevCockpitProps> = ({
  isListening,
  telemetry,
  frequencyDataRef,
  volume,
  onStartMic,
  onInjectSpeech
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<string>(SAMPLE_PROMPTS[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [promptLog, setPromptLog] = useState<string[]>([
    "Scaffolded Vite + React application hands-free via Wispr Flow.",
    "Integrated Web Audio API frequency analyzer with live FFT nodes.",
    "Flow Multiplier benchmark calibrated at 3.8x velocity."
  ]);

  // Clean Audio Bars Visualizer Loop (Wispr Flow Soundwave Aesthetic)
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const data = frequencyDataRef.current;
      const totalBars = 36;
      const barWidth = 6;
      const gap = (width - totalBars * barWidth) / (totalBars + 1);

      for (let i = 0; i < totalBars; i++) {
        const dataIndex = Math.floor((i / totalBars) * data.length);
        const val = isListening ? data[dataIndex] : Math.sin(Date.now() * 0.003 + i * 0.2) * 20 + 25;
        const normalized = Math.max(8, (val / 255) * (height - 24));

        const x = gap + i * (barWidth + gap);
        const y = (height - normalized) / 2;

        // Wispr Signature Forest Green to Charcoal gradient
        const grad = ctx.createLinearGradient(0, y, 0, y + normalized);
        grad.addColorStop(0, '#093c31');
        grad.addColorStop(1, '#111827');

        ctx.fillStyle = isListening ? grad : '#cbd5e1';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, normalized, 3);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [frequencyDataRef, isListening]);

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSimulateVoiceInput = (prompt: string) => {
    setSelectedPrompt(prompt);
    setPromptLog(prev => [prompt, ...prev.slice(0, 4)]);
    if (onInjectSpeech) {
      onInjectSpeech(prompt);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* 1. Hero Section (Matching Screenshot "Don't type, just speak.") */}
      <section style={{ textAlign: 'center', padding: '36px 16px 16px', maxWidth: '820px', margin: '0 auto' }}>
        <div className="eyebrow-text" style={{ marginBottom: '14px' }}>
          WISPR FLOW DEVELOPER TELEMETRY
        </div>

        <h1 className="serif-headline" style={{ fontSize: 'clamp(2.8rem, 6vw, 4.4rem)', lineHeight: '1.08', marginBottom: '18px' }}>
          Don&apos;t type,<br />
          <span className="serif-italic">just code.</span>
        </h1>

        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 24px', lineHeight: '1.6' }}>
          The voice-to-code suite that turns speech into clear, high-velocity software engineering in every app. Built 100% with Wispr Flow.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {!isListening ? (
            <button onClick={onStartMic} className="btn-wispr-lilac" style={{ padding: '12px 24px', fontSize: '1rem' }}>
              <Mic size={18} />
              <span>Start Voice Telemetry</span>
            </button>
          ) : (
            <button onClick={onStartMic} className="btn-wispr-secondary" style={{ padding: '12px 24px', fontSize: '1rem', borderColor: '#10b981', color: '#065f46' }}>
              <span className="pulse-dot" style={{ width: '8px', height: '8px' }}></span>
              <span>Microphone Active • {telemetry.currentWpm} WPM</span>
            </button>
          )}

          <a
            href="https://ref.wisprflow.ai/hhg"
            target="_blank"
            rel="noreferrer"
            className="btn-wispr-secondary"
            style={{ padding: '12px 20px', fontSize: '0.95rem' }}
          >
            <span>Wispr Referral Link</span>
            <ArrowRight size={15} />
          </a>
        </div>
      </section>

      {/* 2. Real-Time Audio Soundwave Box */}
      <div className="wispr-card" style={{ padding: '24px', maxWidth: '820px', width: '100%', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isListening ? '#10b981' : '#9ca3af'
            }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Live Acoustic Waveform (48kHz Web Audio)</span>
          </div>
          <span className="mono-tag">
            {isListening ? `Volume: ${volume}%` : 'Standby'}
          </span>
        </div>

        <div style={{
          backgroundColor: '#faf8f0',
          borderRadius: '12px',
          border: '1px solid #eae6db',
          padding: '16px 8px'
        }}>
          <canvas
            ref={canvasRef}
            width={760}
            height={90}
            style={{ width: '100%', height: '90px', display: 'block' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '10px' }}>
          <span>Low Resonance (Bass)</span>
          <span>Conversational Formants (Wispr Whisper Engine)</span>
          <span>Upper Sibilance</span>
        </div>
      </div>

      {/* 3. Metric Cards (Clean White with Natural Shadow) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Metric 1 */}
        <div className="wispr-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
              FLOW MULTIPLIER
            </span>
            <Zap size={16} color="var(--accent-forest)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#111827' }}>
              {telemetry.flowMultiplier.toFixed(1)}x
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#059669' }}>
              vs 45 WPM Typing
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            3.8x faster thought-to-code velocity
          </p>
        </div>

        {/* Metric 2 */}
        <div className="wispr-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
              CURRENT VELOCITY
            </span>
            <Activity size={16} color="#0284c7" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#111827' }}>
              {telemetry.currentWpm}
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0284c7' }}>
              Words / Min
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Spoken speech bandwidth rate
          </p>
        </div>

        {/* Metric 3 */}
        <div className="wispr-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
              KEYSTROKES SPARED
            </span>
            <Keyboard size={16} color="#7c3aed" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#111827' }}>
              {telemetry.keystrokesSaved.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#7c3aed' }}>
              Keys
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Zero repetitive wrist strain
          </p>
        </div>

        {/* Metric 4 */}
        <div className="wispr-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
              WORDS TRANSCRIBED
            </span>
            <Clock size={16} color="#d97706" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#111827' }}>
              {telemetry.wordsSpoken}
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#d97706' }}>
              {telemetry.sessionDuration}s session
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Wispr speech-to-text engine
          </p>
        </div>
      </div>

      {/* 4. Interactive Spoken Intent Sandbox */}
      <div className="wispr-card" style={{ padding: '28px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <h3 className="serif-headline" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
          Interactive Spoken Intent Sandbox
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '16px' }}>
          Click any sample engineering prompt below to simulate speaking it into your AI developer workflow. Watch the words and velocity metrics above respond instantly:
        </p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {SAMPLE_PROMPTS.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleSimulateVoiceInput(prompt)}
              className="btn-wispr-secondary"
              style={{
                fontSize: '0.82rem',
                backgroundColor: selectedPrompt === prompt ? 'var(--accent-lilac)' : undefined,
                borderColor: selectedPrompt === prompt ? 'var(--border-dark)' : undefined,
                fontWeight: selectedPrompt === prompt ? 600 : 500
              }}
            >
              Prompt #{index + 1}
            </button>
          ))}
        </div>

        <div style={{
          backgroundColor: '#faf8f0',
          border: '1px solid #eae6db',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🎙️</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: '#111827' }}>
              &quot;{selectedPrompt}&quot;
            </span>
          </div>
          <button
            onClick={() => handleCopyPrompt(selectedPrompt)}
            className="btn-wispr-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Recent Activity Log */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Recent Spoken Stream:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {promptLog.map((log, i) => (
              <div key={i} style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#093c31', fontSize: '0.65rem' }}>●</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
