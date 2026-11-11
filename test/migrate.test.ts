import { test } from 'node:test';
import assert from 'node:assert/strict';
import { migrate, defaults } from '../src/app/migrate.ts';

const SC = [{ id: 'dusk', name: 'Zmierzch' }, { id: 'moon', name: 'Księżyc' }, { id: 'dashboard', name: 'Dashboard' }];

test('empty or garbage storage gives defaults', () => {
  for (const raw of [null, undefined, 42, 'x']){ const s = migrate(raw, SC); assert.equal(s.v, 2); assert.equal(s.scene, 'dusk'); assert.equal(s.wbg, 'scrim'); }
});

test('v1: scene index becomes an id, per-scene keys move from names to ids', () => {
  const s = migrate({ scene: 1, sc: { 'Dashboard': { layout: { clock: { x: .1, y: .2, s: 1 } }, widgets: {} } }, scSeen: { 'Dashboard': true }, dscale: 120 }, SC);
  assert.equal(s.scene, 'moon');
  assert.deepEqual(Object.keys(s.sc), ['dashboard']);
  assert.equal(s.sc.dashboard.layout.clock.x, .1);
  assert.equal(s.scSeen.dashboard, true);
  assert.equal(s.dscale, 120);
});

test('v1: out-of-range index wraps like the old page did', () => {
  assert.equal(migrate({ scene: 4 }, SC).scene, 'moon');
  assert.equal(migrate({ scene: -1 }, SC).scene, 'dashboard');
});

test('v2 is kept; unknown scene ids and bad enums fall back', () => {
  const s = migrate({ v: 2, scene: 'gone', wbg: 'neon', tab: 'p9', h24: false, extra: 1 }, SC);
  assert.equal(s.scene, 'dusk'); assert.equal(s.wbg, 'scrim'); assert.equal(s.tab, 'p1'); assert.equal(s.h24, false);
  assert.equal('extra' in s, false);
});

test('wrong types are ignored, pomo survives', () => {
  const pomo = { mode: 'focus', run: false, endAt: 0, left: 1000 };
  const s = migrate({ v: 2, dash: 'yes', todo: 'nope', pomo }, SC);
  assert.equal(s.dash, defaults(SC).dash); assert.deepEqual(s.todo, []); assert.deepEqual(s.pomo, pomo);
});

test('theme: v1 gets the scene-driven default, unknown values fall back', () => {
  assert.equal(migrate({ scene: 0 }, SC).theme, 'scene');
  assert.equal(migrate({ v: 2, theme: 'dossier' }, SC).theme, 'dossier');
  assert.equal(migrate({ v: 2, theme: 'neon' }, SC).theme, 'scene');
});
