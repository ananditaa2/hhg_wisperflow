import React from 'react';
import { Mic, MicOff, Sparkles, Terminal, Gamepad2, PlayCircle, Network, ExternalLink, HelpCircle } from 'lucide-react';
import { ActiveTab, TelemetryData } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isListening: boolean;
  onToggleMic: () => void;
  telemetry: TelemetryData;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isListening,
  onToggleMic,
  telemetry,
  onOpenGuide
}) => {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: 'rgba(8, 9, 13, 0.85)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand & Referral Attribution */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px -3px rgba(139, 92, 246, 0.6)'
          }}>
            <Sparkles size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                WISPR<span style={{ color: 'var(--accent-purple)' }}>VERSE</span>
              </h1>
              <span className="mono-badge" style={{ color: 'var(--accent-cyan)', borderColor: 'rgba(6,182,212,0.3)' }}>
                v1.0 • VOICE-OS
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>Verified Account via</span>
              <a 
                href="https://ref.wisprflow.ai/hhg" 
                target="_blank" 
                rel="noreferrer" 
                style={{ 
                  color: '#a78bfa', 
                  textDecoration: 'none', 
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                ref.wisprflow.ai/hhg <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>

        {/* 4 Pillars Tab Navigation */}
        <nav style={{
          display: 'flex',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '12px',
          padding: '4px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setActiveTab('cockpit')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'cockpit' ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.15))' : 'transparent',
              color: activeTab === 'cockpit' ? '#fff' : 'var(--text-secondary)',
              fontWeight: activeTab === 'cockpit' ? 600 : 400,
              cursor: 'pointer',
              borderBottom: activeTab === 'cockpit' ? '2px solid var(--accent-purple)' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <Terminal size={16} color={activeTab === 'cockpit' ? '#c4b5fd' : '#94a3b8'} />
            <span>1. Dev HUD (Tool)</span>
          </button>

          <button
            onClick={() => setActiveTab('game')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'game' ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(6, 182, 212, 0.15))' : 'transparent',
              color: activeTab === 'game' ? '#fff' : 'var(--text-secondary)',
              fontWeight: activeTab === 'game' ? 600 : 400,
              cursor: 'pointer',
              borderBottom: activeTab === 'game' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <Gamepad2 size={16} color={activeTab === 'game' ? '#67e8f9' : '#94a3b8'} />
            <span>2. Sonic Jump (Game)</span>
          </button>

          <button
            onClick={() => setActiveTab('automations')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'automations' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.15))' : 'transparent',
              color: activeTab === 'automations' ? '#fff' : 'var(--text-secondary)',
              fontWeight: activeTab === 'automations' ? 600 : 400,
              cursor: 'pointer',
              borderBottom: activeTab === 'automations' ? '2px solid var(--accent-green)' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <PlayCircle size={16} color={activeTab === 'automations' ? '#6ee7b7' : '#94a3b8'} />
            <span>3. Automations</span>
          </button>

          <button
            onClick={() => setActiveTab('canvas')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'canvas' ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(245, 158, 11, 0.15))' : 'transparent',
              color: activeTab === 'canvas' ? '#fff' : 'var(--text-secondary)',
              fontWeight: activeTab === 'canvas' ? 600 : 400,
              cursor: 'pointer',
              borderBottom: activeTab === 'canvas' ? '2px solid var(--accent-amber)' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <Network size={16} color={activeTab === 'canvas' ? '#fcd34d' : '#94a3b8'} />
            <span>4. Voice Canvas</span>
          </button>
        </nav>

        {/* Global Controls & Wispr Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Guide / Script Button */}
          <button
            onClick={onOpenGuide}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            title="Video Script & Wispr Flow Instructions"
          >
            <HelpCircle size={15} />
            <span>Demo Blueprint</span>
          </button>

          {/* Wispr Flow Capsule indicator */}
          <div className="wispr-capsule">
            <span className="pulse-dot" style={{ backgroundColor: isListening ? '#10b981' : '#64748b' }}></span>
            <span>{isListening ? `${telemetry.currentWpm} WPM Flow` : 'Wispr Flow Ready'}</span>
          </div>

          {/* Mic Toggle Button */}
          <button
            onClick={onToggleMic}
            className={isListening ? 'btn-primary' : 'btn-secondary'}
            style={{
              padding: '8px 16px',
              background: isListening ? 'linear-gradient(135deg, #10b981, #059669)' : undefined,
              borderColor: isListening ? '#10b981' : undefined
            }}
          >
            {isListening ? (
              <>
                <Mic size={16} />
                <span>Live Audio ON</span>
              </>
            ) : (
              <>
                <MicOff size={16} />
                <span>Start Audio</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
