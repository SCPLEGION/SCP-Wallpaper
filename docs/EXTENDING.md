# Extending

Always finish with `scp-wallpaper check` and `scp-wallpaper reload`.

## Add a scene

1. Create `wallpaper/js/scenes/NN-name.js` (next free number; the number only has to sort correctly).
2. Add `<script src="js/scenes/NN-name.js"></script>` to `index.html` **after the last scene**, before `js/app/state.js`.
3. `scp-wallpaper preview <index>` to look at it.

An SVG scene (cheap, static or CSS-animated):

```js
// Scene 16: Name: one-line description
'use strict';

SCENES.push({
  name: 'Name', swatch: 'linear-gradient(#123,#456)',      // swatch = menu thumbnail (any CSS background)
  accent: '#4fe3ff',                                        // optional: sets --accent (dashboard highlights)
  mount(seed){                                              // return an HTML string for #stage
    const r = rng(seed);                                    // seeded random: same seed = same picture
    return svg(`<rect width="${W}" height="${H}" fill="#101418"/>
                <circle cx="${f1(200 + r() * 1200)}" cy="450" r="120" fill="#fff"/>`);
  },
  after(){ /* optional: grab DOM nodes you will animate */ },
  tick(t, dt){ /* optional, called at 30 fps with seconds + delta; omit for static scenes */ },
  unmount(){ /* optional: stop timers / free GL contexts */ },
});
```

A canvas scene returns `'<canvas id="cv"></canvas>'` from `mount`, calls `cvInit(this, scale)` in `after()` (sets `this.g`,
`this.w`, `this.h`) and draws in `tick`. Use `scale < 1` to render below native resolution; the page runs once per monitor.

Optional scene fields:

* `hud: true`: turns on the HUD widget skin (corner brackets, mono labels) while the scene is shown.
* `preset: { on: ['reactor', ...], layout: { reactor: { x, y, s } } }`: gives the scene its own widget layout, created on
  first visit (see `scenes/15-dashboard.js`). `x`,`y` are fractions of the viewport, `s` is the scale.

## Add a widget

1. Create `wallpaper/js/widgets/NN-name.js`; load it in `index.html` after the other widgets, before `js/app/dashboard.js`.
2. Style it in `css/widgets.css` (sizes in `em`; the box has `font-size: 1.7vh`, so it scales with the screen).

```js
// Widget: name
'use strict';

WIDGETS.push({ id: 'name', name: 'Nazwa w menu', x: .5, y: .1, on: false, cls: 'namew',  // x,y: default position, on: default visibility
  html: () => '<div class="v">-</div>',          // markup of the content element (.wc)
  init(el){ /* optional: bind events once; `this` is the widget */ },
  update(now, el){ el.querySelector('.v').textContent = now.toLocaleTimeString(); },   // runs every second while visible
});
```

Rules: put widget-only helpers in the widget's own file (or `widgets/helpers.js` if shared); read live data from the globals in
`data/sources.js`; persist anything user-editable in `state` and call `save()`; never replace the *outer* box (`.w`), only `el`.
To show it in a scene preset, add its id to that scene's `preset.on`.

## Add a data source

1. A producer writes `~/.cache/scp-center/<name>.json` (atomically: write a temp file, `os.replace`). See `helpers/scp-sysstats`.
2. Add the URL to `PATHS` in `core/config.js`, a variable and `load…()` in `data/sources.js`, and a timer in `initDash()` (`app/dashboard.js`).
3. If it should run as a service, add `systemd/<name>.service` and the link lines to `install.sh`.

## Conventions

* Comments say *why*; keep scene/widget files short and self-contained.
* No globals beyond what the load-order table lists, except a scene's/widget's own helper constants at the top of its file.
* Polish for user-visible text (it is the UI language), English for code and docs.
