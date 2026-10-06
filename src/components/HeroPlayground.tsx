import React, { useState } from 'react';
import { Code2, Copy, ExternalLink, Play, Radio } from 'lucide-react';
import { HeroSection } from './HeroSection';
import heroSource from './HeroSection.tsx?raw';

type PlaygroundTab = 'run' | 'code';

export const HeroPlayground: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PlaygroundTab>('run');
  const [copied, setCopied] = useState(false);
  const pageUrl = `${window.location.origin}/o.html`;

  const copySource = async () => {
    try {
      await navigator.clipboard.writeText(heroSource);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#eef1f4', color: '#17202a', fontFamily: 'var(--font-sans)' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '16px 24px', background: '#fff', borderBottom: '1px solid #d7dde3' }}>
        <div>
          <h1 style={{ fontSize: '1.05rem', fontWeight: 900 }}>Hero component</h1>
          <p style={{ color: '#667085', fontSize: '0.82rem' }}>View the generated component or run it to see its output.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <code style={{ padding: '8px 10px', background: '#f3f5f7', border: '1px solid #d7dde3', borderRadius: 6, fontSize: '0.78rem' }}>{pageUrl}</code>
          <a href={pageUrl} target="_blank" rel="noreferrer" aria-label="Open preview in a new tab" title="Open preview in a new tab" style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, border: '1px solid #d7dde3', borderRadius: 6, color: '#17202a' }}>
            <ExternalLink size={16} />
          </a>
        </div>
      </header>

      <div style={{ padding: '18px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div role="tablist" aria-label="Component view" style={{ display: 'inline-flex', padding: 4, gap: 4, border: '1px solid #d7dde3', borderRadius: 8, background: '#fff' }}>
          <button role="tab" aria-selected={activeTab === 'run'} onClick={() => setActiveTab('run')} style={{ display: 'flex', alignItems: 'center', gap: 7, border: 0, borderRadius: 5, padding: '8px 12px', color: '#17202a', background: activeTab === 'run' ? '#dbeafe' : 'transparent', font: 'inherit', fontWeight: 800, cursor: 'pointer' }}>
            <Play size={15} /> Run
          </button>
          <button role="tab" aria-selected={activeTab === 'code'} onClick={() => setActiveTab('code')} style={{ display: 'flex', alignItems: 'center', gap: 7, border: 0, borderRadius: 5, padding: '8px 12px', color: '#17202a', background: activeTab === 'code' ? '#dbeafe' : 'transparent', font: 'inherit', fontWeight: 800, cursor: 'pointer' }}>
            <Code2 size={15} /> Code
          </button>
        </div>

        {activeTab === 'code' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => void copySource()} title="Copy component source" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 12px', border: '1px solid #d7dde3', borderRadius: 6, background: '#fff', color: '#17202a', font: 'inherit', fontWeight: 800, cursor: 'pointer' }}>
              <Copy size={15} /> {copied ? 'Copied' : 'Copy code'}
            </button>
          </div>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 12px', color: '#166534', fontSize: '0.85rem', fontWeight: 800 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} /> Component output
          </span>
        )}
      </div>

      <div style={{ padding: 24 }}>
        {activeTab === 'code' ? (
          <section aria-label="HeroSection.tsx source code" style={{ minHeight: '70vh', overflow: 'auto', background: '#101820', border: '1px solid #253443', borderRadius: 8, boxShadow: '0 12px 32px rgba(16,24,32,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderBottom: '1px solid #253443', color: '#a9bacb', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
              <Radio size={14} /> src/components/HeroSection.tsx
            </div>
            <pre style={{ margin: 0, padding: 20, color: '#e5edf5', fontSize: '0.82rem', lineHeight: 1.65, fontFamily: 'var(--font-mono)', whiteSpace: 'pre', tabSize: 2 }}>
              <code>{heroSource}</code>
            </pre>
          </section>
        ) : (
          <section id="demo" aria-label="Rendered component output" style={{ overflow: 'hidden', border: '1px solid #d7dde3', borderRadius: 8, background: '#fff', boxShadow: '0 12px 32px rgba(16,24,32,0.08)' }}>
            <HeroSection />
          </section>
        )}
      </div>
    </main>
  );
};