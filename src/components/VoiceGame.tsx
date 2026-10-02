import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Mic, RotateCcw, Scroll, Swords, Sparkles, Star, Shield, Flame, Volume2, ChevronRight, Trophy } from 'lucide-react';

interface VoiceGameProps {
  isListening: boolean;
  volume: number;
  onStartMic: () => void;
  playTone: (freq?: number, type?: OscillatorType, duration?: number) => void;
  lastSpokenCommand?: string;
}

/* ─── ROOM DEFINITIONS ──────────────────────────────────────────────────── */
type RoomType = 'forest' | 'cave' | 'castle' | 'volcano' | 'sky' | 'final';
type PlayerClass = 'wizard' | 'warrior' | 'rogue';

interface Room {
  id: RoomType;
  title: string;
  emoji: string;
  gradient: [string, string];
  description: string;
  challenge: string;           // what the player must say
  triggerWords: string[];      // aliases
  loot: string;
  xp: number;
  monster?: string;
  monsterHp?: number;
}

const ROOMS: Room[] = [
  {
    id: 'forest',
    title: 'The Whispering Forest',
    emoji: '🌲',
    gradient: ['#064e3b', '#065f46'],
    description: 'A sentient forest blocks your path. Its ancient tree-spirits demand a password whispered from the soul.',
    challenge: 'open',
    triggerWords: ['open', 'sesame', 'unlock', 'reveal', 'enter'],
    loot: '🗝️ Ancient Key',
    xp: 100,
  },
  {
    id: 'cave',
    title: 'The Dragon\'s Cave',
    emoji: '🐉',
    gradient: ['#7c2d12', '#9a3412'],
    description: 'A sleeping dragon blocks the treasure vault. Its one weakness: the sound of pure laughter. Make it laugh!',
    challenge: 'haha',
    triggerWords: ['haha', 'hehe', 'lol', 'laugh', 'funny', 'joke', 'giggle'],
    loot: '💎 Dragon Gem',
    xp: 200,
    monster: '🐉 Ignis the Sleeping Drake',
    monsterHp: 100,
  },
  {
    id: 'castle',
    title: 'The Haunted Castle',
    emoji: '🏰',
    gradient: ['#312e81', '#3730a3'],
    description: 'A ghost knight challenges you to a duel! You have no sword — only words. Name the spell of dispelling!',
    challenge: 'begone',
    triggerWords: ['begone', 'vanish', 'disappear', 'ghost', 'banish', 'away', 'gone'],
    loot: '🛡️ Enchanted Shield',
    xp: 300,
    monster: '👻 Sir Wraithmore the Undying',
    monsterHp: 150,
  },
  {
    id: 'volcano',
    title: 'The Volcano Summit',
    emoji: '🌋',
    gradient: ['#7c2d12', '#c2410c'],
    description: 'The lava god demands a sacrifice — but will accept a dramatic BATTLE CRY as tribute! Scream your war cry!',
    challenge: 'charge',
    triggerWords: ['charge', 'attack', 'battle', 'fight', 'war', 'forward', 'go', 'rush'],
    loot: '⚔️ Obsidian Blade',
    xp: 400,
    monster: '🌋 Magmar the Lava God',
    monsterHp: 200,
  },
  {
    id: 'sky',
    title: 'The Sky Citadel',
    emoji: '☁️',
    gradient: ['#0c4a6e', '#075985'],
    description: 'A wise cloud-wizard refuses to let you pass. She will only move for those who can say the magic sky word.',
    challenge: 'fly',
    triggerWords: ['fly', 'soar', 'float', 'cloud', 'sky', 'wings', 'ascend', 'rise'],
    loot: '🪄 Cloud Staff',
    xp: 500,
    monster: '☁️ Nimbus the Cloudwitch',
    monsterHp: 250,
  },
  {
    id: 'final',
    title: 'The Voice Sanctum',
    emoji: '✨',
    gradient: ['#4c1d95', '#5b21b6'],
    description: 'The final guardian — a mirror of yourself. It can only be defeated by the most powerful word in any language. Speak it.',
    challenge: 'wispr',
    triggerWords: ['wispr', 'whisper', 'flow', 'voice', 'speak', 'word'],
    loot: '👑 Crown of the Voice Mage',
    xp: 1000,
    monster: '🪞 The Shadow Self',
    monsterHp: 300,
  },
];

const CLASS_DATA: Record<PlayerClass, { name: string; emoji: string; color: string; perk: string; hp: number }> = {
  wizard: { name: 'Voice Wizard',  emoji: '🧙', color: '#7c3aed', perk: '+50% XP per room',    hp: 80  },
  warrior: { name: 'Battle Crier', emoji: '⚔️', color: '#c2410c', perk: 'Monsters deal -30% damage', hp: 120 },
  rogue:   { name: 'Word Rogue',   emoji: '🗡️', color: '#0284c7', perk: 'Aliases accepted freely',   hp: 100 },
};

/* ─── COMPONENT ─────────────────────────────────────────────────────────── */
export const VoiceGame: React.FC<VoiceGameProps> = ({
  isListening,
  volume,
  onStartMic,
  playTone,
  lastSpokenCommand = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);

  const [screen, setScreen] = useState<'select' | 'playing' | 'victory'>('select');
  const [playerClass, setPlayerClass] = useState<PlayerClass>('wizard');
  const [roomIndex, setRoomIndex] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [monsterHp, setMonsterHp] = useState(100);
  const [score, setScore] = useState(0);
  const [inventory, setInventory] = useState<string[]>([]);
  const [log, setLog] = useState<string[]>(['Your adventure begins... speak to shape the world!']);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState<'green' | 'red' | null>(null);
  const [highScore] = useState(() => Number(localStorage.getItem('yap_quest_hi') || 0));

  const room = ROOMS[Math.min(roomIndex, ROOMS.length - 1)];
  const cls = CLASS_DATA[playerClass];

  /* ─── Canvas ambient animation ───────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;
    const stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * 800,
      y: Math.random() * 300,
      r: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.4 + 0.1,
      twinkle: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      t += 0.02;

      // Subtle dot-grid breathing
      const vNorm = Math.min(volume / 60, 1);
      const pulse = 1 + vNorm * 0.35;

      stars.forEach(s => {
        s.twinkle += 0.04;
        const alpha = 0.3 + 0.5 * Math.abs(Math.sin(s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(216, 180, 254, ${alpha})`;
        ctx.fill();
        s.y -= s.speed;
        if (s.y < 0) { s.y = h; s.x = Math.random() * w; }
      });

      // Voice-reactive halo
      if (volume > 8) {
        const cx = w * 0.5, cy = h * 0.5;
        const rings = 4;
        for (let i = 0; i < rings; i++) {
          const rad = 30 + i * 28 + vNorm * 60;
          const alpha = Math.max(0, 0.6 - i * 0.15 - (1 - vNorm) * 0.3);
          ctx.beginPath();
          ctx.arc(cx, cy, rad, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(216, 180, 254, ${alpha})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [volume, screen]);

  /* ─── Voice command matching ─────────────────────────────────────────── */
  const addLog = useCallback((msg: string) => {
    setLog(prev => [...prev.slice(-6), msg]);
  }, []);

  const triggerSuccess = useCallback(() => {
    const xpGain = Math.round(room.xp * (playerClass === 'wizard' ? 1.5 : 1));
    setScore(s => s + xpGain);
    setInventory(inv => [...inv, room.loot]);
    setFlash('green');
    setTimeout(() => setFlash(null), 600);
    playTone(660, 'sine', 0.25);
    setTimeout(() => playTone(880, 'sine', 0.2), 180);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 }, colors: ['#d8b4fe', '#86efac', '#fef08a'] });
    addLog(`✅ ${room.loot} obtained! +${xpGain} XP`);

    setTimeout(() => {
      if (roomIndex + 1 >= ROOMS.length) {
        setScreen('victory');
        const finalScore = score + xpGain;
        const hi = Math.max(highScore, finalScore);
        localStorage.setItem('yap_quest_hi', String(hi));
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.4 } });
      } else {
        setRoomIndex(r => r + 1);
        setMonsterHp(ROOMS[roomIndex + 1]?.monsterHp ?? 100);
        addLog(`🚪 New room unlocked: ${ROOMS[roomIndex + 1]?.title}`);
      }
    }, 900);
  }, [room, roomIndex, playerClass, score, highScore, playTone, addLog]);

  const triggerFailure = useCallback(() => {
    const dmg = playerClass === 'warrior' ? 7 : 10;
    setPlayerHp(hp => {
      const next = Math.max(0, hp - dmg);
      if (next <= 0) { setScreen('select'); }
      return next;
    });
    setShake(true);
    setTimeout(() => setShake(false), 450);
    setFlash('red');
    setTimeout(() => setFlash(null), 600);
    playTone(180, 'sawtooth', 0.2);
    addLog(`❌ The ${room.monster ?? 'guardian'} attacks! -${dmg} HP`);
  }, [playerClass, room, playTone, addLog]);

  useEffect(() => {
    if (!lastSpokenCommand || screen !== 'playing') return;
    const lower = lastSpokenCommand.toLowerCase().trim();
    const hit = room.triggerWords.some(w => lower.includes(w));
    if (hit) {
      triggerSuccess();
    } else if (lower.length > 2) {
      triggerFailure();
    }
  }, [lastSpokenCommand, screen, room, triggerSuccess, triggerFailure]);

  /* ─── Start game ─────────────────────────────────────────────────────── */
  const startGame = () => {
    if (!isListening) onStartMic();
    setScreen('playing');
    setRoomIndex(0);
    setScore(0);
    setInventory([]);
    setPlayerHp(cls.hp);
    setMonsterHp(ROOMS[0].monsterHp ?? 100);
    setLog(['🎮 Quest started! Speak to defeat the guardian...']);
    playTone(440, 'triangle', 0.2);
  };

  /* ─── HP bars ─────────────────────────────────────────────────────────── */
  const HpBar = ({ current, max, color }: { current: number; max: number; color: string }) => (
    <div style={{ width: '100%', height: '10px', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '999px', overflow: 'hidden', border: '1.5px solid var(--border-black)' }}>
      <div style={{ height: '100%', width: `${Math.max(0, (current / max) * 100)}%`, backgroundColor: color, borderRadius: '999px', transition: 'width 0.3s ease' }} />
    </div>
  );

  /* ─── CLASS SELECT SCREEN ────────────────────────────────────────────── */
  if (screen === 'select') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        {/* Canvas BG */}
        <canvas ref={canvasRef} width={800} height={300} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, opacity: 0.35 }} />

        {/* Header */}
        <div className="genz-card" style={{ padding: '32px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>🎙️</div>
          <h2 className="serif-headline" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', marginBottom: '8px' }}>
            Yap Quest
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto 8px' }}>
            A voice-powered RPG adventure. Speak magic words to defeat monsters, collect loot, and conquer 6 mythical realms — <strong>no keyboard required.</strong>
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '12px' }}>
            <span className="genz-tag" style={{ backgroundColor: 'var(--accent-lilac)' }}>🗺️ 6 ROOMS</span>
            <span className="genz-tag" style={{ backgroundColor: 'var(--accent-yellow)' }}>🎙️ VOICE-ONLY</span>
            <span className="genz-tag" style={{ backgroundColor: 'var(--accent-matcha)' }}>👾 LIVE MONSTERS</span>
            <span className="genz-tag" style={{ backgroundColor: 'var(--accent-peach)' }}>🏆 HIGH SCORE: {highScore}</span>
          </div>
        </div>

        {/* Class selection */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', position: 'relative', zIndex: 1 }}>
          {(Object.entries(CLASS_DATA) as [PlayerClass, typeof CLASS_DATA[PlayerClass]][]).map(([key, c]) => (
            <button
              key={key}
              onClick={() => setPlayerClass(key)}
              className="genz-card"
              style={{
                padding: '28px 24px',
                textAlign: 'left',
                cursor: 'pointer',
                background: playerClass === key ? c.color : '#ffffff',
                color: playerClass === key ? '#ffffff' : 'var(--text-main)',
                border: playerClass === key ? `3px solid var(--border-black)` : '2.5px solid var(--border-black)',
                boxShadow: playerClass === key ? '6px 6px 0px var(--border-black)' : 'var(--shadow-brutal)',
                transform: playerClass === key ? 'translate(-2px, -2px)' : 'none',
                transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div style={{ fontSize: '2.4rem', marginBottom: '10px' }}>{c.emoji}</div>
              <div style={{ fontWeight: 900, fontSize: '1.2rem', marginBottom: '4px' }}>{c.name}</div>
              <div style={{ fontSize: '0.88rem', opacity: 0.75, marginBottom: '10px' }}>{c.perk}</div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.82rem', fontWeight: 700, opacity: 0.8 }}>
                <span>❤️ {c.hp} HP</span>
              </div>
              {playerClass === key && (
                <div style={{ marginTop: '12px', fontSize: '0.8rem', fontWeight: 800, backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '999px', display: 'inline-block' }}>
                  ✓ SELECTED
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Preview of rooms */}
        <div className="genz-card" style={{ padding: '24px', zIndex: 1, position: 'relative' }}>
          <h3 style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '16px' }}>🗺️ The 6 Realms You'll Conquer:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
            {ROOMS.map((r, i) => (
              <div key={r.id} style={{ padding: '10px 14px', background: `linear-gradient(135deg, ${r.gradient[0]}, ${r.gradient[1]})`, borderRadius: '12px', border: '2px solid var(--border-black)', boxShadow: '2px 2px 0px var(--border-black)', color: '#ffffff' }}>
                <div style={{ fontSize: '1.4rem' }}>{r.emoji}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, marginTop: '4px' }}>{r.title}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.75, marginTop: '2px' }}>+{r.xp} XP</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', zIndex: 1, position: 'relative' }}>
          <button onClick={startGame} className="btn-brutal-lilac" style={{ padding: '18px 48px', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
            <Scroll size={22} />
            Begin Quest as {cls.name} {cls.emoji}
          </button>
        </div>
      </div>
    );
  }

  /* ─── VICTORY SCREEN ─────────────────────────────────────────────────── */
  if (screen === 'victory') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <canvas ref={canvasRef} width={800} height={300} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, opacity: 0.35 }} />
        <div className="genz-card" style={{ padding: '48px', textAlign: 'center', zIndex: 1, position: 'relative', background: 'linear-gradient(135deg, #fef08a 0%, #d8b4fe 100%)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '12px' }}>👑</div>
          <h2 className="serif-headline" style={{ fontSize: '3rem', marginBottom: '8px' }}>Quest Complete!</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '24px' }}>You conquered all 6 realms with your voice alone.</p>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '28px' }}>
            <div className="genz-card" style={{ padding: '16px 28px', backgroundColor: '#ffffff' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>FINAL SCORE</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#7c3aed' }}>{score}</div>
            </div>
            <div className="genz-card" style={{ padding: '16px 28px', backgroundColor: '#ffffff' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>ITEMS FOUND</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900 }}>{inventory.length}</div>
            </div>
            <div className="genz-card" style={{ padding: '16px 28px', backgroundColor: '#ffffff' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>HP REMAINING</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#059669' }}>{playerHp}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
            {inventory.map((item, i) => (
              <span key={i} className="genz-tag" style={{ backgroundColor: 'var(--accent-lilac)', fontSize: '0.95rem', padding: '6px 14px' }}>{item}</span>
            ))}
          </div>
          <button onClick={() => setScreen('select')} className="btn-brutal-lilac" style={{ padding: '14px 36px', fontSize: '1.05rem' }}>
            <RotateCcw size={18} /> Play Again
          </button>
        </div>
      </div>
    );
  }

  /* ─── MAIN GAME SCREEN ───────────────────────────────────────────────── */
  const mHpMax = room.monsterHp ?? 100;
  const progressPct = (roomIndex / ROOMS.length) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', position: 'relative' }}>
      {/* Ambient canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, opacity: 0.25 }}
      />

      {/* Flash overlay */}
      {flash && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999, pointerEvents: 'none',
          backgroundColor: flash === 'green' ? 'rgba(134, 239, 172, 0.25)' : 'rgba(244, 63, 94, 0.22)',
          transition: 'opacity 0.3s',
        }} />
      )}

      {/* Top Status Bar */}
      <div className="genz-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '1.5rem' }}>{cls.emoji}</span>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)' }}>{cls.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ef4444' }}>❤️ {playerHp}/{cls.hp}</span>
              <div style={{ width: '100px' }}><HpBar current={playerHp} max={cls.hp} color="#ef4444" /></div>
            </div>
          </div>
        </div>

        {/* Quest progress */}
        <div style={{ flex: 1, maxWidth: '320px', minWidth: '200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, marginBottom: '4px', color: 'var(--text-muted)' }}>
            <span>QUEST PROGRESS</span>
            <span>Room {roomIndex + 1} / {ROOMS.length}</span>
          </div>
          <div style={{ width: '100%', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '999px', border: '1.5px solid var(--border-black)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #d8b4fe, #7c3aed)', borderRadius: '999px', transition: 'width 0.5s ease' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="genz-tag" style={{ backgroundColor: 'var(--accent-yellow)', fontSize: '0.95rem', padding: '6px 14px' }}>
            <Trophy size={14} style={{ display: 'inline', marginRight: '4px' }} />
            {score} XP
          </div>
          <button onClick={() => setScreen('select')} className="btn-brutal-white" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
            <RotateCcw size={14} /> Quit
          </button>
        </div>
      </div>

      {/* Main Game Area */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(300px, 1fr)', gap: '20px', position: 'relative', zIndex: 1 }}>

        {/* Left: Room & Monster Panel */}
        <div
          className="genz-card"
          style={{
            padding: '0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '520px',
            animation: shake ? 'shakeAnim 0.45s ease' : 'none',
          }}
        >
          {/* Room header with gradient */}
          <div style={{
            background: `linear-gradient(135deg, ${room.gradient[0]}, ${room.gradient[1]})`,
            padding: '28px 28px 24px',
            color: '#ffffff',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.75, letterSpacing: '0.08em', marginBottom: '6px' }}>
                  🗺️ REALM {roomIndex + 1} OF {ROOMS.length}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '2.8rem' }}>{room.emoji}</span>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', lineHeight: '1.1', fontWeight: 700 }}>
                    {room.title}
                  </h2>
                </div>
                <p style={{ fontSize: '0.95rem', opacity: 0.9, maxWidth: '520px', lineHeight: '1.55' }}>
                  {room.description}
                </p>
              </div>
              <span style={{ fontSize: '2rem', opacity: 0.3 }}>{cls.emoji}</span>
            </div>
          </div>

          {/* Monster HP */}
          {room.monster && (
            <div style={{ padding: '16px 28px', borderBottom: '2px solid rgba(24,24,27,0.08)', backgroundColor: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>{room.monster}</span>
                <span className="genz-tag" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                  💀 {monsterHp}/{mHpMax} HP
                </span>
              </div>
              <HpBar current={monsterHp} max={mHpMax} color="#ef4444" />
            </div>
          )}

          {/* The Voice Command Challenge */}
          <div style={{ flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#6b21a8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              🎙️ Speak the magic word to defeat the guardian:
            </div>
            <div style={{
              background: 'linear-gradient(135deg, var(--accent-lilac-soft), #f3e8ff)',
              border: '3px solid var(--border-black)',
              borderRadius: '20px',
              padding: '20px 40px',
              boxShadow: '6px 6px 0px var(--border-black)',
              position: 'relative',
            }}>
              <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', letterSpacing: '0.04em' }}>
                "{room.challenge}"
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 700 }}>
                (or any of: {room.triggerWords.slice(0, 4).join(', ')}...)
              </div>
            </div>

            {/* Loot preview */}
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              🎁 Reward for this room: <strong style={{ color: 'var(--text-main)' }}>{room.loot}</strong> + {room.xp} XP
            </div>
          </div>

          {/* Bottom: Live mic status */}
          <div style={{ padding: '14px 28px', borderTop: '2px solid rgba(24,24,27,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fafafa' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: isListening ? '#22c55e' : '#94a3b8', boxShadow: isListening ? '0 0 8px #22c55e' : 'none', animation: isListening ? 'pulse 1.5s infinite' : 'none' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {isListening ? `Listening: "${lastSpokenCommand || '...'}"` : 'Mic off — click Start Voice'}
              </span>
            </div>
            {!isListening && (
              <button onClick={onStartMic} className="btn-brutal-lilac" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                <Mic size={14} /> Start Voice
              </button>
            )}
          </div>
        </div>

        {/* Right: Inventory + Log + Hint */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Inventory */}
          <div className="genz-card" style={{ padding: '20px' }}>
            <h3 style={{ fontWeight: 900, fontSize: '0.95rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={16} color="#f59e0b" /> Inventory ({inventory.length})
            </h3>
            {inventory.length === 0 ? (
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 600 }}>No items yet. Speak to claim your first loot!</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {inventory.map((item, i) => (
                  <span key={i} className="genz-tag" style={{ backgroundColor: 'var(--accent-yellow)', fontSize: '0.88rem', padding: '5px 12px' }}>{item}</span>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming rooms preview */}
          <div className="genz-card" style={{ padding: '20px' }}>
            <h3 style={{ fontWeight: 900, fontSize: '0.95rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ChevronRight size={16} /> Next Realms
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ROOMS.slice(roomIndex, Math.min(roomIndex + 3, ROOMS.length)).map((r, i) => (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px',
                  borderRadius: '10px', border: '1.5px solid var(--border-black)',
                  backgroundColor: i === 0 ? 'var(--accent-lilac-soft)' : '#f8fafc',
                  boxShadow: i === 0 ? '2px 2px 0px var(--border-black)' : 'none',
                }}>
                  <span style={{ fontSize: '1.2rem' }}>{r.emoji}</span>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800 }}>{r.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>{r.loot} • +{r.xp} XP</div>
                  </div>
                  {i === 0 && <span className="genz-tag" style={{ backgroundColor: 'var(--accent-lilac)', marginLeft: 'auto', fontSize: '0.7rem' }}>NOW</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Battle log */}
          <div className="genz-card" style={{ padding: '20px', flex: 1 }}>
            <h3 style={{ fontWeight: 900, fontSize: '0.95rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Scroll size={16} /> Battle Log
            </h3>
            <div style={{
              backgroundColor: '#111827', borderRadius: '10px', padding: '14px',
              border: '2px solid var(--border-black)', boxShadow: '2px 2px 0px var(--border-black)',
              fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: '1.7',
              color: '#a7f3d0', maxHeight: '180px', overflowY: 'auto', display: 'flex',
              flexDirection: 'column', gap: '2px',
            }}>
              {log.map((line, i) => (
                <div key={i} style={{ color: line.startsWith('✅') ? '#86efac' : line.startsWith('❌') ? '#fca5a5' : '#a7f3d0' }}>
                  <span style={{ color: '#4b5563' }}>{'>'} </span>{line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shakeAnim {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};
