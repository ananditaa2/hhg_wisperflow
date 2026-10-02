import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Gamepad2, Mic, RotateCcw, Trophy, Volume2, Shield } from 'lucide-react';
import { GameObstacle } from '../types';

interface VoiceGameProps {
  isListening: boolean;
  volume: number;
  onStartMic: () => void;
  playTone: (freq?: number, type?: OscillatorType, duration?: number) => void;
}

const OBSTACLE_TYPES: Array<{ type: 'bug' | 'syntax_error' | 'merge_conflict'; label: string; color: string }> = [
  { type: 'bug', label: '🐛 BUG #404', color: '#f43f5e' },
  { type: 'syntax_error', label: '⚠️ SYNTAX ERROR', color: '#f59e0b' },
  { type: 'merge_conflict', label: '⚔️ MERGE CONFLICT', color: '#ec4899' }
];

export const VoiceGame: React.FC<VoiceGameProps> = ({
  isListening,
  volume,
  onStartMic,
  playTone
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('wispr_game_high') || 0);
  });
  const [sensitivity, setSensitivity] = useState<number>(25); // Volume threshold to jump

  // Game physics state refs
  const playerRef = useRef({
    x: 80,
    y: 200,
    vy: 0,
    width: 36,
    height: 36,
    isGrounded: false
  });

  const obstaclesRef = useRef<GameObstacle[]>([]);
  const frameCountRef = useRef<number>(0);
  const animIdRef = useRef<number | null>(null);

  const triggerJump = useCallback(() => {
    if (playerRef.current.isGrounded || playerRef.current.y > 150) {
      playerRef.current.vy = -12;
      playerRef.current.isGrounded = false;
      playTone(520, 'sine', 0.1);
    }
  }, [playTone]);

  // Handle voice-triggered jump
  useEffect(() => {
    if (gameState === 'playing' && volume > sensitivity) {
      triggerJump();
    }
  }, [volume, sensitivity, gameState, triggerJump]);

  const startGame = () => {
    if (!isListening) {
      onStartMic();
    }
    playerRef.current = {
      x: 80,
      y: 200,
      vy: 0,
      width: 36,
      height: 36,
      isGrounded: false
    };
    obstaclesRef.current = [];
    frameCountRef.current = 0;
    setScore(0);
    setGameState('playing');
    playTone(660, 'triangle', 0.2);
  };

  // Main Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gravity = 0.65;
    const groundY = canvas.height - 40;

    const loop = () => {
      frameCountRef.current += 1;
      const player = playerRef.current;

      // 1. Update Player Physics
      player.vy += gravity;
      player.y += player.vy;

      if (player.y >= groundY - player.height) {
        player.y = groundY - player.height;
        player.vy = 0;
        player.isGrounded = true;
      }

      // Ceiling limit
      if (player.y < 20) {
        player.y = 20;
        player.vy = 0;
      }

      // 2. Spawn Obstacles
      if (frameCountRef.current % 110 === 0) {
        const obsDef = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
        obstaclesRef.current.push({
          x: canvas.width + 20,
          width: 50,
          height: Math.floor(Math.random() * 30) + 40,
          type: obsDef.type,
          label: obsDef.label
        });
      }

      // 3. Update & Clean Obstacles
      for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
        const obs = obstaclesRef.current[i];
        obs.x -= 4.5;

        // Collision Check (AABB)
        const obsY = groundY - obs.height;
        if (
          player.x < obs.x + obs.width &&
          player.x + player.width > obs.x &&
          player.y < obsY + obs.height &&
          player.y + player.height > obsY
        ) {
          // Game Over Collision
          setGameState('gameover');
          playTone(200, 'sawtooth', 0.4);
          setHighScore(prev => {
            const newHigh = Math.max(prev, score);
            localStorage.setItem('wispr_game_high', String(newHigh));
            return newHigh;
          });
          return;
        }

        // Passed Obstacle -> Score Point
        if (obs.x + obs.width < player.x && !(obs as unknown as { scored: boolean }).scored) {
          (obs as unknown as { scored: boolean }).scored = true;
          setScore(s => {
            const nextScore = s + 10;
            if (nextScore > 0 && nextScore % 50 === 0) {
              confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
              playTone(880, 'sine', 0.2);
            }
            return nextScore;
          });
        }

        // Remove offscreen
        if (obs.x + obs.width < -50) {
          obstaclesRef.current.splice(i, 1);
        }
      }

      // 4. Render
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid Background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Ground Line
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(canvas.width, groundY);
      ctx.stroke();

      // Ground Glow
      ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
      ctx.fillRect(0, groundY, canvas.width, 40);

      // Render Player (Wispr Drone)
      ctx.save();
      ctx.translate(player.x, player.y);

      // Drone Glow
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.roundRect(0, 0, player.width, player.height, 8);
      ctx.fill();

      // Drone Core / Eyes
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(player.width - 12, 10, 6, 6);

      // Thrust flame when jumping
      if (!player.isGrounded) {
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.moveTo(8, player.height);
        ctx.lineTo(player.width / 2, player.height + 12 + Math.random() * 8);
        ctx.lineTo(player.width - 8, player.height);
        ctx.fill();
      }
      ctx.restore();

      // Render Obstacles (Bugs)
      obstaclesRef.current.forEach(obs => {
        const obsY = groundY - obs.height;
        ctx.save();
        ctx.fillStyle = obs.type === 'bug' ? '#f43f5e' : obs.type === 'syntax_error' ? '#f59e0b' : '#ec4899';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(obs.x, obsY, obs.width, obs.height, 6);
        ctx.fill();

        // Label
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px JetBrains Mono';
        ctx.fillText(obs.label, obs.x, obsY - 8);
        ctx.restore();
      });

      animIdRef.current = requestAnimationFrame(loop);
    };

    animIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [gameState, score, playTone]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Pillar Header */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span className="mono-badge" style={{ color: 'var(--accent-cyan)', borderColor: 'rgba(6,182,212,0.3)' }}>
              PILLAR 2: INTERACTIVE GAME
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Acoustic Frequency Physics Engine</span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }} className="gradient-text-cyan">
            Sonic Jump: Bug Buster
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', fontSize: '0.95rem' }}>
            A voice-controlled arcade game. Use your vocal volume and speech frequency to propel the Wispr drone into the air and dodge bugs, syntax errors, and merge conflicts!
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HIGH SCORE</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Trophy size={18} /> {highScore}
            </div>
          </div>
        </div>
      </div>

      {/* Game Canvas Container */}
      <div className="glass-panel-glow" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* HUD Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gamepad2 size={20} color="var(--accent-cyan)" />
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Score: {score}</span>
            </div>

            {/* Mic Level VU Meter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '8px' }}>
              <Volume2 size={16} color={volume > sensitivity ? '#10b981' : '#94a3b8'} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Voice Jump Level:</span>
              <div style={{ width: '80px', height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${volume}%`,
                  height: '100%',
                  backgroundColor: volume > sensitivity ? '#10b981' : '#06b6d4',
                  transition: 'width 0.1s linear'
                }} />
              </div>
              <span className="mono-badge" style={{ fontSize: '0.7rem' }}>{volume}%</span>
            </div>
          </div>

          {/* Sensitivity Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mic Trigger Sensitivity:</span>
            <input
              type="range"
              min="10"
              max="60"
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              style={{ width: '100px', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
            <span className="mono-badge">{sensitivity}%</span>
          </div>
        </div>

        {/* The Screen */}
        <div style={{ position: 'relative', width: '100%', backgroundColor: '#090a10', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
          <canvas
            ref={canvasRef}
            width={800}
            height={320}
            style={{ width: '100%', height: '320px', display: 'block', cursor: 'pointer' }}
            onClick={gameState === 'playing' ? triggerJump : startGame}
          />

          {/* Overlay: Idle State */}
          {gameState === 'idle' && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(8, 9, 13, 0.75)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px'
            }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Gamepad2 size={28} color="#fff" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Ready to Bug-Bust with Your Voice?</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                  Speak, make sounds, or tap Space/Click to make the Wispr drone jump!
                </p>
              </div>
              <button onClick={startGame} className="btn-primary" style={{ padding: '12px 28px', fontSize: '1rem' }}>
                <Mic size={18} /> Start Voice Game
              </button>
            </div>
          )}

          {/* Overlay: Game Over */}
          {gameState === 'gameover' && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(8, 9, 13, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px'
            }}>
              <span className="mono-badge" style={{ color: '#f43f5e', borderColor: 'rgba(244,63,94,0.3)' }}>
                SYSTEM HALT
              </span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc' }}>
                Merged a Critical Bug!
              </h3>
              <div style={{ display: 'flex', gap: '20px', margin: '8px 0' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>YOUR SCORE</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>{score}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BEST RUN</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{highScore}</div>
                </div>
              </div>
              <button onClick={startGame} className="btn-primary" style={{ padding: '10px 24px' }}>
                <RotateCcw size={16} /> Play Again
              </button>
            </div>
          )}
        </div>

        {/* Instructions / Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Mic size={15} color="var(--accent-cyan)" />
            <span>Speak or make voice sounds into your mic to jump.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={15} color="var(--accent-purple)" />
            <span>Or click / tap canvas as physical fallback.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
