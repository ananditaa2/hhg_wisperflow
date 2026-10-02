import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Shield, ShieldAlert, Sparkles, Trophy, RotateCcw, Volume2, Mic, Zap } from 'lucide-react';
import { CyberThreat } from '../types';

interface VoiceGameProps {
  isListening: boolean;
  volume: number;
  onStartMic: () => void;
  playTone: (freq?: number, type?: OscillatorType, duration?: number) => void;
  lastSpokenCommand?: string;
}

const THREAT_LIBRARY = [
  { name: 'DDoS Flood', voiceCounter: 'firewall', aliases: ['firewall', 'block', 'wall'], color: '#e11d48', icon: '🌐' },
  { name: 'SQL Injection', voiceCounter: 'sanitize', aliases: ['sanitize', 'escape', 'clean'], color: '#d97706', icon: '💉' },
  { name: 'Memory Leak', voiceCounter: 'purge', aliases: ['purge', 'kill', 'leak'], color: '#7c3aed', icon: '⚡' },
  { name: 'Expired Token', voiceCounter: 'revoke', aliases: ['revoke', 'refresh', 'token'], color: '#0284c7', icon: '🔑' },
  { name: 'Null Pointer', voiceCounter: 'patch', aliases: ['patch', 'null', 'fix'], color: '#059669', icon: '🐛' }
];

export const VoiceGame: React.FC<VoiceGameProps> = ({
  isListening,
  volume,
  onStartMic,
  playTone,
  lastSpokenCommand = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('wispr_blitz_high') || 0);
  });
  const [serverHealth, setServerHealth] = useState<number>(100);
  const [wave, setWave] = useState<number>(1);
  const [recentNeutralized, setRecentNeutralized] = useState<string | null>(null);

  const threatsRef = useRef<CyberThreat[]>([]);
  const frameCountRef = useRef<number>(0);
  const animIdRef = useRef<number | null>(null);

  // Attack neutralizer function
  const neutralizeThreat = useCallback((triggerWord: string) => {
    if (gameState !== 'playing') return;

    const lower = triggerWord.toLowerCase().trim();
    const index = threatsRef.current.findIndex(t => 
      t.voiceCounter.toLowerCase() === lower || 
      t.aliases.some(a => lower.includes(a))
    );

    if (index !== -1) {
      const eliminated = threatsRef.current[index];
      threatsRef.current.splice(index, 1);
      setScore(s => {
        const next = s + 25;
        if (next % 100 === 0) {
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
          setWave(w => w + 1);
        }
        return next;
      });
      setRecentNeutralized(`Eliminated ${eliminated.name} via "${triggerWord}"!`);
      playTone(720, 'triangle', 0.12);
      setTimeout(() => setRecentNeutralized(null), 1800);
    }
  }, [gameState, playTone]);

  // Listen for speech commands from props
  useEffect(() => {
    if (lastSpokenCommand && gameState === 'playing') {
      neutralizeThreat(lastSpokenCommand);
    }
  }, [lastSpokenCommand, gameState, neutralizeThreat]);

  const startGame = () => {
    if (!isListening) {
      onStartMic();
    }
    threatsRef.current = [];
    frameCountRef.current = 0;
    setScore(0);
    setServerHealth(100);
    setWave(1);
    setGameState('playing');
    playTone(550, 'sine', 0.2);
  };

  // Main Canvas Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const serverY = canvas.height - 50;

    const loop = () => {
      frameCountRef.current += 1;

      // Spawn threats based on wave difficulty
      const spawnRate = Math.max(60, 120 - wave * 10);
      if (frameCountRef.current % spawnRate === 0) {
        const threatDef = THREAT_LIBRARY[Math.floor(Math.random() * THREAT_LIBRARY.length)];
        threatsRef.current.push({
          id: Math.random().toString(),
          name: threatDef.name,
          voiceCounter: threatDef.voiceCounter,
          aliases: threatDef.aliases,
          x: Math.random() * (canvas.width - 160) + 80,
          y: -20,
          speed: 1.2 + wave * 0.25,
          color: threatDef.color,
          icon: threatDef.icon
        });
      }

      // Update threats
      for (let i = threatsRef.current.length - 1; i >= 0; i--) {
        const threat = threatsRef.current[i];
        threat.y += threat.speed;

        // Check if hit server core
        if (threat.y >= serverY - 30) {
          threatsRef.current.splice(i, 1);
          playTone(220, 'sawtooth', 0.25);
          setServerHealth(hp => {
            const newHp = Math.max(0, hp - 20);
            if (newHp <= 0) {
              setGameState('gameover');
              setHighScore(prev => {
                const nextHigh = Math.max(prev, score);
                localStorage.setItem('wispr_blitz_high', String(nextHigh));
                return nextHigh;
              });
            }
            return newHp;
          });
        }
      }

      // Render Warm Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = '#faf8f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle network grid lines
      ctx.strokeStyle = '#eae6db';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Server Core at bottom
      ctx.fillStyle = '#093c31';
      ctx.beginPath();
      ctx.roundRect(canvas.width / 2 - 120, serverY, 240, 42, 10);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Plus Jakarta Sans';
      ctx.textAlign = 'center';
      ctx.fillText('🛡️ PRODUCTION CLUSTER CORE', canvas.width / 2, serverY + 26);

      // Draw descending threats
      threatsRef.current.forEach(threat => {
        ctx.save();
        ctx.translate(threat.x, threat.y);

        // Threat card
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = threat.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-65, -18, 130, 36, 8);
        ctx.fill();
        ctx.stroke();

        // Threat title
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 11px Plus Jakarta Sans';
        ctx.textAlign = 'center';
        ctx.fillText(`${threat.icon} ${threat.name}`, 0, -2);

        // Spoken counter badge
        ctx.fillStyle = threat.color;
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.fillText(`Say: "${threat.voiceCounter}"`, 0, 11);

        ctx.restore();
      });

      animIdRef.current = requestAnimationFrame(loop);
    };

    animIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [gameState, score, wave, playTone]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="wispr-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="eyebrow-text" style={{ marginBottom: '8px' }}>
            PILLAR 2: VOICE CYBER DEFENSE
          </div>
          <h2 className="serif-headline" style={{ fontSize: '2rem', marginBottom: '6px' }}>
            Wispr Blitz: Voice Cyber Defense
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', fontSize: '0.95rem' }}>
            Production server is under attack! Speak the defensive countermeasure words (e.g. <strong>&quot;Firewall&quot;</strong>, <strong>&quot;Sanitize&quot;</strong>, <strong>&quot;Purge&quot;</strong>) to neutralize threats before they breach the core!
          </p>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>HIGH SCORE</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Trophy size={18} /> {highScore}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>WAVE</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#093c31' }}>
              #{wave}
            </div>
          </div>
        </div>
      </div>

      {/* Game Card */}
      <div className="wispr-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Top Status Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {/* Health & Score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color={serverHealth > 40 ? '#059669' : '#e11d48'} />
              <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Core Health:</span>
              <div style={{ width: '120px', height: '10px', backgroundColor: '#e5e0d3', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{
                  width: `${serverHealth}%`,
                  height: '100%',
                  backgroundColor: serverHealth > 40 ? '#059669' : '#e11d48',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <span className="mono-tag">{serverHealth}%</span>
            </div>

            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
              Score: {score}
            </div>
          </div>

          {/* Voice listener status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#faf8f0', padding: '6px 12px', borderRadius: '8px', border: '1px solid #eae6db' }}>
            <Mic size={15} color={isListening ? '#059669' : '#6b7280'} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {isListening ? `Voice Defense Active (Last: "${lastSpokenCommand || '...'}")` : 'Click Start to Enable Mic'}
            </span>
          </div>
        </div>

        {/* Recent Neutralization Toast */}
        {recentNeutralized && (
          <div style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #86efac',
            color: '#15803d',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={16} />
            <span>{recentNeutralized}</span>
          </div>
        )}

        {/* The Game Canvas */}
        <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1.5px solid var(--border-dark)' }}>
          <canvas
            ref={canvasRef}
            width={800}
            height={360}
            style={{ width: '100%', height: '360px', display: 'block' }}
          />

          {/* Idle screen */}
          {gameState === 'idle' && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(250, 248, 240, 0.92)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <ShieldAlert size={36} color="#093c31" />
              <h3 className="serif-headline" style={{ fontSize: '1.8rem' }}>Protect the Production Cluster</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', fontSize: '0.92rem' }}>
                Cyber threats will fall from the sky. <strong>Speak the defensive keyword</strong> (or click the quick buttons below) to fire lasers and destroy them!
              </p>
              <button onClick={startGame} className="btn-wispr-lilac" style={{ padding: '12px 28px', fontSize: '1rem' }}>
                <Mic size={18} /> Start Voice Defense
              </button>
            </div>
          )}

          {/* Game Over screen */}
          {gameState === 'gameover' && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(250, 248, 240, 0.95)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <span className="mono-tag" style={{ color: '#e11d48' }}>SECURITY BREACH</span>
              <h3 className="serif-headline" style={{ fontSize: '2rem' }}>Server Core Compromised!</h3>
              <div style={{ display: 'flex', gap: '24px', margin: '8px 0' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FINAL SCORE</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{score}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOP SCORE</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d97706' }}>{highScore}</div>
                </div>
              </div>
              <button onClick={startGame} className="btn-wispr-lilac" style={{ padding: '10px 24px' }}>
                <RotateCcw size={16} /> Deploy New Cluster
              </button>
            </div>
          )}
        </div>

        {/* Quick Voice Spellcasting Deck (Click or Speak!) */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            ⚡ Defensive Countermeasures (Speak the word or Click to Trigger):
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {THREAT_LIBRARY.map(item => (
              <button
                key={item.voiceCounter}
                onClick={() => neutralizeThreat(item.voiceCounter)}
                className="btn-wispr-secondary"
                style={{
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderColor: item.color
                }}
              >
                <span>{item.icon}</span>
                <span>Say: <strong>&quot;{item.voiceCounter}&quot;</strong></span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
