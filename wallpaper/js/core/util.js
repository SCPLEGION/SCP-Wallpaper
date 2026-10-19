// Small pure helpers: DOM lookup, seeded random, value noise, SVG shell.
'use strict';

const $ = id => document.getElementById(id);
const stage = $('stage');

/* ---------------- helpers ---------------- */
function rng(seed){ // mulberry32
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function hash1(i, s){ let h = (i * 374761393 + s * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, s){ const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash1(i, s) * (1 - u) + hash1(i + 1, s) * u; }
function fbm1(x, s){ return vnoise(x, s) * .55 + vnoise(x * 2.1, s + 7) * .3 + vnoise(x * 4.3, s + 13) * .15; }
const f1 = n => n.toFixed(1);

function ridge(base, amp, freq, seed, fill, extra = ''){
  let d = `M-20 ${H + 20}`;
  for (let x = -20; x <= W + 20; x += 16) d += ` L${x} ${f1(base - amp * fbm1(x * freq, seed))}`;
  return `<path d="${d} L${W + 20} ${H + 20} Z" fill="${fill}" ${extra}/>`;
}
const svg = (inner, bg) => `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
