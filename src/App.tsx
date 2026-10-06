import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { DevCockpit } from './components/DevCockpit';
import { VoiceGame } from './components/VoiceGame';
import { VoiceTriggers } from './components/VoiceTriggers';
import { AudioSpectrum } from './components/AudioSpectrum';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { ActiveTab } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('game');

  const {
    isActive,
    volume,
    telemetry,
    frequencyDataRef,
    timeDomainDataRef,
    sampleRate,
    startListening,
    stopListening,
    injectSpeechInput,
    playTone
  } = useAudioAnalyzer();

  const handleSpeechCommand = useCallback((cmd: string) => {
    injectSpeechInput(cmd);
  }, [injectSpeechInput]);

  const speech = useSpeechRecognition(handleSpeechCommand);

  const handleToggleMic = () => {
    if (isActive) {
      stopListening();
      speech.stopListening();
    } else {
      startListening();
      speech.startListening();
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
      <main className="full-screen-container" style={{ flex: 1 }}>
        {activeTab === 'cockpit' && (
          <DevCockpit
            isListening={isActive}
            telemetry={telemetry}
            frequencyDataRef={frequencyDataRef}
            volume={volume}
            onStartMic={handleToggleMic}
            onInjectSpeech={injectSpeechInput}
            liveTranscript={speech.transcript}
            interimTranscript={speech.interimTranscript}
            lastSpokenCommand={speech.lastCommand}
            onClearTranscript={speech.resetTranscript}
          />
        )}

        {activeTab === 'game' && (
          <VoiceGame
            isListening={isActive}
            volume={volume}
            onStartMic={handleToggleMic}
            playTone={playTone}
            lastSpokenCommand={speech.lastCommand}
          />
        )}

        {activeTab === 'automations' && (
          <VoiceTriggers
            playTone={playTone}
            lastSpokenCommand={speech.lastCommand}
            liveTranscript={speech.transcript}
            interimTranscript={speech.interimTranscript}
            isListening={isActive}
            isSpeechSupported={speech.isSupported}
            onStartMic={handleToggleMic}
          />
        )}

        {activeTab === 'canvas' && (
          <AudioSpectrum
            frequencyDataRef={frequencyDataRef}
            timeDomainDataRef={timeDomainDataRef}
            sampleRate={sampleRate}
            volume={volume}
            isListening={isActive}
            onStartMic={handleToggleMic}
          />
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
        borderTop: '2.5px solid var(--border-black)',
        backgroundColor: '#ffffff',
        padding: '24px 32px',
        marginTop: '60px'
      }}>
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.88rem',
          color: 'var(--text-main)',
          fontWeight: 600
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span className="genz-tag" style={{ backgroundColor: 'var(--accent-matcha)' }}>100% VOICE CODED</span>
            <span>Voice-driven tools, made for play.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="genz-tag" style={{ backgroundColor: 'var(--accent-peach)' }}>GOA HACKER HOUSE 🌴</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
