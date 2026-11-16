# Extending

Work loop: `scp-wallpaper dev` in one terminal (rebuilds and refreshes the pages on every save), then
`scp-wallpaper check` before committing.

## Add a scene

1. Create `src/scenes/NN-name.ts` and add it to the list in `src/scenes/index.ts` (list order = menu order).
2. `scp-wallpaper preview <index>` to look at it offscreen.

```ts
// Name: one-line description            (first line is what `scp-wallpaper scenes` prints)
import { W, H } from '../core/config.ts';
import { rng, f1, svg } from '../core/util.ts';
import type { Scene } from './types.ts';

export default {
  id: 'name',                                   // stable key in saved state and the CLI: never rename
  pack: 'tech',                                 // bundle it is grouped under: a key of PACKS in scenes/index.ts
  name: 'Nazwa', swatch: 'linear-gradient(#123,#456)',   // menu label + thumbnail (any CSS background)
  accent: '#4fe3ff',                            // optional: sets --accent (widget highlights)
  mount({ el, seed }){
    const r = rng(seed);                        // seeded random: same seed = same picture
    el.innerHTML = svg(`<rect width="${W}" height="${H}" fill="#101418"/>
                        <circle class="c" cx="${f1(200 + r() * 1200)}" cy="450" r="120" fill="#fff"/>`);
    const c = el.querySelector('.c')!;
    return {
      tick(t, dt){ /* optional: 30 fps while visible and not covered; omit for static scenes */ },
      destroy(){ /* optional: unsubscribe, free GL contexts */ },
    };
  },
} satisfies Scene;
```

Prefer a static or CSS-animated SVG (costs nothing per frame; CSS animations freeze with the pause). If something must
move every frame, draw on a canvas instead of rewriting SVG attributes:

```ts
el.innerHTML = '<canvas id="cv"></canvas>';
const cv = cvInit(el, .8);          // .8 = render at 80% resolution (the page runs once per monitor)
cvSlice(cv);                        // optional: draw in the 1600×900 SVG space instead of screen pixels
return { soft: cv.soft, tick(t){ cv.g.fillRect(...) } };
```

SCP scenes share `src/scenes/scp.ts` (pre-rendered `layer()`, the `emblem()`, in-world text). Draw static parts once into a layer and blit it each frame; never animate box-shadow/filter in CSS (a repaint every frame).

Return `soft: cv.soft` from canvas scenes: the VRAM guard remounts a scene whose canvas mode no longer matches.
For audio, `audio.on(cb, periodMs)` from `data/sources.ts` (and return its unsubscribe as `destroy`).

Optional scene fields: `hud: true` (HUD widget skin), `curved: true` (widgets bend along `run.geo = {cx, cy, Rc}`,
see `15-dashboard.ts`), `preset: { on: [...ids], layout: { id: { x, y, s } } }` (the scene's own widget layout, created
on first visit; `x`,`y` fractions of the viewport, `s` scale).

## Add a widget

1. Create `src/widgets/NN-name.ts`, add it to `src/widgets/index.ts`.
2. Style it in `wallpaper/css/widgets.css` (sizes in `em`; the box has `font-size: 1.7vh`).

```ts
// Name: one-line description
import { sys } from '../data/sources.ts';
import type { Widget } from './types.ts';

export default { id: 'name', name: 'Nazwa w menu', x: .5, y: .1, on: false, cls: 'namew',
  every: 60000,                       // update period in ms (optional)
  sources: [sys],                     // also update when these change (optional)
  html: () => '<div class="v">-</div>',
  init(el){ /* optional: bind events once */ },
  update(el, now){ el.querySelector('.v')!.textContent = sys.value ? sys.value.cpu + '%' : '–'; },
} satisfies Widget;
```

Rules: update only what changed (text, a width) instead of replacing `innerHTML`, or use `patchHtml`; use the slowest
`every` that looks right — every CSS transition you trigger repaints at 60 fps for its duration; persist anything
user-editable in `state` (add it to `app/model.ts` and `defaults()` in `app/migrate.ts`) and call `save()`.

## Add a data source

1. A producer writes `~/.cache/scp-center/<name>.json` atomically (temp file + `os.replace`); see `helpers/scp-sysstats`.
   Add it to `PRODUCERS` in `helpers/scp-wallpaperd` so the daemon runs it.
2. Add the URL to `PATHS` (`core/config.ts`), a typed `Source` and a `poll(...)` line in `data/sources.ts`.

## Add a CLI command

Add the name to `COMMANDS` in `helpers/scp-wallpaperd`, a `case` in `src/app/commands.ts`, and the name to the
`scene|next|...` line and the help in `bin/scp-wallpaper`.

## Saved state changes

Bump nothing for additive fields: `migrate()` fills missing keys from `defaults()`. Renaming or reshaping a field needs
a migration step in `app/migrate.ts` and a case in `test/migrate.test.ts`.

## Conventions

* Comments say *why*; keep scene/widget files self-contained.
* Polish for user-visible text (it is the UI language), English for code and docs.
