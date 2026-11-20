import { exampleFleet } from '@/lib/example';
import { emptyDraft } from '@/lib/draft';
import { initialState, reducer } from '@/lib/reducer';

describe('reducer', () => {
  test('creates, updates, and deletes a bot along with its links', () => {
    const created = reducer(initialState, {
      type: 'createBot',
      id: 'job-scout',
      now: '2026-11-20T00:00:00.000Z',
      draft: { ...emptyDraft(), name: 'Job Scout', role: 'Finds roles', tags: 'career, career', status: 'active' },
    });
    const withPartner = reducer(created, {
      type: 'createBot',
      id: 'code-partner',
      now: '2026-11-20T00:00:00.000Z',
      draft: { ...emptyDraft(), name: 'Code Partner' },
    });
    const linked = reducer(withPartner, { type: 'addLink', id: 'link-1', fromId: 'job-scout', toId: 'code-partner', label: 'FYI' });
    expect(linked.links).toHaveLength(1);
    expect(reducer(linked, { type: 'addLink', fromId: 'job-scout', toId: 'job-scout', label: 'loop' }).links).toHaveLength(1);
    expect(reducer(linked, { type: 'addLink', fromId: 'job-scout', toId: 'code-partner', label: 'again' }).links).toHaveLength(1);

    const removed = reducer(linked, { type: 'deleteBot', id: 'job-scout' });
    expect(removed.bots.map((bot) => bot.id)).toEqual(['code-partner']);
    expect(removed.links).toEqual([]);
    expect(created.bots[0].tags).toEqual(['career']);
  });

  test('tracks to-dos and activity on one bot', () => {
    const start = reducer(initialState, {
      type: 'createBot',
      id: 'study-coach',
      now: '2026-11-20T00:00:00.000Z',
      draft: { ...emptyDraft(), name: 'Study Coach' },
    });
    const withTodo = reducer(start, { type: 'addTodo', botId: 'study-coach', text: 'Quiz on ports', id: 'todo-1', now: '2026-11-20T01:00:00.000Z' });
    const done = reducer(withTodo, { type: 'toggleTodo', botId: 'study-coach', todoId: 'todo-1' });
    expect(done.bots[0].todos[0].done).toBe(true);
    const reopened = reducer(done, { type: 'toggleTodo', botId: 'study-coach', todoId: 'todo-1' });
    expect(reopened.bots[0].todos[0].done).toBe(false);
    const withActivity = reducer(reopened, {
      type: 'addActivity',
      botId: 'study-coach',
      text: 'Ten questions.',
      id: 'act-1',
      now: '2026-11-20T02:00:00.000Z',
    });
    expect(withActivity.bots[0].activity[0].text).toBe('Ten questions.');
    expect(reducer(withActivity, { type: 'addTodo', botId: 'study-coach', text: '   ' }).bots[0].todos).toHaveLength(1);
  });

  test('loads the example fleet without changing the theme, and clear keeps the theme', () => {
    expect(initialState.settings.theme).toBe('dark');
    const themed = reducer(initialState, { type: 'setTheme', theme: 'light' });
    const loaded = reducer(themed, { type: 'loadExample' });
    expect(loaded.settings.theme).toBe('light');
    expect(loaded.bots.map((bot) => bot.name)).toEqual(exampleFleet().bots.map((bot) => bot.name));
    const cleared = reducer(loaded, { type: 'clearFleet' });
    expect(cleared.bots).toEqual([]);
    expect(cleared.links).toEqual([]);
    expect(cleared.settings.theme).toBe('light');
  });
});
