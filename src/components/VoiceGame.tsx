import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Zap, Trophy, RotateCcw, Volume2, Mic, Flame, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

interface VoiceGameProps {
  isListening: boolean;
  volume: number;
  onStartMic: () => void;
  playTone: (freq?: number, type?: OscillatorType, duration?: number) => void;
  lastSpokenCommand?: string;
}

interface SpeedrunCard {
  id: string;
  crisis: string;
  counterVoice: string;
  aliases: string[];
  category: 'devops' | 'syntax' | 'security' | 'db';
  difficulty: 'fast' | 'normal' | 'boss';
  color: string;
}

const SPEEDRUN_CHALLENGES: SpeedrunCard[] = [
  { id: '1', crisis: 'DROP TABLE USERS IN PROD!', counterVoice: 'rollback', aliases: ['rollback', 'undo', 'revert', 'back'], category: 'db', difficulty: 'boss', color: '#f43f5e' },
  { id: '2', crisis: 'CORS POLICY BLOCKED REQUEST', counterVoice: 'allow origin', aliases: ['allow', 'origin', 'cors'], category: 'security', difficulty: 'normal', color: '#ec4899' },
  { id: '3', crisis: 'NODE_MODULES OUT OF MEMORY (99%)', counterVoice: 'garbage collect', aliases: ['garbage', 'collect', 'purge', 'clean', 'gc'], category: 'devops', difficulty: 'normal', color: '#8b5cf6' },
  { id: '4', crisis: 'CLIENT WAITING FOR FEATURE!', counterVoice: 'ship it', aliases: ['ship', 'it', 'deploy', 'push'], category: 'devops', difficulty: 'fast', color: '#10b981' },
  { id: '5', crisis: 'INFINITE WHILE LOOP DETECTED', counterVoice: 'break', aliases: ['break', 'stop', 'exit'], category: 'syntax', difficulty: 'fast', color: '#f59e0b' },
  { id: '6', crisis: 'UNHANDLED PROMISE REJECTION', counterVoice: 'catch error', aliases: ['catch', 'error', 'try'], category: 'syntax', difficulty: 'normal', color: '#06b6d4' },
  { id: '7', crisis: 'PORT 3000 ALREADY IN USE', counterVoice: 'kill 3000', aliases: ['kill', 'port', 'stop'], category: 'devops', difficulty: 'normal', color: '#f97316' },
  { id: '8', crisis: 'UNENCRYPTED API SECRET IN REPO', counterVoice: 'git scrub', aliases: ['scrub', 'secret', 'vault', 'hide'], category: 'security', difficulty: 'boss', color: '#ef4444' },
  { id: '9', crisis: 'GIT MERGE HEAD CONFLICT', counterVoice: 'accept current', aliases: ['accept', 'current', 'merge'], category: 'syntax', difficulty: 'normal', color: '#a855f7' }
];

const HYPE_COMMENTARY = [
  "CLEAN YAP!",
  "10x DEV UNLOCKED!",
  "GOA HACKER HOUSE READY!",
  "NO KEYBOARD NEEDED!",
  "GODLIKE FLOW STATE!",
  "THOUGHT-TO-CODE VELOCITY!"
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
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [hypeMessage, setHypeMessage] = useState<string>('');
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('wispr_speedrun_high') || 0);
  });

  const activeCard = SPEEDRUN_CHALLENGES[currentCardIndex % SPEEDRUN_CHALLENGES.length];

  // Resolve challenge
  const resolveChallenge = useCallback((wordUsed: string) => {
    if (gameState !== 'playing') return;

    setScore(s => s + 100 + combo * 25);
    setCombo(c => {
      const nextC = c + 1;
      if (nextC % 3 === 0) {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        setHypeMessage(HYPE_COMMENTARY[Math.floor(Math.random() * HYPE_COMMENTARY.length)]);
        setTimeout(() => setHypeMessage(''), 1500);
      }
      return nextC;
    });

    playTone(660 + combo * 40, 'triangle', 0.15);
    setCurrentCardIndex(idx => idx + 1);
  }, [gameState, combo, playTone]);

  // Check speech command against active challenge
  useEffect(() => {
    if (!lastSpokenCommand || gameState !== 'playing') return;
    const lower = lastSpokenCommand.toLowerCase().trim();

    const isMatch = 
      lower.includes(activeCard.counterVoice.toLowerCase()) ||
      activeCard.aliases.some(alias => lower.includes(alias));

    if (isMatch) {
      resolveChallenge(lastSpokenCommand);
    }
  }, [lastSpokenCommand, activeCard, gameState, resolveChallenge]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          setGameState('gameover');
          playTone(240, 'sawtooth', 0.4);
          setHighScore(prev => {
            const nextH = Math.max(prev, score);
            localStorage.setItem('wispr_speedrun_high', String(nextH));
            return nextH;
          });
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, score, playTone]);

  // Audio Particle Vortex Canvas
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let angle = 0;
    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      angle += 0.03;
      const centerX = w / 2;
      const centerY = h / 2;
      const radius = 60 + (volume * 1.2);

      // Radial shockwave ripples
      ctx.save();
      for (let r = 0; r < 3; r++) {
        const currentR = (radius + r * 30 + (angle * 20)) % 160;
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(216, 180, 254, ${Math.max(0, 0.6 - currentR / 160)})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Rotating voice vortex particles
      const particles = 18;
      for (let i = 0; i < particles; i++) {
        const theta = angle + (i * (Math.PI * 2 / particles));
        const px = centerX + Math.cos(theta) * radius;
        const py = centerY + Math.sin(theta) * radius;

        ctx.fillStyle = i % 2 === 0 ? '#d8b4fe' : '#86efac';
        ctx.beginPath();
        ctx.arc(px, py, 4 + (volume > 20 ? 3 : 0), 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#18181b';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [volume]);

  const startGame = () => {
    if (!isListening) {
      onStartMic();
    }
    setScore(0);
    setCombo(0);
    setTimeLeft(45);
    setCurrentCardIndex(0);
    setHypeMessage('SPEECH ENGINE READY!');
    setGameState('playing');
    playTone(520, 'sine', 0.2);
    setTimeout(() => setHypeMessage(''), 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* 1. Header Banner */}
      <div className="genz-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="genz-tag tag-lilac">PILLAR 2: VOICE SPEEDRUN</span>
            <span className="genz-tag tag-green">GEN Z DEV ARENA</span>
          </div>
          <h2 className="serif-headline" style={{ fontSize: '2.4rem', lineHeight: '1.1' }}>
            Wispr Blitz: The 10x Voice Arena
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '750px', marginTop: '6px' }}>
            Emergency production bugs are firing down! No typing allowed. <strong>Speak the voice countermeasure command</strong> out loud to blast through crisis cards and hit hyper-flow combos!
          </p>
        </div>

        {/* High Score & Time */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div className="genz-card" style={{ padding: '12px 20px', backgroundColor: '#ffffff', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>RECORD SCORE</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Trophy size={18} /> {highScore}
            </div>
          </div>

          <div className="genz-card" style={{ padding: '12px 20px', backgroundColor: timeLeft <= 10 ? 'var(--accent-peach)' : 'var(--accent-yellow)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>SPEEDRUN CLOCK</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
              {timeLeft}s
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Arena Battle Station */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)',
        gap: '24px',
        width: '100%'
      }}>
        {/* Left: Active Crisis Card & Vortex Visualizer */}
        <div className="genz-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', minHeight: '440px' }}>
          {/* Hype Message Overlay */}
          {hypeMessage && (
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: 'var(--accent-yellow)',
              border: '2px solid var(--border-black)',
              boxShadow: '3px 3px 0px var(--border-black)',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontWeight: 900,
              fontSize: '0.88rem',
              animation: 'bounce 0.5s infinite alternate',
              zIndex: 30
            }}>
              🔥 {hypeMessage}
            </div>
          )}

          {/* Top Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="genz-tag tag-peach" style={{ fontSize: '0.82rem' }}>
                CRISIS #{currentCardIndex + 1}
              </span>
              <span className="genz-tag tag-cyan">
                {activeCard.category.toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={20} color={combo > 0 ? '#ef4444' : '#64748b'} />
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: combo > 2 ? '#ef4444' : '#18181b' }}>
                {combo}x COMBO
              </span>
            </div>
          </div>

          {/* Center Card Display or Idle Screen */}
          {gameState === 'playing' ? (
            <div style={{ margin: '32px 0', textAlign: 'center', zIndex: 10 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f43f5e', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                ⚠️ INCOMING EMERGENCY
              </div>
              <h3 className="serif-headline" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', lineHeight: '1.15', marginBottom: '20px' }}>
                {activeCard.crisis}
              </h3>

              {/* The Target Voice Command */}
              <div style={{
                display: 'inline-block',
                backgroundColor: 'var(--accent-lilac-soft)',
                border: '2.5px solid var(--border-black)',
                borderRadius: '16px',
                padding: '16px 32px',
                boxShadow: '5px 5px 0px var(--border-black)'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#6b21a8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                  🎙️ SPEAK THIS EXACT PHRASE:
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#18181b', fontFamily: 'var(--font-mono)' }}>
                  &quot;{activeCard.counterVoice}&quot;
                </div>
              </div>
            </div>
          ) : gameState === 'idle' ? (
            <div style={{ margin: 'auto', textAlign: 'center', zIndex: 10, padding: '20px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--accent-lilac)', border: '2px solid var(--border-black)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '4px 4px 0px var(--border-black)' }}>
                <Zap size={32} />
              </div>
              <h3 className="serif-headline" style={{ fontSize: '2.2rem', marginBottom: '8px' }}>
                Ready to 10x Voice Speedrun?
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '420px', margin: '0 auto 20px' }}>
                Speak the countermeasure words into your mic as fast as possible before the 45s timer expires.
              </p>
              <button onClick={startGame} className="btn-brutal-lilac" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
                <Mic size={20} /> Launch 45s Voice Blitz
              </button>
            </div>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', zIndex: 10, padding: '20px' }}>
              <div className="genz-tag tag-peach" style={{ marginBottom: '12px' }}>
                TIME&apos;S UP!
              </div>
              <h3 className="serif-headline" style={{ fontSize: '2.4rem', marginBottom: '6px' }}>
                Speedrun Complete!
              </h3>
              <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', margin: '16px 0' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>FINAL SCORE</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900 }}>{score}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>PEAK STREAK</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b' }}>{combo}x</div>
                </div>
              </div>
              <button onClick={startGame} className="btn-brutal-lilac" style={{ padding: '12px 28px', fontSize: '1rem' }}>
                <RotateCcw size={18} /> Play Speedrun Again
              </button>
            </div>
          )}

          {/* Background Vortex Canvas */}
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              opacity: 0.85
            }}
          />

          {/* Bottom Live Mic Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, paddingTop: '16px', borderTop: '2px solid rgba(24, 24, 27, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Volume2 size={16} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                {isListening ? `Mic Active • Recognized: "${lastSpokenCommand || '...'}"` : 'Mic Standby'}
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>
              SCORE: <span style={{ color: '#093c31', fontSize: '1.1rem' }}>{score}</span>
            </div>
          </div>
        </div>

        {/* Right: Rapid Voice Spell Deck (Click or Speak!) */}
        <div className="genz-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Sparkles size={18} color="#093c31" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900 }}>Rapid-Fire Voice Deck</h3>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Speak any of these commands or tap to instantly resolve the active card:
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '340px' }}>
            {SPEEDRUN_CHALLENGES.map(challenge => {
              const isTarget = challenge.counterVoice === activeCard.counterVoice && gameState === 'playing';

              return (
                <button
                  key={challenge.id}
                  onClick={() => resolveChallenge(challenge.counterVoice)}
                  disabled={gameState !== 'playing'}
                  className="btn-brutal-white"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderColor: isTarget ? '#18181b' : 'rgba(24, 24, 27, 0.2)',
                    backgroundColor: isTarget ? 'var(--accent-yellow)' : '#ffffff',
                    transform: isTarget ? 'scale(1.02)' : 'none',
                    boxShadow: isTarget ? '4px 4px 0px #18181b' : '2px 2px 0px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: challenge.color }}>
                      ●
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', fontFamily: 'var(--font-mono)' }}>
                      &quot;{challenge.counterVoice}&quot;
                    </span>
                  </div>

                  <span className="genz-tag tag-lilac" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                    {challenge.category}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{
            backgroundColor: 'var(--accent-matcha)',
            border: '2px solid var(--border-black)',
            boxShadow: '3px 3px 0px var(--border-black)',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '0.82rem',
            fontWeight: 700,
            lineHeight: '1.4'
          }}>
            ⚡ <strong>Pro Tip:</strong> Hold Wispr Flow push-to-talk key and speak naturally without stopping. The voice pipeline detects phrases with zero input latency!
          </div>
        </div>
      </div>
    </div>
  );
};
