import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Gamepad2, Mic, RotateCcw, Trophy, Volume2 } from 'lucide-react';
import { GameObstacle } from '../types';

interface VoiceGameProps {
  isListening: boolean;
  volume: number;
  onStartMic: () => void;
  playTone: (freq?: number, type?: OscillatorType, duration?: number) => void;
}

const OBSTACLE_TYPES: Array<{ type: 'bug' | 'syntax_error' | 'merge_conflict'; label: string; color: string }> = [
  { type: 'bug', label: '🐛 BUG #404', color: '#e11d48' },
  { type: 'syntax_error', label: '⚠️ SYNTAX ERROR', color: '#d97706' },
  { type: 'merge_conflict', label: '⚔️ CONFLICT', color: '#7c3aed' }
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
  const [sensitivity, setSensitivity] = useState<number>(25);

  const playerRef = useRef({
    x: 80,
    y: 200,
    vy: 0,
    width: 38,
    height: 38,
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
      width: 38,
      height: 38,
      isGrounded: false
    };
    obstaclesRef.current = [];
    frameCountRef.current = 0;
    setScore(0);
    setGameState('playing');
    playTone(660, 'triangle', 0.2);
  };

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

      player.vy += gravity;
      player.y += player.vy;

      if (player.y >= groundY - player.height) {
        player.y = groundY - player.height;
        player.vy = 0;
        player.isGrounded = true;
      }

      if (player.y < 20) {
        player.y = 20;
        player.vy = 0;
      }

      if (frameCountRef.current % 110 === 0) {
        const obsDef = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
        obstaclesRef.current.push({
          x: canvas.width + 20,
          width: 50,
          height: Math.floor(Math.random() * 30) + 40,
          type: obsDef.type,
          label: obsDef.label,
          color: obsDef.color
        });
      }

      for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
        const obs = obstaclesRef.current[i];
        obs.x -= 4.5;

        const obsY = groundY - obs.height;
        if (
          player.x < obs.x + obs.width &&
          player.x + player.width > obs.x &&
          player.y < obsY + obs.height &&
          player.y + player.height > obsY
        ) {
          setGameState('gameover');
          playTone(200, 'sawtooth', 0.4);
          setHighScore(prev => {
            const newHigh = Math.max(prev, score);
            localStorage.setItem('wispr_game_high', String(newHigh));
            return newHigh;
          });
          return;
        }

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

        if (obs.x + obs.width < -50) {
          obstaclesRef.current.splice(i, 1);
        }
      }

      // Render Warm Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = '#faf8f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = '#eae6db';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Ground Line
      ctx.strokeStyle = '#093c31';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(canvas.width, groundY);
      ctx.stroke();

      ctx.fillStyle = '#f0ebe0';
      ctx.fillRect(0, groundY, canvas.width, 40);

      // Render Player (Wispr Lilac Drone)
      ctx.save();
      ctx.translate(player.x, player.y);

      ctx.fillStyle = '#ecdffc';
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(0, 0, player.width, player.height, 10);
      ctx.fill();
      ctx.stroke();

      // Soundwave logo on player
      ctx.fillStyle = '#111827';
      ctx.fillRect(10, 14, 2.5, 10);
      ctx.fillRect(16, 10, 2.5, 18);
      ctx.fillRect(22, 12, 2.5, 14);
      ctx.fillRect(28, 16, 2.5, 6);

      // Thrust flame when jumping
      if (!player.isGrounded) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(10, player.height + 2);
        ctx.lineTo(player.width / 2, player.height + 12 + Math.random() * 8);
        ctx.lineTo(player.width - 10, player.height + 2);
        ctx.fill();
      }
      ctx.restore();

      // Render Obstacles
      obstaclesRef.current.forEach(obs => {
        const obsY = groundY - obs.height;
        ctx.save();
        ctx.fillStyle = obs.color || '#e11d48';
        ctx.strokeStyle = '#18181b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(obs.x, obsY, obs.width, obs.height, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#18181b';
        ctx.font = 'bold 10px Plus Jakarta Sans';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="wispr-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="eyebrow-text" style={{ marginBottom: '8px' }}>
            PILLAR 2: INTERACTIVE ARCADE
          </div>
          <h2 className="serif-headline" style={{ fontSize: '2rem', marginBottom: '6px' }}>
            Sonic Jump: Bug Buster
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '620px', fontSize: '0.95rem' }}>
            A voice-controlled arcade game. Use your vocal volume and speech to make the Wispr drone jump over bugs, syntax errors, and merge conflicts!
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>HIGH SCORE</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trophy size={18} /> {highScore}
          </div>
        </div>
      </div>

      {/* Game Canvas Container */}
      <div className="wispr-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '1.1rem' }}>
              <Gamepad2 size={18} />
              <span>Score: {score}</span>
            </div>

            {/* Mic Meter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#faf8f0', padding: '6px 12px', borderRadius: '8px', border: '1px solid #eae6db' }}>
              <Volume2 size={15} color={volume > sensitivity ? '#059669' : '#6b7280'} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Voice Trigger:</span>
              <div style={{ width: '80px', height: '6px', backgroundColor: '#e5e0d3', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${volume}%`,
                  height: '100%',
                  backgroundColor: volume > sensitivity ? '#059669' : '#093c31',
                  transition: 'width 0.1s linear'
                }} />
              </div>
              <span className="mono-tag" style={{ fontSize: '0.7rem' }}>{volume}%</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Trigger Threshold:</span>
            <input
              type="range"
              min="10"
              max="60"
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              style={{ width: '100px', accentColor: 'var(--accent-forest)', cursor: 'pointer' }}
            />
            <span className="mono-tag">{sensitivity}%</span>
          </div>
        </div>

        {/* Screen */}
        <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1.5px solid var(--border-dark)' }}>
          <canvas
            ref={canvasRef}
            width={800}
            height={320}
            style={{ width: '100%', height: '320px', display: 'block', cursor: 'pointer' }}
            onClick={gameState === 'playing' ? triggerJump : startGame}
          />

          {gameState === 'idle' && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(250, 248, 240, 0.88)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px'
            }}>
              <h3 className="serif-headline" style={{ fontSize: '1.8rem' }}>Ready to Bug-Bust with Your Voice?</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Speak, hum, make vocal sounds, or click to make the Wispr drone jump!
              </p>
              <button onClick={startGame} className="btn-wispr-lilac" style={{ padding: '12px 28px', fontSize: '1rem' }}>
                <Mic size={18} /> Start Voice Game
              </button>
            </div>
          )}

          {gameState === 'gameover' && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(250, 248, 240, 0.92)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <span className="mono-tag" style={{ color: '#e11d48' }}>CRITICAL ERROR</span>
              <h3 className="serif-headline" style={{ fontSize: '2rem' }}>Merged a Bug to Production!</h3>
              <div style={{ display: 'flex', gap: '24px', margin: '8px 0' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SCORE</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{score}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BEST</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d97706' }}>{highScore}</div>
                </div>
              </div>
              <button onClick={startGame} className="btn-wispr-lilac" style={{ padding: '10px 24px' }}>
                <RotateCcw size={16} /> Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
