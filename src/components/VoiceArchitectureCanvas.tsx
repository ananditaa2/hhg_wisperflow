import React, { useState, useEffect, useRef } from 'react';
import { Network, Sparkles, Cpu, Layers, HardDrive, Terminal, Zap, Play } from 'lucide-react';
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
    x: 80,
    y: 180,
    connections: ['wispr-engine'],
    status: 'active'
  },
  {
    id: 'wispr-engine',
    title: 'Wispr Flow Speech Engine',
    category: 'processing',
    description: 'Ultra-low latency whisper transcription, developer nomenclature & punctuation.',
    x: 320,
    y: 180,
    connections: ['intent-parser'],
    status: 'pulsing'
  },
  {
    id: 'intent-parser',
    title: 'Intent & AST Extractor',
    category: 'ai',
    description: 'Extracts engineering intent, arguments, file targets, and terminal actions.',
    x: 560,
    y: 100,
    connections: ['agent-orchestrator', 'terminal-runner'],
    status: 'active'
  },
  {
    id: 'agent-orchestrator',
    title: 'Multi-Agent Code Synthesizer',
    category: 'ai',
    description: 'Translates architectural intent into multi-file TypeScript components.',
    x: 800,
    y: 100,
    connections: ['execution-sandbox'],
    status: 'active'
  },
  {
    id: 'terminal-runner',
    title: 'Voice-Driven Shell Daemon',
    category: 'execution',
    description: 'Executes npm builds, git commits, and docker containers hands-free.',
    x: 560,
    y: 280,
    connections: ['execution-sandbox'],
    status: 'active'
  },
  {
    id: 'execution-sandbox',
    title: 'Vite 6 Live Application Sandbox',
    category: 'storage',
    description: 'Instant Hot Module Replacement (HMR) and real-time browser preview.',
    x: 800,
    y: 280,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Pillar Banner */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span className="mono-badge" style={{ color: 'var(--accent-amber)', borderColor: 'rgba(245,158,11,0.3)' }}>
              PILLAR 4: EXPERIMENT & RESEARCH
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Interactive System Topology</span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }} className="gradient-text">
            Voice-to-Architecture Canvas
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', fontSize: '0.95rem' }}>
            Visualizes the data pathway from spoken acoustic vibrations into synthesized software code. Click any node or simulate a live data packet transmission.
          </p>
        </div>

        <button onClick={triggerPacketFlow} disabled={isSimulatingPacket} className="btn-primary">
          <Play size={16} />
          <span>{isSimulatingPacket ? 'Propagating Voice Packet...' : 'Trace Voice Pipeline'}</span>
        </button>
      </div>

      {/* Main Canvas & Details Split */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)',
        gap: '20px'
      }}>
        {/* SVG Node Graph Canvas */}
        <div className="glass-panel-glow" style={{ padding: '20px', position: 'relative', minHeight: '440px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Network size={18} color="var(--accent-amber)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Interactive Neural-Acoustic Topology</h3>
            </div>
            <span className="mono-badge">6 NODES • 60 FPS</span>
          </div>

          <div style={{ position: 'relative', width: '920px', height: '360px', margin: '0 auto' }}>
            {/* SVG Connecting Lines */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Ingest to Wispr */}
              <line x1="160" y1="200" x2="320" y2="200" stroke="url(#lineGrad)" strokeWidth="2.5" strokeDasharray="5,5" />
              {/* Wispr to Intent */}
              <line x1="420" y1="180" x2="560" y2="120" stroke="url(#lineGrad)" strokeWidth="2.5" />
              {/* Wispr to Shell */}
              <line x1="420" y1="210" x2="560" y2="280" stroke="url(#lineGrad)" strokeWidth="2.5" />
              {/* Intent to Agent */}
              <line x1="680" y1="120" x2="800" y2="120" stroke="url(#lineGrad)" strokeWidth="2.5" />
              {/* Shell to Sandbox */}
              <line x1="680" y1="290" x2="800" y2="290" stroke="url(#lineGrad)" strokeWidth="2.5" />
              {/* Agent to Sandbox */}
              <line x1="860" y1="140" x2="860" y2="260" stroke="url(#lineGrad)" strokeWidth="2.5" />
            </svg>

            {/* Render Nodes */}
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
                    width: '140px',
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: isStepActive 
                      ? 'rgba(245,158,11,0.25)' 
                      : isSelected 
                      ? 'rgba(139,92,246,0.25)' 
                      : 'rgba(18,20,29,0.85)',
                    border: `1.5px solid ${isStepActive ? 'var(--accent-amber)' : isSelected ? 'var(--accent-purple)' : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: (isStepActive || isSelected) ? '0 0 20px -3px rgba(139,92,246,0.5)' : undefined,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    zIndex: 10
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    {node.category === 'input' && <Sparkles size={16} color="var(--accent-cyan)" />}
                    {node.category === 'processing' && <Zap size={16} color="var(--accent-purple)" />}
                    {node.category === 'ai' && <Cpu size={16} color="var(--accent-amber)" />}
                    {node.category === 'execution' && <Terminal size={16} color="var(--accent-green)" />}
                    {node.category === 'storage' && <Layers size={16} color="#38bdf8" />}
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f1f5f9' }}>
                      {node.title.split(' ')[0]}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                    {node.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Node Inspector Panel */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="mono-badge" style={{ color: 'var(--accent-purple)' }}>NODE INSPECTOR</span>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedNode.title}</h3>

          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.5'
          }}>
            {selectedNode.description}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Category:</span>
              <span className="mono-badge">{selectedNode.category.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Throughput:</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>&lt; 85ms Latency</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Data State:</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Streaming FFT Buffer</span>
            </div>
          </div>

          <div style={{
            marginTop: 'auto',
            padding: '12px',
            backgroundColor: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#fef3c7'
          }}>
            💡 <strong>Why this matters:</strong> Traditional keyboard coding communicates through keystroke buffers. Wispr Flow bypasses that, sending dense semantic intent directly into the orchestrator.
          </div>
        </div>
      </div>
    </div>
  );
};
