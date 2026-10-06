import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Mic, 
  MicOff, 
  RotateCcw, 
  Sparkles, 
  Volume2, 
  Trophy, 
  Flame, 
  Shield, 
  Zap, 
  Bomb, 
  Sliders, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertTriangle,
  Target
} from 'lucide-react';

interface VoiceGameProps {
  isListening: boolean;
  volume: number; // 0 to 100
  onStartMic: () => void;
  playTone: (freq?: number, type?: OscillatorType, duration?: number) => void;
  lastSpokenCommand?: string;
}

type GameMode = 'runner' | 'bomb' | 'target';

/* ─── SOUND FX SYNTHESIZER ──────────────────────────────────────────────── */
function playSfx(type: 'jump' | 'blast' | 'coin' | 'hit' | 'win' | 'tick' | 'boom') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'jump') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.18);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'blast') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.3);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'coin') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'hit') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'tick') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'boom') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.6);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'win') {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.value = f;
        o.connect(g);
        g.connect(ctx.destination);
        g.gain.setValueAtTime(0.1, now + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2);
        o.start(now + i * 0.08);
        o.stop(now + i * 0.08 + 0.2);
      });
    }
  } catch {
    // Audio context unavailable
  }
}

/* ─── RUNNER OBJECT INTERFACES ─────────────────────────────────────────── */
interface RunnerItem {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'coin' | 'gem' | 'spike' | 'drone' | 'shield';
  collected?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

/* ─── BOMB CHALLENGES ─────────────────────────────────────────────────── */
interface BombPrompt {
  id: number;
  instruction: string;
  hint: string;
  type: 'keyword' | 'loudness' | 'softness';
  validWords?: string[];
  minVolume?: number;
  maxVolume?: number;
}

const BOMB_PROMPTS: BombPrompt[] = [
  {
    id: 1,
    instruction: '🐶 Make an ANIMAL SOUND or scream its name!',
    hint: 'Say "woof", "meow", "moo", "roar", "quack", "oink", "baa", "bark"',
    type: 'keyword',
    validWords: ['woof', 'meow', 'moo', 'roar', 'quack', 'oink', 'baa', 'bark', 'lion', 'dog', 'cat', 'cow', 'wolf', 'tiger']
  },
  {
    id: 2,
    instruction: '🍕 Name a delicious FOOD or JUNK FOOD!',
    hint: 'Say "pizza", "burger", "taco", "sushi", "cookie", "cake", "ice cream", "fries"',
    type: 'keyword',
    validWords: ['pizza', 'burger', 'taco', 'sushi', 'cookie', 'cake', 'ice cream', 'fries', 'pasta', 'donut', 'chocolate', 'bread', 'apple', 'banana', 'curry']
  },
  {
    id: 3,
    instruction: '⚡ Scream a word that rhymes with "LIGHT"!',
    hint: 'Say "night", "bright", "fight", "flight", "white", "kite", "bite", "right"',
    type: 'keyword',
    validWords: ['night', 'bright', 'fight', 'flight', 'white', 'kite', 'bite', 'right', 'sight', 'tight', 'might', 'height']
  },
  {
    id: 4,
    instruction: '🗣️ SCREAM AS LOUD AS YOU CAN (> 75% Volume)!',
    hint: 'Let out a loud shout or war cry right now into your mic!',
    type: 'loudness',
    minVolume: 75
  },
  {
    id: 5,
    instruction: '🌈 Shout any COLOR of the rainbow!',
    hint: 'Say "red", "blue", "green", "yellow", "purple", "orange", "pink", "violet"',
    type: 'keyword',
    validWords: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'violet', 'cyan', 'gold', 'silver', 'black', 'white']
  },
  {
    id: 6,
    instruction: '🚀 Name something that FLIES through the sky!',
    hint: 'Say "plane", "rocket", "bird", "superman", "drone", "dragon", "alien", "ufo"',
    type: 'keyword',
    validWords: ['plane', 'rocket', 'bird', 'superman', 'drone', 'dragon', 'alien', 'ufo', 'helicopter', 'eagle', 'bat', 'comet', 'falcon']
  },
  {
    id: 7,
    instruction: '🤫 WHISPER a secret word very softly (< 30% Vol)!',
    hint: 'Whisper anything quietly without waking the baby!',
    type: 'softness',
    maxVolume: 35
  },
  {
    id: 8,
    instruction: '🦸 Shout a SUPERHERO or SUPERPOWER!',
    hint: 'Say "batman", "spiderman", "iron man", "superman", "laser", "flight", "teleport"',
    type: 'keyword',
    validWords: ['batman', 'spiderman', 'iron man', 'superman', 'laser', 'flight', 'teleport', 'thor', 'hulk', 'flash', 'speed', 'invisible', 'fire']
  },
  {
    id: 9,
    instruction: '🎉 Shout a word that rhymes with "COOL"!',
    hint: 'Say "pool", "fool", "rule", "school", "tool", "fuel", "jewel"',
    type: 'keyword',
    validWords: ['pool', 'fool', 'rule', 'school', 'tool', 'fuel', 'jewel', 'drool', 'wool']
  },
  {
    id: 10,
    instruction: '👑 FINAL BOSS: Shout "WISPR FLOW" to win!',
    hint: 'Say "wispr flow" or "wispr" or "flow" clearly!',
    type: 'keyword',
    validWords: ['wispr', 'flow', 'wisper', 'whisper', 'wispr flow', 'whisper flow', 'champion', 'victory']
  }
];

export const VoiceGame: React.FC<VoiceGameProps> = ({
  isListening,
  volume,
  onStartMic,
  lastSpokenCommand = ''
}) => {
  const [activeMode] = useState<GameMode>('runner');
  const [sensitivity, setSensitivity] = useState<number>(1.4); // volume multiplier

  /* ═══════════════════════════════════════════════════════════════════════
     MODE 1: SCREAM RUNNER (SONIC BLAST PHYSICS)
  ═══════════════════════════════════════════════════════════════════════════ */
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('wispr_runner_high') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [coinsCollected, setCoinsCollected] = useState<number>(0);
  const [hasShield, setHasShield] = useState<boolean>(false);
  const [laserActive, setLaserActive] = useState<boolean>(false);
  const [recentAction, setRecentAction] = useState<string>('');

  // Runner Mutable Ref State for 60fps Loop
  const runnerRef = useRef({
    playerY: 260,
    playerVy: 0,
    playerX: 90,
    groundY: 310,
    isGrounded: true,
    distance: 0,
    speed: 5.5,
    items: [] as RunnerItem[],
    particles: [] as Particle[],
    shieldActive: false,
    laserTime: 0,
    lastSpawnDist: 0,
    screenShake: 0
  });

  // Effective scaled volume
  const effectiveVol = Math.min(100, Math.round(volume * sensitivity));

  // Voice Speech Command Trigger for Runner
  useEffect(() => {
    if (!lastSpokenCommand || gameState !== 'playing') return;
    const cmd = lastSpokenCommand.toLowerCase();

    if (cmd.includes('blast') || cmd.includes('fire') || cmd.includes('boom') || cmd.includes('pew') || cmd.includes('laser')) {
      // Fire Laser Cannon!
      runnerRef.current.laserTime = 40; // frames
      setLaserActive(true);
      playSfx('blast');
      setRecentAction('💥 LASER CANNON FIRED!');
      // Obliterate all on-screen obstacles
      runnerRef.current.items.forEach(item => {
        if ((item.type === 'spike' || item.type === 'drone') && item.x > runnerRef.current.playerX && item.x < 700) {
          item.collected = true;
          setScore(s => s + 75);
          // Spawn boom particles
          for (let p = 0; p < 12; p++) {
            runnerRef.current.particles.push({
              x: item.x,
              y: item.y,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              size: Math.random() * 6 + 3,
              color: '#f43f5e',
              life: 25,
              maxLife: 25
            });
          }
        }
      });
      setTimeout(() => setLaserActive(false), 600);
    } else if (cmd.includes('jump') || cmd.includes('hop') || cmd.includes('up')) {
      if (runnerRef.current.isGrounded) {
        runnerRef.current.playerVy = -15;
        runnerRef.current.isGrounded = false;
        playSfx('jump');
        setRecentAction('🦘 VOICE JUMP!');
      }
    } else if (cmd.includes('shield')) {
      runnerRef.current.shieldActive = true;
      setHasShield(true);
      playSfx('coin');
      setRecentAction('🛡️ SHIELD DEPLOYED!');
    }
  }, [lastSpokenCommand, gameState]);

  // Main 60fps Runner Loop
  useEffect(() => {
    if (activeMode !== 'runner') return;
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const r = runnerRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Clear Screen with Screen Shake
      ctx.save();
      if (r.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * r.screenShake;
        const shakeY = (Math.random() - 0.5) * r.screenShake;
        ctx.translate(shakeX, shakeY);
        r.screenShake *= 0.85;
        if (r.screenShake < 0.5) r.screenShake = 0;
      }

      ctx.clearRect(-10, -10, width + 20, height + 20);

      // Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#090d16');
      skyGrad.addColorStop(0.65, '#1e1b4b');
      skyGrad.addColorStop(1, '#311042');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Parallax Neon Grid Horizon
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
      ctx.lineWidth = 1;
      const groundY = r.groundY;
      for (let i = 0; i < width; i += 32) {
        const scrollX = (i - (r.distance * 0.5) % 32);
        ctx.beginPath();
        ctx.moveTo(scrollX, groundY);
        ctx.lineTo(scrollX - 40, height);
        ctx.stroke();
      }

      // Ground Line
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, groundY, width, height - groundY);
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      if (gameState === 'playing') {
        r.distance += r.speed;
        setScore(Math.floor(r.distance / 10));

        // VOICE THRUST PHYSICS:
        // Whisper (15-35%): gentle bounce
        // Talking (35-65%): jump
        // Scream (>65%): rocket launch
        if (effectiveVol > 22) {
          const upwardThrust = (effectiveVol / 100) * 1.6;
          r.playerVy -= upwardThrust;
          r.isGrounded = false;

          // Rocket Thrust Particles
          if (effectiveVol > 55) {
            for (let p = 0; p < 2; p++) {
              r.particles.push({
                x: r.playerX + 10,
                y: r.playerY + 22,
                vx: -r.speed * 0.5 + (Math.random() - 0.5) * 3,
                vy: Math.random() * 4 + 2,
                size: Math.random() * 5 + 3,
                color: effectiveVol > 75 ? '#ef4444' : '#f59e0b',
                life: 18,
                maxLife: 18
              });
            }
          }
        }

        // Apply Gravity
        r.playerVy += 0.72; // gravity
        r.playerY += r.playerVy;

        // Ground Collision
        if (r.playerY >= groundY - 26) {
          r.playerY = groundY - 26;
          r.playerVy = 0;
          r.isGrounded = true;
        }

        // Ceiling Bound
        if (r.playerY < 20) {
          r.playerY = 20;
          r.playerVy = 0;
        }

        // Spawn Obstacles & Coins
        if (r.distance - r.lastSpawnDist > 200) {
          r.lastSpawnDist = r.distance;
          const rand = Math.random();
          if (rand < 0.45) {
            // Coin Arc
            for (let c = 0; c < 3; c++) {
              r.items.push({
                x: width + c * 35,
                y: groundY - 45 - Math.sin((c / 2) * Math.PI) * 45,
                width: 18,
                height: 18,
                type: 'coin'
              });
            }
          } else if (rand < 0.75) {
            // Spikes on ground
            r.items.push({
              x: width,
              y: groundY - 24,
              width: 24,
              height: 24,
              type: 'spike'
            });
          } else if (rand < 0.90) {
            // Flying Spiked Drone
            r.items.push({
              x: width,
              y: groundY - 70 - Math.random() * 60,
              width: 26,
              height: 26,
              type: 'drone'
            });
          } else {
            // Rare Shield Orb
            r.items.push({
              x: width,
              y: groundY - 80,
              width: 22,
              height: 22,
              type: 'shield'
            });
          }
        }

        // Move Items & Check Collisions
        r.items.forEach(item => {
          item.x -= r.speed;

          if (!item.collected) {
            // Player Box: x: r.playerX, y: r.playerY, w: 30, h: 30
            const hit = (
              r.playerX < item.x + item.width &&
              r.playerX + 28 > item.x &&
              r.playerY < item.y + item.height &&
              r.playerY + 28 > item.y
            );

            if (hit) {
              if (item.type === 'coin') {
                item.collected = true;
                setCoinsCollected(c => c + 1);
                setScore(s => s + 25);
                playSfx('coin');
                // Coin particle burst
                for (let p = 0; p < 8; p++) {
                  r.particles.push({
                    x: item.x,
                    y: item.y,
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.5) * 5,
                    size: 3,
                    color: '#fbbf24',
                    life: 20,
                    maxLife: 20
                  });
                }
              } else if (item.type === 'shield') {
                item.collected = true;
                r.shieldActive = true;
                setHasShield(true);
                playSfx('coin');
                setRecentAction('🛡️ SHIELD EQUIPPED!');
              } else if (item.type === 'spike' || item.type === 'drone') {
                if (r.shieldActive) {
                  // Shield absorbs the blow!
                  r.shieldActive = false;
                  setHasShield(false);
                  item.collected = true;
                  r.screenShake = 12;
                  playSfx('hit');
                  setRecentAction('💥 SHIELD CRACKED BUT SAVED YOU!');
                } else {
                  // Game Over
                  playSfx('hit');
                  r.screenShake = 18;
                  setGameState('gameover');
                  const finalScore = Math.floor(r.distance / 10);
                  if (finalScore > highScore) {
                    setHighScore(finalScore);
                    try {
                      localStorage.setItem('wispr_runner_high', finalScore.toString());
                    } catch {
                      // ignore
                    }
                    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
                  }
                }
              }
            }
          }
        });

        // Cleanup off-screen items
        r.items = r.items.filter(item => item.x > -50 && !item.collected);
      }

      // Draw Laser Cannon Beam
      if (r.laserTime > 0) {
        r.laserTime--;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 14;
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(r.playerX + 24, r.playerY + 12);
        ctx.lineTo(width, r.playerY + 12);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Core White Beam
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(r.playerX + 24, r.playerY + 12);
        ctx.lineTo(width, r.playerY + 12);
        ctx.stroke();
      }

      // Draw Items
      r.items.forEach(item => {
        if (item.type === 'coin') {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(item.x + item.width / 2, item.y + item.height / 2, item.width / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Inner shimmer
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(item.x + item.width / 2 - 2, item.y + item.height / 2 - 2, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (item.type === 'shield') {
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(item.x + item.width / 2, item.y + item.height / 2, item.width / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px sans-serif';
          ctx.fillText('🛡️', item.x + 3, item.y + 16);
        } else if (item.type === 'spike') {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(item.x, item.y + item.height);
          ctx.lineTo(item.x + item.width / 2, item.y);
          ctx.lineTo(item.x + item.width, item.y + item.height);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#991b1b';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (item.type === 'drone') {
          ctx.fillStyle = '#ec4899';
          ctx.beginPath();
          ctx.roundRect(item.x, item.y, item.width, item.height, 6);
          ctx.fill();
          ctx.strokeStyle = '#be185d';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Drone glowing eye
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(item.x + item.width / 2, item.y + item.height / 2, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(item.x + item.width / 2, item.y + item.height / 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Update & Render Particles
      r.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      r.particles = r.particles.filter(p => p.life > 0);

      // Draw Player Character ("Aero Wispr")
      const px = r.playerX;
      const py = r.playerY;

      // Shield Aura
      if (r.shieldActive) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(px + 14, py + 14, 26, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Body (Glowing rounded cyber cube / sonic orb)
      ctx.fillStyle = effectiveVol > 60 ? '#f43f5e' : (effectiveVol > 25 ? '#a855f7' : '#06b6d4');
      ctx.beginPath();
      ctx.roundRect(px, py, 28, 28, 8);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Expressive Face / Headphones
      // Headphones band
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(px + 14, py + 8, 14, Math.PI, 0);
      ctx.stroke();
      // Headphone ear cups
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(px - 4, py + 8, 5, 10);
      ctx.fillRect(px + 27, py + 8, 5, 10);

      // Eyes
      ctx.fillStyle = '#ffffff';
      if (effectiveVol > 60) {
        // Shocked / Screaming Eyes! (big circles)
        ctx.beginPath();
        ctx.arc(px + 9, py + 12, 4, 0, Math.PI * 2);
        ctx.arc(px + 19, py + 12, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(px + 9, py + 12, 2, 0, Math.PI * 2);
        ctx.arc(px + 19, py + 12, 2, 0, Math.PI * 2);
        ctx.fill();
        // Screaming Open Mouth!
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(px + 14, py + 21, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Normal Happy Eyes
        ctx.beginPath();
        ctx.arc(px + 9, py + 12, 3, 0, Math.PI * 2);
        ctx.arc(px + 19, py + 12, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(px + 10, py + 12, 1.5, 0, Math.PI * 2);
        ctx.arc(px + 20, py + 12, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Smile
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px + 14, py + 17, 3, 0, Math.PI);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [activeMode, gameState, effectiveVol, highScore]);

  const handleStartRunner = () => {
    if (!isListening) {
      onStartMic();
    }
    runnerRef.current.playerY = 260;
    runnerRef.current.playerVy = 0;
    runnerRef.current.distance = 0;
    runnerRef.current.items = [];
    runnerRef.current.particles = [];
    runnerRef.current.shieldActive = false;
    runnerRef.current.laserTime = 0;
    runnerRef.current.lastSpawnDist = 0;
    setScore(0);
    setCoinsCollected(0);
    setHasShield(false);
    setGameState('playing');
    playSfx('win');
  };

  /* ═══════════════════════════════════════════════════════════════════════
     MODE 2: TICKING BOMB PARTY DUEL (CREATIVE VOICE CHALLENGES)
  ═══════════════════════════════════════════════════════════════════════════ */
  const [bombIndex, setBombIndex] = useState<number>(0);
  const [bombTimeLeft, setBombTimeLeft] = useState<number>(10);
  const [bombState, setBombState] = useState<'idle' | 'playing' | 'defused' | 'exploded'>('idle');
  const [bombScore, setBombScore] = useState<number>(0);
  const [bombSuccessText, setBombSuccessText] = useState<string>('');

  const currentPrompt = BOMB_PROMPTS[bombIndex % BOMB_PROMPTS.length];

  // Bomb Countdown Timer
  useEffect(() => {
    if (activeMode !== 'bomb' || bombState !== 'playing') return;
    const interval = setInterval(() => {
      setBombTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          setBombState('exploded');
          playSfx('boom');
          return 0;
        }
        playSfx('tick');
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeMode, bombState, bombIndex]);

  // Voice Verification for Bomb Mode
  useEffect(() => {
    if (activeMode !== 'bomb' || bombState !== 'playing') return;

    // Loudness Check
    if (currentPrompt.type === 'loudness') {
      if (effectiveVol >= (currentPrompt.minVolume || 75)) {
        handleBombSuccess(`💥 LOUD SHOUT REGISTERED (${effectiveVol}% Vol)!`);
      }
      return;
    }

    // Softness Check
    if (currentPrompt.type === 'softness') {
      if (lastSpokenCommand && effectiveVol < (currentPrompt.maxVolume || 35)) {
        handleBombSuccess(`🤫 SOFT WHISPER ACCEPTED!`);
      }
      return;
    }

    // Keyword Match Check
    if (currentPrompt.type === 'keyword' && lastSpokenCommand) {
      const words = lastSpokenCommand.toLowerCase().split(/\s+/);
      const match = currentPrompt.validWords?.some(w => 
        words.some(usrWord => usrWord.includes(w) || w.includes(usrWord))
      );

      if (match) {
        handleBombSuccess(`✅ VERIFIED: "${lastSpokenCommand}"!`);
      }
    }
  }, [effectiveVol, lastSpokenCommand, activeMode, bombState, currentPrompt]);

  const handleBombSuccess = (reason: string) => {
    playSfx('win');
    setBombSuccessText(reason);
    setBombScore(s => s + bombTimeLeft * 100 + 50);

    if (bombIndex + 1 >= BOMB_PROMPTS.length) {
      setBombState('defused');
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    } else {
      setTimeout(() => {
        setBombIndex(i => i + 1);
        setBombTimeLeft(10);
        setBombSuccessText('');
      }, 1200);
    }
  };

  const handleStartBomb = () => {
    if (!isListening) onStartMic();
    setBombIndex(0);
    setBombTimeLeft(10);
    setBombScore(0);
    setBombSuccessText('');
    setBombState('playing');
    playSfx('coin');
  };

  /* ═══════════════════════════════════════════════════════════════════════
     MODE 3: TARGET DECIBEL CANNON (PITCH & MODULATION)
  ═══════════════════════════════════════════════════════════════════════════ */
  const [targetZone, setTargetZone] = useState<{ min: number; max: number }>({ min: 40, max: 65 });
  const [targetHoldTime, setTargetHoldTime] = useState<number>(0);
  const [targetScore, setTargetScore] = useState<number>(0);
  const [aliensDestroyed, setAliensDestroyed] = useState<number>(0);

  useEffect(() => {
    if (activeMode !== 'target') return;
    const interval = setInterval(() => {
      if (effectiveVol >= targetZone.min && effectiveVol <= targetZone.max) {
        setTargetHoldTime(h => {
          if (h >= 100) {
            playSfx('blast');
            setAliensDestroyed(a => a + 1);
            setTargetScore(s => s + 250);
            confetti({ particleCount: 30, spread: 50 });
            // Pick new target range
            const newMin = Math.floor(Math.random() * 40) + 20;
            setTargetZone({ min: newMin, max: newMin + 25 });
            return 0;
          }
          return h + 4;
        });
      } else {
        setTargetHoldTime(h => Math.max(0, h - 2));
      }
    }, 60);
    return () => clearInterval(interval);
  }, [activeMode, effectiveVol, targetZone]);

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* ─── ARCADE HEADER & MODE SWITCHER ─── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="genz-tag tag-cyan">100% REAL-TIME VOICE CONTROLLED</span>
            <span className="genz-tag tag-yellow">NO APIS • PURE ARCADE FUN</span>
          </div>
          <h1 style={{
            fontSize: '2.4rem',
            fontWeight: 900,
            color: '#18181b',
            letterSpacing: '-0.04em',
            marginTop: '8px',
            lineHeight: 1.1
          }}>
            Wispr Voice Arcade 🕹️
          </h1>
          <p style={{ color: '#4b5563', fontSize: '0.98rem', marginTop: '4px', fontWeight: 500 }}>
            No boring forms, no technical setup. Just speak, scream, or whisper into your mic to play!
          </p>
        </div>

      </div>

      {/* ─── LIVE VOICE SENSOR BAR (ALWAYS ACTIVE) ─── */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '14px 20px',
        border: '2px solid var(--border-black)',
        boxShadow: '4px 4px 0px var(--border-black)',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Mic Activation Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onStartMic}
            className="btn-brutal-green"
            style={{
              backgroundColor: isListening ? '#86efac' : '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              fontSize: '0.9rem'
            }}
          >
            {isListening ? <Mic size={18} /> : <MicOff size={18} />}
            <span>{isListening ? '🎤 Mic Live & Listening' : '🔴 Click to Turn On Mic'}</span>
          </button>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#6b7280' }}>
              Real-Time Voice Volume
            </span>
            <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#18181b' }}>
              {effectiveVol}% &nbsp;
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: effectiveVol > 60 ? '#ef4444' : '#059669' }}>
                {effectiveVol < 15 ? '🤫 Silent / Whisper' : effectiveVol < 45 ? '💬 Talking' : effectiveVol < 75 ? '🚀 LOUD JUMP!' : '🔥 MAXIMUM SCREAM!'}
              </span>
            </span>
          </div>
        </div>

        {/* Visual Volume Meter Gauge */}
        <div style={{ flex: 1, minWidth: '220px', maxWidth: '450px' }}>
          <div style={{
            height: '20px',
            backgroundColor: '#f3f4f6',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '2px solid var(--border-black)',
            position: 'relative'
          }}>
            <div style={{
              width: `${Math.min(100, effectiveVol)}%`,
              height: '100%',
              backgroundColor: effectiveVol > 75 ? '#ef4444' : effectiveVol > 40 ? '#f59e0b' : '#10b981',
              transition: 'width 0.05s ease',
              borderRadius: '6px'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, marginTop: '3px', color: '#9ca3af' }}>
            <span>0% Whisper</span>
            <span>40% Talk</span>
            <span>70% Shout</span>
            <span>100% Scream</span>
          </div>
        </div>

        {/* Mic Sensitivity Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={16} color="#6b7280" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>Mic Boost:</span>
          <input
            type="range"
            min="0.8"
            max="2.5"
            step="0.1"
            value={sensitivity}
            onChange={(e) => setSensitivity(parseFloat(e.target.value))}
            style={{ width: '90px', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#18181b' }}>{sensitivity}x</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MODE 1 VIEW: SCREAM RUNNER
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeMode === 'runner' && (
        <div className="runner-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          {/* Main Game Screen Canvas */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '3px solid var(--border-black)',
            boxShadow: '6px 6px 0px var(--border-black)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Top Canvas HUD Overlay */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              right: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pointerEvents: 'none',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="genz-tag" style={{ backgroundColor: '#ffffff', color: '#18181b', fontSize: '0.95rem', fontWeight: 900 }}>
                  🏆 Score: {score}
                </div>
                <div className="genz-tag" style={{ backgroundColor: '#fef08a', color: '#854d0e', fontSize: '0.95rem', fontWeight: 900 }}>
                  🪙 Coins: {coinsCollected}
                </div>
                {hasShield && (
                  <div className="genz-tag" style={{ backgroundColor: '#bae6fd', color: '#0369a1', fontSize: '0.95rem', fontWeight: 900 }}>
                    🛡️ Shield Active!
                  </div>
                )}
              </div>

              <div className="genz-tag" style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#ffffff', fontSize: '0.85rem' }}>
                High Score: {highScore}
              </div>
            </div>

            {/* Recent Voice Spell / Action Flash */}
            {recentAction && (
              <div style={{
                position: 'absolute',
                top: '64px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(24, 24, 27, 0.85)',
                color: '#facc15',
                padding: '6px 16px',
                borderRadius: '999px',
                fontWeight: 900,
                fontSize: '0.92rem',
                border: '1.5px solid #facc15',
                pointerEvents: 'none',
                zIndex: 10
              }}>
                {recentAction}
              </div>
            )}

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={800}
              height={360}
              style={{ width: '100%', height: 'auto', display: 'block', backgroundColor: '#090d16' }}
            />

            {/* Start / Game Over Modal Overlays */}
            {gameState === 'idle' && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.82)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                textAlign: 'center',
                padding: '24px'
              }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>🚀</div>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#ffffff' }}>
                  SCREAM RUNNER: SONIC BLAST
                </h2>
                <p style={{ color: '#cbd5e1', maxWidth: '440px', marginTop: '6px', fontSize: '0.95rem' }}>
                  Your voice is your controller! <strong>Whisper</strong> to run, <strong>TALK / SHOUT</strong> to jump into the sky, and say <strong>"BLAST"</strong> to vaporize obstacles!
                </p>

                <button
                  onClick={handleStartRunner}
                  className="btn-brutal-green"
                  style={{
                    fontSize: '1.15rem',
                    padding: '14px 32px',
                    marginTop: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <Play size={20} />
                  <span>START VOICE RUNNER</span>
                </button>
              </div>
            )}

            {gameState === 'gameover' && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.88)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                textAlign: 'center',
                padding: '24px'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '6px' }}>💥</div>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#f87171' }}>
                  CRASH! GAME OVER
                </h2>
                <div style={{ display: 'flex', gap: '16px', margin: '14px 0' }}>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '10px 18px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>DISTANCE SCORE</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fde047' }}>{score}</div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '10px 18px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>COINS</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#38bdf8' }}>{coinsCollected}</div>
                  </div>
                </div>

                <button
                  onClick={handleStartRunner}
                  className="btn-brutal-green"
                  style={{
                    fontSize: '1.1rem',
                    padding: '12px 28px',
                    marginTop: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <RotateCcw size={18} />
                  <span>TRY AGAIN (SCREAM HARDER!)</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Info Card: Voice Controls Cheat Sheet */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '20px',
              border: '2.5px solid var(--border-black)',
              boxShadow: '4px 4px 0px var(--border-black)'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#18181b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="#eab308" />
                <span>Voice Controls Guide</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                <div style={{ padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1.5px solid #86efac' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#166534' }}>🗣️ TALK / SHOUT LOUD</div>
                  <div style={{ fontSize: '0.78rem', color: '#15803d', marginTop: '2px' }}>
                    Speak up or yell to launch high into the air and clear spikes!
                  </div>
                </div>

                <div style={{ padding: '10px', backgroundColor: '#eff6ff', borderRadius: '10px', border: '1.5px solid #93c5fd' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#1e40af' }}>💥 Say "BLAST" or "FIRE"</div>
                  <div style={{ fontSize: '0.78rem', color: '#1d4ed8', marginTop: '2px' }}>
                    Fires a giant screen-clearing laser cannon that destroys obstacles!
                  </div>
                </div>

                <div style={{ padding: '10px', backgroundColor: '#faf5ff', borderRadius: '10px', border: '1.5px solid #d8b4fe' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#6b21a8' }}>🦘 Say "JUMP"</div>
                  <div style={{ fontSize: '0.78rem', color: '#7e22ce', marginTop: '2px' }}>
                    Performs an instant acrobatic high-spring leap!
                  </div>
                </div>

                <div style={{ padding: '10px', backgroundColor: '#fffbeb', borderRadius: '10px', border: '1.5px solid #fde68a' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#92400e' }}>🛡️ Say "SHIELD"</div>
                  <div style={{ fontSize: '0.78rem', color: '#b45309', marginTop: '2px' }}>
                    Deploys an energy bubble to absorb 1 crash impact!
                  </div>
                </div>
              </div>
            </div>

            {/* Live Transcript Bubble */}
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              padding: '16px',
              border: '2px solid var(--border-black)',
              boxShadow: '3px 3px 0px var(--border-black)'
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                Heard Voice Input
              </div>
              <div style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: lastSpokenCommand ? '#059669' : '#94a3b8',
                marginTop: '4px',
                minHeight: '28px'
              }}>
                {lastSpokenCommand ? `"${lastSpokenCommand}"` : '(Waiting for your voice...)'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODE 2 VIEW: TICKING BOMB PARTY DUEL
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeMode === 'bomb' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '3px solid var(--border-black)',
          boxShadow: '6px 6px 0px var(--border-black)',
          padding: '36px',
          textAlign: 'center',
          maxWidth: '820px',
          margin: '0 auto'
        }}>
          {bombState === 'idle' && (
            <div>
              <div style={{ fontSize: '4.5rem', marginBottom: '12px' }}>💣</div>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#18181b', letterSpacing: '-0.04em' }}>
                TICKING VOICE BOMB: PARTY DUEL
              </h2>
              <p style={{ color: '#4b5563', fontSize: '1.05rem', maxWidth: '520px', margin: '10px auto 24px' }}>
                Can you beat the 10-second fuse? Speak or shout funny answers into your mic to defuse 10 rounds of ticking bombs before they blow up!
              </p>
              <button
                onClick={handleStartBomb}
                className="btn-brutal-green"
                style={{ fontSize: '1.2rem', padding: '14px 36px' }}
              >
                START DEFUSING THE BOMB!
              </button>
            </div>
          )}

          {bombState === 'playing' && (
            <div>
              {/* Bomb Progress & Score */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span className="genz-tag tag-cyan">Round {bombIndex + 1} of {BOMB_PROMPTS.length}</span>
                <span className="genz-tag tag-yellow">Score: {bombScore} pts</span>
              </div>

              {/* Big Animated Bomb Graphic with Sizzling Timer */}
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
                <div style={{
                  fontSize: '6rem',
                  transform: bombTimeLeft <= 3 ? 'scale(1.15)' : 'scale(1)',
                  transition: 'transform 0.15s ease'
                }}>
                  💣
                </div>

                <div style={{
                  position: 'absolute',
                  top: '55%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: bombTimeLeft <= 3 ? '#ef4444' : '#18181b',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '54px',
                  height: '54px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  border: '3px solid #ffffff'
                }}>
                  {bombTimeLeft}s
                </div>
              </div>

              {/* Current Prompt */}
              <div style={{
                backgroundColor: '#fef3c7',
                border: '2.5px solid var(--border-black)',
                borderRadius: '16px',
                padding: '20px',
                maxWidth: '640px',
                margin: '0 auto 20px'
              }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#92400e' }}>
                  {currentPrompt.instruction}
                </div>
                <div style={{ fontSize: '0.88rem', color: '#b45309', marginTop: '6px', fontWeight: 600 }}>
                  💡 Hint: {currentPrompt.hint}
                </div>
              </div>

              {/* Success Banner */}
              {bombSuccessText && (
                <div style={{
                  backgroundColor: '#dcfce7',
                  border: '2px solid #22c55e',
                  color: '#15803d',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  marginBottom: '16px'
                }}>
                  {bombSuccessText}
                </div>
              )}

              {/* Live Speech Feedback */}
              <div style={{ fontSize: '0.92rem', color: '#6b7280', fontWeight: 600 }}>
                Mic Detected: <span style={{ color: '#18181b', fontWeight: 800 }}>"{lastSpokenCommand || '...'}"</span>
              </div>
            </div>
          )}

          {bombState === 'defused' && (
            <div>
              <div style={{ fontSize: '4.5rem', marginBottom: '12px' }}>👑</div>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#15803d' }}>
                BOMB SQUAD CHAMPION!
              </h2>
              <p style={{ color: '#4b5563', fontSize: '1.1rem', margin: '8px auto 20px' }}>
                Incredible! You defused all 10 voice bombs with lightning reflexes!
              </p>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#eab308', marginBottom: '24px' }}>
                Final Score: {bombScore}
              </div>
              <button onClick={handleStartBomb} className="btn-brutal-green" style={{ fontSize: '1.1rem', padding: '12px 30px' }}>
                PLAY AGAIN
              </button>
            </div>
          )}

          {bombState === 'exploded' && (
            <div>
              <div style={{ fontSize: '4.5rem', marginBottom: '12px' }}>💥</div>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#dc2626' }}>
                KABOOM! TIME EXPIRED!
              </h2>
              <p style={{ color: '#4b5563', fontSize: '1.05rem', margin: '8px auto 20px' }}>
                The fuse burned down! Speak faster next time!
              </p>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#18181b', marginBottom: '24px' }}>
                Score: {bombScore}
              </div>
              <button onClick={handleStartBomb} className="btn-brutal-green" style={{ fontSize: '1.1rem', padding: '12px 30px' }}>
                TRY AGAIN
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODE 3 VIEW: VOCAL DECIBEL CANNON
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeMode === 'target' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '3px solid var(--border-black)',
          boxShadow: '6px 6px 0px var(--border-black)',
          padding: '36px',
          textAlign: 'center',
          maxWidth: '820px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span className="genz-tag tag-cyan">👾 Aliens Blasted: {aliensDestroyed}</span>
            <span className="genz-tag tag-yellow">Score: {targetScore}</span>
          </div>

          <div style={{ fontSize: '4.5rem', marginBottom: '12px' }}>🛸</div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#18181b', letterSpacing: '-0.03em' }}>
            VOCAL DECIBEL CANNON
          </h2>
          <p style={{ color: '#4b5563', fontSize: '1rem', maxWidth: '520px', margin: '8px auto 24px' }}>
            Modulate your voice volume! Hold your voice inside the target green zone to charge up the sonic laser and destroy the alien saucer!
          </p>

          {/* Target Zone Bar */}
          <div style={{
            position: 'relative',
            height: '48px',
            backgroundColor: '#f1f5f9',
            borderRadius: '16px',
            border: '3px solid var(--border-black)',
            overflow: 'hidden',
            margin: '0 auto 20px',
            maxWidth: '600px'
          }}>
            {/* Target Green Zone */}
            <div style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${targetZone.min}%`,
              width: `${targetZone.max - targetZone.min}%`,
              backgroundColor: '#bbf7d0',
              borderLeft: '2px dashed #16a34a',
              borderRight: '2px dashed #16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem',
              color: '#166534'
            }}>
              TARGET ZONE ({targetZone.min}% - {targetZone.max}%)
            </div>

            {/* Live Voice Indicator Needle */}
            <div style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${effectiveVol}%`,
              width: '8px',
              backgroundColor: '#dc2626',
              boxShadow: '0 0 10px #ef4444',
              transform: 'translateX(-50%)',
              transition: 'left 0.05s ease'
            }} />
          </div>

          {/* Cannon Charge Progress Bar */}
          <div style={{ maxWidth: '600px', margin: '0 auto 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>
              <span>Laser Charge:</span>
              <span>{targetHoldTime}%</span>
            </div>
            <div style={{ height: '16px', backgroundColor: '#e2e8f0', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--border-black)' }}>
              <div style={{
                height: '100%',
                width: `${targetHoldTime}%`,
                backgroundColor: '#38bdf8',
                transition: 'width 0.08s linear'
              }} />
            </div>
          </div>

          <div style={{ fontSize: '1rem', fontWeight: 800, color: effectiveVol >= targetZone.min && effectiveVol <= targetZone.max ? '#16a34a' : '#9ca3af' }}>
            {effectiveVol >= targetZone.min && effectiveVol <= targetZone.max ? '⚡ CHARGING LASER BEAM!' : 'Adjust voice volume into the target zone!'}
          </div>
        </div>
      )}
    </div>
  );
};
