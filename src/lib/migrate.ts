import { DEFAULT_COLOR, DEFAULT_EMOJI, LIMITS, SCHEMA_VERSION } from '@/lib/constants';
import { isHexColor, isHttpUrl } from '@/lib/tags';
import { STATUSES, type ActivityEntry, type Bot, type BotStatus, type FleetData, type Handoff, type Settings, type ThemePreference, type Todo } from '@/lib/types';

const THEMES = new Set<ThemePreference>(['system', 'light', 'dark']);
const STATUS_SET = new Set<string>(STATUSES);

export interface LoadResult {
  ok: true;
  fleet: FleetData | null;
}

export interface UnsupportedLoad {
  ok: false;
  reason: 'unsupported';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function stamp(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

/**
 * Lift a schemaVersion 1 document (name, description, status, notes) into the
 * version 2 shape. Missing lists become empty. Unknown versions are refused
 * so a newer backup is not overwritten.
 */
export function migrateRaw(value: unknown): { ok: true; value: unknown } | UnsupportedLoad | { ok: false; reason: 'invalid' } {
  if (!isRecord(value)) return { ok: false, reason: 'invalid' };
  const version = value.schemaVersion;
  if (version === SCHEMA_VERSION) return { ok: true, value };
  if (version === 1 || (version === undefined && Array.isArray(value.bots))) {
    const bots = Array.isArray(value.bots) ? value.bots.map(upgradeBot) : [];
    return {
      ok: true,
      value: {
        schemaVersion: SCHEMA_VERSION,
        bots,
        links: Array.isArray(value.links) ? value.links : [],
        settings: value.settings,
      },
    };
  }
  if (typeof version === 'number') return { ok: false, reason: 'unsupported' };
  return { ok: false, reason: 'invalid' };
}

function upgradeBot(value: unknown): unknown {
  if (!isRecord(value)) return value;
  const role = typeof value.role === 'string' ? value.role : typeof value.description === 'string' ? value.description : '';
  return {
    ...value,
    role,
    emoji: typeof value.emoji === 'string' && value.emoji.trim() ? value.emoji : DEFAULT_EMOJI,
    color: typeof value.color === 'string' ? value.color : DEFAULT_COLOR,
    tags: Array.isArray(value.tags) ? value.tags : [],
    link: typeof value.link === 'string' ? value.link : '',
    notes: typeof value.notes === 'string' ? value.notes : '',
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : value.createdAt,
    todos: Array.isArray(value.todos) ? value.todos : [],
    activity: Array.isArray(value.activity) ? value.activity : [],
  };
}

/** Lenient cleanup used when reading on-device data. Drops broken pieces, keeps the rest. */
export function sanitizeFleet(value: unknown): FleetData | null {
  const migrated = migrateRaw(value);
  if (!migrated.ok) return null;
  if (!isRecord(migrated.value)) return null;
  const root = migrated.value;
  if (!Array.isArray(root.bots)) return null;

  const seen = new Set<string>();
  const bots: Bot[] = [];
  for (const item of root.bots) {
    const bot = sanitizeBot(item);
    if (!bot || seen.has(bot.id)) continue;
    seen.add(bot.id);
    bots.push(bot);
    if (bots.length >= LIMITS.bots) break;
  }

  const links: Handoff[] = [];
  const linkIds = new Set<string>();
  const pairs = new Set<string>();
  if (Array.isArray(root.links)) {
    for (const item of root.links) {
      const link = sanitizeLink(item, seen);
      if (!link || linkIds.has(link.id)) continue;
      const pair = `${link.fromId}->${link.toId}`;
      if (pairs.has(pair)) continue;
      linkIds.add(link.id);
      pairs.add(pair);
      links.push(link);
      if (links.length >= LIMITS.links) break;
    }
  }

  return { bots, links, settings: sanitizeSettings(root.settings) };
}

function sanitizeBot(value: unknown): Bot | null {
  if (!isRecord(value)) return null;
  const id = text(value.id, 80);
  const name = text(value.name, LIMITS.name);
  if (!id || !name) return null;
  const createdAt = stamp(value.createdAt, new Date(0).toISOString());
  const status = typeof value.status === 'string' && STATUS_SET.has(value.status) ? (value.status as BotStatus) : 'idea';
  const color = typeof value.color === 'string' && isHexColor(value.color) ? value.color : DEFAULT_COLOR;
  const link = text(value.link, LIMITS.link);
  return {
    id,
    name,
    role: text(value.role, LIMITS.role),
    emoji: text(value.emoji, LIMITS.emoji) || DEFAULT_EMOJI,
    color,
    status,
    tags: sanitizeTags(value.tags),
    notes: typeof value.notes === 'string' ? value.notes.slice(0, LIMITS.notes) : '',
    link: link && isHttpUrl(link) ? link : '',
    createdAt,
    updatedAt: stamp(value.updatedAt, createdAt),
    todos: sanitizeTodos(value.todos),
    activity: sanitizeActivity(value.activity),
  };
}

function sanitizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string') continue;
    const tag = item.trim().replace(/\s+/g, ' ').slice(0, LIMITS.tag);
    if (!tag) continue;
    const key = tag.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
    if (tags.length >= LIMITS.tags) break;
  }
  return tags;
}

function sanitizeTodos(value: unknown): Todo[] {
  if (!Array.isArray(value)) return [];
  const todos: Todo[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (!isRecord(item)) continue;
    const id = text(item.id, 80);
    const todoText = text(item.text, LIMITS.todo);
    if (!id || !todoText || seen.has(id)) continue;
    seen.add(id);
    todos.push({
      id,
      text: todoText,
      done: item.done === true,
      createdAt: stamp(item.createdAt, new Date(0).toISOString()),
    });
    if (todos.length >= LIMITS.todos) break;
  }
  return todos;
}

function sanitizeActivity(value: unknown): ActivityEntry[] {
  if (!Array.isArray(value)) return [];
  const entries: ActivityEntry[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (!isRecord(item)) continue;
    const id = text(item.id, 80);
    const entryText = text(item.text, LIMITS.activity);
    if (!id || !entryText || seen.has(id)) continue;
    seen.add(id);
    entries.push({
      id,
      text: entryText,
      createdAt: stamp(item.createdAt, new Date(0).toISOString()),
    });
    if (entries.length >= LIMITS.activities) break;
  }
  return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function sanitizeLink(value: unknown, botIds: Set<string>): Handoff | null {
  if (!isRecord(value)) return null;
  const id = text(value.id, 80);
  const fromId = text(value.fromId, 80);
  const toId = text(value.toId, 80);
  if (!id || !fromId || !toId) return null;
  if (fromId === toId) return null;
  if (!botIds.has(fromId) || !botIds.has(toId)) return null;
  return { id, fromId, toId, label: text(value.label, LIMITS.label) };
}

export function sanitizeSettings(value: unknown): Settings {
  const record = isRecord(value) ? value : {};
  const theme = typeof record.theme === 'string' && THEMES.has(record.theme as ThemePreference) ? (record.theme as ThemePreference) : 'system';
  return { theme };
}

export function toStored(fleet: FleetData): Record<string, unknown> {
  return { schemaVersion: SCHEMA_VERSION, ...fleet };
}
