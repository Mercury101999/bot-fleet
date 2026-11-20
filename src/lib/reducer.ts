import { DEFAULT_EMOJI, LIMITS } from '@/lib/constants';
import { exampleFleet } from '@/lib/example';
import { createId } from '@/lib/id';
import { parseTags } from '@/lib/tags';
import type { Bot, BotDraft, BotStatus, FleetData, Handoff, Settings, ThemePreference } from '@/lib/types';

export interface FleetState {
  bots: Bot[];
  links: Handoff[];
  settings: Settings;
}

export const initialState: FleetState = {
  bots: [],
  links: [],
  settings: { theme: 'system' },
};

export type Action =
  | { type: 'hydrate'; fleet: FleetData }
  | { type: 'createBot'; draft: BotDraft; id?: string; now?: string }
  | { type: 'updateBot'; id: string; draft: BotDraft; now?: string }
  | { type: 'deleteBot'; id: string }
  | { type: 'setStatus'; id: string; status: BotStatus; now?: string }
  | { type: 'addTodo'; botId: string; text: string; id?: string; now?: string }
  | { type: 'toggleTodo'; botId: string; todoId: string; now?: string }
  | { type: 'deleteTodo'; botId: string; todoId: string; now?: string }
  | { type: 'addActivity'; botId: string; text: string; id?: string; now?: string }
  | { type: 'deleteActivity'; botId: string; activityId: string; now?: string }
  | { type: 'addLink'; fromId: string; toId: string; label: string; id?: string }
  | { type: 'deleteLink'; id: string }
  | { type: 'setTheme'; theme: ThemePreference }
  | { type: 'importFleet'; fleet: FleetData }
  | { type: 'loadExample' }
  | { type: 'clearFleet' };

function stamp(now?: string): string {
  return now ?? new Date().toISOString();
}

function touch(bot: Bot, now: string, patch: Partial<Bot>): Bot {
  return { ...bot, ...patch, updatedAt: now };
}

function mapBot(state: FleetState, id: string, now: string, patch: (bot: Bot) => Partial<Bot>): FleetState {
  return {
    ...state,
    bots: state.bots.map((bot) => (bot.id === id ? touch(bot, now, patch(bot)) : bot)),
  };
}

export function reducer(state: FleetState, action: Action): FleetState {
  switch (action.type) {
    case 'hydrate':
    case 'importFleet':
      return { bots: action.fleet.bots, links: action.fleet.links, settings: action.fleet.settings };
    case 'loadExample': {
      const example = exampleFleet();
      return { ...state, bots: example.bots, links: example.links };
    }
    case 'clearFleet':
      return { ...state, bots: [], links: [] };
    case 'setTheme':
      return { ...state, settings: { theme: action.theme } };
    case 'createBot': {
      if (state.bots.length >= LIMITS.bots) return state;
      const now = stamp(action.now);
      const bot: Bot = {
        id: action.id ?? createId(),
        name: action.draft.name.trim(),
        role: action.draft.role.trim(),
        emoji: action.draft.emoji.trim() || DEFAULT_EMOJI,
        color: action.draft.color,
        status: action.draft.status,
        tags: parseTags(action.draft.tags),
        notes: action.draft.notes.slice(0, LIMITS.notes),
        link: action.draft.link.trim(),
        createdAt: now,
        updatedAt: now,
        todos: [],
        activity: [],
      };
      return { ...state, bots: [...state.bots, bot] };
    }
    case 'updateBot': {
      const now = stamp(action.now);
      return mapBot(state, action.id, now, () => ({
        name: action.draft.name.trim(),
        role: action.draft.role.trim(),
        emoji: action.draft.emoji.trim() || DEFAULT_EMOJI,
        color: action.draft.color,
        status: action.draft.status,
        tags: parseTags(action.draft.tags),
        notes: action.draft.notes.slice(0, LIMITS.notes),
        link: action.draft.link.trim(),
      }));
    }
    case 'deleteBot':
      return {
        ...state,
        bots: state.bots.filter((bot) => bot.id !== action.id),
        links: state.links.filter((link) => link.fromId !== action.id && link.toId !== action.id),
      };
    case 'setStatus':
      return mapBot(state, action.id, stamp(action.now), () => ({ status: action.status }));
    case 'addTodo': {
      const text = action.text.trim();
      if (!text) return state;
      const now = stamp(action.now);
      return mapBot(state, action.botId, now, (bot) => {
        if (bot.todos.length >= LIMITS.todos) return {};
        return {
          todos: [...bot.todos, { id: action.id ?? createId(), text: text.slice(0, LIMITS.todo), done: false, createdAt: now }],
        };
      });
    }
    case 'toggleTodo':
      return mapBot(state, action.botId, stamp(action.now), (bot) => ({
        todos: bot.todos.map((todo) => (todo.id === action.todoId ? { ...todo, done: !todo.done } : todo)),
      }));
    case 'deleteTodo':
      return mapBot(state, action.botId, stamp(action.now), (bot) => ({
        todos: bot.todos.filter((todo) => todo.id !== action.todoId),
      }));
    case 'addActivity': {
      const text = action.text.trim();
      if (!text) return state;
      const now = stamp(action.now);
      return mapBot(state, action.botId, now, (bot) => ({
        activity: [{ id: action.id ?? createId(), text: text.slice(0, LIMITS.activity), createdAt: now }, ...bot.activity].slice(
          0,
          LIMITS.activities,
        ),
      }));
    }
    case 'deleteActivity':
      return mapBot(state, action.botId, stamp(action.now), (bot) => ({
        activity: bot.activity.filter((entry) => entry.id !== action.activityId),
      }));
    case 'addLink': {
      const label = action.label.trim().slice(0, LIMITS.label);
      if (!action.fromId || !action.toId || action.fromId === action.toId) return state;
      if (!state.bots.some((bot) => bot.id === action.fromId) || !state.bots.some((bot) => bot.id === action.toId)) return state;
      if (state.links.some((link) => link.fromId === action.fromId && link.toId === action.toId)) return state;
      if (state.links.length >= LIMITS.links) return state;
      return {
        ...state,
        links: [...state.links, { id: action.id ?? createId(), fromId: action.fromId, toId: action.toId, label }],
      };
    }
    case 'deleteLink':
      return { ...state, links: state.links.filter((link) => link.id !== action.id) };
    default:
      return state;
  }
}
