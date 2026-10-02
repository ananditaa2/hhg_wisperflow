import React, { useState } from 'react';
import { Header } from './components/Header';
import { DevCockpit } from './components/DevCockpit';
import { VoiceGame } from './components/VoiceGame';
import { WorkflowAutomations } from './components/WorkflowAutomations';
import { VoiceArchitectureCanvas } from './components/VoiceArchitectureCanvas';
import { WisprModal } from './components/WisprModal';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import { ActiveTab } from './types';
import { Sparkles, ExternalLink, Heart } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('cockpit');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  const {
    isActive,
    volume,
    telemetry,
    frequencyDataRef,
    startListening,
    stopListening,
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
        onOpenGuide={() => setIsGuideOpen(true)}
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

      {/* Video & Submission Guide Modal */}
      <WisprModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'rgba(8, 9, 13, 0.9)',
        padding: '20px 24px',
        marginTop: '40px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--accent-purple)" />
            <span>Built 100% using voice with</span>
            <a
              href="https://ref.wisprflow.ai/hhg"
              target="_blank"
              rel="noreferrer"
              style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}
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
