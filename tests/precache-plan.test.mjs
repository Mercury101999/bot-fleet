import assert from 'node:assert/strict';
import test from 'node:test';

import { navigationAliases, precacheUrls } from '../scripts/precache-plan.mjs';

test('prefixes exported files with the Pages base path and skips the sitemap', () => {
  assert.deepEqual(
    precacheUrls(['index.html', '_expo/static/js/app.js', 'sw.js', 'app.js.map', '_sitemap.html'], '/bot-fleet'),
    ['/bot-fleet/index.html', '/bot-fleet/_expo/static/js/app.js'],
  );
});

test('adds extensionless aliases for static routes', () => {
  assert.deepEqual(navigationAliases('/bot-fleet/bots.html'), ['/bot-fleet/bots.html', '/bot-fleet/bots']);
  assert.ok(navigationAliases('/bot-fleet/index.html').includes('/bot-fleet/'));
  assert.ok(navigationAliases('/bot-fleet/index.html').includes('/bot-fleet'));
});
