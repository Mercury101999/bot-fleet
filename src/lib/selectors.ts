import type { ActivityEntry, Bot, BotStatus, Todo } from '@/lib/types';

export type StatusFilter = BotStatus | 'all';

export interface OpenTodo {
  botId: string;
  botName: string;
  todo: Todo;
}

export interface ActivityItem {
  botId: string;
  botName: string;
  entry: ActivityEntry;
}

const STATUS_RANK: Record<BotStatus, number> = {
  active: 0,
  paused: 1,
  idea: 2,
  retired: 3,
};

export function sortBots(bots: Bot[]): Bot[] {
  return [...bots].sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || a.name.localeCompare(b.name));
}

export function filterBots(bots: Bot[], query: string, status: StatusFilter, tag: string): Bot[] {
  const needle = query.trim().toLocaleLowerCase();
  return sortBots(bots).filter((bot) => {
    if (status !== 'all' && bot.status !== status) return false;
    if (tag !== 'all' && !bot.tags.some((item) => item.toLocaleLowerCase() === tag.toLocaleLowerCase())) return false;
    if (!needle) return true;
    const haystack = [bot.name, bot.role, bot.notes, ...bot.tags].join('\n').toLocaleLowerCase();
    return haystack.includes(needle);
  });
}

export function collectTags(bots: Bot[]): string[] {
  const tags = new Map<string, string>();
  for (const bot of bots) {
    for (const tag of bot.tags) {
      const key = tag.toLocaleLowerCase();
      if (!tags.has(key)) tags.set(key, tag);
    }
  }
  return [...tags.values()].sort((a, b) => a.localeCompare(b));
}

export function statusCounts(bots: Bot[]): Record<BotStatus, number> {
  const counts: Record<BotStatus, number> = { active: 0, paused: 0, idea: 0, retired: 0 };
  for (const bot of bots) counts[bot.status] += 1;
  return counts;
}

export function openTodos(bots: Bot[]): OpenTodo[] {
  return sortBots(bots).flatMap((bot) =>
    bot.todos
      .filter((todo) => !todo.done)
      .map((todo) => ({ botId: bot.id, botName: bot.name, todo })),
  );
}

export function recentActivity(bots: Bot[], limit = 8): ActivityItem[] {
  return bots
    .flatMap((bot) => bot.activity.map((entry) => ({ botId: bot.id, botName: bot.name, entry })))
    .sort((a, b) => b.entry.createdAt.localeCompare(a.entry.createdAt))
    .slice(0, limit);
}

export function orderedTodos(todos: Todo[]): Todo[] {
  return [...todos.filter((todo) => !todo.done), ...todos.filter((todo) => todo.done)];
}

export function linkError(links: { fromId: string; toId: string }[], fromId: string, toId: string): string | null {
  if (!fromId || !toId) return 'Choose both bots.';
  if (fromId === toId) return 'Choose two different bots.';
  if (links.some((link) => link.fromId === fromId && link.toId === toId)) return 'Those bots are already connected.';
  return null;
}
