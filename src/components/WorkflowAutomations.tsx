import React, { useState } from 'react';
import { PlayCircle, CheckCircle2, Loader2, Terminal, Shield, Rocket, FileCode2, RefreshCw } from 'lucide-react';
import { AutomationTask } from '../types';

interface WorkflowAutomationsProps {
  playTone: (freq?: number, type?: OscillatorType, duration?: number) => void;
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

export const WorkflowAutomations: React.FC<WorkflowAutomationsProps> = ({ playTone }) => {
  const [tasks, setTasks] = useState<AutomationTask[]>(INITIAL_TASKS);
  const [activeTaskLogs, setActiveTaskLogs] = useState<string[]>([
    "Wispr Automation Daemon online.",
    "Awaiting spoken command triggers or manual execution."
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

  const resetAll = () => {
    setTasks(INITIAL_TASKS);
    setActiveTaskLogs(["All automation workflows reset to standby."]);
    playTone(350, 'sine', 0.1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="wispr-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="eyebrow-text" style={{ marginBottom: '8px' }}>
            PILLAR 3: VOICE AUTOMATIONS
          </div>
          <h2 className="serif-headline" style={{ fontSize: '2rem', marginBottom: '6px' }}>
            Spoken Pipeline Orchestrator
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '620px', fontSize: '0.95rem' }}>
            Trigger mission-critical developer workflows with natural speech. Speak a macro into Wispr Flow to orchestrate testing, deployment, and security scans.
          </p>
        </div>

        <button onClick={resetAll} className="btn-wispr-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          <RefreshCw size={14} /> Reset Workflows
        </button>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px'
      }}>
        {tasks.map(task => {
          const isRunning = task.status === 'running';
          const isSuccess = task.status === 'success';

          return (
            <div
              key={task.id}
              className="wispr-card"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderColor: isRunning ? 'var(--accent-forest)' : isSuccess ? '#059669' : undefined,
                borderWidth: (isRunning || isSuccess) ? '1.5px' : '1px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {task.category === 'deployment' && <Rocket size={17} color="#093c31" />}
                    {task.category === 'security' && <Shield size={17} color="#0284c7" />}
                    {task.category === 'ai' && <FileCode2 size={17} color="#7c3aed" />}
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>{task.name}</h3>
                  </div>

                  <span className="mono-tag" style={{
                    backgroundColor: isRunning ? '#ecfdf5' : isSuccess ? '#dcfce7' : undefined,
                    color: isRunning ? '#047857' : isSuccess ? '#15803d' : undefined
                  }}>
                    {isRunning ? 'RUNNING' : isSuccess ? 'COMPLETE' : 'STANDBY'}
                  </span>
                </div>

                <div style={{
                  backgroundColor: '#faf8f0',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #eae6db',
                  marginBottom: '14px'
                }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '4px' }}>
                    🎙️ SPOKEN VOICE TRIGGER:
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#111827' }}>
                    &quot;{task.voiceTrigger}&quot;
                  </div>
                </div>
              </div>

              <button
                onClick={() => runTask(task)}
                disabled={isRunning}
                className={isSuccess ? 'btn-wispr-secondary' : 'btn-wispr-lilac'}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {isRunning ? (
                  <>
                    <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Executing Pipeline...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 size={15} color="#059669" />
                    <span>Workflow Succeeded ({task.duration})</span>
                  </>
                ) : (
                  <>
                    <PlayCircle size={15} />
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px'
      }}>
        {/* Terminal Screen */}
        <div className="wispr-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={17} color="#093c31" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Live Automation Execution Console</h3>
            </div>
            <span className="mono-tag">WISPR-CLI DAEMON</span>
          </div>

          <div style={{
            backgroundColor: '#111827',
            borderRadius: '10px',
            padding: '16px',
            minHeight: '170px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            lineHeight: '1.6',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399' }}>
                <span className="pulse-dot" style={{ width: '6px', height: '6px' }}></span>
                <span>executing step...</span>
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Topology */}
        <div className="wispr-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>CI/CD Pipeline Topology</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Each stage is validated automatically upon voice macro trigger:
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            padding: '16px 8px',
            backgroundColor: '#faf8f0',
            borderRadius: '10px',
            border: '1px solid #eae6db'
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
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: runningTaskId ? '#dcfce7' : '#ffffff',
                    border: '1.5px solid #093c31',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#093c31'
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{stage.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{stage.sub}</div>
                </div>
                {i < 3 && <span style={{ color: '#9ca3af', fontSize: '1.1rem' }}>→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
