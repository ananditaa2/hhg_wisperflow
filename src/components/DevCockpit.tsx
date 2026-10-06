import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Activity, Keyboard, Clock, Mic, Copy, Check, Code2, Play,
  Wand2, Volume2, Sparkles, Loader2, RotateCcw
} from 'lucide-react';
import { TelemetryData } from '../types';
import { GeneratedCodePreview } from './GeneratedCodePreview';

interface DevCockpitProps {
  isListening: boolean;
  telemetry: TelemetryData;
  frequencyDataRef: React.MutableRefObject<Uint8Array>;
  volume: number;
  onStartMic: () => void;
  liveTranscript?: string;
  interimTranscript?: string;
  /** Most recent completed utterance — used for code generation */
  lastSpokenCommand?: string;
  /** Resets the cumulative speech transcript */
  onClearTranscript?: () => void;
}

interface NormalizationSample {
  raw: string;
  normalized: string;
  code: string;
  language?: string;
}

// ─── STATIC DEMO SAMPLES (shown before user speaks) ─────────────────────────
const DEMO_SAMPLES: NormalizationSample[] = [
  {
    raw: 'uh make a function that takes an array of numbers and like removes duplicates and sorts it ascending',
    normalized: 'Create a typed utility function to deduplicate and sort numeric arrays in ascending order with O(n log n) efficiency.',
    language: 'TypeScript',
    code: `export function dedupeAndSort(items: number[]): number[] {
  return Array.from(new Set(items)).sort((a, b) => a - b);
}`,
  },
  {
    raw: 'create a glowing animated gradient button that triggers confetti on click',
    normalized: 'Build an interactive neo-brutalist CTA button with animated gradient border and multi-colored particle burst on click.',
    language: 'React / TSX',
    code: `interface GlowButtonProps { label: string; onClick: () => void; }

export const GlowButton: React.FC<GlowButtonProps> = ({ label, onClick }) => (
  <button
    className="glow-btn"
    onClick={() => { onClick(); confetti({ particleCount: 80, spread: 70 }); }}
  >
    {label}
  </button>
);`,
  },
  {
    raw: 'build a react hook that monitors window resize and returns the current viewport width and height debounce it',
    normalized: 'Build a custom React useWindowDimensions hook with 150 ms debounced resize listeners returning { width, height }.',
    language: 'React Hook',
    code: `import { useState, useEffect } from 'react';

export function useWindowDimensions() {
  const [dims, setDims] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const handler = () => { clearTimeout(t); t = setTimeout(() => setDims({ width: window.innerWidth, height: window.innerHeight }), 150); };
    window.addEventListener('resize', handler);
    return () => { window.removeEventListener('resize', handler); clearTimeout(t); };
  }, []);
  return dims;
}`,
  },
];

// ─── VOICE-TO-CODE ENGINE ────────────────────────────────────────────────────
// Analyzes spoken text, detects dev intent, and synthesizes a polished prompt + code.

interface IntentRule {
  keywords: string[];
  priority: number;
  normalize: (raw: string) => NormalizationSample;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function extractSubject(raw: string): string {
  const cleaned = raw.toLowerCase()
    .replace(/\b(uh|um|like|just|maybe|kind of|sort of|basically|so|and|that|which|it|a|an|the)\b/g, '')
    .replace(/\s+/g, ' ').trim();
  return cleaned.slice(0, 80);
}

const INTENT_RULES: IntentRule[] = [
  // ── UI CARD ────────────────────────────────────────────────────────────────
  {
    keywords: ['card', 'glow', 'glowing', 'hover', 'animation', 'animated', 'shimmer', 'gradient'],
    priority: 10,
    normalize: (raw) => ({
      raw,
      normalized: 'Build a premium glassmorphism card component with animated gradient border glow, smooth hover lift, and shimmer on mount.',
      language: 'React / TSX + CSS',
      code: `import React from 'react';

interface GlowCardProps {
  title: string;
  description: string;
  accentColor?: string;
}

export const GlowCard: React.FC<GlowCardProps> = ({
  title, description, accentColor = '#a855f7'
}) => (
  <div style={{
    position: 'relative', padding: '28px 24px',
    borderRadius: '20px', background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(16px)',
    border: '1.5px solid rgba(255,255,255,0.18)',
    boxShadow: \`0 0 28px 0 \${accentColor}33, 0 8px 32px rgba(0,0,0,0.18)\`,
    transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease',
    cursor: 'pointer',
  }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px) scale(1.01)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = \`0 0 44px 4px \${accentColor}55, 0 16px 48px rgba(0,0,0,0.22)\`;
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.transform = '';
      (e.currentTarget as HTMLDivElement).style.boxShadow = \`0 0 28px 0 \${accentColor}33, 0 8px 32px rgba(0,0,0,0.18)\`;
    }}
  >
    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8 }}>{title}</h3>
    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>{description}</p>
  </div>
);`,
    }),
  },

  // ── BUTTON ─────────────────────────────────────────────────────────────────
  {
    keywords: ['button', 'btn', 'click', 'cta', 'call to action', 'ripple'],
    priority: 9,
    normalize: (raw) => ({
      raw,
      normalized: `Build a reusable interactive Button component with ripple click effect, loading state, and accessible aria attributes derived from: "${extractSubject(raw)}".`,
      language: 'React / TSX',
      code: `import React, { useState } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', loading, onClick, ...rest
}) => {
  const [ripple, setRipple] = useState(false);
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setRipple(true);
    setTimeout(() => setRipple(false), 400);
    onClick?.(e);
  };
  const bg = { primary: '#a855f7', ghost: 'transparent', danger: '#ef4444' }[variant];
  return (
    <button
      {...rest}
      disabled={loading || rest.disabled}
      onClick={handleClick}
      aria-busy={loading}
      style={{ background: bg, color: '#fff', border: '2px solid #18181b',
        borderRadius: 10, padding: '10px 22px', fontWeight: 700, cursor: 'pointer',
        boxShadow: ripple ? '1px 1px 0 #18181b' : '3px 3px 0 #18181b',
        transform: ripple ? 'translate(2px,2px)' : 'none',
        transition: 'all 0.1s ease', opacity: loading ? 0.7 : 1 }}
    >
      {loading ? '⏳ Loading...' : children}
    </button>
  );
};`,
    }),
  },

  // ── MODAL / DIALOG ─────────────────────────────────────────────────────────
  {
    keywords: ['modal', 'dialog', 'popup', 'overlay', 'drawer', 'sheet'],
    priority: 9,
    normalize: (raw) => ({
      raw,
      normalized: `Create an accessible Modal/Dialog component with focus trap, backdrop click-to-close, and smooth slide-in animation from: "${extractSubject(raw)}".`,
      language: 'React / TSX',
      code: `import React, { useEffect, useRef } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) { el.showModal(); } else { el.close(); }
  }, [open]);

  if (!open) return null;
  return (
    <dialog ref={dialogRef}
      onClick={e => e.target === dialogRef.current && onClose()}
      style={{ border: '2.5px solid #18181b', borderRadius: 20, padding: 0,
        boxShadow: '8px 8px 0 #18181b', maxWidth: 540, width: '90vw',
        animation: 'slideIn 0.22s cubic-bezier(0.16,1,0.3,1)' }}
    >
      <div style={{ padding: '24px 28px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h2 style={{ fontWeight: 900, fontSize: '1.3rem' }}>{title}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:'1.4rem', cursor:'pointer' }}>✕</button>
        </div>
        {children}
      </div>
    </dialog>
  );
};`,
    }),
  },

  // ── NAVBAR / HEADER ────────────────────────────────────────────────────────
  {
    keywords: ['navbar', 'nav bar', 'navigation', 'header', 'menu', 'sidebar'],
    priority: 9,
    normalize: (raw) => ({
      raw,
      normalized: `Build a responsive sticky Navbar with logo, navigation links, mobile hamburger menu toggle, and scroll-aware background blur for: "${extractSubject(raw)}".`,
      language: 'React / TSX',
      code: `import React, { useState, useEffect } from 'react';

const LINKS = ['Home', 'Features', 'Pricing', 'Docs'];

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50, width: '100%',
      padding: '12px 28px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', background: scrolled
        ? 'rgba(250,247,238,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(14px)' : 'none',
      borderBottom: scrolled ? '2px solid #18181b' : 'none',
      transition: 'all 0.25s ease',
    }}>
      <span style={{ fontWeight: 900, fontSize: '1.3rem' }}>🎙️ WisprFlow</span>
      <div style={{ display:'flex', gap: 24 }}>
        {LINKS.map(l => <a key={l} href={\`#\${l.toLowerCase()}\`}
          style={{ fontWeight: 700, textDecoration: 'none', color: '#18181b' }}>{l}</a>)}
      </div>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'none' }}>☰</button>
    </nav>
  );
};`,
    }),
  },

  // ── FORM / INPUT ───────────────────────────────────────────────────────────
  {
    keywords: ['form', 'input', 'field', 'validation', 'submit', 'signup', 'login', 'register', 'email'],
    priority: 8,
    normalize: (raw) => ({
      raw,
      normalized: `Build a controlled React form with Zod-style validation, real-time error messages, and accessible field labels derived from: "${extractSubject(raw)}".`,
      language: 'React / TSX',
      code: `import React, { useState } from 'react';

interface FormState { name: string; email: string; }
interface Errors { name?: string; email?: string; }

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = 'Name is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email.';
  return e;
}

export const ContactForm: React.FC = () => {
  const [form, setForm] = useState<FormState>({ name: '', email: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitted(true);
  };

  if (submitted) return <div style={{ color: '#059669', fontWeight: 800 }}>✅ Submitted!</div>;

  return (
    <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16, maxWidth:420 }}>
      {(['name','email'] as const).map(field => (
        <label key={field} style={{ fontWeight:700 }}>
          {field === 'name' ? 'Full Name' : 'Email Address'}
          <input value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
            style={{ display:'block', width:'100%', marginTop:4, padding:'10px 14px',
              border: errors[field] ? '2px solid #ef4444' : '2px solid #18181b',
              borderRadius:8, fontFamily:'inherit' }} />
          {errors[field] && <span style={{ color:'#ef4444', fontSize:'0.8rem' }}>{errors[field]}</span>}
        </label>
      ))}
      <button type="submit" className="btn-brutal-lilac" style={{ alignSelf:'flex-start' }}>Submit →</button>
    </form>
  );
};`,
    }),
  },

  // ── CUSTOM HOOK ────────────────────────────────────────────────────────────
  {
    keywords: ['hook', 'use', 'custom hook', 'react hook', 'state', 'effect', 'ref'],
    priority: 8,
    normalize: (raw) => ({
      raw,
      normalized: `Build a reusable custom React hook with proper TypeScript generics and cleanup, derived from: "${extractSubject(raw)}".`,
      language: 'React Hook',
      code: `import { useState, useEffect, useCallback, useRef } from 'react';

interface UseLocalStorageOptions<T> { defaultValue: T; }

export function useLocalStorage<T>(key: string, { defaultValue }: UseLocalStorageOptions<T>) {
  const [value, setValue] = useState<T>(() => {
    try { const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : defaultValue;
    } catch { return defaultValue; }
  });

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setValue(prev => {
      const resolved = typeof next === 'function' ? (next as (p:T)=>T)(prev) : next;
      try { localStorage.setItem(key, JSON.stringify(resolved)); } catch {}
      return resolved;
    });
  }, [key]);

  const remove = useCallback(() => {
    localStorage.removeItem(key);
    setValue(defaultValue);
  }, [key, defaultValue]);

  return [value, set, remove] as const;
}`,
    }),
  },

  // ── API / FETCH ────────────────────────────────────────────────────────────
  {
    keywords: ['api', 'fetch', 'request', 'endpoint', 'rest', 'get', 'post', 'http', 'axios', 'data', 'async'],
    priority: 8,
    normalize: (raw) => ({
      raw,
      normalized: `Build a typed async data-fetching utility with retry logic, loading/error states, and AbortController cleanup for: "${extractSubject(raw)}".`,
      language: 'TypeScript',
      code: `// Generic typed fetch with retry + abort support
interface FetchOptions { retries?: number; signal?: AbortSignal; }

export async function typedFetch<T>(
  url: string, options: RequestInit & FetchOptions = {}
): Promise<T> {
  const { retries = 2, signal, ...init } = options;
  let lastErr: Error = new Error('Unknown error');

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { ...init, signal });
      if (!res.ok) throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
      return (await res.json()) as T;
    } catch (err) {
      if ((err as Error).name === 'AbortError') throw err;
      lastErr = err as Error;
      if (attempt < retries) await new Promise(r => setTimeout(r, 300 * 2 ** attempt));
    }
  }
  throw lastErr;
}

// Usage with React hook:
// const { data, loading, error } = useFetch<User[]>('/api/users');`,
    }),
  },

  // ── SORT / FILTER / ARRAY ─────────────────────────────────────────────────
  {
    keywords: ['sort', 'filter', 'array', 'list', 'search', 'dedupe', 'duplicate', 'unique', 'group', 'map'],
    priority: 7,
    normalize: (raw) => ({
      raw,
      normalized: `Build typed functional array utilities with generics for sorting, filtering, deduplication, and grouping from: "${extractSubject(raw)}".`,
      language: 'TypeScript',
      code: `// Typed array utility suite

/** Deduplicate an array by a key selector */
export function dedupeBy<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set<T[keyof T]>();
  return arr.filter(item => { const k = item[key]; return seen.has(k) ? false : (seen.add(k), true); });
}

/** Sort ascending / descending by key */
export function sortBy<T>(arr: T[], key: keyof T, dir: 'asc' | 'desc' = 'asc'): T[] {
  return [...arr].sort((a, b) => {
    const [va, vb] = [a[key], b[key]];
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return dir === 'asc' ? cmp : -cmp;
  });
}

/** Group array items by a key */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String(item[key]);
    (acc[k] ??= []).push(item);
    return acc;
  }, {} as Record<string, T[]>);
}`,
    }),
  },

  // ── TABLE / DATA GRID ──────────────────────────────────────────────────────
  {
    keywords: ['table', 'grid', 'data grid', 'column', 'row', 'pagination', 'sortable'],
    priority: 7,
    normalize: (raw) => ({
      raw,
      normalized: `Build a sortable, paginated data table component with column headers, typed rows, and empty-state handling from: "${extractSubject(raw)}".`,
      language: 'React / TSX',
      code: `import React, { useState } from 'react';

interface Column<T> { key: keyof T; label: string; }

interface DataTableProps<T extends { id: string | number }> {
  columns: Column<T>[];
  rows: T[];
  pageSize?: number;
}

export function DataTable<T extends { id: string | number }>({
  columns, rows, pageSize = 10
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc');

  const sorted = sortKey
    ? [...rows].sort((a, b) => {
        const cmp = a[sortKey] < b[sortKey] ? -1 : a[sortKey] > b[sortKey] ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      }) : rows;

  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.9rem' }}>
        <thead>
          <tr style={{ backgroundColor:'#f1f5f9' }}>
            {columns.map(col => (
              <th key={String(col.key)} onClick={() => { setSortKey(col.key); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}
                style={{ padding:'10px 14px', textAlign:'left', cursor:'pointer', fontWeight:800 }}>
                {col.label} {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paged.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ padding:24, textAlign:'center', color:'#94a3b8' }}>No data</td></tr>
          ) : paged.map(row => (
            <tr key={row.id} style={{ borderBottom:'1px solid #e2e8f0' }}>
              {columns.map(col => <td key={String(col.key)} style={{ padding:'10px 14px' }}>{String(row[col.key])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display:'flex', gap:8, marginTop:12 }}>
        <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
        <span>Page {page + 1}</span>
        <button disabled={(page + 1) * pageSize >= rows.length} onClick={() => setPage(p => p + 1)}>Next →</button>
      </div>
    </div>
  );
}`,
    }),
  },

  // ── AUTH / LOGIN ───────────────────────────────────────────────────────────
  {
    keywords: ['auth', 'login', 'logout', 'sign in', 'sign up', 'jwt', 'token', 'session', 'password'],
    priority: 9,
    normalize: (raw) => ({
      raw,
      normalized: `Build a React authentication context with JWT token management, protected route wrapper, and auto-refresh logic from: "${extractSubject(raw)}".`,
      language: 'React / TSX',
      code: `import React, { createContext, useContext, useState, useCallback } from 'react';

interface AuthContextValue {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    const { token } = await res.json();
    localStorage.setItem('auth_token', token);
    setToken(token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};`,
    }),
  },

  // ── CHART / VISUALIZATION ──────────────────────────────────────────────────
  {
    keywords: ['chart', 'graph', 'visualization', 'plot', 'bar chart', 'line chart', 'pie chart', 'dashboard', 'analytics'],
    priority: 8,
    normalize: (raw) => ({
      raw,
      normalized: `Build a responsive SVG bar chart component with animated bars, axis labels, and tooltip on hover from: "${extractSubject(raw)}".`,
      language: 'React / SVG',
      code: `import React, { useState } from 'react';

interface DataPoint { label: string; value: number; }

export const BarChart: React.FC<{ data: DataPoint[]; height?: number }> = ({
  data, height = 200
}) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...data.map(d => d.value), 1);
  const barW = Math.floor(300 / data.length) - 8;

  return (
    <svg width="100%" viewBox={\`0 0 320 \${height + 40}\`} style={{ fontFamily:'inherit' }}>
      {data.map((d, i) => {
        const barH = (d.value / max) * height;
        const x = i * (barW + 8) + 4;
        const y = height - barH;
        return (
          <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <rect x={x} y={y} width={barW} height={barH}
              fill={hovered === i ? '#a855f7' : '#d8b4fe'}
              rx={4}
              style={{ transition:'fill 0.15s ease, height 0.4s cubic-bezier(0.16,1,0.3,1)' }}
            />
            <text x={x + barW/2} y={height + 18} textAnchor="middle" fontSize={10} fill="#64748b">{d.label}</text>
            {hovered === i && (
              <text x={x + barW/2} y={y - 6} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#18181b">{d.value}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
};`,
    }),
  },

  // ── WEBSOCKET / REALTIME ───────────────────────────────────────────────────
  {
    keywords: ['websocket', 'socket', 'realtime', 'real time', 'live', 'streaming', 'sse', 'pubsub'],
    priority: 9,
    normalize: (raw) => ({
      raw,
      normalized: `Build a useWebSocket React hook with auto-reconnect, message queue, and connection status indicator for: "${extractSubject(raw)}".`,
      language: 'React Hook',
      code: `import { useState, useEffect, useRef, useCallback } from 'react';

type WsStatus = 'connecting' | 'open' | 'closed' | 'error';

export function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WsStatus>('closed');
  const [messages, setMessages] = useState<string[]>([]);
  const retryCount = useRef(0);

  const connect = useCallback(() => {
    setStatus('connecting');
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => { setStatus('open'); retryCount.current = 0; };
    ws.onmessage = e => setMessages(prev => [...prev.slice(-99), e.data]);
    ws.onerror = () => setStatus('error');
    ws.onclose = () => {
      setStatus('closed');
      const delay = Math.min(1000 * 2 ** retryCount.current, 30000);
      retryCount.current++;
      setTimeout(connect, delay); // exponential back-off
    };
  }, [url]);

  useEffect(() => { connect(); return () => { wsRef.current?.close(); }; }, [connect]);

  const send = useCallback((msg: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(msg);
  }, []);

  return { status, messages, send };
}`,
    }),
  },

  // ── CONTEXT / STORE ────────────────────────────────────────────────────────
  {
    keywords: ['context', 'store', 'global state', 'zustand', 'redux', 'provider', 'state management'],
    priority: 8,
    normalize: (raw) => ({
      raw,
      normalized: `Build a typed React Context store with reducer pattern, selectors, and DevTools-friendly action logging from: "${extractSubject(raw)}".`,
      language: 'React / TypeScript',
      code: `import React, { createContext, useContext, useReducer, useCallback } from 'react';

// State
interface AppState { count: number; theme: 'light' | 'dark'; user: string | null; }
const initialState: AppState = { count: 0, theme: 'light', user: null };

// Actions
type Action =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_USER'; payload: string | null };

function reducer(state: AppState, action: Action): AppState {
  console.log('[Store]', action.type, action);
  switch (action.type) {
    case 'INCREMENT': return { ...state, count: state.count + 1 };
    case 'DECREMENT': return { ...state, count: state.count - 1 };
    case 'SET_THEME': return { ...state, theme: action.payload };
    case 'SET_USER': return { ...state, user: action.payload };
    default: return state;
  }
}

const StoreContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be inside StoreProvider');
  return ctx;
};`,
    }),
  },

  // ── LANDING PAGE / WEBSITE ─────────────────────────────────────────────────
  {
    keywords: ['landing page', 'website', 'homepage', 'hero', 'page', 'site', 'ui', 'pui', 'prompt ui'],
    priority: 7,
    normalize: (raw) => ({
      raw,
      normalized: `Build a premium Hero section component with gradient headline, animated CTA button, and floating background orbs for: "${extractSubject(raw)}".`,
      language: 'React / TSX',
      code: `import React from 'react';

export const HeroSection: React.FC = () => (
  <section style={{
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', textAlign: 'center',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    position: 'relative', overflow: 'hidden', padding: '60px 24px',
  }}>
    {/* Floating ambient orbs */}
    {[
      { size:320, x:'10%', y:'15%', color:'rgba(168,85,247,0.18)' },
      { size:240, x:'75%', y:'60%', color:'rgba(6,182,212,0.15)' },
    ].map((orb, i) => (
      <div key={i} style={{
        position:'absolute', width:orb.size, height:orb.size,
        left:orb.x, top:orb.y, borderRadius:'50%',
        background:orb.color, filter:'blur(60px)', pointerEvents:'none',
        animation:'float 6s ease-in-out infinite alternate',
        animationDelay: i === 1 ? '3s' : '0s',
      }} />
    ))}

    <span style={{ fontSize:'0.8rem', fontWeight:800, letterSpacing:'0.15em',
      color:'#a855f7', textTransform:'uppercase', marginBottom:16 }}>
      ✦ Voice-First Developer Platform
    </span>

    <h1 style={{ fontSize:'clamp(2.4rem,7vw,5.5rem)', fontWeight:900, lineHeight:1.05,
      background:'linear-gradient(135deg,#fff 40%,#a855f7)', WebkitBackgroundClip:'text',
      WebkitTextFillColor:'transparent', marginBottom:20 }}>
      Don't type.<br/>Just <em>code</em>.
    </h1>

    <p style={{ fontSize:'1.2rem', color:'rgba(255,255,255,0.65)', maxWidth:540, marginBottom:36 }}>
      Speak an idea and follow it through from transcript to intent to generated code.
    </p>

    <div style={{ display:'flex', gap:14, flexWrap:'wrap', justifyContent:'center' }}>
      <a href="#start" style={{ background:'#a855f7', color:'#fff', padding:'14px 30px',
        borderRadius:12, fontWeight:800, fontSize:'1.05rem', textDecoration:'none',
        boxShadow:'0 0 24px rgba(168,85,247,0.5)', transition:'all 0.2s ease' }}>
        🚀 Start Free
      </a>
      <a href="#demo" style={{ background:'rgba(255,255,255,0.1)', color:'#fff',
        padding:'14px 28px', borderRadius:12, fontWeight:700, fontSize:'1.05rem',
        textDecoration:'none', border:'1.5px solid rgba(255,255,255,0.2)' }}>
        Watch Demo ▶
      </a>
    </div>
  </section>
);`,
    }),
  },
];

// ─── NORMALIZER ENGINE ───────────────────────────────────────────────────────
function normalizeVoiceInput(rawText: string): NormalizationSample | null {
  const lower = rawText.toLowerCase().trim();
  const words = lower.split(/\s+/);
  if (words.length < 2) return null;

  let bestRule: IntentRule | null = null;
  let bestScore = 0;

  for (const rule of INTENT_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) score += kw.split(' ').length; // multi-word phrases score higher
    }
    if (score > 0) {
      const weighted = score * rule.priority;
      if (weighted > bestScore) {
        bestScore = weighted;
        bestRule = rule;
      }
    }
  }

  if (!bestRule) {
    // Fallback: generic utility function
    return {
      raw: rawText,
      normalized: `Build a TypeScript utility module for: "${capitalize(rawText.trim().slice(0, 120))}".`,
      language: 'TypeScript',
      code: `// Auto-generated utility from voice input:
// "${rawText.trim().slice(0, 80)}..."

export interface VoiceGeneratedConfig {
  input: string;
  options?: Record<string, unknown>;
}

export async function processVoiceIntent(config: VoiceGeneratedConfig): Promise<string> {
  const { input, options = {} } = config;
  // TODO: Implement logic for "${rawText.trim().slice(0, 60)}"
  console.log('[VoiceIntent] Processing:', input, options);
  return \`Processed: \${input}\`;
}`,
    };
  }

  return bestRule.normalize(rawText);
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export const DevCockpit: React.FC<DevCockpitProps> = ({
  isListening,
  telemetry,
  frequencyDataRef,
  volume,
  onStartMic,
  liveTranscript = '',
  interimTranscript = '',
  lastSpokenCommand = '',
  onClearTranscript,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeDemoIdx, setActiveDemoIdx] = useState(1);
  const [outputTab, setOutputTab] = useState<'code' | 'run'>('code');

  // Live voice output state
  const [liveOutput, setLiveOutput] = useState<NormalizationSample | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFor, setProcessedFor] = useState('');

  // ── Audio Bars Visualizer ──────────────────────────────────────────────────
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      const data = frequencyDataRef.current;
      const totalBars = 48;
      const barWidth = 6;
      const gap = (width - totalBars * barWidth) / (totalBars + 1);
      for (let i = 0; i < totalBars; i++) {
        const dataIndex = Math.floor((i / totalBars) * data.length);
        const val = isListening
          ? data[dataIndex]
          : Math.sin(Date.now() * 0.003 + i * 0.2) * 20 + 25;
        const normalized = Math.max(8, (val / 255) * (height - 24));
        const x = gap + i * (barWidth + gap);
        const y = (height - normalized) / 2;
        const hue = isListening ? 260 + (i / totalBars) * 40 : 220;
        ctx.fillStyle = isListening ? `hsl(${hue}, 80%, 55%)` : '#cbd5e1';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, normalized, 3);
        ctx.fill();
      }
      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [frequencyDataRef, isListening]);

  // ── lastSpokenCommand → Voice-to-Code engine ─────────────────────────────
  // KEY FIX: use lastSpokenCommand (most recent utterance) NOT liveTranscript
  // liveTranscript is the full cumulative session — causes wrong/stale matches
  useEffect(() => {
    const text = lastSpokenCommand.trim();
    if (!text || text === processedFor || text.split(' ').length < 2) return;

    setIsProcessing(true);
    const timer = setTimeout(() => {
      const result = normalizeVoiceInput(text);
      setLiveOutput(result);
      setProcessedFor(text);
      setIsProcessing(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [lastSpokenCommand, processedFor]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1500);
  };

  const handleClearAll = () => {
    setLiveOutput(null);
    setProcessedFor('');
    if (onClearTranscript) onClearTranscript();
  };

  const handleSelectDemo = (sample: NormalizationSample, idx: number) => {
    setActiveDemoIdx(idx);
    setLiveOutput(null); // Clear live output when demo is selected
  };




  // What to show in the normalizer panel
  const displaySample: NormalizationSample = liveOutput ?? DEMO_SAMPLES[activeDemoIdx];
  const isLive = liveOutput !== null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>

      {/* ── 1. Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ textAlign: 'center', padding: '24px 16px 8px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <span className="genz-tag tag-yellow">VOICE → CODE</span>
          <span className="genz-tag tag-lilac">LIVE TRANSCRIPT</span>
          <span className="genz-tag tag-green">CODE + RUN</span>
        </div>

        <h1 className="serif-headline" style={{ fontSize: 'clamp(3rem, 6.5vw, 5.2rem)', lineHeight: '1.04', marginBottom: '16px' }}>
          Don&apos;t type,<br />
          <span className="serif-italic" style={{ color: '#093c31' }}>just code.</span>
        </h1>

        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '780px', margin: '0 auto 24px', lineHeight: '1.6' }}>
          Describe what you want to build. Watch your speech become a transcript, a clearer engineering brief, and generated code. Switch between <strong>Code</strong> and <strong>Run</strong> to inspect the source or test its output.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={onStartMic}
            className="btn-brutal-lilac"
            style={{ padding: '14px 28px', fontSize: '1.05rem', backgroundColor: isListening ? 'var(--accent-matcha)' : 'var(--accent-lilac)' }}
          >
            <Mic size={20} />
            <span>{isListening ? '🎙️ Microphone Active — Speak Now' : 'Launch Voice Telemetry'}</span>
          </button>
        </div>
      </section>

      {/* ── 2. Bento Grid ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(320px, 1fr)', gap: '24px', width: '100%' }}>

        {/* Left: Live Transcript */}
        <div className="genz-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '380px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="genz-tag tag-green">{isListening ? 'LIVE AUDIO ON' : 'STANDBY'}</span>
                <span style={{ fontSize: '1rem', fontWeight: 800 }}>Real-Time Speech-to-Intent Stream</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Volume2 size={16} />
                <span className="genz-tag tag-cyan" style={{ fontSize: '0.72rem' }}>Mic: {volume}%</span>
                {(liveTranscript || interimTranscript) && (
                  <button
                    onClick={handleClearAll}
                    title="Clear transcript"
                    style={{
                      background: 'none', border: '1.5px solid #e2e8f0', borderRadius: '6px',
                      padding: '3px 8px', cursor: 'pointer', fontSize: '0.75rem',
                      fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    <RotateCcw size={11} /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* Transcript area */}
            <div style={{
              backgroundColor: '#faf7ee', borderRadius: '12px',
              border: liveTranscript ? '2px solid #a855f7' : '2px solid var(--border-black)',
              padding: '20px', minHeight: '130px', fontFamily: 'var(--font-sans)',
              fontSize: '1.2rem', lineHeight: '1.6', color: '#18181b',
              boxShadow: liveTranscript ? 'inset 0 0 0 2px rgba(168,85,247,0.1)' : 'inset 0 2px 4px rgba(0,0,0,0.04)',
              transition: 'border-color 0.2s ease',
            }}>
              {liveTranscript || interimTranscript ? (
                <div>
                  <span style={{ fontWeight: 600 }}>{liveTranscript}</span>{' '}
                  <span style={{ color: '#7c3aed', fontStyle: 'italic', fontWeight: 800 }}>{interimTranscript}</span>
                </div>
              ) : (
                <span style={{ color: '#94a3b8' }}>
                  {isListening
                    ? '🎙️ Speak freely — e.g. "create a glowing card with hover animations" or "build a login form with validation"...'
                    : 'Click "Launch Voice Telemetry" above to activate microphone, then speak your coding intent.'}
                </span>
              )}
            </div>

            {/* Live processing indicator */}
            {isProcessing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', color: '#7c3aed' }}>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Normalizing intent &amp; synthesizing code...</span>
              </div>
            )}

            {/* "Live output ready" badge */}
            {liveOutput && !isProcessing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                <span className="genz-tag" style={{ backgroundColor: '#a855f7', color: '#fff', fontSize: '0.72rem' }}>
                  ✨ LIVE CODE GENERATED ↓
                </span>
                <span style={{ fontSize: '0.82rem', color: '#6b7280', fontWeight: 600 }}>
                  Scroll down to see your code
                </span>
              </div>
            )}
          </div>

          {/* Soundwave canvas */}
          <div style={{ marginTop: '20px' }}>
            <canvas ref={canvasRef} width={820} height={55} style={{ width: '100%', height: '55px', display: 'block' }} />
          </div>
        </div>

        {/* Right: Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div className="genz-card" style={{ padding: '20px', backgroundColor: 'var(--accent-lilac)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SESSION TIME</span>
              <Clock size={16} />
            </div>
            <div style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: '1' }}>
              {Math.floor(telemetry.sessionDuration / 60)}:{String(telemetry.sessionDuration % 60).padStart(2, '0')}
            </div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '8px' }}>Elapsed microphone session</p>
          </div>

          <div className="genz-card" style={{ padding: '20px', backgroundColor: 'var(--accent-matcha)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>OBSERVED WPM</span>
              <Activity size={16} />
            </div>
            <div style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: '1' }}>{telemetry.currentWpm}</div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '8px' }}>Average recognized words per minute</p>
          </div>

          <div className="genz-card" style={{ padding: '20px', backgroundColor: 'var(--accent-cyan)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>EST. CHARS</span>
              <Keyboard size={16} />
            </div>
            <div style={{ fontSize: '2.6rem', fontWeight: 900, lineHeight: '1' }}>{telemetry.keystrokesSaved.toLocaleString()}</div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '8px' }}>Approx. characters not typed</p>
          </div>

          <div className="genz-card" style={{ padding: '20px', backgroundColor: 'var(--accent-yellow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>RECOGNIZED WORDS</span>
              <Clock size={16} />
            </div>
            <div style={{ fontSize: '2.6rem', fontWeight: 900, lineHeight: '1' }}>{telemetry.wordsSpoken}</div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '8px' }}>🕒 {telemetry.sessionDuration}s Active Session</p>
          </div>
        </div>
      </div>

      {/* ── 3. Wispr Magic Normalizer ─────────────────────────────────────────── */}
      <div className="genz-card" style={{ padding: '32px', width: '100%' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wand2 size={24} color="#093c31" />
            <h3 className="serif-headline" style={{ fontSize: '2rem' }}>
              YapLab Code Lab&nbsp;
              <span className="serif-italic" style={{ fontSize: '1.4rem' }}>(Speech → Output)</span>
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {isLive && (
              <span className="genz-tag" style={{ backgroundColor: '#a855f7', color: '#fff', animation: 'pulseDot 2s ease-in-out infinite' }}>
                ✨ LIVE FROM YOUR VOICE
              </span>
            )}
            <span className="genz-tag tag-lilac">VOICE → RUN</span>
          </div>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '20px' }}>
          {isLive
            ? '🎙️ Code below was generated live from your spoken input. Speak something else to regenerate instantly.'
            : 'Speak an idea to generate its intent and code. Use Code to inspect the source, or Run to preview components, hooks, and function results.'}
        </p>

        {/* Demo sample tabs (shown when no live output) */}
        {!isLive && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {DEMO_SAMPLES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectDemo(sample, idx)}
                className="btn-brutal-white"
                style={{
                  fontSize: '0.86rem',
                  backgroundColor: activeDemoIdx === idx ? 'var(--accent-yellow)' : '#ffffff',
                  transform: activeDemoIdx === idx ? 'translate(-1px,-1px) scale(1.02)' : 'none',
                }}
              >
                Demo #{idx + 1}: {sample.normalized.slice(0, 30)}...
              </button>
            ))}
          </div>
        )}

        {/* Live output — clear button */}
        {isLive && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
            <div style={{
              backgroundColor: '#f5f0ff', borderRadius: '10px',
              border: '1.5px solid #a855f7', padding: '8px 16px',
              fontSize: '0.88rem', fontWeight: 700, color: '#7c3aed',
              fontFamily: 'var(--font-mono)',
            }}>
              🎙️ &quot;{lastSpokenCommand.slice(0, 90)}{lastSpokenCommand.length > 90 ? '...' : ''}&quot;
            </div>
            <button onClick={handleClearAll} className="btn-brutal-white" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
              <RotateCcw size={13} /> Clear &amp; Reset
            </button>
          </div>
        )}

        {/* Side-by-side comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', width: '100%' }}>

          {/* Left: Raw speech */}
          <div style={{
            backgroundColor: isLive ? '#f5f0ff' : '#faf7ee',
            border: isLive ? '2px solid #a855f7' : '2px solid var(--border-black)',
            boxShadow: isLive ? '3px 3px 0px #a855f7' : '3px 3px 0px var(--border-black)',
            borderRadius: '14px', padding: '24px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            transition: 'all 0.25s ease',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.2rem' }}>🎙️</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: isLive ? '#7c3aed' : 'inherit' }}>
                  {isLive ? 'Your Live Voice Input' : 'Sample transcript'}
                </span>
                {isLive && <span className="genz-tag" style={{ backgroundColor: '#a855f7', color: '#fff', fontSize: '0.68rem' }}>LIVE</span>}
              </div>
              <p style={{ fontSize: '1.1rem', color: '#18181b', fontStyle: 'italic', lineHeight: '1.6' }}>
                &quot;{displaySample.raw}&quot;
              </p>
            </div>
            <div style={{ marginTop: '24px', fontSize: '0.85rem', color: isLive ? '#7c3aed' : '#093c31', fontWeight: 800 }}>
              {isLive ? `✨ Detected language: ${displaySample.language ?? 'TypeScript'}` : 'Sample text only; no microphone metrics are recorded.'}
            </div>
          </div>

          {/* Right: Normalized output + Code */}
          <div style={{
            backgroundColor: '#ffffff', border: '2px solid var(--border-black)',
            boxShadow: '3px 3px 0px var(--border-black)',
            borderRadius: '14px', padding: '24px',
            display: 'flex', flexDirection: 'column', gap: '14px',
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="#093c31" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#093c31', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Wispr Normalized Engineering Intent
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div role="tablist" aria-label="Generated output view" style={{ display: 'inline-flex', gap: '3px', padding: '3px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                    <button
                      role="tab"
                      aria-selected={outputTab === 'code'}
                      onClick={() => setOutputTab('code')}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 9px', border: 0, borderRadius: '5px', backgroundColor: outputTab === 'code' ? '#ffffff' : 'transparent', color: '#18181b', fontSize: '0.76rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      <Code2 size={13} /> Code
                    </button>
                    <button
                      role="tab"
                      aria-selected={outputTab === 'run'}
                      onClick={() => setOutputTab('run')}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 9px', border: 0, borderRadius: '5px', backgroundColor: outputTab === 'run' ? '#ffffff' : 'transparent', color: '#18181b', fontSize: '0.76rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      <Play size={13} /> Run
                    </button>
                  </div>
                  <button
                    onClick={() => handleCopyCode(displaySample.code)}
                    className="btn-brutal-white"
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                  >
                    {copiedCode ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>
              <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#18181b', lineHeight: '1.5' }}>
                {displaySample.normalized}
              </p>
            </div>

            {/* Language badge */}
            {displaySample.language && (
              <div>
                <span className="genz-tag tag-cyan" style={{ fontSize: '0.72rem' }}>
                  {displaySample.language}
                </span>
              </div>
            )}

            {/* Code block */}
            {outputTab === 'code' ? (
              <pre style={{
                backgroundColor: '#0f172a', color: '#a7f3d0',
                padding: '20px', borderRadius: '12px',
                fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                overflowX: 'auto', lineHeight: '1.6',
                border: '1.5px solid #1e293b',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)',
              }}>
                <code>{displaySample.code}</code>
              </pre>
            ) : (
              <GeneratedCodePreview code={displaySample.code} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
