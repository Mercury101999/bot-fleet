export const STATUSES = ['active', 'paused', 'idea', 'retired'] as const;

export type BotStatus = (typeof STATUSES)[number];

export type ThemePreference = 'system' | 'light' | 'dark';

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
}

export interface ActivityEntry {
  id: string;
  text: string;
  createdAt: string;
}

export interface Bot {
  id: string;
  name: string;
  role: string;
  emoji: string;
  color: string;
  status: BotStatus;
  tags: string[];
  notes: string;
  link: string;
  createdAt: string;
  updatedAt: string;
  todos: Todo[];
  activity: ActivityEntry[];
}

/** A directed hand-off from one bot to another. */
export interface Handoff {
  id: string;
  fromId: string;
  toId: string;
  label: string;
}

export interface Settings {
  theme: ThemePreference;
}

export interface FleetData {
  bots: Bot[];
  links: Handoff[];
  settings: Settings;
}

export interface BotDraft {
  name: string;
  role: string;
  emoji: string;
  color: string;
  status: BotStatus;
  tags: string;
  notes: string;
  link: string;
}

export const STATUS_LABEL: Record<BotStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  idea: 'Idea',
  retired: 'Retired',
};
