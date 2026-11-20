import { APP_ID, DEFAULT_COLOR, DEFAULT_EMOJI, LIMITS, SCHEMA_VERSION } from '@/lib/constants';
import { migrateRaw, sanitizeSettings } from '@/lib/migrate';
import { isHexColor, isHttpUrl } from '@/lib/tags';
import { STATUSES, type ActivityEntry, type Bot, type BotStatus, type FleetData, type Handoff, type Todo } from '@/lib/types';

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

const STATUS_SET = new Set<string>(STATUSES);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function serializeFleet(fleet: FleetData, exportedAt: string): string {
  return JSON.stringify(
    {
      app: APP_ID,
      schemaVersion: SCHEMA_VERSION,
      exportedAt,
      bots: fleet.bots,
      links: fleet.links,
      settings: fleet.settings,
    },
    null,
    2,
  );
}

export function parseFleetImport(raw: unknown, createId: () => string, now = new Date().toISOString()): ParseResult<FleetData> {
  let data = raw;
  if (typeof raw === 'string') {
    const text = raw.trim();
    if (!text) return { ok: false, error: 'Paste or choose a JSON file first.' };
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      return { ok: false, error: 'That text is not valid JSON.' };
    }
  }

  if (!isRecord(data)) return { ok: false, error: 'The file should be a JSON object.' };

  const version = data.schemaVersion;
  const legacy = version === 1 && Array.isArray(data.bots);
  const current = version === SCHEMA_VERSION && data.app === APP_ID;
  if (!legacy && !current) {
    if (typeof version === 'number' && version !== SCHEMA_VERSION && version !== 1) {
      return { ok: false, error: 'This file uses an unsupported Bot Fleet version.' };
    }
    return { ok: false, error: 'This file is not a Bot Fleet backup.' };
  }

  const migrated = migrateRaw(data);
  if (!migrated.ok || !isRecord(migrated.value)) {
    return { ok: false, error: 'This file is not a Bot Fleet backup.' };
  }
  const root = migrated.value;
  if (!Array.isArray(root.bots)) return { ok: false, error: 'The file is missing a bots list.' };
  if (root.bots.length > LIMITS.bots) {
    return { ok: false, error: `This file has too many bots. The limit is ${LIMITS.bots}.` };
  }
  if (root.links !== undefined && !Array.isArray(root.links)) {
    return { ok: false, error: 'Links should be a list.' };
  }
  const linkItems = Array.isArray(root.links) ? root.links : [];
  if (linkItems.length > LIMITS.links) {
    return { ok: false, error: `This file has too many links. The limit is ${LIMITS.links}.` };
  }

  const bots: Bot[] = [];
  const ids = new Set<string>();
  for (let index = 0; index < root.bots.length; index += 1) {
    const parsed = parseBot(root.bots[index], index, createId, now);
    if (!parsed.ok) return parsed;
    if (ids.has(parsed.value.id)) return { ok: false, error: `Two bots share the id "${parsed.value.id}".` };
    ids.add(parsed.value.id);
    bots.push(parsed.value);
  }

  const links: Handoff[] = [];
  const linkIds = new Set<string>();
  const pairs = new Set<string>();
  for (let index = 0; index < linkItems.length; index += 1) {
    const parsed = parseLink(linkItems[index], index, ids, createId);
    if (!parsed.ok) return parsed;
    if (linkIds.has(parsed.value.id)) return { ok: false, error: `Two links share the id "${parsed.value.id}".` };
    const pair = `${parsed.value.fromId}->${parsed.value.toId}`;
    if (pairs.has(pair)) return { ok: false, error: `Link ${index + 1} repeats a connection that is already in the file.` };
    linkIds.add(parsed.value.id);
    pairs.add(pair);
    links.push(parsed.value);
  }

  return { ok: true, value: { bots, links, settings: sanitizeSettings(root.settings) } };
}

function parseBot(value: unknown, index: number, createId: () => string, now: string): ParseResult<Bot> {
  const label = `Bot ${index + 1}`;
  if (!isRecord(value)) return { ok: false, error: `${label} is not an object.` };
  const name = typeof value.name === 'string' ? value.name.trim() : '';
  if (!name) return { ok: false, error: `${label} needs a name.` };
  if (name.length > LIMITS.name) return { ok: false, error: `${label} ("${name.slice(0, 40)}") has a name that is too long.` };

  if (typeof value.status !== 'string' || !STATUS_SET.has(value.status)) {
    return { ok: false, error: `${label} ("${name}") has an unknown status.` };
  }

  const role = optionalString(value.role);
  if (role === null) return { ok: false, error: `${label} ("${name}") has a role that is not text.` };
  if (role.trim().length > LIMITS.role) return { ok: false, error: `${label} ("${name}") has a role that is too long.` };

  const notes = optionalString(value.notes);
  if (notes === null) return { ok: false, error: `${label} ("${name}") has notes that are not text.` };
  if (notes.length > LIMITS.notes) return { ok: false, error: `${label} ("${name}") has notes that are too long.` };

  const link = optionalString(value.link);
  if (link === null) return { ok: false, error: `${label} ("${name}") has a link that is not text.` };
  const trimmedLink = link.trim();
  if (trimmedLink && !isHttpUrl(trimmedLink)) {
    return { ok: false, error: `${label} ("${name}") has a link that is not an http or https URL.` };
  }

  const emoji = optionalString(value.emoji);
  if (emoji === null) return { ok: false, error: `${label} ("${name}") has an emoji that is not text.` };
  if (emoji.trim().length > LIMITS.emoji) return { ok: false, error: `${label} ("${name}") has an emoji that is too long.` };

  let color = DEFAULT_COLOR;
  if (value.color !== undefined) {
    if (typeof value.color !== 'string' || !isHexColor(value.color)) {
      return { ok: false, error: `${label} ("${name}") has a color that is not a #RRGGBB value.` };
    }
    color = value.color;
  }

  const tags = parseTagList(value.tags, name);
  if (!tags.ok) return tags;

  const todos = parseTodos(value.todos, name, createId, now);
  if (!todos.ok) return todos;
  const activity = parseActivity(value.activity, name, createId, now);
  if (!activity.ok) return activity;

  const id = typeof value.id === 'string' && value.id.trim() ? value.id.trim() : createId();
  if (id.length > 80) return { ok: false, error: `${label} ("${name}") has an id that is too long.` };
  const createdAt = typeof value.createdAt === 'string' && value.createdAt.trim() ? value.createdAt : now;
  const updatedAt = typeof value.updatedAt === 'string' && value.updatedAt.trim() ? value.updatedAt : createdAt;

  return {
    ok: true,
    value: {
      id,
      name,
      role: role.trim(),
      emoji: emoji.trim() || DEFAULT_EMOJI,
      color,
      status: value.status as BotStatus,
      tags: tags.value,
      notes,
      link: trimmedLink,
      createdAt,
      updatedAt,
      todos: todos.value,
      activity: activity.value,
    },
  };
}

function optionalString(value: unknown): string | null {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') return null;
  return value;
}

function parseTagList(value: unknown, name: string): ParseResult<string[]> {
  if (value === undefined) return { ok: true, value: [] };
  if (!Array.isArray(value)) return { ok: false, error: `Bot "${name}" has tags that are not a list.` };
  if (value.length > LIMITS.tags) return { ok: false, error: `Bot "${name}" has too many tags.` };
  const tags: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== 'string') return { ok: false, error: `Bot "${name}" has a tag that is not text.` };
    const tag = item.trim().replace(/\s+/g, ' ');
    if (!tag) return { ok: false, error: `Bot "${name}" has an empty tag.` };
    if (tag.length > LIMITS.tag) return { ok: false, error: `Bot "${name}" has a tag that is too long.` };
    const key = tag.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
  }
  return { ok: true, value: tags };
}

function parseTodos(value: unknown, name: string, createId: () => string, now: string): ParseResult<Todo[]> {
  if (value === undefined) return { ok: true, value: [] };
  if (!Array.isArray(value)) return { ok: false, error: `Bot "${name}" has to-dos that are not a list.` };
  if (value.length > LIMITS.todos) return { ok: false, error: `Bot "${name}" has too many to-dos.` };
  const todos: Todo[] = [];
  const seen = new Set<string>();
  for (let index = 0; index < value.length; index += 1) {
    const item = value[index];
    const label = `Bot "${name}" to-do ${index + 1}`;
    if (!isRecord(item)) return { ok: false, error: `${label} is not an object.` };
    if (typeof item.text !== 'string' || !item.text.trim()) return { ok: false, error: `${label} needs text.` };
    if (item.text.trim().length > LIMITS.todo) return { ok: false, error: `${label} is too long.` };
    if (typeof item.done !== 'boolean') return { ok: false, error: `${label} needs a done true or false.` };
    let id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : createId();
    if (seen.has(id)) id = createId();
    seen.add(id);
    todos.push({
      id,
      text: item.text.trim(),
      done: item.done,
      createdAt: typeof item.createdAt === 'string' && item.createdAt ? item.createdAt : now,
    });
  }
  return { ok: true, value: todos };
}

function parseActivity(value: unknown, name: string, createId: () => string, now: string): ParseResult<ActivityEntry[]> {
  if (value === undefined) return { ok: true, value: [] };
  if (!Array.isArray(value)) return { ok: false, error: `Bot "${name}" has activity that is not a list.` };
  if (value.length > LIMITS.activities) return { ok: false, error: `Bot "${name}" has too many activity entries.` };
  const entries: ActivityEntry[] = [];
  const seen = new Set<string>();
  for (let index = 0; index < value.length; index += 1) {
    const item = value[index];
    const label = `Bot "${name}" activity ${index + 1}`;
    if (!isRecord(item)) return { ok: false, error: `${label} is not an object.` };
    if (typeof item.text !== 'string' || !item.text.trim()) return { ok: false, error: `${label} needs text.` };
    if (item.text.trim().length > LIMITS.activity) return { ok: false, error: `${label} is too long.` };
    let id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : createId();
    if (seen.has(id)) id = createId();
    seen.add(id);
    entries.push({
      id,
      text: item.text.trim(),
      createdAt: typeof item.createdAt === 'string' && item.createdAt ? item.createdAt : now,
    });
  }
  return { ok: true, value: entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) };
}

function parseLink(value: unknown, index: number, botIds: Set<string>, createId: () => string): ParseResult<Handoff> {
  const label = `Link ${index + 1}`;
  if (!isRecord(value)) return { ok: false, error: `${label} is not an object.` };
  const fromId = typeof value.fromId === 'string' ? value.fromId.trim() : '';
  const toId = typeof value.toId === 'string' ? value.toId.trim() : '';
  if (!fromId || !toId) return { ok: false, error: `${label} needs a from bot and a to bot.` };
  if (fromId === toId) return { ok: false, error: `${label} connects a bot to itself.` };
  if (!botIds.has(fromId) || !botIds.has(toId)) {
    return { ok: false, error: `${label} points at a bot that is not in the file.` };
  }
  if (value.label !== undefined && typeof value.label !== 'string') {
    return { ok: false, error: `${label} has a label that is not text.` };
  }
  const linkLabel = typeof value.label === 'string' ? value.label.trim() : '';
  if (linkLabel.length > LIMITS.label) return { ok: false, error: `${label} has a label that is too long.` };
  const id = typeof value.id === 'string' && value.id.trim() ? value.id.trim() : createId();
  return { ok: true, value: { id, fromId, toId, label: linkLabel } };
}
