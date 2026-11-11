// Small pure helpers: DOM lookup, seeded random, value noise, SVG shell.
import { W, H } from './config.ts';

export const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

export function rng(seed: number){ // mulberry32
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export type Rng = ReturnType<typeof rng>;
export function hash1(i: number, s: number){ let h = (i * 374761393 + s * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
export function vnoise(x: number, s: number){ const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash1(i, s) * (1 - u) + hash1(i + 1, s) * u; }
export function fbm1(x: number, s: number){ return vnoise(x, s) * .55 + vnoise(x * 2.1, s + 7) * .3 + vnoise(x * 4.3, s + 13) * .15; }
export const f1 = (n: number) => n.toFixed(1);

export function ridge(base: number, amp: number, freq: number, seed: number, fill: string, extra = ''){
  let d = `M-20 ${H + 20}`;
  for (let x = -20; x <= W + 20; x += 16) d += ` L${x} ${f1(base - amp * fbm1(x * freq, seed))}`;
  return `<path d="${d} L${W + 20} ${H + 20} Z" fill="${fill}" ${extra}/>`;
}
export const svg = (inner: string) => `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
