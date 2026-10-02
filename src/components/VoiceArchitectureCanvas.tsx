import React, { useState } from 'react';
import { Network, Sparkles, Cpu, Layers, Terminal, Zap, Play } from 'lucide-react';
import { ArchitectureNode } from '../types';

interface VoiceArchitectureCanvasProps {
  playTone: (freq?: number, type?: OscillatorType, duration?: number) => void;
}

const NODES_DATA: ArchitectureNode[] = [
  {
    id: 'audio-input',
    title: 'Acoustic Audio Ingestion',
    category: 'input',
    description: 'Raw microphone stream captured at 48kHz via Web Audio API.',
    x: 60,
    y: 170,
    connections: ['wispr-engine'],
    status: 'active'
  },
  {
    id: 'wispr-engine',
    title: 'Wispr Flow Speech Engine',
    category: 'processing',
    description: 'Ultra-low latency whisper transcription, developer nomenclature & punctuation.',
    x: 290,
    y: 170,
    connections: ['intent-parser'],
    status: 'pulsing'
  },
  {
    id: 'intent-parser',
    title: 'Intent & AST Extractor',
    category: 'ai',
    description: 'Extracts engineering intent, arguments, file targets, and terminal actions.',
    x: 520,
    y: 90,
    connections: ['agent-orchestrator', 'terminal-runner'],
    status: 'active'
  },
  {
    id: 'agent-orchestrator',
    title: 'Multi-Agent Synthesizer',
    category: 'ai',
    description: 'Translates architectural intent into multi-file TypeScript components.',
    x: 750,
    y: 90,
    connections: ['execution-sandbox'],
    status: 'active'
  },
  {
    id: 'terminal-runner',
    title: 'Voice-Driven Shell Daemon',
    category: 'execution',
    description: 'Executes npm builds, git commits, and docker containers hands-free.',
    x: 520,
    y: 260,
    connections: ['execution-sandbox'],
    status: 'active'
  },
  {
    id: 'execution-sandbox',
    title: 'Vite 6 Live Application Sandbox',
    category: 'storage',
    description: 'Instant Hot Module Replacement (HMR) and real-time browser preview.',
    x: 750,
    y: 260,
    connections: [],
    status: 'active'
  }
];

export const VoiceArchitectureCanvas: React.FC<VoiceArchitectureCanvasProps> = ({ playTone }) => {
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode>(NODES_DATA[1]);
  const [isSimulatingPacket, setIsSimulatingPacket] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);

  const triggerPacketFlow = () => {
    if (isSimulatingPacket) return;

    setIsSimulatingPacket(true);
    setActiveStep(0);
    playTone(440, 'sine', 0.1);

    const steps = [0, 1, 2, 3, 5];
    steps.forEach((stepIdx, i) => {
      setTimeout(() => {
        setActiveStep(stepIdx);
        setSelectedNode(NODES_DATA[stepIdx]);
        playTone(500 + i * 90, 'triangle', 0.1);
        if (i === steps.length - 1) {
          setTimeout(() => {
            setIsSimulatingPacket(false);
            playTone(880, 'sine', 0.2);
          }, 600);
        }
      }, i * 650);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="wispr-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="eyebrow-text" style={{ marginBottom: '8px' }}>
            PILLAR 4: EXPERIMENT & ARCHITECTURE
          </div>
          <h2 className="serif-headline" style={{ fontSize: '2rem', marginBottom: '6px' }}>
            Voice-to-Architecture Canvas
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '620px', fontSize: '0.95rem' }}>
            Visualizes the data pathway from spoken acoustic vibrations into synthesized software code. Click any node or trace a live voice packet transmission.
          </p>
        </div>

        <button onClick={triggerPacketFlow} disabled={isSimulatingPacket} className="btn-wispr-lilac">
          <Play size={15} />
          <span>{isSimulatingPacket ? 'Propagating Packet...' : 'Trace Voice Pipeline'}</span>
        </button>
      </div>

      {/* Main Split */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
        gap: '20px'
      }}>
        {/* SVG Node Graph */}
        <div className="wispr-card" style={{ padding: '20px', position: 'relative', minHeight: '420px', overflowX: 'auto', backgroundColor: '#faf8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Network size={16} color="#093c31" />
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Neural-Acoustic Topology</h3>
            </div>
            <span className="mono-tag">6 NODES • ACTIVE</span>
          </div>

          <div style={{ position: 'relative', width: '840px', height: '340px', margin: '0 auto' }}>
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <line x1="140" y1="190" x2="290" y2="190" stroke="#093c31" strokeWidth="2" strokeDasharray="4,4" />
              <line x1="390" y1="170" x2="520" y2="110" stroke="#093c31" strokeWidth="2" />
              <line x1="390" y1="200" x2="520" y2="270" stroke="#093c31" strokeWidth="2" />
              <line x1="620" y1="110" x2="750" y2="110" stroke="#093c31" strokeWidth="2" />
              <line x1="620" y1="280" x2="750" y2="280" stroke="#093c31" strokeWidth="2" />
              <line x1="800" y1="130" x2="800" y2="240" stroke="#093c31" strokeWidth="2" />
            </svg>

            {NODES_DATA.map((node, index) => {
              const isSelected = selectedNode.id === node.id;
              const isStepActive = isSimulatingPacket && activeStep === index;

              return (
                <div
                  key={node.id}
                  onClick={() => {
                    setSelectedNode(node);
                    playTone(480, 'sine', 0.08);
                  }}
                  style={{
                    position: 'absolute',
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: '135px',
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: isStepActive 
                      ? '#ecdffc' 
                      : isSelected 
                      ? '#ffffff' 
                      : '#ffffff',
                    border: `1.5px solid ${isStepActive ? 'var(--border-dark)' : isSelected ? 'var(--border-dark)' : '#eae6db'}`,
                    boxShadow: (isStepActive || isSelected) ? '0 4px 14px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    zIndex: 10
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    {node.category === 'input' && <Sparkles size={14} color="#0284c7" />}
                    {node.category === 'processing' && <Zap size={14} color="#7c3aed" />}
                    {node.category === 'ai' && <Cpu size={14} color="#d97706" />}
                    {node.category === 'execution' && <Terminal size={14} color="#059669" />}
                    {node.category === 'storage' && <Layers size={14} color="#093c31" />}
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#111827' }}>
                      {node.title.split(' ')[0]}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                    {node.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Node Inspector */}
        <div className="wispr-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="mono-tag">NODE INSPECTOR</span>
          </div>

          <h3 className="serif-headline" style={{ fontSize: '1.4rem' }}>{selectedNode.title}</h3>

          <div style={{
            padding: '14px',
            backgroundColor: '#faf8f0',
            border: '1px solid #eae6db',
            borderRadius: '10px',
            fontSize: '0.86rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.5'
          }}>
            {selectedNode.description}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Category:</span>
              <span className="mono-tag">{selectedNode.category.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Throughput:</span>
              <span style={{ color: '#059669', fontWeight: 600 }}>&lt; 85ms Latency</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status:</span>
              <span style={{ color: '#093c31', fontWeight: 600 }}>Streaming Web Audio</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
