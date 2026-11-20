import { SCHEMA_VERSION, LEGACY_STORAGE_KEY, STORAGE_KEY } from '@/lib/constants';
import { loadFleet, saveFleet, type KeyValueStore } from '@/lib/storage';
import type { FleetData } from '@/lib/types';

function memoryStore(initial: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: async (key) => data[key] ?? null,
    setItem: async (key, value) => {
      data[key] = value;
    },
  };
}

const fleet: FleetData = {
  bots: [
    {
      id: 'job-scout',
      name: 'Job Scout',
      role: 'Finds roles',
      emoji: '🔭',
      color: '#1F6F8B',
      status: 'active',
      tags: ['career'],
      notes: 'Fictional',
      link: 'https://example.com/job-scout',
      createdAt: '2026-10-02T15:00:00.000Z',
      updatedAt: '2026-11-19T18:10:00.000Z',
      todos: [{ id: 'todo-1', text: 'Draft a brief', done: false, createdAt: '2026-11-18T15:00:00.000Z' }],
      activity: [{ id: 'act-1', text: 'Asked for a weekly search.', createdAt: '2026-11-19T18:10:00.000Z' }],
    },
  ],
  links: [],
  settings: { theme: 'light' },
};

describe('storage', () => {
  test('drops corrupt JSON instead of throwing', async () => {
    const store = memoryStore({ [STORAGE_KEY]: '{not json' });
    await expect(loadFleet(store)).resolves.toEqual({ ok: true, fleet: null });
  });

  test('migrates a legacy key and saves the current schema', async () => {
    const store = memoryStore({
      [LEGACY_STORAGE_KEY]: JSON.stringify({
        schemaVersion: 1,
        bots: [{ id: 'job-scout', name: 'Job Scout', description: 'Finds roles', status: 'paused', createdAt: '2026-01-01T00:00:00.000Z' }],
        settings: { theme: 'dark' },
      }),
    });
    const loaded = await loadFleet(store);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok || !loaded.fleet) throw new Error('expected a fleet');
    expect(loaded.fleet.bots[0].role).toBe('Finds roles');
    expect(loaded.fleet.settings.theme).toBe('dark');

    await saveFleet(store, loaded.fleet);
    const saved = JSON.parse(store.data[STORAGE_KEY]) as { schemaVersion: number; bots: { role: string }[] };
    expect(saved.schemaVersion).toBe(SCHEMA_VERSION);
    expect(saved.bots[0].role).toBe('Finds roles');
  });

  test('leaves a newer backup untouched', async () => {
    const store = memoryStore({ [STORAGE_KEY]: JSON.stringify({ schemaVersion: 9, bots: [{ id: 'a', name: 'Future' }] }) });
    await expect(loadFleet(store)).resolves.toEqual({ ok: false, reason: 'unsupported' });
  });

  test('keeps a saved theme instead of applying the first-run default', async () => {
    const store = memoryStore();
    await saveFleet(store, { ...fleet, settings: { theme: 'system' } });
    const loaded = await loadFleet(store);
    expect(loaded.ok && loaded.fleet?.settings.theme).toBe('system');

    await saveFleet(store, { ...fleet, settings: { theme: 'light' } });
    const light = await loadFleet(store);
    expect(light.ok && light.fleet?.settings.theme).toBe('light');
  });

  test('saves and loads the same fleet', async () => {
    const store = memoryStore();
    await saveFleet(store, fleet);
    const loaded = await loadFleet(store);
    expect(loaded).toEqual({ ok: true, fleet });
  });
});
