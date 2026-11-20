export const SCHEMA_VERSION = 2;

export const STORAGE_KEY = 'bot-fleet';

/** Earlier builds kept the fleet under this key with schemaVersion 1 inside. */
export const LEGACY_STORAGE_KEY = 'bot-fleet.v1';

export const APP_ID = 'bot-fleet';

export const DEFAULT_EMOJI = '🤖';

export const DEFAULT_COLOR = '#0C6E6A';

export const LIMITS = {
  bots: 200,
  links: 500,
  name: 80,
  role: 160,
  notes: 8000,
  link: 400,
  emoji: 8,
  tag: 24,
  tags: 12,
  todo: 200,
  todos: 100,
  activity: 500,
  activities: 100,
  label: 40,
} as const;

export const BOT_COLORS: { name: string; value: string }[] = [
  { name: 'Teal', value: '#0C6E6A' },
  { name: 'Blue', value: '#1D4E89' },
  { name: 'Cyan', value: '#1F6F8B' },
  { name: 'Amber', value: '#C47B2B' },
  { name: 'Purple', value: '#6A4C93' },
  { name: 'Slate', value: '#5C6B73' },
  { name: 'Green', value: '#0E7A4B' },
  { name: 'Rose', value: '#9C3D55' },
];

export const EMOJI_CHOICES = ['🤖', '🔭', '🛠️', '📚', '📥', '🔎', '📝', '✨', '🧭', '🧪'];
