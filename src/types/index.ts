export type ActiveTab = 'cockpit' | 'game' | 'automations' | 'canvas';

export interface TelemetryData {
  isRecording: boolean;
  wordsSpoken: number;
  currentWpm: number;
  flowMultiplier: number;
  keystrokesSaved: number;
  sessionDuration: number;
  volumeLevel: number;
}

export interface AutomationTask {
  id: string;
  name: string;
  voiceTrigger: string;
  status: 'idle' | 'running' | 'success' | 'failed';
  duration: string;
  category: 'deployment' | 'security' | 'testing' | 'ai';
  logs: string[];
}

export interface ArchitectureNode {
  id: string;
  title: string;
  category: 'input' | 'processing' | 'ai' | 'execution' | 'storage';
  description: string;
  x: number;
  y: number;
  connections: string[];
  status: 'active' | 'standby' | 'pulsing';
}

export interface GameObstacle {
  x: number;
  width: number;
  height: number;
  type: 'bug' | 'syntax_error' | 'merge_conflict';
  label: string;
  color?: string;
}
