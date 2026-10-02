import React from 'react';
import { Mic, MicOff, ExternalLink, ChevronRight, Activity, Gamepad2, PlayCircle, Network } from 'lucide-react';
import { ActiveTab, TelemetryData } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isListening: boolean;
  onToggleMic: () => void;
  telemetry: TelemetryData;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isListening,
  onToggleMic,
  telemetry
}) => {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 60 }}>
      {/* 1. Top Announcement Bar (Matches Screenshot) */}
      <div style={{
        backgroundColor: 'var(--bg-banner)',
        color: '#ffffff',
        padding: '9px 16px',
        textAlign: 'center',
        fontSize: '0.84rem',
        fontWeight: 500,
        letterSpacing: '0.01em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
      }}>
        <span>Wispr Flow Developer Suite is now active for Goa Hacker House.</span>
        <a
          href="https://ref.wisprflow.ai/hhg"
          target="_blank"
          rel="noreferrer"
          style={{
            color: '#ffffff',
            fontWeight: 600,
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            display: 'inline-flex',
            alignItems: 'center',
            marginLeft: '4px'
          }}
        >
          Verify referral: ref.wisprflow.ai/hhg <ChevronRight size={14} />
        </a>
      </div>

      {/* 2. Floating Navbar (Matches Screenshot) */}
      <div style={{ padding: '12px 20px', backgroundColor: 'rgba(250, 248, 240, 0.95)', backdropFilter: 'blur(10px)' }}>
        <header style={{
          maxWidth: '1280px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 2px 14px -2px rgba(0, 0, 0, 0.04)',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Logo (Wispr Waveform + Flow) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5px', height: '18px' }}>
              <div style={{ width: '3px', height: '10px', backgroundColor: '#111827', borderRadius: '2px' }} />
              <div style={{ width: '3px', height: '18px', backgroundColor: '#111827', borderRadius: '2px' }} />
              <div style={{ width: '3px', height: '14px', backgroundColor: '#111827', borderRadius: '2px' }} />
              <div style={{ width: '3px', height: '8px', backgroundColor: '#111827', borderRadius: '2px' }} />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em' }}>
              Flow
            </span>
            <span className="mono-tag" style={{ marginLeft: '4px', fontSize: '0.7rem' }}>
              DEV-EDITION
            </span>
          </div>

          {/* Center Pill Switcher (Matches [ Dictation | Notetaker ] style) */}
          <nav style={{
            display: 'flex',
            backgroundColor: '#ece8db',
            borderRadius: '9999px',
            padding: '4px',
            gap: '2px'
          }}>
            <button
              onClick={() => setActiveTab('cockpit')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: activeTab === 'cockpit' ? '#ffffff' : 'transparent',
                color: activeTab === 'cockpit' ? '#111827' : '#6b7280',
                fontWeight: activeTab === 'cockpit' ? 600 : 500,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'cockpit' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Activity size={14} />
              <span>Dev HUD</span>
            </button>

            <button
              onClick={() => setActiveTab('game')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: activeTab === 'game' ? '#ffffff' : 'transparent',
                color: activeTab === 'game' ? '#111827' : '#6b7280',
                fontWeight: activeTab === 'game' ? 600 : 500,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'game' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Gamepad2 size={14} />
              <span>Sonic Game</span>
            </button>

            <button
              onClick={() => setActiveTab('automations')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: activeTab === 'automations' ? '#ffffff' : 'transparent',
                color: activeTab === 'automations' ? '#111827' : '#6b7280',
                fontWeight: activeTab === 'automations' ? 600 : 500,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'automations' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <PlayCircle size={14} />
              <span>Automations</span>
            </button>

            <button
              onClick={() => setActiveTab('canvas')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: activeTab === 'canvas' ? '#ffffff' : 'transparent',
                color: activeTab === 'canvas' ? '#111827' : '#6b7280',
                fontWeight: activeTab === 'canvas' ? 600 : 500,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'canvas' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Network size={14} />
              <span>Architecture</span>
            </button>
          </nav>

          {/* Right Action: Lilac Button (Matches Screenshot [Get started on Windows]) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Status indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#6b7280' }}>
              <div style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isListening ? '#10b981' : '#9ca3af'
              }} />
              <span>{isListening ? `${telemetry.currentWpm} WPM Flow` : 'Ready'}</span>
            </div>

            {/* Signature Lilac CTA Button */}
            <button
              onClick={onToggleMic}
              className="btn-wispr-lilac"
              style={{
                backgroundColor: isListening ? '#bbf7d0' : 'var(--accent-lilac)'
              }}
            >
              {isListening ? <Mic size={15} /> : <MicOff size={15} />}
              <span>{isListening ? 'Mute Microphone' : 'Start Voice Input'}</span>
            </button>
          </div>
        </header>
      </div>
    </div>
  );
};
