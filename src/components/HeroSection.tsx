import React from 'react';

export const HeroSection: React.FC = () => (
  <section style={{
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', textAlign: 'center',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    position: 'relative', overflow: 'hidden', padding: '60px 24px', color: '#fff'
  }}>
    <style>{`@keyframes float { from { transform: translateY(-8px); } to { transform: translateY(8px); } }`}</style>
    {[
      { size: 320, x: '10%', y: '15%', color: 'rgba(168,85,247,0.18)' },
      { size: 240, x: '75%', y: '60%', color: 'rgba(6,182,212,0.15)' },
    ].map((orb, index) => (
      <div key={index} style={{
        position: 'absolute', width: orb.size, height: orb.size,
        left: orb.x, top: orb.y, borderRadius: '50%',
        background: orb.color, filter: 'blur(60px)', pointerEvents: 'none',
        animation: 'float 6s ease-in-out infinite alternate',
        animationDelay: index === 1 ? '3s' : '0s',
      }} />
    ))}

    <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.15em',
      color: '#c084fc', textTransform: 'uppercase', marginBottom: 16 }}>
      ✦ Voice-First Developer Platform
    </span>

    <h1 style={{ fontSize: 'clamp(2.4rem, 7vw, 5.5rem)', fontWeight: 900, lineHeight: 1.05,
      background: 'linear-gradient(135deg, #fff 40%, #c084fc)', WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent', marginBottom: 20 }}>
      Don&apos;t type.<br />Just <em>code</em>.
    </h1>

    <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.72)', maxWidth: 540, marginBottom: 36 }}>
      Speak at 160 WPM. Wispr Flow turns your thoughts into polished production code instantly.
    </p>

    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
      <a href="#start" style={{ background: '#a855f7', color: '#fff', padding: '14px 30px',
        borderRadius: 12, fontWeight: 800, fontSize: '1.05rem', textDecoration: 'none',
        boxShadow: '0 0 24px rgba(168,85,247,0.5)', transition: 'all 0.2s ease' }}>
        Start Free
      </a>
      <a href="#demo" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff',
        padding: '14px 28px', borderRadius: 12, fontWeight: 700, fontSize: '1.05rem',
        textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.2)' }}>
        Watch Demo
      </a>
    </div>

    <div id="start" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 170px), 1fr))', gap: 18, width: 'min(100%, 760px)', marginTop: 52, textAlign: 'left' }}>
      {[
        { title: 'Natural voice', detail: 'Speak ideas in your own words.' },
        { title: 'Live transcription', detail: 'See your words appear as you speak.' },
        { title: 'Code-ready output', detail: 'Turn intent into a clear starting point.' },
      ].map(feature => (
        <div key={feature.title} style={{ padding: '12px 14px', borderLeft: '2px solid rgba(192,132,252,0.8)' }}>
          <h2 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: 4 }}>{feature.title}</h2>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.5 }}>{feature.detail}</p>
        </div>
      ))}
    </div>
  </section>
);