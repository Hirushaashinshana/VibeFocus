export interface Habit {
  id: string;
  name: string;
  streak: number;
  lastCompletedDate: string | null; // Format: "YYYY-MM-DD"
  createdAt: string;
  category: 'work' | 'health' | 'learn' | 'mind' | 'routine';
}

export interface UserStats {
  level: number;
  xp: number;
  totalXpNeeded: number; // Always 100 as per specifications
  focusSessionsCompleted: number;
  totalFocusTime: number; // In minutes
  habitsCompletedCount: number;
}

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface HistoryEntry {
  date: string; // Format: "YYYY-MM-DD"
  focusMinutes: number;
  habitsCompleted: number;
}


export interface TimerPreset {
  id: TimerMode;
  label: string;
  duration: number; // In minutes
}
