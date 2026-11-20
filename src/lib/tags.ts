import { LIMITS } from '@/lib/constants';

export function parseTags(value: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const part of value.split(',')) {
    const tag = part.trim().replace(/\s+/g, ' ').slice(0, LIMITS.tag);
    if (!tag) continue;
    const key = tag.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
    if (tags.length >= LIMITS.tags) break;
  }
  return tags;
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}
