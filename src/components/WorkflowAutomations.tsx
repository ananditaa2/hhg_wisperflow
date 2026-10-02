import React, { useState } from 'react';
import { PlayCircle, CheckCircle2, Loader2, Terminal, Shield, Rocket, FileCode2, RefreshCw } from 'lucide-react';
import { AutomationTask } from '../types';

interface WorkflowAutomationsProps {
  playTone: (freq?: number, type?: OscillatorType, duration?: number) => void;
  lastSpokenCommand?: string;
  isListening?: boolean;
  onStartMic?: () => void;
}

const INITIAL_TASKS: AutomationTask[] = [
  {
    id: 'deploy-staging',
    name: 'Deploy to Cloud Staging',
    voiceTrigger: 'Wispr, deploy main branch to staging cluster',
    status: 'idle',
    duration: '2.4s',
    category: 'deployment',
    logs: [
      '[INIT] Authenticated with Kubernetes cluster via Wispr CLI',
      '[BUILD] Docker image wispr-app:latest compiled in 1.2s',
      '[HELM] Upgraded release staging-ap-south-1',
      '[HEALTH] 4/4 pods healthy, zero downtime rollover confirmed'
    ]
  },
  {
    id: 'sec-audit',
    name: 'Security & Dependency Scan',
    voiceTrigger: 'Wispr, run comprehensive security audit',
    status: 'idle',
    duration: '1.8s',
    category: 'security',
    logs: [
      '[SCAN] Auditing 482 direct & transitive npm dependencies',
      '[CRYPTO] Validating TLS 1.3 certificate expiration',
      '[STATIC] Semgrep SAST ruleset completed over 42 source files',
      '[RESULT] 0 vulnerabilities detected. High security posture verified'
    ]
  },
  {
    id: 'api-docs',
    name: 'Generate Typed OpenAPI & SDKs',
    voiceTrigger: 'Wispr, generate typescript API client from schema',
    status: 'idle',
    duration: '1.1s',
    category: 'ai',
    logs: [
      '[PARSER] Reading route handlers from src/api/*.ts',
      '[GEN] Generated openapi-spec.v3.json',
      '[TYPES] Emitted strict TypeScript interfaces and axios client wrappers',
      '[DONE] Exported SDK package ready for consumption'
    ]
  },
  {
    id: 'docker-cluster',
    name: 'Spin Up Local Dev Multi-Container Stack',
    voiceTrigger: 'Wispr, spin up local Postgres and Redis cluster',
    status: 'idle',
    duration: '3.1s',
    category: 'deployment',
    logs: [
      '[DOCKER] Pulling postgres:16-alpine and redis:7-alpine',
      '[NETWORK] Created bridge network wispr_dev_net',
      '[VOLUMES] Mounted persistent pgdata at /var/lib/postgresql/data',
      '[STATUS] Ports 5432 and 6379 bound and accepting connections'
    ]
  }
];

export const WorkflowAutomations: React.FC<WorkflowAutomationsProps> = ({ 
  playTone,
  lastSpokenCommand = '',
  isListening = false,
  onStartMic
}) => {
  const [tasks, setTasks] = useState<AutomationTask[]>(INITIAL_TASKS);
  const [activeTaskLogs, setActiveTaskLogs] = useState<string[]>([
    "Wispr Automation Daemon online.",
    "Speak a command (e.g. 'Deploy', 'Audit', 'API', 'Docker') or click trigger."
  ]);
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);

  const runTask = (task: AutomationTask) => {
    if (runningTaskId) return;

    setRunningTaskId(task.id);
    playTone(550, 'sine', 0.15);

    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'running' } : t));
    setActiveTaskLogs([`[TRIGGER] Spoken command received: "${task.voiceTrigger}"`]);

    let step = 0;
    const interval = setInterval(() => {
      if (step < task.logs.length) {
        const nextLog = task.logs[step];
        setActiveTaskLogs(prev => [...prev, nextLog]);
        playTone(400 + step * 80, 'triangle', 0.08);
        step += 1;
      } else {
        clearInterval(interval);
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'success' } : t));
        setRunningTaskId(null);
        playTone(880, 'sine', 0.25);
      }
    }, 600);
  };

  // Automatic voice command matching
  React.useEffect(() => {
    if (!lastSpokenCommand) return;
    const lower = lastSpokenCommand.toLowerCase();
    if (lower.includes('deploy') || lower.includes('staging')) {
      runTask(tasks[0]);
    } else if (lower.includes('security') || lower.includes('audit')) {
      runTask(tasks[1]);
    } else if (lower.includes('api') || lower.includes('doc')) {
      runTask(tasks[2]);
    } else if (lower.includes('docker') || lower.includes('postgres') || lower.includes('cluster')) {
      runTask(tasks[3]);
    }
  }, [lastSpokenCommand]);

  const resetAll = () => {
    setTasks(INITIAL_TASKS);
    setActiveTaskLogs(["All automation workflows reset to standby."]);
    playTone(350, 'sine', 0.1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Header */}
      <div className="genz-card" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="genz-tag" style={{ backgroundColor: 'var(--accent-yellow)' }}>PILLAR 3</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              VOICE PIPELINE AUTOMATIONS
            </span>
          </div>
          <h2 className="serif-headline" style={{ fontSize: '2.2rem', marginBottom: '6px' }}>
            Spoken Pipeline Orchestrator
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '750px', fontSize: '0.95rem' }}>
            Trigger mission-critical developer workflows with natural speech. Speak a macro into Wispr Flow to orchestrate testing, deployment, and security scans hands-free.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            backgroundColor: 'var(--accent-lilac-soft)',
            padding: '8px 16px',
            borderRadius: '999px',
            border: '2px solid var(--border-black)',
            boxShadow: '2px 2px 0px var(--border-black)',
            fontSize: '0.85rem',
            color: 'var(--text-main)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>🎙️</span>
            <span>Say &quot;Deploy&quot;, &quot;Audit&quot;, &quot;API&quot;, or &quot;Docker&quot;</span>
          </div>

          <button onClick={resetAll} className="btn-brutal-white" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <RefreshCw size={14} /> Reset All
          </button>
        </div>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {tasks.map(task => {
          const isRunning = task.status === 'running';
          const isSuccess = task.status === 'success';

          return (
            <div
              key={task.id}
              className="genz-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundColor: isRunning ? '#ecfdf5' : isSuccess ? '#f0fdf4' : '#ffffff'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {task.category === 'deployment' && <Rocket size={20} color="#093c31" />}
                    {task.category === 'security' && <Shield size={20} color="#0284c7" />}
                    {task.category === 'ai' && <FileCode2 size={20} color="#7c3aed" />}
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{task.name}</h3>
                  </div>

                  <span className="genz-tag" style={{
                    backgroundColor: isRunning ? 'var(--accent-matcha)' : isSuccess ? '#86efac' : '#f1f5f9'
                  }}>
                    {isRunning ? 'RUNNING' : isSuccess ? 'COMPLETE' : 'STANDBY'}
                  </span>
                </div>

                <div style={{
                  backgroundColor: '#faf8f0',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '2px solid var(--border-black)',
                  boxShadow: '2px 2px 0px var(--border-black)',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '4px' }}>
                    🎙️ SPOKEN VOICE TRIGGER:
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#111827', fontWeight: 600 }}>
                    &quot;{task.voiceTrigger}&quot;
                  </div>
                </div>
              </div>

              <button
                onClick={() => runTask(task)}
                disabled={isRunning}
                className={isSuccess ? 'btn-brutal-white' : 'btn-brutal-lilac'}
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              >
                {isRunning ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Executing Pipeline...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 size={16} color="#059669" />
                    <span>Workflow Succeeded ({task.duration})</span>
                  </>
                ) : (
                  <>
                    <PlayCircle size={16} />
                    <span>Trigger Spoken Macro</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Terminal Screen & DAG */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '20px'
      }}>
        {/* Terminal Screen */}
        <div className="genz-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={18} color="#093c31" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Live Automation Execution Console</h3>
            </div>
            <span className="genz-tag" style={{ backgroundColor: 'var(--accent-cyan)' }}>WISPR-CLI DAEMON</span>
          </div>

          <div style={{
            backgroundColor: '#111827',
            borderRadius: '12px',
            border: '2px solid var(--border-black)',
            boxShadow: '3px 3px 0px var(--border-black)',
            padding: '18px',
            minHeight: '200px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.84rem',
            lineHeight: '1.7',
            color: '#a7f3d0',
            overflowY: 'auto'
          }}>
            {activeTaskLogs.map((line, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#6b7280' }}>$&gt;</span>
                <span>{line}</span>
              </div>
            ))}
            {runningTaskId && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', marginTop: '6px' }}>
                <span className="pulse-dot" style={{ width: '8px', height: '8px', backgroundColor: '#34d399' }}></span>
                <span>executing step...</span>
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Topology */}
        <div className="genz-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>CI/CD Pipeline Topology</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Each stage is validated automatically upon voice macro trigger:
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            padding: '20px 12px',
            backgroundColor: '#faf8f0',
            borderRadius: '14px',
            border: '2px solid var(--border-black)',
            boxShadow: '2px 2px 0px var(--border-black)'
          }}>
            {[
              { label: 'Voice Intent', sub: 'Wispr Flow' },
              { label: 'Lint & Test', sub: 'Jest / Vitest' },
              { label: 'Build Image', sub: 'Docker' },
              { label: 'Rollout', sub: 'Cloud K8s' }
            ].map((stage, i) => (
              <React.Fragment key={i}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: runningTaskId ? '#86efac' : '#ffffff',
                    border: '2px solid var(--border-black)',
                    boxShadow: '2px 2px 0px var(--border-black)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: 'var(--text-main)'
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800 }}>{stage.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{stage.sub}</div>
                </div>
                {i < 3 && <span style={{ color: 'var(--border-black)', fontSize: '1.2rem', fontWeight: 800 }}>→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
