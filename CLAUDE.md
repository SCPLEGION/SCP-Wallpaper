# SCP Wallpaper

Git repo, branch `Main`, no remote. iNiR's `background.backend.web.source` (`~/.config/illogical-impulse/config.json`) points at `wallpaper/index.html`; `./install.sh` sets it (`--uninstall`). Read first: `README.md`, `docs/ARCHITECTURE.md`, `docs/EXTENDING.md`, `docs/STATE.md`, `docs/TROUBLESHOOTING.md`, `patches/README.md`.

## Layout
`src/` TypeScript page (core/ data/ scenes/NN-*.ts widgets/NN-*.ts app/; lists in `scenes/index.ts`, `widgets/index.ts`) → esbuild → `wallpaper/dist/app.js` (gitignored) · `wallpaper/` index.html + css/ · `test/` node unit tests · `helpers/scp-wallpaperd` (runs `scp-sysstats`, `scp-audioviz`, `scp-nowplaying` as threads, niri occlusion, CLI socket) · `patches/` iNiR patch + `apply.sh` · `tools/` build.mjs, check.sh, preview.sh, smoke.js, qml harnesses · `bin/scp-wallpaper`.

## Commands
`scp-wallpaper status|build|dev|refresh|reload|scenes|scene ID|next|dash|layout N|widget ID on|preview N|check|patch|logs|install`. Page edits: `dev` (rebuild + in-place refresh) or `build && refresh`. `reload` = build + kill all hosts + `inir restart` (shell process is `inir-shell`; bare `inir` prints help). Always `check` before committing.

## Rules
- Chromium blocks ES modules on `file://` and the host forbids remote URLs, so: one bundled classic script; data in/out only via JSON files in `~/.cache/scp-center/`. The page can't talk back to the daemon.
- Scenes/widgets have stable `id`s used in saved state + CLI: never rename. State is `localStorage['scp-wallpaper']` v2; shape changes need a step in `app/migrate.ts` + test.
- Patch `0002` (persistent per-screen profile + `?screen=`) is still needed; 0001 is upstream. After `./setup update` in `~/Dokumenty/Packets/inir`: `scp-wallpaper patch`, then `reload` (applying it hot-reloads quickshell, which leaks orphaned hosts; `status` shows hosts per output).
- Anything that changes every second must not trigger CSS transitions (60 fps repaint); paused pages request no frames.
- Data: `sysstats.json`, `audio.json` (sink monitor only, never mic), `nowplaying.json`, `control.json` from scp-wallpaperd; `claude-usage.json` from claude-hud (only while a Claude session runs).
- Interactive web mode is on, so iNiR's own desktop widgets aren't clickable.

## Testing
`scp-wallpaper preview N` renders offscreen (Nebula/WebGL shows black). `tools/qml/eval.qml -- <url> <js> [wait-ms]` evals JS in a page (`window.scp` exposes SCENES, WIDGETS, state, app, show, go). Measure CPU of `QtWebEngineProcess` + `WebWallpaperHost.qml` processes for perf changes.
