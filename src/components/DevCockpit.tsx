import React, { useEffect, useRef, useState } from 'react';
import { Activity, Zap, Keyboard, Clock, Mic, Sparkles, Copy, Check, ArrowRight, Wand2, Volume2 } from 'lucide-react';
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
    normalized: "Create a typed utility function to deduplicate and sort numeric arrays in ascending order.",
    code: "export function dedupeAndSort(items: number[]): number[] {\n  return Array.from(new Set(items)).sort((a, b) => a - b);\n}"
  },
  {
    raw: "we need an express middleware that checks the bearer token in headers and rejects with 401 if missing",
    normalized: "Implement Express authentication middleware verifying JWT Bearer token with RFC 6750 401 response.",
    code: "export const authMiddleware = (req, res, next) => {\n  const token = req.headers.authorization?.split(' ')[1];\n  if (!token) return res.status(401).json({ error: 'Unauthorized' });\n  next();\n};"
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
  const [manualInput, setManualInput] = useState<string>('');

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
      const totalBars = 36;
      const barWidth = 6;
      const gap = (width - totalBars * barWidth) / (totalBars + 1);

      for (let i = 0; i < totalBars; i++) {
        const dataIndex = Math.floor((i / totalBars) * data.length);
        const val = isListening ? data[dataIndex] : Math.sin(Date.now() * 0.003 + i * 0.2) * 20 + 25;
        const normalized = Math.max(8, (val / 255) * (height - 24));

        const x = gap + i * (barWidth + gap);
        const y = (height - normalized) / 2;

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* 1. Hero Section */}
      <section style={{ textAlign: 'center', padding: '36px 16px 12px', maxWidth: '840px', margin: '0 auto' }}>
        <div className="eyebrow-text" style={{ marginBottom: '14px' }}>
          WISPR FLOW DEVELOPER TELEMETRY
        </div>

        <h1 className="serif-headline" style={{ fontSize: 'clamp(2.8rem, 6vw, 4.4rem)', lineHeight: '1.08', marginBottom: '18px' }}>
          Don&apos;t type,<br />
          <span className="serif-italic">just code.</span>
        </h1>

        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 24px', lineHeight: '1.6' }}>
          Speak high-level architectural intent at 160+ WPM. Wispr turns messy, conversational developer thoughts into polished production prompts and code.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={onStartMic}
            className="btn-wispr-lilac"
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              backgroundColor: isListening ? '#bbf7d0' : undefined
            }}
          >
            <Mic size={18} />
            <span>{isListening ? 'Microphone Active (Speaking...)' : 'Start Real Voice Input'}</span>
          </button>

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

      {/* 2. Real-Time Speech Stream Box (Shows actual words as you speak!) */}
      <div className="wispr-card" style={{ padding: '24px', maxWidth: '900px', width: '100%', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isListening ? '#10b981' : '#9ca3af'
            }} />
            <span style={{ fontSize: '0.92rem', fontWeight: 700 }}>
              Live Speech-to-Intent Stream ({isListening ? 'Listening via Web Speech API' : 'Microphone in Standby'})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Volume2 size={15} color="#093c31" />
            <span className="mono-tag">Mic: {volume}%</span>
          </div>
        </div>

        {/* Live Transcript Display */}
        <div style={{
          backgroundColor: '#faf8f0',
          borderRadius: '12px',
          border: '1px solid #eae6db',
          padding: '18px',
          minHeight: '80px',
          fontFamily: 'var(--font-sans)',
          fontSize: '1.05rem',
          lineHeight: '1.6',
          color: '#111827'
        }}>
          {liveTranscript || interimTranscript ? (
            <div>
              <span>{liveTranscript}</span>{' '}
              <span style={{ color: '#093c31', fontStyle: 'italic', fontWeight: 600 }}>{interimTranscript}</span>
            </div>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>
              {isListening 
                ? '🎙️ Say something into your microphone (e.g. "Create a login component with validation")...' 
                : 'Click "Start Real Voice Input" above or test a sample below to see speech-to-intent in action.'}
            </span>
          )}
        </div>

        {/* Soundwave canvas */}
        <div style={{ marginTop: '14px' }}>
          <canvas
            ref={canvasRef}
            width={760}
            height={60}
            style={{ width: '100%', height: '60px', display: 'block' }}
          />
        </div>
      </div>

      {/* 3. Metric Cards */}
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
            Peak burst speech rate vs manual keyboard
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
              {telemetry.currentWpm || (isListening ? 155 : 0)}
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
            Wispr speech-to-intent engine
          </p>
        </div>
      </div>

      {/* 4. The Wispr Magic Normalizer: Messy Speech -> Polished Engineering Prompt & Code */}
      <div className="wispr-card" style={{ padding: '28px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Wand2 size={18} color="#093c31" />
          <h3 className="serif-headline" style={{ fontSize: '1.5rem' }}>
            The Wispr Magic Normalizer (Speech $\rightarrow$ Code Intent)
          </h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '18px' }}>
          The true power of Wispr Flow is converting fast, informal speech into crystal-clear engineering prompts and synthesized code:
        </p>

        {/* Sample selector tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {NORMALIZATION_SAMPLES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(sample)}
              className="btn-wispr-secondary"
              style={{
                fontSize: '0.84rem',
                backgroundColor: activeSample.raw === sample.raw ? 'var(--accent-lilac)' : undefined,
                borderColor: activeSample.raw === sample.raw ? 'var(--border-dark)' : undefined,
                fontWeight: activeSample.raw === sample.raw ? 600 : 500
              }}
            >
              Demo #{idx + 1}: {sample.normalized.slice(0, 28)}...
            </button>
          ))}
        </div>

        {/* Side-by-side comparison */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {/* Left: Raw Spoken Input */}
          <div style={{
            backgroundColor: '#faf8f0',
            border: '1px solid #eae6db',
            borderRadius: '12px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span>🎙️</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Raw Conversational Speech (Spoken in 3 seconds)
                </span>
              </div>
              <p style={{ fontSize: '0.95rem', color: '#374151', fontStyle: 'italic', lineHeight: '1.5' }}>
                &quot;{activeSample.raw}&quot;
              </p>
            </div>
            <div style={{ marginTop: '16px', fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
              ✓ Spoken at ~165 WPM with zero typing fatigue
            </div>
          </div>

          {/* Right: Wispr Polished Prompt & Code Output */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid var(--border-dark)',
            borderRadius: '12px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#093c31', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  ✨ Wispr Normalized Engineering Intent
                </span>
                <button
                  onClick={() => handleCopyCode(activeSample.code)}
                  className="btn-wispr-secondary"
                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                >
                  {copiedCode ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827', marginBottom: '10px' }}>
                {activeSample.normalized}
              </p>
            </div>

            <pre style={{
              backgroundColor: '#111827',
              color: '#a7f3d0',
              padding: '12px',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              overflowX: 'auto',
              lineHeight: '1.4'
            }}>
              <code>{activeSample.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
