import { exampleFleet } from '@/lib/example';
import { parseFleetImport, serializeFleet } from '@/lib/transfer';

const ids = ['imported-1', 'imported-2', 'imported-3'];

function createId() {
  const next = ids.shift();
  if (!next) throw new Error('ran out of ids');
  return next;
}

describe('import and export', () => {
  test('rejects malformed input with a readable error', () => {
    expect(parseFleetImport('', createId).ok).toBe(false);
    expect(parseFleetImport('{', createId)).toEqual({ ok: false, error: 'That text is not valid JSON.' });
    expect(parseFleetImport([], createId)).toEqual({ ok: false, error: 'The file should be a JSON object.' });
    expect(parseFleetImport({ app: 'other', schemaVersion: 2, bots: [] }, createId)).toEqual({
      ok: false,
      error: 'This file is not a Bot Fleet backup.',
    });
    expect(parseFleetImport({ app: 'bot-fleet', schemaVersion: 9, bots: [] }, createId)).toEqual({
      ok: false,
      error: 'This file uses an unsupported Bot Fleet version.',
    });
    expect(parseFleetImport({ app: 'bot-fleet', schemaVersion: 2, bots: [{ status: 'active' }] }, createId)).toEqual({
      ok: false,
      error: 'Bot 1 needs a name.',
    });
    expect(
      parseFleetImport({ app: 'bot-fleet', schemaVersion: 2, bots: [{ name: 'Job Scout', status: 'asleep' }] }, createId),
    ).toEqual({ ok: false, error: 'Bot 1 ("Job Scout") has an unknown status.' });
    expect(
      parseFleetImport(
        {
          app: 'bot-fleet',
          schemaVersion: 2,
          bots: [{ id: 'a', name: 'Job Scout', status: 'active', link: 'notaurl' }],
        },
        createId,
      ),
    ).toEqual({ ok: false, error: 'Bot 1 ("Job Scout") has a link that is not an http or https URL.' });
    expect(
      parseFleetImport(
        {
          app: 'bot-fleet',
          schemaVersion: 2,
          bots: [
            { id: 'a', name: 'Job Scout', status: 'active' },
            { id: 'a', name: 'Code Partner', status: 'active' },
          ],
        },
        createId,
      ),
    ).toEqual({ ok: false, error: 'Two bots share the id "a".' });
    expect(
      parseFleetImport(
        {
          app: 'bot-fleet',
          schemaVersion: 2,
          bots: [{ id: 'a', name: 'Job Scout', status: 'active', todos: [{ text: 'Draft', done: 'yes' }] }],
        },
        createId,
      ),
    ).toEqual({ ok: false, error: 'Bot "Job Scout" to-do 1 needs a done true or false.' });
    expect(
      parseFleetImport(
        {
          app: 'bot-fleet',
          schemaVersion: 2,
          bots: [{ id: 'a', name: 'Job Scout', status: 'active' }],
          links: [{ fromId: 'a', toId: 'missing' }],
        },
        createId,
      ),
    ).toEqual({ ok: false, error: 'Link 1 points at a bot that is not in the file.' });
    expect(
      parseFleetImport(
        {
          app: 'bot-fleet',
          schemaVersion: 2,
          bots: [{ id: 'a', name: 'Job Scout', status: 'active' }],
          links: [{ fromId: 'a', toId: 'a' }],
        },
        createId,
      ),
    ).toEqual({ ok: false, error: 'Link 1 connects a bot to itself.' });
  });

  test('accepts a version 1 file and a current backup', () => {
    const legacy = parseFleetImport(
      {
        schemaVersion: 1,
        bots: [{ id: 'job-scout', name: 'Job Scout', description: 'Finds roles', status: 'paused' }],
      },
      createId,
      '2026-11-20T00:00:00.000Z',
    );
    expect(legacy.ok).toBe(true);
    if (!legacy.ok) return;
    expect(legacy.value.bots[0].role).toBe('Finds roles');
    expect(legacy.value.bots[0].status).toBe('paused');
    expect(legacy.value.bots[0].emoji).toBe('🤖');

    const example = exampleFleet();
    const raw = serializeFleet({ ...example, settings: { theme: 'dark' } }, '2026-11-20T00:00:00.000Z');
    const parsed = parseFleetImport(raw, createId);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.bots.map((bot) => bot.name)).toEqual(example.bots.map((bot) => bot.name));
    expect(parsed.value.links).toEqual(example.links);
    expect(parsed.value.settings.theme).toBe('dark');
    expect(parsed.value.bots[0].todos[0].text).toBe("Draft this week's search brief");
  });
});
