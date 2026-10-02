import React, { useEffect, useRef, useState } from 'react';
import { Activity, Zap, Keyboard, Clock, Mic, Sparkles, Send, Copy, Check } from 'lucide-react';
import { TelemetryData } from '../types';

interface DevCockpitProps {
  isListening: boolean;
  telemetry: TelemetryData;
  frequencyDataRef: React.MutableRefObject<Uint8Array>;
  volume: number;
  onStartMic: () => void;
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
  onStartMic
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<string>(SAMPLE_PROMPTS[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [promptLog, setPromptLog] = useState<string[]>([
    "Initial scaffold created using Wispr Flow voice prompt.",
    "Web Audio API hook integrated with live frequency spectrum.",
    "Flow Multiplier benchmark initialized at 3.6x velocity."
  ]);

  // Canvas visualizer loop
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
      const bufferLength = data.length || 64;
      const barWidth = (width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const val = isListening ? data[i] : Math.sin(Date.now() * 0.003 + i * 0.15) * 20 + 25;
        const barHeight = Math.max(4, (val / 255) * (height - 20));

        // Neon Gradient
        const grad = ctx.createLinearGradient(0, height - barHeight, 0, height);
        grad.addColorStop(0, '#06b6d4'); // Cyan top
        grad.addColorStop(0.5, '#8b5cf6'); // Violet middle
        grad.addColorStop(1, '#ec4899'); // Rose base

        ctx.fillStyle = grad;
        ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);

        // Subtle glow top dot
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, height - barHeight - 2, barWidth - 2, 2);

        x += barWidth;
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
    setPromptLog(prev => [prompt, ...prev.slice(0, 5)]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner / Hero */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span className="mono-badge" style={{ color: 'var(--accent-purple)', borderColor: 'rgba(139,92,246,0.3)' }}>
              PILLAR 1: DEVELOPER TOOL
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-Time Web Audio Telemetry</span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }} className="gradient-text">
            Voice Telemetry & Flow Cockpit
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', fontSize: '0.95rem' }}>
            Measures your vocal bandwidth in real time. Speaking eliminates the 45 WPM typing bottleneck, allowing you to formulate dense engineering logic at 160+ WPM directly into AI coding tools.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {!isListening && (
            <button onClick={onStartMic} className="btn-primary">
              <Mic size={18} />
              <span>Enable Microphone Telemetry</span>
            </button>
          )}
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        {/* Card 1: Velocity Multiplier */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--accent-purple)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>FLOW MULTIPLIER</span>
            <Zap size={18} color="var(--accent-purple)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc' }}>
              {telemetry.flowMultiplier.toFixed(1)}x
            </span>
            <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>vs 45 WPM Typing</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            {telemetry.flowMultiplier > 2.5 ? '⚡ Hyper-Flow state detected' : 'Standard conversational baseline'}
          </p>
        </div>

        {/* Card 2: Current WPM */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>VOICE VELOCITY</span>
            <Activity size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc' }}>
              {telemetry.currentWpm}
            </span>
            <span style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 600 }}>Words / Min</span>
          </div>
          <div style={{ marginTop: '10px', height: '6px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(100, (telemetry.currentWpm / 200) * 100)}%`,
              height: '100%',
              backgroundColor: 'var(--accent-cyan)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Card 3: Keystrokes Saved */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--accent-green)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>KEYSTROKES SPARED</span>
            <Keyboard size={18} color="var(--accent-green)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc' }}>
              {telemetry.keystrokesSaved.toLocaleString()}
            </span>
            <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>Keys</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Zero repetitive strain injury (RSI) friction
          </p>
        </div>

        {/* Card 4: Session Duration & Words */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--accent-amber)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>WORDS TRANSCRIBED</span>
            <Clock size={18} color="var(--accent-amber)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc' }}>
              {telemetry.wordsSpoken}
            </span>
            <span style={{ color: 'var(--accent-amber)', fontSize: '0.85rem', fontWeight: 600 }}>
              {telemetry.sessionDuration}s session
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Transcribed with Wispr Flow speech engine
          </p>
        </div>
      </div>

      {/* Visualizer & Benchmark Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px'
      }}>
        {/* Real-time Spectrum Canvas */}
        <div className="glass-panel-glow" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="pulse-dot" style={{ backgroundColor: isListening ? '#06b6d4' : '#64748b' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Real-Time Frequency Spectrum (Web Audio FFT)</h3>
            </div>
            <span className="mono-badge" style={{ color: 'var(--accent-cyan)' }}>
              Amp: {volume}%
            </span>
          </div>

          <div style={{
            position: 'relative',
            backgroundColor: '#0c0e17',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
            padding: '12px'
          }}>
            <canvas 
              ref={canvasRef} 
              width={600} 
              height={140} 
              style={{ width: '100%', height: '140px', display: 'block' }}
            />
            {!isListening && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(8, 9, 13, 0.65)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <p style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Microphone in standby</p>
                <button onClick={onStartMic} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                  <Mic size={14} /> Connect Audio
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>20 Hz (Low Bass)</span>
            <span>Speech Formants (300Hz - 3.4kHz)</span>
            <span>8 kHz (Presence)</span>
          </div>
        </div>

        {/* Voice vs Keyboard Benchmark */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>The Wispr Flow Velocity Benchmark</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: '#c4b5fd' }}>🎙️ Wispr Flow Natural Speech</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#a78bfa' }}>165 WPM</span>
              </div>
              <div style={{ height: '10px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: '#94a3b8' }}>⌨️ Mechanical Keyboard Typing</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#94a3b8' }}>48 WPM</span>
              </div>
              <div style={{ height: '10px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: '25%', height: '100%', backgroundColor: '#64748b' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: '#94a3b8' }}>📱 Mobile Screen Keyboard</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#94a3b8' }}>32 WPM</span>
              </div>
              <div style={{ height: '10px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: '16%', height: '100%', backgroundColor: '#475569' }} />
              </div>
            </div>
          </div>

          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(139,92,246,0.08)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '10px',
            fontSize: '0.82rem',
            color: '#ddd6fe',
            lineHeight: '1.4'
          }}>
            <strong>💡 Insight:</strong> When orchestrating AI coding models, typing detailed architectural requirements takes ~2.5 minutes by hand, but only ~35 seconds using Wispr Flow.
          </div>
        </div>
      </div>

      {/* Voice Prompt Live Sandbox */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
          Spoken Intent Sandbox (Simulated Voice Flow)
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '16px' }}>
          Click any sample voice prompt to simulate speaking it via Wispr Flow into your AI development pipeline:
        </p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {SAMPLE_PROMPTS.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleSimulateVoiceInput(prompt)}
              className="btn-secondary"
              style={{
                fontSize: '0.8rem',
                borderColor: selectedPrompt === prompt ? 'var(--accent-purple)' : undefined,
                color: selectedPrompt === prompt ? '#fff' : undefined,
                backgroundColor: selectedPrompt === prompt ? 'rgba(139,92,246,0.2)' : undefined
              }}
            >
              Prompt #{index + 1}
            </button>
          ))}
        </div>

        <div style={{
          backgroundColor: '#0c0e17',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--accent-purple)' }}>🎙️</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: '#f1f5f9' }}>
              &quot;{selectedPrompt}&quot;
            </span>
          </div>
          <button 
            onClick={() => handleCopyPrompt(selectedPrompt)}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Live Prompt Activity Stream */}
        <div style={{ marginTop: '16px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Recent Voice Stream Log:
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
            {promptLog.map((log, i) => (
              <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent-green)', fontSize: '0.7rem' }}>●</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
