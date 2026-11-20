import { arrowPoints, layoutFleet, segmentBetween } from '@/lib/layout';
import { collectTags, filterBots, openTodos, recentActivity } from '@/lib/selectors';
import { exampleFleet } from '@/lib/example';

describe('layout', () => {
  test('places every bot and keeps a narrow map to two columns', () => {
    const ids = ['a', 'b', 'c', 'd', 'e'];
    const layout = layoutFleet(ids, 360);
    expect(layout.columns).toBe(2);
    expect(layout.positions.map((item) => item.id)).toEqual(ids);
    expect(new Set(layout.positions.map((item) => `${item.x},${item.y}`)).size).toBe(ids.length);
    expect(layout.positions.every((item) => item.x >= 0 && item.x <= layout.width)).toBe(true);
  });

  test('stops the arrow at the node edge', () => {
    const from = { id: 'a', x: 40, y: 40 };
    const to = { id: 'b', x: 200, y: 40 };
    const segment = segmentBetween(from, to, 28);
    const full = Math.hypot(to.x - from.x, to.y - from.y);
    const drawn = Math.hypot(segment.x2 - segment.x1, segment.y2 - segment.y1);
    expect(drawn).toBeLessThan(full);
    expect(segment.y1).toBeCloseTo(40);
    expect(arrowPoints(segment.x1, segment.y1, segment.x2, segment.y2).startsWith(`${segment.x2.toFixed(2)},`)).toBe(true);
  });

  test('offsets a vertical label off the line', () => {
    const segment = segmentBetween({ id: 'a', x: 80, y: 40 }, { id: 'b', x: 80, y: 180 }, 28);
    expect(segment.labelX).toBeGreaterThan(80);
  });

  test('starts a downward arrow below the name under the node', () => {
    const from = { id: 'a', x: 80, y: 40 };
    const segment = segmentBetween(from, { id: 'b', x: 80, y: 220 }, 28, 22);
    expect(segment.y1).toBeGreaterThan(from.y + 28);
  });
});

describe('selectors', () => {
  const { bots } = exampleFleet();

  test('filters by search, status, and tag', () => {
    expect(filterBots(bots, 'certification', 'all', 'all').map((bot) => bot.name)).toEqual(['Study Coach']);
    expect(filterBots(bots, '', 'paused', 'all').map((bot) => bot.name)).toEqual(['Inbox Triage']);
    expect(filterBots(bots, '', 'all', 'research').map((bot) => bot.name)).toEqual(['Job Scout', 'Research Desk']);
    expect(collectTags(bots)).toEqual(['career', 'coding', 'ops', 'research', 'study', 'writing']);
  });

  test('lists open to-dos and newest activity first', () => {
    expect(openTodos(bots).map((item) => item.todo.text)).toEqual([
      'Review the open practice diff',
      "Draft this week's search brief",
      'Quiz on common ports',
    ]);
    expect(recentActivity(bots, 2).map((item) => item.entry.id)).toEqual(['act-scout-1', 'act-code-1']);
  });
});
