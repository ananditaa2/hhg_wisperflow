import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Clock3, ListTodo, Mic, Pause, Play, RotateCcw, StickyNote } from 'lucide-react';

interface VoiceTriggersProps {
  playTone: (freq?: number, type?: OscillatorType, duration?: number) => void;
  lastSpokenCommand?: string;
  liveTranscript?: string;
  interimTranscript?: string;
  isListening: boolean;
  isSpeechSupported: boolean;
  onStartMic: () => void;
}

interface TodoItem {
  id: number;
  text: string;
  complete: boolean;
}

type VoiceAction =
  | { id: 'note'; label: string; text: string }
  | { id: 'task'; label: string; text: string }
  | { id: 'timer'; label: string; minutes: number }
  | { id: 'list'; label: string };

const ACTION_CARDS = [
  { icon: StickyNote, title: 'Save a note', phrase: '“Add a note: remember to call Maya”', color: '#d8b4fe' },
  { icon: ListTodo, title: 'Add a to-do', phrase: '“Add a task: review the mobile layout”', color: '#86efac' },
  { icon: Clock3, title: 'Start a focus timer', phrase: '“Start a 5 minute focus timer”', color: '#a5f3fc' },
  { icon: Check, title: 'Read your to-dos', phrase: '“Show my tasks”', color: '#fecdd3' }
];

const FLOW_STAGES = ['Hear phrase', 'Match action', 'Do the work', 'Show result'];

function matchVoiceCommand(command: string): VoiceAction | null {
  const normalized = command.trim().replace(/[.!?]+$/, '');
  const noteMatch = normalized.match(/^(?:add|save|take) (?:a )?note(?:[:,-]\s*|\s+)(.+)$/i);
  if (noteMatch) return { id: 'note', label: 'Save a note', text: noteMatch[1].trim() };

  const taskMatch = normalized.match(/^(?:add|create) (?:a )?(?:task|to-?do)(?:[:,-]\s*|\s+)(.+)$/i);
  if (taskMatch) return { id: 'task', label: 'Add a to-do', text: taskMatch[1].trim() };

  const timerMatch = normalized.match(/^(?:start|set) (?:a )?(?:(\d{1,2})\s*(?:minute|min)\s+)?(?:focus\s+)?timer$/i);
  if (timerMatch) return { id: 'timer', label: 'Start a focus timer', minutes: Math.min(60, Math.max(1, Number(timerMatch[1]) || 5)) };

  if (/^(?:show|list) (?:my )?(?:tasks|to-?dos)$/i.test(normalized)) {
    return { id: 'list', label: 'Read your to-dos' };
  }

  return null;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

export const VoiceTriggers: React.FC<VoiceTriggersProps> = ({
  playTone,
  lastSpokenCommand = '',
  liveTranscript = '',
  interimTranscript = '',
  isListening,
  isSpeechSupported,
  onStartMic
}) => {
  const [notes, setNotes] = useState<Array<{ id: number; text: string }>>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [heardCommand, setHeardCommand] = useState('');
  const [matchedAction, setMatchedAction] = useState('');
  const [result, setResult] = useState('Say one of the example phrases to run an action.');
  const [typedCommand, setTypedCommand] = useState('');
  const [activeStage, setActiveStage] = useState(0);
  const [flowStatus, setFlowStatus] = useState<'idle' | 'running' | 'complete' | 'unmatched'>('idle');
  const handledTranscriptRef = useRef('');
  const timeoutRefs = useRef<number[]>([]);

  const clearPendingStages = useCallback(() => {
    timeoutRefs.current.forEach(window.clearTimeout);
    timeoutRefs.current = [];
  }, []);

  const scheduleStage = useCallback((callback: () => void, delay: number) => {
    const timeout = window.setTimeout(callback, delay);
    timeoutRefs.current.push(timeout);
  }, []);

  const runCommand = useCallback((command: string) => {
    clearPendingStages();
    const action = matchVoiceCommand(command);
    setHeardCommand(command);
    setMatchedAction('');
    setFlowStatus('running');
    setActiveStage(1);
    setResult('Heard your phrase. Checking for a matching action...');

    scheduleStage(() => {
      if (!action) {
        setActiveStage(2);
        setFlowStatus('unmatched');
        setResult('No action matched. Try “add a note…”, “add a task…”, “start a 5 minute focus timer”, or “show my tasks”.');
        playTone(260, 'sine', 0.12);
        return;
      }

      setMatchedAction(action.label);
      setActiveStage(2);
      setResult(`Matched: ${action.label}. Starting it now...`);

      scheduleStage(() => {
        setActiveStage(3);
        let message = '';

        if (action.id === 'note') {
          const note = { id: Date.now(), text: action.text };
          setNotes(previous => [note, ...previous]);
          message = `Note saved: “${action.text}”`;
        } else if (action.id === 'task') {
          const todo = { id: Date.now(), text: action.text, complete: false };
          setTodos(previous => [todo, ...previous]);
          message = `To-do added: “${action.text}”`;
        } else if (action.id === 'timer') {
          setTimerSeconds(action.minutes * 60);
          setTimerRunning(true);
          message = `${action.minutes}-minute focus timer started.`;
        } else {
          const openTodos = todos.filter(todo => !todo.complete);
          message = openTodos.length
            ? `You have ${openTodos.length} open ${openTodos.length === 1 ? 'task' : 'tasks'}: ${openTodos.map(todo => todo.text).join('; ')}`
            : 'Your to-do list is empty. Say “add a task” followed by what you need to do.';
        }

        playTone(640, 'triangle', 0.12);
        scheduleStage(() => {
          setActiveStage(4);
          setFlowStatus('complete');
          setResult(message);
        }, 350);
      }, 450);
    }, 400);
  }, [clearPendingStages, playTone, scheduleStage, todos]);

  useEffect(() => {
    const command = lastSpokenCommand.trim();
    const transcriptId = liveTranscript || command;
    if (!command || !transcriptId || transcriptId === handledTranscriptRef.current) return;
    handledTranscriptRef.current = transcriptId;
    runCommand(command);
  }, [lastSpokenCommand, liveTranscript, runCommand]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setTimerSeconds(seconds => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    if (timerRunning && timerSeconds === 0) {
      setTimerRunning(false);
      setResult('Focus session complete. Take a short break.');
      playTone(880, 'sine', 0.25);
    }
  }, [playTone, timerRunning, timerSeconds]);

  useEffect(() => () => clearPendingStages(), [clearPendingStages]);

  const toggleTodo = (id: number) => {
    setTodos(previous => previous.map(todo => todo.id === id ? { ...todo, complete: !todo.complete } : todo));
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <section className="genz-card" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="genz-tag" style={{ backgroundColor: 'var(--accent-yellow)' }}>PILLAR 3</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>VOICE TRIGGERS</span>
          </div>
          <h2 className="serif-headline" style={{ fontSize: '2.1rem', marginBottom: '6px' }}>Speak, and get something done</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '720px', fontSize: '0.95rem' }}>
            A voice trigger is a spoken shortcut. Say one of these commands while the mic is on: the page recognizes it, chooses an action, performs it, and shows the result below.
          </p>
        </div>
        <button onClick={onStartMic} className="btn-brutal-lilac" style={{ backgroundColor: isListening ? 'var(--accent-matcha)' : 'var(--accent-lilac)' }}>
          <Mic size={16} /> {isListening ? 'Stop microphone' : 'Turn on microphone'}
        </button>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 245px), 1fr))', gap: '12px' }}>
        {ACTION_CARDS.map(({ icon: Icon, title, phrase, color }) => (
          <div key={title} className="genz-card" style={{ padding: '18px', borderTop: `5px solid ${color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Icon size={17} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 900 }}>{title}</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.5 }}>{phrase}</p>
          </div>
        ))}
      </section>

      <section className="genz-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 900 }}>Your voice command</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>The four steps update automatically after speech is recognized.</p>
          </div>
          <span className="genz-tag" style={{ backgroundColor: isListening ? 'var(--accent-matcha)' : '#f1f5f9' }}>
            {isListening && isSpeechSupported ? 'LISTENING' : isListening ? 'SPEECH UNAVAILABLE' : 'MIC OFF'}
          </span>
        </div>

        {!isSpeechSupported && (
          <p style={{ color: '#92400e', fontSize: '0.84rem', marginBottom: '12px' }}>
            Speech recognition is unavailable in this browser. Type a command below to try the same actions.
          </p>
        )}

        <div aria-live="polite" style={{ minHeight: '52px', padding: '12px 14px', backgroundColor: '#f8fafc', border: '2px solid var(--border-black)', borderRadius: '8px', fontWeight: 700, marginBottom: '16px' }}>
          {interimTranscript ? `Hearing: “${interimTranscript}”` : heardCommand ? `Heard: “${heardCommand}”` : 'Say a command to begin.'}
        </div>

        <form
          onSubmit={event => {
            event.preventDefault();
            if (!typedCommand.trim()) return;
            runCommand(typedCommand);
            setTypedCommand('');
          }}
          style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}
        >
          <input
            value={typedCommand}
            onChange={event => setTypedCommand(event.target.value)}
            aria-label="Type a voice command"
            placeholder="Type a command if speech is unavailable"
            style={{ flex: '1 1 240px', minWidth: 0, padding: '10px 12px', border: '1.5px solid var(--border-black)', borderRadius: '6px', font: 'inherit' }}
          />
          <button type="submit" className="btn-brutal-white" style={{ padding: '9px 14px' }}>Send command</button>
        </form>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '8px' }}>
          {FLOW_STAGES.map((stage, index) => {
            const stepNumber = index + 1;
            const isCurrent = activeStage === stepNumber;
            const isDone = activeStage > stepNumber && flowStatus !== 'unmatched';
            return (
              <div key={stage} style={{ padding: '10px 6px', textAlign: 'center', backgroundColor: isCurrent ? 'var(--accent-matcha)' : isDone ? '#ecfdf5' : '#f8fafc', border: '1.5px solid var(--border-black)', borderRadius: '8px', opacity: activeStage === 0 ? 0.72 : 1 }}>
                <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>{stepNumber}</span>
                <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 900 }}>{stage}</span>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '14px', padding: '14px', backgroundColor: flowStatus === 'unmatched' ? '#fff7ed' : '#ecfdf5', border: '1.5px solid var(--border-black)', borderRadius: '8px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px' }}>
            {matchedAction ? `Matched action: ${matchedAction}` : 'Action result'}
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>{result}</div>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '12px' }}>
        <div className="genz-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 900 }}><ListTodo size={17} /> Your to-dos</h3>
            <span className="genz-tag" style={{ backgroundColor: 'var(--accent-matcha)' }}>{todos.filter(todo => !todo.complete).length} open</span>
          </div>
          {todos.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Say “Add a task” followed by something you need to do.</p>
          ) : todos.map(todo => (
            <label key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderTop: '1px solid #e5e7eb', fontSize: '0.88rem', textDecoration: todo.complete ? 'line-through' : 'none', color: todo.complete ? 'var(--text-muted)' : 'var(--text-main)' }}>
              <input type="checkbox" checked={todo.complete} onChange={() => toggleTodo(todo.id)} />
              {todo.text}
            </label>
          ))}
        </div>

        <div className="genz-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 900 }}><StickyNote size={17} /> Your notes</h3>
            <span className="genz-tag" style={{ backgroundColor: 'var(--accent-lilac)' }}>{notes.length} saved</span>
          </div>
          {notes.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Say “Add a note” followed by what you want to remember.</p>
          ) : notes.map(note => (
            <p key={note.id} style={{ padding: '8px 0', borderTop: '1px solid #e5e7eb', fontSize: '0.88rem' }}>{note.text}</p>
          ))}
        </div>

        <div className="genz-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 900 }}><Clock3 size={17} /> Focus timer</h3>
            {timerSeconds > 0 && <span className="genz-tag" style={{ backgroundColor: 'var(--accent-cyan)' }}>{timerRunning ? 'RUNNING' : 'PAUSED'}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <span aria-live="polite" style={{ fontSize: '2rem', fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{formatTime(timerSeconds)}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {timerSeconds > 0 && (
                <button onClick={() => setTimerRunning(running => !running)} aria-label={timerRunning ? 'Pause timer' : 'Resume timer'} className="btn-brutal-white" style={{ padding: '8px' }}>
                  {timerRunning ? <Pause size={16} /> : <Play size={16} />}
                </button>
              )}
              <button onClick={resetTimer} aria-label="Reset timer" className="btn-brutal-white" style={{ padding: '8px' }}>
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '6px' }}>Say “Start a 5 minute focus timer” to begin.</p>
        </div>
      </section>
    </div>
  );
};