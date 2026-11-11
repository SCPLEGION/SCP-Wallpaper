# Architecture

## The constraint that shapes the page

iNiR loads the page from `file://` in a QtWebEngine window. Chromium refuses ES modules on `file://`, and the host
forbids `file://` pages from reaching any network URL (`localContentCanAccessRemoteUrls: false`). So:

* Sources are TypeScript ES modules in `src/`; `tools/build.mjs` (esbuild) bundles them into **one classic IIFE script**,
  `wallpaper/dist/app.js` (gitignored, built by `install`, `build`, `reload`, `dev`).
* All data reaches the page as **JSON files** under `~/.cache/scp-center/`, read with `file://` XHR
  (`localContentCanAccessFileUrls` is on). The page can read but never write anything outside its `localStorage`.

## Modules (`src/`)

| Path | Role |
|---|---|
| `main.ts` | boot: menu, dashboard, first scene, timers, sources, frame loop, control channel; exposes `window.scp` for tests |
| `core/config.ts` | `W`×`H` logical SVG canvas (1600×900), `PATHS` of the data files (home dir taken from the page URL) |
| `core/util.ts`, `core/draw.ts` | seeded `rng`, noise, `svg()`, `ridge()`; `cvInit()` (canvas sized to the viewport, GPU or CPU, see below), `cvSlice()` (1600×900 → canvas like SVG `slice`), `arcPath`, `hexs` |
| `core/source.ts` | `Source<T>`: a value plus subscribers; each subscriber says how often it needs a refresh |
| `data/sources.ts` | `sys`, `usage`, `np`, `audio` sources and the pollers. A poller runs at min(base period, fastest subscriber); `audio` has no base, so it is only read while the Equalizer or Dashboard scene is mounted |
| `data/control.ts` | polls `control.json` (1 s): this screen's pause flag, CLI commands newer than page load |
| `scenes/` | `types.ts` (contract), `NN-*.ts` one per scene, `index.ts` the ordered list (= menu order) |
| `widgets/` | `types.ts`, `helpers.ts` (formatting, `patchHtml`), `NN-*.ts`, `index.ts` |
| `app/model.ts`, `app/migrate.ts` | saved-state types; pure migration (v1 `minwall` → v2), unit-tested |
| `app/state.ts` | the live `state` (loaded + migrated once, mutated in place, `save()`), URL hash overrides |
| `app/stage.ts` | mount/switch scenes (`show`, `go`, `step`), scene-change and frame hooks, 30 fps loop, pause, VRAM guard |
| `app/dashboard.ts` | widget boxes, per-scene layouts, edit mode, saved slots, widget refresh scheduling |
| `app/curve.ts` | curved layout maths (unit-tested) and DOM pass |
| `app/menu.ts`, `app/commands.ts` | menu + keys + auto-rotate; what each CLI command does in the page |

## Runtime flow

1. `show(i)` destroys the running scene, calls `scene.mount({ el: #stage, seed })` and keeps the returned
   `SceneRun` (`tick`, `destroy`, `geo`, `soft`). Scene objects are never mutated; all per-mount state lives in that closure.
2. Scene-change hooks run: the dashboard applies the scene's skin (`hud`, `curved`), its own layout or preset.
3. The loop calls `run.tick(t, dt)` at 30 fps. While **paused** no animation frame is even requested, and CSS
   animations and transitions are frozen (`body.paused`).
4. Widgets update on their own period (`every`) and whenever a source they list in `sources` changes, only while visible.

### Pause

The page pauses when `document.hidden`, or when `control.json` says its screen is covered and the file is fresher than
30 s (a dead daemon cannot freeze the wallpaper). `scp-wallpaperd` decides "covered" from niri's event stream: the
active window of the output's active workspace is tiled (not floating) and covers ≥ 92% of the output's width and
height. The overview un-pauses everything.

### Canvas mode (VRAM guard)

Chromium's GPU canvas allocates a screen-sized MSAA buffer (~250 MiB at 1440p) once a curved path is drawn. When
`sysstats.json` reports VRAM above 75%, `stage.ts` remounts canvas scenes on a CPU canvas (`willReadFrequently`);
below 60% it switches back. `#cv=cpu|gpu` forces a mode for tests.

## Background service: `scp-wallpaperd`

One Python process (`helpers/scp-wallpaperd`, unit `scp-wallpaperd.service`):

| Thread | Writes | Notes |
|---|---|---|
| `scp-sysstats` | `sysstats.json` every 2 s | CPU/temps, RAM, GPU/VRAM, default-route NIC rates, mounts, load, uptime |
| `scp-audioviz` | `audio.json` ~30/s, 1/s in silence | `parec` on the default sink's *monitor* (never the mic), FFT, 72 log bands; nothing stored |
| `scp-nowplaying` | `nowplaying.json` every 1 s | best MPRIS player via `playerctl` |
| `niri` | `control.json` `pause` | event stream → covered outputs |
| socket | `control.json` `cmds` | `$XDG_RUNTIME_DIR/scp-wallpaperd.sock`, line-JSON requests from `scp-wallpaperd send …` |

The producers are the same files that run standalone (`helpers/scp-*`), loaded as modules; a crash restarts that
thread after 5 s. `claude-usage.json` comes from the claude-hud plugin, only while a Claude Code session runs.

## iNiR integration

iNiR (`services/WebWallpaper.qml`) starts one `modules/shared/background/WebWallpaperHost.qml` per screen when
`background.backend.provider == "web"`. Patch 0002 (see `patches/README.md`) gives each host a persistent profile and
passes `?screen=<output>`.
