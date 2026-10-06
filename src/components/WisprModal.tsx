import React from 'react';
import { X, CheckCircle, ExternalLink, Video, Mic, Award } from 'lucide-react';

interface WisprModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WisprModal: React.FC<WisprModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(8, 9, 13, 0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '720px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        position: 'relative',
        border: '1px solid rgba(139,92,246,0.3)',
        boxShadow: '0 0 50px -10px rgba(139,92,246,0.4)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Wispr Flow Shortlisting Blueprint</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Step-by-step instructions for a guaranteed Top 5 submission.
            </p>
          </div>
        </div>

        {/* Video Script Breakdown */}
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Video size={18} color="var(--accent-purple)" />
          The 2.5-Minute Video Pitch Script:
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--accent-purple)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c4b5fd' }}>0:00 - 0:25: THE HOOK</div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '4px' }}>
              &quot;Hey Wispr team! We took on the ultimate voice challenge: building WisprVerse—a 4-in-1 suite featuring a Developer Telemetry Tool, a Voice-Controlled Arcade Game, a DevOps Automation Engine, and an Architecture Canvas—built 100% hands-free using Wispr Flow.&quot;
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--accent-cyan)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#67e8f9' }}>0:25 - 1:15: VOICE-CODING PROOF</div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '4px' }}>
              Show the Wispr Flow floating capsule active on screen. Hold hotkey and speak terminal commands and AI prompts naturally. Show words appearing with zero delay and generating the code.
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--accent-green)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6ee7b7' }}>1:15 - 2:05: THE 4 PILLARS SHOWCASE</div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '4px' }}>
              • 🛠️ <strong>Tool:</strong> Speak into mic to see live FFT spectrum & 3.8x velocity multiplier.<br/>
              • 🎮 <strong>Game:</strong> Play Sonic Jump—make voice sounds into the mic to jump over bugs!<br/>
              • ⚡ <strong>Automation:</strong> Click/speak &quot;Deploy to Staging&quot; and watch the terminal DAG run.<br/>
              • 🧪 <strong>Canvas:</strong> Trace the voice data packet across the architecture.
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--accent-amber)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fcd34d' }}>2:05 - 2:30: THE CLOSING PUNCHLINE</div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '4px' }}>
              &quot;Wispr Flow removed the 45 WPM keyboard tax and let our team build in pure flow state. We can&apos;t wait to push voice engineering even further at the Goa Hacker House. See you in Goa!&quot;
            </div>
          </div>
        </div>

        {/* Submission Links */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <a
            href="https://forms.gle/Lv9wF8gYVHdEqfJW8"
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{ fontSize: '0.85rem', padding: '8px 16px' }}
          >
            Google Form Submission Link <ExternalLink size={14} />
          </a>
          <button onClick={onClose} className="btn-secondary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
