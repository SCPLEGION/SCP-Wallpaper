import { test } from 'node:test';
import assert from 'node:assert/strict';
import { curveSide, curveShift, CURVE_GAP } from '../src/app/curve.ts';

const geo = { cx: 800, cy: 450, Rc: 300 };
const R = geo.Rc + CURVE_GAP;

test('side: centre band is left alone', () => {
  assert.equal(curveSide(800, 800, 1600), 0);
  assert.equal(curveSide(300, 800, 1600), -1);
  assert.equal(curveSide(1300, 800, 1600), 1);
});

test('shift: at the globe equator the inner edge touches the circle', () => {
  // left widget spanning 100..300: right edge should land on cx - R
  assert.equal(curveShift(geo, -1, 450, 100, 300), 800 - R - 300);
  // right widget spanning 1300..1500: left edge should land on cx + R
  assert.equal(curveShift(geo, 1, 450, 1300, 1500), 800 + R - 1300);
});

test('shift: far above the globe the bend is clamped, not NaN', () => {
  const v = curveShift(geo, -1, -2000, 100, 300);
  assert.ok(Number.isFinite(v));
  assert.equal(v, 800 - R * .45 - 300);
});
