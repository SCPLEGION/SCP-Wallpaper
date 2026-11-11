// The live page state: loaded once (with migration), mutated in place, saved on every change.
import { SCENES } from '../scenes/index.ts';
import { migrate } from './migrate.ts';
import { STATE_KEY, LEGACY_KEY, THEMES, type State } from './model.ts';

/** URL hash parameters, for previews and tests: #scene=N|id&seed=S&dash=0|1&menu=1&tab=p2&edit=1&cv=cpu|gpu */
export const params = new URLSearchParams(location.hash.slice(1));

const read = (k: string) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } };
export const state: State = migrate(read(STATE_KEY) ?? read(LEGACY_KEY), SCENES);
export const save = () => { try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (e) {} };

if (params.has('scene')){ const v = params.get('scene')!, i = +v; state.scene = SCENES[/^\d+$/.test(v) ? i % SCENES.length : -1]?.id ?? (SCENES.some(s => s.id === v) ? v : state.scene); }
if (params.has('seed')) state.seed = +params.get('seed')!;   // deterministic previews/tests
if (params.has('dash')) state.dash = params.get('dash') === '1';
if (params.has('theme')) state.theme = (THEMES as string[]).includes(params.get('theme')!) ? params.get('theme') as State['theme'] : state.theme;
if (params.has('tab')) state.tab = params.get('tab') === 'p2' ? 'p2' : 'p1';
