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

export interface GameObstacle {
  x: number;
  width: number;
  height: number;
  type: 'bug' | 'syntax_error' | 'merge_conflict';
  label: string;
  color?: string;
}

export interface CyberThreat {
  id: string;
  name: string;
  voiceCounter: string;
  aliases: string[];
  x: number;
  y: number;
  speed: number;
  color: string;
  icon: string;
}

