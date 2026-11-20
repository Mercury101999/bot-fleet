import { migrateRaw, sanitizeFleet } from '@/lib/migrate';

describe('migrations', () => {
  test('lifts a version 1 bot into the current shape', () => {
    const fleet = sanitizeFleet({
      schemaVersion: 1,
      bots: [
        {
          id: 'job-scout',
          name: 'Job Scout',
          description: 'Finds roles',
          status: 'active',
          notes: 'Keep this',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      settings: { theme: 'dark' },
    });
    expect(fleet?.bots).toHaveLength(1);
    expect(fleet?.bots[0].role).toBe('Finds roles');
    expect(fleet?.bots[0].emoji).toBe('🤖');
    expect(fleet?.bots[0].tags).toEqual([]);
    expect(fleet?.bots[0].todos).toEqual([]);
    expect(fleet?.bots[0].activity).toEqual([]);
    expect(fleet?.bots[0].notes).toBe('Keep this');
    expect(fleet?.links).toEqual([]);
    expect(fleet?.settings.theme).toBe('dark');
  });

  test('drops broken links and keeps a readable bot', () => {
    const fleet = sanitizeFleet({
      schemaVersion: 2,
      bots: [
        { id: 'a', name: 'Code Partner', status: 'active', role: 'Reviews diffs' },
        { id: '', name: 'Nameless' },
        { id: 'a', name: 'Duplicate' },
      ],
      links: [
        { id: 'ok', fromId: 'a', toId: 'missing', label: 'nope' },
        { id: 'self', fromId: 'a', toId: 'a', label: 'loop' },
      ],
      settings: { theme: 'nope' },
    });
    expect(fleet?.bots.map((bot) => bot.name)).toEqual(['Code Partner']);
    expect(fleet?.bots[0].status).toBe('active');
    expect(fleet?.links).toEqual([]);
    expect(fleet?.settings.theme).toBe('system');
  });

  test('refuses a newer schema instead of guessing', () => {
    expect(migrateRaw({ schemaVersion: 9, bots: [] })).toEqual({ ok: false, reason: 'unsupported' });
    expect(sanitizeFleet({ schemaVersion: 9, bots: [] })).toBeNull();
  });

  test('treats corrupt roots as unreadable', () => {
    expect(migrateRaw(null)).toEqual({ ok: false, reason: 'invalid' });
    expect(sanitizeFleet('nope')).toBeNull();
  });
});
