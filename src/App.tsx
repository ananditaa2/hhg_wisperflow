import React, { useState } from 'react';
import { Header } from './components/Header';
import { DevCockpit } from './components/DevCockpit';
import { VoiceGame } from './components/VoiceGame';
import { WorkflowAutomations } from './components/WorkflowAutomations';
import { VoiceArchitectureCanvas } from './components/VoiceArchitectureCanvas';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import { ActiveTab } from './types';
import { Sparkles, ExternalLink, Heart } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('cockpit');

  const {
    isActive,
    volume,
    telemetry,
    frequencyDataRef,
    startListening,
    stopListening,
    injectSpeechInput,
    playTone
  } = useAudioAnalyzer();

  const handleToggleMic = () => {
    if (isActive) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isListening={isActive}
        onToggleMic={handleToggleMic}
        telemetry={telemetry}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '24px 20px' }}>
        {activeTab === 'cockpit' && (
          <DevCockpit
            isListening={isActive}
            telemetry={telemetry}
            frequencyDataRef={frequencyDataRef}
            volume={volume}
            onStartMic={startListening}
            onInjectSpeech={injectSpeechInput}
          />
        )}

        {activeTab === 'game' && (
          <VoiceGame
            isListening={isActive}
            volume={volume}
            onStartMic={startListening}
            playTone={playTone}
          />
        )}

        {activeTab === 'automations' && (
          <WorkflowAutomations playTone={playTone} />
        )}

        {activeTab === 'canvas' && (
          <VoiceArchitectureCanvas playTone={playTone} />
        )}
      </main>

      {/* Floating Lilac Wispr Capsule Widget (Matches Screenshot Bottom-Left) */}
      <div
        className="floating-wispr-capsule"
        onClick={handleToggleMic}
        title={isActive ? 'Microphone Active (Click to mute)' : 'Click to start Wispr Voice Input'}
        style={{
          backgroundColor: isActive ? '#bbf7d0' : 'var(--accent-lilac)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <div style={{ width: '2.5px', height: isActive ? '14px' : '10px', backgroundColor: '#111827', borderRadius: '1px', transition: 'height 0.2s' }} />
          <div style={{ width: '2.5px', height: isActive ? '22px' : '16px', backgroundColor: '#111827', borderRadius: '1px', transition: 'height 0.2s' }} />
          <div style={{ width: '2.5px', height: isActive ? '18px' : '12px', backgroundColor: '#111827', borderRadius: '1px', transition: 'height 0.2s' }} />
          <div style={{ width: '2.5px', height: isActive ? '10px' : '6px', backgroundColor: '#111827', borderRadius: '1px', transition: 'height 0.2s' }} />
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #eae6db',
        backgroundColor: '#f5f2e8',
        padding: '24px 20px',
        marginTop: '60px'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Built 100% using voice with</span>
            <a
              href="https://ref.wisprflow.ai/hhg"
              target="_blank"
              rel="noreferrer"
              style={{ color: '#093c31', textDecoration: 'none', fontWeight: 700 }}
            >
              Wispr Flow (ref.wisprflow.ai/hhg)
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Engineered for the Wispr Goa Hacker House 🌴</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
