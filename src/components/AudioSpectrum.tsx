import React, { useEffect, useState } from 'react';
import { Activity, Mic, Volume2 } from 'lucide-react';

type SpectrumBand = 'low' | 'mid' | 'high';

interface AudioSpectrumProps {
  frequencyDataRef: React.MutableRefObject<Uint8Array>;
  timeDomainDataRef: React.MutableRefObject<Uint8Array>;
  sampleRate: number;
  volume: number;
  isListening: boolean;
  onStartMic: () => void;
}

const BANDS: Record<SpectrumBand, { label: string; description: string; color: string; start: number; end: number }> = {
  low: {
    label: 'Low',
    description: 'Lower-frequency sound, such as a hum or the deeper part of a voice.',
    color: '#60a5fa',
    start: 0,
    end: 21
  },
  mid: {
    label: 'Middle',
    description: 'The middle frequencies that carry much of a voice’s body and vowel sounds.',
    color: '#34d399',
    start: 21,
    end: 43
  },
  high: {
    label: 'High',
    description: 'Higher-frequency detail, including crisp consonants such as “s” and “t”.',
    color: '#fb923c',
    start: 43,
    end: 64
  }
};

export const AudioSpectrum: React.FC<AudioSpectrumProps> = ({
  frequencyDataRef,
  timeDomainDataRef,
  sampleRate,
  volume,
  isListening,
  onStartMic
}) => {
  const [spectrum, setSpectrum] = useState<number[]>([]);
  const [pitch, setPitch] = useState<{ frequency: number; note: string; cents: number } | null>(null);

  useEffect(() => {
    const sample = () => {
      setSpectrum(Array.from(frequencyDataRef.current, value => value / 255));
    };
    sample();
    const interval = window.setInterval(sample, 80);
    return () => window.clearInterval(interval);
  }, [frequencyDataRef]);

  useEffect(() => {
    const sample = () => {
      const frequency = detectPitch(timeDomainDataRef.current, sampleRate);
      if (!frequency) {
        setPitch(null);
        return;
      }

      const midiNote = Math.round(69 + 12 * Math.log2(frequency / 440));
      const targetFrequency = 440 * 2 ** ((midiNote - 69) / 12);
      const cents = Math.round(1200 * Math.log2(frequency / targetFrequency));
      const note = `${NOTE_NAMES[(midiNote % 12 + 12) % 12]}${Math.floor(midiNote / 12) - 1}`;
      setPitch({ frequency, note, cents });
    };

    sample();
    const interval = window.setInterval(sample, 80);
    return () => window.clearInterval(interval);
  }, [sampleRate, timeDomainDataRef]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <section className="genz-card" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="genz-tag" style={{ backgroundColor: 'var(--accent-cyan)' }}>LIVE INPUT VIEW</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>MICROPHONE VISUALIZER</span>
          </div>
          <h2 className="serif-headline" style={{ fontSize: '2.1rem', marginBottom: '6px' }}>Pitch &amp; spectrum</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '720px', fontSize: '0.95rem' }}>
            Hold a steady note to see its nearest musical pitch and whether you are sharp or flat. This gives you a simple singing-practice tuner; it does not grade your voice or identify a song.
          </p>
        </div>
        {!isListening && (
          <button onClick={onStartMic} className="btn-brutal-lilac">
            <Mic size={16} /> Start microphone
          </button>
        )}
      </section>

      <section className="genz-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#093c31" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Live singing tuner</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.85rem', fontWeight: 700 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isListening ? '#16a34a' : '#9ca3af' }} />
            {isListening ? 'Microphone on' : 'Microphone off'}
          </div>
        </div>

        <div aria-live="polite" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', alignItems: 'center', gap: '20px', padding: '18px', marginBottom: '16px', backgroundColor: '#f8fafc', border: '2px solid var(--border-black)', borderRadius: '8px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Detected note</div>
            <div style={{ fontSize: '2.8rem', lineHeight: 1.1, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{pitch?.note ?? '—'}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>{pitch ? `${pitch.frequency.toFixed(0)} Hz` : 'Hum a steady note'}</div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 900 }}>
              <span>FLAT</span>
              <span style={{ color: pitch && Math.abs(pitch.cents) <= 5 ? '#15803d' : 'var(--text-muted)' }}>
                {pitch ? `${pitch.cents > 0 ? '+' : ''}${pitch.cents} cents` : 'Waiting for a clear pitch'}
              </span>
              <span>SHARP</span>
            </div>
            <div style={{ height: '18px', position: 'relative', backgroundColor: '#e5e7eb', border: '1.5px solid var(--border-black)', borderRadius: '99px' }}>
              <div style={{ position: 'absolute', left: '50%', top: '-4px', bottom: '-4px', width: '2px', backgroundColor: '#111827' }} />
              {pitch && (
                <div style={{ position: 'absolute', left: `${Math.min(100, Math.max(0, pitch.cents + 50))}%`, top: '-5px', width: '10px', height: '26px', border: '2px solid #111827', borderRadius: '4px', backgroundColor: Math.abs(pitch.cents) <= 5 ? '#34d399' : '#fb923c', transform: 'translateX(-50%)', transition: 'left 80ms linear' }} />
              )}
            </div>
            <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {pitch ? (Math.abs(pitch.cents) <= 5 ? 'Right on the note. Keep holding it.' : pitch.cents < 0 ? 'Raise the pitch slightly.' : 'Lower the pitch slightly.') : 'Sing or hum one sustained vowel, such as “ah”.'}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', fontWeight: 900, marginBottom: '8px' }}>Frequency spectrum</div>
        <div style={{ backgroundColor: '#111827', border: '2px solid var(--border-black)', boxShadow: '3px 3px 0 var(--border-black)', borderRadius: '8px', padding: '20px 16px 12px' }}>
          <div aria-label="Live audio frequency spectrum" role="img" style={{ height: '210px', display: 'grid', gridTemplateColumns: `repeat(${Math.max(spectrum.length, 1)}, minmax(2px, 1fr))`, alignItems: 'end', gap: '2px' }}>
            {spectrum.map((value, index) => {
              const band = index < BANDS.low.end ? BANDS.low : index < BANDS.mid.end ? BANDS.mid : BANDS.high;
              return (
                <div
                  key={index}
                  style={{
                    height: `${Math.max(2, value * 100)}%`,
                    minHeight: '2px',
                    backgroundColor: band.color,
                    opacity: isListening ? 0.95 : 0.3,
                    borderRadius: '2px 2px 0 0',
                    transition: 'height 80ms linear'
                  }}
                />
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d1d5db', fontSize: '0.75rem', fontWeight: 700, marginTop: '10px' }}>
            <span>LOWER FREQUENCIES</span>
            <span>HIGHER FREQUENCIES</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', borderTop: '1px solid #e5e7eb', marginTop: '20px', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Volume2 size={18} color="#093c31" />
            <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Input level: {volume}%</span>
          </div>
          <div style={{ height: '8px', minWidth: '140px', flex: 1, backgroundColor: '#e5e7eb', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, volume)}%`, height: '100%', backgroundColor: '#34d399', transition: 'width 80ms linear' }} />
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>Relative level, not calibrated decibels</div>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        <div className="genz-card" style={{ padding: '18px' }}>
          <strong style={{ display: 'block', marginBottom: '6px' }}>How to use the tuner</strong>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>Sing a comfortable, sustained note. Match the named note, then adjust until the marker is near the center.</span>
        </div>
        <div className="genz-card" style={{ padding: '18px' }}>
          <strong style={{ display: 'block', marginBottom: '6px' }}>What the spectrum adds</strong>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>The pitch is the note you sing. The bars show its harmonics and changing sound energy; they are visual context, not a vocal-quality score.</span>
        </div>
      </section>
    </div>
  );
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function detectPitch(samples: Uint8Array, sampleRate: number): number | null {
  let mean = 0;
  for (const sample of samples) mean += sample;
  mean /= samples.length;

  const centered = Float32Array.from(samples, sample => (sample - mean) / 128);
  let energy = 0;
  for (const sample of centered) energy += sample * sample;
  if (Math.sqrt(energy / centered.length) < 0.025) return null;

  const minLag = Math.max(2, Math.floor(sampleRate / 1000));
  const maxLag = Math.min(Math.floor(sampleRate / 55), Math.floor(centered.length / 2));
  const correlations = new Float32Array(maxLag + 1);

  for (let lag = minLag; lag <= maxLag; lag++) {
    let product = 0;
    let firstEnergy = 0;
    let secondEnergy = 0;
    const limit = centered.length - lag;
    for (let index = 0; index < limit; index++) {
      const first = centered[index];
      const second = centered[index + lag];
      product += first * second;
      firstEnergy += first * first;
      secondEnergy += second * second;
    }
    correlations[lag] = product / Math.sqrt(firstEnergy * secondEnergy || 1);
  }

  for (let lag = minLag + 1; lag < maxLag; lag++) {
    const previous = correlations[lag - 1];
    const current = correlations[lag];
    const next = correlations[lag + 1];
    if (current < 0.78 || current < previous || current < next) continue;

    const denominator = previous - 2 * current + next;
    const offset = denominator ? Math.max(-0.5, Math.min(0.5, 0.5 * (previous - next) / denominator)) : 0;
    return sampleRate / (lag + offset);
  }

  return null;
}