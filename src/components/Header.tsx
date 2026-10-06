import React from 'react';
import { Activity, AudioLines, Gamepad2, Mic, MicOff, Sparkles, Workflow } from 'lucide-react';
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
  const navigation = [
    { id: 'game' as const, label: 'Arcade', detail: 'Scream Runner', icon: Gamepad2, className: 'nav-arcade' },
    { id: 'cockpit' as const, label: 'Studio', detail: 'Voice → Code', icon: Activity, className: 'nav-studio' },
    { id: 'automations' as const, label: 'Triggers', detail: 'Speak → Action', icon: Workflow, className: 'nav-triggers' },
    { id: 'canvas' as const, label: 'Pitch', detail: 'Tune anything', icon: AudioLines, className: 'nav-pitch' }
  ];

  return (
    <div className="site-shell">
      <div className="topline">
        <span><Sparkles size={13} /> IDEAS IN. THINGS OUT.</span>
        <span className="topline-note">A voice-first creative lab</span>
      </div>
      <header className="site-header">
        <div className="brand-lockup" aria-label="YapLab home">
          <span className="brand-symbol"><AudioLines size={22} strokeWidth={2.5} /></span>
          <span className="brand-copy">
            <span className="brand-name">YapLab<span>.</span></span>
            <span className="brand-descriptor">VOICE-FIRST CREATIVE LAB</span>
          </span>
        </div>

        <nav className="site-navigation" aria-label="Main features">
          {navigation.map(({ id, label, detail, icon: Icon, className }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`nav-tab ${className}${activeTab === id ? ' is-active' : ''}`}
              aria-current={activeTab === id ? 'page' : undefined}
            >
              <Icon size={17} strokeWidth={2.2} />
              <span className="nav-tab-copy">
                <span className="nav-tab-title">{label}</span>
                <span className="nav-tab-detail">{detail}</span>
              </span>
            </button>
          ))}
        </nav>

        <button onClick={onToggleMic} className={`mic-control${isListening ? ' is-live' : ''}`}>
          {isListening ? <Mic size={17} /> : <MicOff size={17} />}
          <span>{isListening ? `${telemetry.currentWpm || 165} WPM` : 'Mic off'}</span>
          <span className="mic-state-dot" />
        </button>
      </header>
    </div>
  );
};
