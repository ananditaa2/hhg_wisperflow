import React, { useState, useRef } from 'react';
import { Network, Sparkles, Cpu, Layers, Terminal, Zap, Play, Plus, Move } from 'lucide-react';
import { ArchitectureNode } from '../types';

interface VoiceArchitectureCanvasProps {
  playTone: (freq?: number, type?: OscillatorType, duration?: number) => void;
  lastSpokenCommand?: string;
}

const INITIAL_NODES: ArchitectureNode[] = [
  {
    id: 'audio-input',
    title: 'Acoustic Ingestion',
    category: 'input',
    description: 'Raw microphone stream captured at 48kHz via Web Audio API.',
    x: 40,
    y: 150,
    connections: ['wispr-engine'],
    status: 'active'
  },
  {
    id: 'wispr-engine',
    title: 'Wispr Speech Engine',
    category: 'processing',
    description: 'Ultra-low latency whisper transcription, developer nomenclature & punctuation.',
    x: 260,
    y: 150,
    connections: ['intent-parser'],
    status: 'pulsing'
  },
  {
    id: 'intent-parser',
    title: 'Intent & AST Extractor',
    category: 'ai',
    description: 'Extracts engineering intent, arguments, file targets, and terminal actions.',
    x: 480,
    y: 70,
    connections: ['agent-orchestrator', 'terminal-runner'],
    status: 'active'
  },
  {
    id: 'agent-orchestrator',
    title: 'Multi-Agent Synthesizer',
    category: 'ai',
    description: 'Translates architectural intent into multi-file TypeScript components.',
    x: 700,
    y: 70,
    connections: ['execution-sandbox'],
    status: 'active'
  },
  {
    id: 'terminal-runner',
    title: 'Voice Shell Daemon',
    category: 'execution',
    description: 'Executes npm builds, git commits, and docker containers hands-free.',
    x: 480,
    y: 240,
    connections: ['execution-sandbox'],
    status: 'active'
  },
  {
    id: 'execution-sandbox',
    title: 'Vite 6 Sandbox',
    category: 'storage',
    description: 'Instant Hot Module Replacement (HMR) and real-time browser preview.',
    x: 700,
    y: 240,
    connections: [],
    status: 'active'
  }
];

export const VoiceArchitectureCanvas: React.FC<VoiceArchitectureCanvasProps> = ({ 
  playTone,
  lastSpokenCommand = ''
}) => {
  const [nodes, setNodes] = useState<ArchitectureNode[]>(INITIAL_NODES);
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode>(INITIAL_NODES[1]);
  const [isSimulatingPacket, setIsSimulatingPacket] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);

  // Dragging state
  const draggingNodeRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent, node: ArchitectureNode) => {
    setSelectedNode(node);
    playTone(480, 'sine', 0.08);

    draggingNodeRef.current = {
      id: node.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: node.x,
      origY: node.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeRef.current) return;
    const { id, startX, startY, origX, origY } = draggingNodeRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    setNodes(prev => prev.map(n => {
      if (n.id === id) {
        return {
          ...n,
          x: Math.max(10, Math.min(740, origX + dx)),
          y: Math.max(10, Math.min(300, origY + dy))
        };
      }
      return n;
    }));
  };

  const handleMouseUp = () => {
    draggingNodeRef.current = null;
  };

  const addCustomNode = (title: string, category: ArchitectureNode['category']) => {
    const id = `node-${Date.now()}`;
    const newNode: ArchitectureNode = {
      id,
      title,
      category,
      description: `Custom ${title} node spawned dynamically via voice / UI action.`,
      x: Math.floor(Math.random() * 300) + 350,
      y: Math.floor(Math.random() * 150) + 120,
      connections: ['execution-sandbox'],
      status: 'active'
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode);
    playTone(660, 'triangle', 0.15);
  };

  // Voice command detection for canvas
  React.useEffect(() => {
    if (!lastSpokenCommand) return;
    const lower = lastSpokenCommand.toLowerCase();
    if (lower.includes('cache') || lower.includes('redis')) {
      addCustomNode('Redis Cache Layer', 'storage');
    } else if (lower.includes('auth') || lower.includes('security')) {
      addCustomNode('JWT Auth Sentinel', 'ai');
    } else if (lower.includes('trace') || lower.includes('pipeline')) {
      triggerPacketFlow();
    }
  }, [lastSpokenCommand]);

  const triggerPacketFlow = () => {
    if (isSimulatingPacket) return;

    setIsSimulatingPacket(true);
    setActiveStep(0);
    playTone(440, 'sine', 0.1);

    const steps = [0, 1, 2, 3, 5];
    steps.forEach((stepIdx, i) => {
      setTimeout(() => {
        if (nodes[stepIdx]) {
          setActiveStep(stepIdx);
          setSelectedNode(nodes[stepIdx]);
        }
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

  const getNodeCenter = (nodeId: string) => {
    const n = nodes.find(item => item.id === nodeId);
    if (!n) return { x: 0, y: 0 };
    return { x: n.x + 65, y: n.y + 25 };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Header */}
      <div className="genz-card" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="genz-tag" style={{ backgroundColor: 'var(--accent-matcha)' }}>PILLAR 4</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              DYNAMIC ARCHITECTURE CANVAS
            </span>
          </div>
          <h2 className="serif-headline" style={{ fontSize: '2.2rem', marginBottom: '6px' }}>
            Voice-to-Architecture Canvas
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '750px', fontSize: '0.95rem' }}>
            Interactive node topology. Drag nodes freely across the infinite board, trace live data packets, or speak commands like <strong>&quot;Add Redis Cache&quot;</strong> to dynamically synthesize system architecture.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={() => addCustomNode('Redis Cache Layer', 'storage')} className="btn-brutal-white" style={{ fontSize: '0.85rem' }}>
            <Plus size={15} /> Add Redis Cache
          </button>
          <button onClick={triggerPacketFlow} disabled={isSimulatingPacket} className="btn-brutal-lilac" style={{ fontSize: '0.85rem' }}>
            <Play size={15} />
            <span>{isSimulatingPacket ? 'Tracing...' : 'Trace Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Main Split */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 3fr) minmax(320px, 1fr)',
        gap: '24px'
      }}>
        {/* Dynamic Draggable SVG Canvas */}
        <div
          className="genz-card"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            padding: '24px',
            position: 'relative',
            minHeight: '520px',
            overflow: 'hidden',
            backgroundColor: '#faf8f0',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Network size={18} color="#093c31" />
              <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>Dynamic Draggable Nodes</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              backgroundColor: '#ffffff',
              padding: '4px 10px',
              borderRadius: '999px',
              border: '1.5px solid var(--border-black)'
            }}>
              <Move size={13} />
              <span>Click & drag any node</span>
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '440px' }}>
            {/* Dynamic Connecting Lines */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {nodes.map(fromNode => {
                const p1 = getNodeCenter(fromNode.id);
                return fromNode.connections.map(targetId => {
                  const p2 = getNodeCenter(targetId);
                  if (p2.x === 0 && p2.y === 0) return null;
                  return (
                    <line
                      key={`${fromNode.id}-${targetId}`}
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="var(--border-black)"
                      strokeWidth="2.5"
                      strokeDasharray="6,6"
                      opacity="0.8"
                    />
                  );
                });
              })}
            </svg>

            {/* Render Nodes */}
            {nodes.map((node, index) => {
              const isSelected = selectedNode.id === node.id;
              const isStepActive = isSimulatingPacket && activeStep === index;

              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleMouseDown(e, node)}
                  style={{
                    position: 'absolute',
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: '145px',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    backgroundColor: isStepActive ? 'var(--accent-lilac)' : isSelected ? 'var(--accent-yellow)' : '#ffffff',
                    border: '2.5px solid var(--border-black)',
                    boxShadow: isSelected ? '4px 4px 0px var(--border-black)' : '2px 2px 0px var(--border-black)',
                    cursor: 'grab',
                    transition: draggingNodeRef.current?.id === node.id ? 'none' : 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                    zIndex: isSelected ? 20 : 10
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    {node.category === 'input' && <Sparkles size={14} color="#0284c7" />}
                    {node.category === 'processing' && <Zap size={14} color="#7c3aed" />}
                    {node.category === 'ai' && <Cpu size={14} color="#d97706" />}
                    {node.category === 'execution' && <Terminal size={14} color="#059669" />}
                    {node.category === 'storage' && <Layers size={14} color="#093c31" />}
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {node.title.split(' ')[0]}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.2', fontWeight: 600 }}>
                    {node.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Node Inspector */}
        <div className="genz-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="genz-tag" style={{ backgroundColor: 'var(--accent-lilac)' }}>NODE INSPECTOR</span>
          </div>

          <h3 className="serif-headline" style={{ fontSize: '1.6rem' }}>{selectedNode.title}</h3>

          <div style={{
            padding: '16px',
            backgroundColor: '#faf8f0',
            border: '2px solid var(--border-black)',
            boxShadow: '2px 2px 0px var(--border-black)',
            borderRadius: '12px',
            fontSize: '0.88rem',
            color: 'var(--text-main)',
            lineHeight: '1.6'
          }}>
            {selectedNode.description}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700 }}>Category:</span>
              <span className="genz-tag" style={{ backgroundColor: 'var(--accent-yellow)' }}>{selectedNode.category.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700 }}>Coordinates:</span>
              <span className="genz-tag" style={{ backgroundColor: '#f1f5f9' }}>X: {Math.round(selectedNode.x)}px, Y: {Math.round(selectedNode.y)}px</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700 }}>Latency:</span>
              <span style={{ color: '#059669', fontWeight: 800, fontSize: '0.88rem' }}>&lt; 85ms Flow Path</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
