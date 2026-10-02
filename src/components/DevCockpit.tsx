import React, { useEffect, useRef, useState } from 'react';
import { Activity, Zap, Keyboard, Clock, Mic, Sparkles, Copy, Check, ArrowRight, Wand2, Volume2, Flame } from 'lucide-react';
import { TelemetryData } from '../types';

interface DevCockpitProps {
  isListening: boolean;
  telemetry: TelemetryData;
  frequencyDataRef: React.MutableRefObject<Uint8Array>;
  volume: number;
  onStartMic: () => void;
  onInjectSpeech?: (text: string) => void;
  liveTranscript?: string;
  interimTranscript?: string;
}

interface NormalizationSample {
  raw: string;
  normalized: string;
  code: string;
}

const NORMALIZATION_SAMPLES: NormalizationSample[] = [
  {
    raw: "uh make a function that takes an array of numbers and like removes duplicates and sorts it ascending",
    normalized: "Create a typed utility function to deduplicate and sort numeric arrays in ascending order with O(n log n) efficiency.",
    code: "export function dedupeAndSort(items: number[]): number[] {\n  return Array.from(new Set(items)).sort((a, b) => a - b);\n}"
  },
  {
    raw: "we need an express middleware that checks the bearer token in headers and rejects with 401 if missing",
    normalized: "Implement Express authentication middleware verifying JWT Bearer token with RFC 6750 401 response and claim extraction.",
    code: "export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {\n  const token = req.headers.authorization?.split(' ')[1];\n  if (!token) return res.status(401).json({ error: 'Unauthorized' });\n  next();\n};"
  },
  {
    raw: "build a react hook that monitors window resize and returns the current viewport width and height debounce it",
    normalized: "Build a custom React useWindowDimensions hook with 150ms debounced window resize event listeners.",
    code: "export function useWindowDimensions() {\n  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });\n  // debounced resize listener\n  return dims;\n}"
  }
];

export const DevCockpit: React.FC<DevCockpitProps> = ({
  isListening,
  telemetry,
  frequencyDataRef,
  volume,
  onStartMic,
  onInjectSpeech,
  liveTranscript = '',
  interimTranscript = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeSample, setActiveSample] = useState<NormalizationSample>(NORMALIZATION_SAMPLES[0]);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Audio Bars Visualizer Loop
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
      const totalBars = 48;
      const barWidth = 6;
      const gap = (width - totalBars * barWidth) / (totalBars + 1);

      for (let i = 0; i < totalBars; i++) {
        const dataIndex = Math.floor((i / totalBars) * data.length);
        const val = isListening ? data[dataIndex] : Math.sin(Date.now() * 0.003 + i * 0.2) * 20 + 25;
        const normalized = Math.max(8, (val / 255) * (height - 24));

        const x = gap + i * (barWidth + gap);
        const y = (height - normalized) / 2;

        ctx.fillStyle = isListening ? '#18181b' : '#cbd5e1';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, normalized, 3);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [frequencyDataRef, isListening]);

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1500);
  };

  const handleSelectSample = (sample: NormalizationSample) => {
    setActiveSample(sample);
    if (onInjectSpeech) {
      onInjectSpeech(sample.raw);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      {/* 1. Full-Width Expansive Hero */}
      <section style={{ textAlign: 'center', padding: '24px 16px 8px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <span className="genz-tag tag-yellow">⚡ 100% SPEECH TO CODE</span>
          <span className="genz-tag tag-lilac">3.8x FLOW VELOCITY</span>
          <span className="genz-tag tag-green">ZERO KEYBOARD TAX</span>
        </div>

        <h1 className="serif-headline" style={{ fontSize: 'clamp(3rem, 6.5vw, 5.2rem)', lineHeight: '1.04', marginBottom: '16px' }}>
          Don&apos;t type,<br />
          <span className="serif-italic" style={{ color: '#093c31' }}>just code.</span>
        </h1>

        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '780px', margin: '0 auto 24px', lineHeight: '1.6' }}>
          Speak high-level architectural intent at 160+ WPM. Wispr turns messy, conversational developer thoughts into polished production prompts and code.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={onStartMic}
            className="btn-brutal-lilac"
            style={{
              padding: '14px 28px',
              fontSize: '1.05rem',
              backgroundColor: isListening ? 'var(--accent-matcha)' : 'var(--accent-lilac)'
            }}
          >
            <Mic size={20} />
            <span>{isListening ? '🎙️ Microphone Active (Speak Now)' : 'Launch Voice Telemetry'}</span>
          </button>

          <a
            href="https://ref.wisprflow.ai/hhg"
            target="_blank"
            rel="noreferrer"
            className="btn-brutal-white"
            style={{ padding: '14px 24px', fontSize: '1.05rem' }}
          >
            <span>Wispr Referral Verification</span>
            <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* 2. Full-Width Bento Grid: Live Transcript + Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.35fr) minmax(320px, 1fr)',
        gap: '24px',
        width: '100%'
      }}>
        {/* Left Bento: Live Speech-to-Intent Stream Box */}
        <div className="genz-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '380px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="genz-tag tag-green">
                  {isListening ? 'LIVE AUDIO ON' : 'STANDBY'}
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 800 }}>
                  Real-Time Speech-to-Intent Stream
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Volume2 size={16} />
                <span className="genz-tag tag-cyan" style={{ fontSize: '0.72rem' }}>
                  Mic: {volume}%
                </span>
              </div>
            </div>

            {/* Live Words Stream Display */}
            <div style={{
              backgroundColor: '#faf7ee',
              borderRadius: '12px',
              border: '2px solid var(--border-black)',
              padding: '20px',
              minHeight: '130px',
              fontFamily: 'var(--font-sans)',
              fontSize: '1.2rem',
              lineHeight: '1.6',
              color: '#18181b',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)'
            }}>
              {liveTranscript || interimTranscript ? (
                <div>
                  <span style={{ fontWeight: 600 }}>{liveTranscript}</span>{' '}
                  <span style={{ color: '#093c31', fontStyle: 'italic', fontWeight: 800 }}>{interimTranscript}</span>
                </div>
              ) : (
                <span style={{ color: '#94a3b8' }}>
                  {isListening 
                    ? '🎙️ Speak freely into your microphone (e.g. "Build an API route with JWT auth and rate limiting")...' 
                    : 'Click "Launch Voice Telemetry" above or click a demo sample below to see speech-to-intent in action.'}
                </span>
              )}
            </div>
          </div>

          {/* Soundwave canvas */}
          <div style={{ marginTop: '20px' }}>
            <canvas
              ref={canvasRef}
              width={820}
              height={55}
              style={{ width: '100%', height: '55px', display: 'block' }}
            />
          </div>
        </div>

        {/* Right Bento: 4 Tactile Metric Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px'
        }}>
          {/* Card 1 */}
          <div className="genz-card" style={{ padding: '20px', backgroundColor: 'var(--accent-lilac)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                FLOW MULTIPLIER
              </span>
              <Zap size={16} />
            </div>
            <div style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: '1' }}>
              {telemetry.flowMultiplier.toFixed(1)}x
            </div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '8px' }}>
              ⚡ vs 45 WPM Keyboard Typing
            </p>
          </div>

          {/* Card 2 */}
          <div className="genz-card" style={{ padding: '20px', backgroundColor: 'var(--accent-matcha)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                BURST WPM
              </span>
              <Activity size={16} />
            </div>
            <div style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: '1' }}>
              {telemetry.currentWpm || (isListening ? 165 : 0)}
            </div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '8px' }}>
              🚀 Words / Minute Speech Rate
            </p>
          </div>

          {/* Card 3 */}
          <div className="genz-card" style={{ padding: '20px', backgroundColor: 'var(--accent-cyan)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                KEYS SPARED
              </span>
              <Keyboard size={16} />
            </div>
            <div style={{ fontSize: '2.6rem', fontWeight: 900, lineHeight: '1' }}>
              {telemetry.keystrokesSaved.toLocaleString()}
            </div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '8px' }}>
              🦾 Zero Wrist Strain / RSI
            </p>
          </div>

          {/* Card 4 */}
          <div className="genz-card" style={{ padding: '20px', backgroundColor: 'var(--accent-yellow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                WORDS DICTATED
              </span>
              <Clock size={16} />
            </div>
            <div style={{ fontSize: '2.6rem', fontWeight: 900, lineHeight: '1' }}>
              {telemetry.wordsSpoken}
            </div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '8px' }}>
              🕒 {telemetry.sessionDuration}s Active Session
            </p>
          </div>
        </div>
      </div>

      {/* 3. The Wispr Magic Normalizer: Full-Width Comparison Lab */}
      <div className="genz-card" style={{ padding: '32px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wand2 size={24} color="#093c31" />
            <h3 className="serif-headline" style={{ fontSize: '2rem' }}>
              The Wispr Magic Normalizer (Speech $\rightarrow$ Code Intent)
            </h3>
          </div>

          <span className="genz-tag tag-lilac">
            SECRET SAUCE
          </span>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '20px' }}>
          Wispr Flow&apos;s true differentiator: converting fast, rambling speech into crystal-clear engineering prompts and synthesized production code:
        </p>

        {/* Demo Selector Tabs */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {NORMALIZATION_SAMPLES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(sample)}
              className="btn-brutal-white"
              style={{
                fontSize: '0.86rem',
                backgroundColor: activeSample.raw === sample.raw ? 'var(--accent-yellow)' : '#ffffff',
                transform: activeSample.raw === sample.raw ? 'scale(1.02)' : 'none'
              }}
            >
              Demo #{idx + 1}: {sample.normalized.slice(0, 32)}...
            </button>
          ))}
        </div>

        {/* Side-by-side comparison */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px',
          width: '100%'
        }}>
          {/* Left: Raw Spoken Input */}
          <div style={{
            backgroundColor: '#faf7ee',
            border: '2px solid var(--border-black)',
            boxShadow: '3px 3px 0px var(--border-black)',
            borderRadius: '14px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.2rem' }}>🎙️</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Raw Conversational Speech (Spoken in 3 seconds)
                </span>
              </div>
              <p style={{ fontSize: '1.15rem', color: '#18181b', fontStyle: 'italic', lineHeight: '1.6' }}>
                &quot;{activeSample.raw}&quot;
              </p>
            </div>
            <div style={{ marginTop: '24px', fontSize: '0.85rem', color: '#093c31', fontWeight: 800 }}>
              ✓ Spoken at ~165 WPM with zero keystroke fatigue
            </div>
          </div>

          {/* Right: Wispr Polished Prompt & Code Output */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '2px solid var(--border-black)',
            boxShadow: '3px 3px 0px var(--border-black)',
            borderRadius: '14px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#093c31', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  ✨ Wispr Normalized Engineering Intent
                </span>
                <button
                  onClick={() => handleCopyCode(activeSample.code)}
                  className="btn-brutal-white"
                  style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                >
                  {copiedCode ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#18181b', lineHeight: '1.4' }}>
                {activeSample.normalized}
              </p>
            </div>

            <pre style={{
              backgroundColor: '#18181b',
              color: '#a7f3d0',
              padding: '16px',
              borderRadius: '10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.84rem',
              overflowX: 'auto',
              lineHeight: '1.5'
            }}>
              <code>{activeSample.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
