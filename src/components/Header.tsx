import React from 'react';
import { Mic, MicOff, Activity, Zap, PlayCircle, Network, ExternalLink } from 'lucide-react';
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
    <div style={{ position: 'sticky', top: 0, zIndex: 60, width: '100%' }}>
      {/* 1. Gen Z Marquee Top Banner */}
      <div className="marquee-container">
        <div className="marquee-content">
          <span>⚡ WISPR FLOW × GOA HACKER HOUSE 2026 • FROM YAPS TO APPS • KEYBOARDS ARE OFFICIALLY OBSOLETE • 3.8x DEV VELOCITY • REGISTERED VIA REF.WISPRFLOW.AI/HHG • 100% VOICE CODING SPEEDRUN •&nbsp;</span>
          <span>⚡ WISPR FLOW × GOA HACKER HOUSE 2026 • FROM YAPS TO APPS • KEYBOARDS ARE OFFICIALLY OBSOLETE • 3.8x DEV VELOCITY • REGISTERED VIA REF.WISPRFLOW.AI/HHG • 100% VOICE CODING SPEEDRUN •&nbsp;</span>
        </div>
      </div>

      {/* 2. Full-Width Navbar Container */}
      <div style={{ padding: '12px 24px', backgroundColor: 'rgba(250, 247, 238, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '2px solid var(--border-black)' }}>
        <header style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Brand Logo & Tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '22px' }}>
              <div style={{ width: '4px', height: '12px', backgroundColor: '#18181b', borderRadius: '2px' }} />
              <div style={{ width: '4px', height: '22px', backgroundColor: '#18181b', borderRadius: '2px' }} />
              <div style={{ width: '4px', height: '16px', backgroundColor: '#18181b', borderRadius: '2px' }} />
              <div style={{ width: '4px', height: '9px', backgroundColor: '#18181b', borderRadius: '2px' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#18181b', letterSpacing: '-0.04em' }}>
                Flow
              </span>
              <span className="serif-italic" style={{ fontSize: '1.1rem', color: '#093c31', fontWeight: 600 }}>
                studio
              </span>
            </div>
          </div>

          {/* 4 Pillars Navigation Pills */}
          <nav style={{
            display: 'flex',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '4px',
            gap: '4px',
            border: '2px solid var(--border-black)',
            boxShadow: '3px 3px 0px var(--border-black)'
          }}>
            <button
              onClick={() => setActiveTab('game')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'game' ? 'var(--accent-matcha)' : 'transparent',
                color: '#18181b',
                fontWeight: activeTab === 'game' ? 900 : 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.1s ease'
              }}
            >
              <Zap size={15} />
              <span>🎮 Voice Arcade 🕹️</span>
            </button>

            <button
              onClick={() => setActiveTab('cockpit')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'cockpit' ? 'var(--accent-lilac)' : 'transparent',
                color: '#18181b',
                fontWeight: activeTab === 'cockpit' ? 800 : 600,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.1s ease'
              }}
            >
              <Activity size={15} />
              <span>Voice Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('automations')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'automations' ? 'var(--accent-cyan)' : 'transparent',
                color: '#18181b',
                fontWeight: activeTab === 'automations' ? 800 : 600,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.1s ease'
              }}
            >
              <PlayCircle size={15} />
              <span>Voice Triggers</span>
            </button>

            <button
              onClick={() => setActiveTab('canvas')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'canvas' ? 'var(--accent-peach)' : 'transparent',
                color: '#18181b',
                fontWeight: activeTab === 'canvas' ? 800 : 600,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.1s ease'
              }}
            >
              <Network size={15} />
              <span>Audio Spectrum</span>
            </button>
          </nav>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a
              href="https://ref.wisprflow.ai/hhg"
              target="_blank"
              rel="noreferrer"
              className="genz-tag tag-cyan"
              style={{ textDecoration: 'none' }}
            >
              <span>ref.wisprflow.ai/hhg</span>
              <ExternalLink size={11} />
            </a>

            <button
              onClick={onToggleMic}
              className="btn-brutal-lilac"
              style={{
                backgroundColor: isListening ? 'var(--accent-matcha)' : 'var(--accent-lilac)'
              }}
            >
              {isListening ? <Mic size={16} /> : <MicOff size={16} />}
              <span>{isListening ? `${telemetry.currentWpm || 165} WPM Active` : 'Start Voice Input'}</span>
            </button>
          </div>
        </header>
      </div>
    </div>
  );
};
