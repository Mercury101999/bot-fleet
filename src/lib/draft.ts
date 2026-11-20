import { DEFAULT_COLOR, DEFAULT_EMOJI, LIMITS } from '@/lib/constants';
import { isHttpUrl } from '@/lib/tags';
import type { Bot, BotDraft } from '@/lib/types';

export function emptyDraft(): BotDraft {
  return {
    name: '',
    role: '',
    emoji: DEFAULT_EMOJI,
    color: DEFAULT_COLOR,
    status: 'active',
    tags: '',
    notes: '',
    link: '',
  };
}

export function draftFromBot(bot: Bot): BotDraft {
  return {
    name: bot.name,
    role: bot.role,
    emoji: bot.emoji,
    color: bot.color,
    status: bot.status,
    tags: bot.tags.join(', '),
    notes: bot.notes,
    link: bot.link,
  };
}

export function validateDraft(draft: BotDraft): string | null {
  const name = draft.name.trim();
  if (!name) return 'Name is required.';
  if (name.length > LIMITS.name) return `Name should be ${LIMITS.name} characters or fewer.`;
  if (draft.role.trim().length > LIMITS.role) return `Role should be ${LIMITS.role} characters or fewer.`;
  if (draft.emoji.trim().length > LIMITS.emoji) return 'Use a short emoji for the avatar.';
  const link = draft.link.trim();
  if (link && !isHttpUrl(link)) return 'Link should be an http or https URL.';
  if (draft.notes.length > LIMITS.notes) return 'Notes are too long.';
  return null;
}
