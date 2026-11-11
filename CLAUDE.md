# SCP Wallpaper

Git repo, branch `Main`, no remote. iNiR's `background.backend.web.source` (`~/.config/illogical-impulse/config.json`) points at `wallpaper/index.html`; `./install.sh` sets it (`--uninstall`). Read first: `README.md`, `docs/ARCHITECTURE.md`, `docs/EXTENDING.md`, `docs/STATE.md`, `docs/TROUBLESHOOTING.md`, `patches/README.md`.

## Layout
`wallpaper/` static page (css/, js/core|scenes|widgets|data|app; one file per scene `NN-name.js`/widget) · `helpers/` `scp-sysstats`, `scp-audioviz` (write JSON to `~/.cache/scp-center/`) · `patches/` iNiR patches + `apply.sh` · `tools/` `check.sh`, `preview.sh`, `smoke.js`, qml harnesses · `bin/scp-wallpaper`.

## Commands
`scp-wallpaper status|reload|scenes|preview N|check|patch|logs|install`. After editing `wallpaper/`: `check`, then `reload` (restarts shell: `pkill -x qs; inir run`; bare `inir` only prints help).

## Rules
- JS = classic scripts, one global scope (no ES modules on `file://`). New `js/**/*.js` must be listed in `index.html`; order matters and = menu order. `check` enforces it.
- Persistence needs local patch `patches/inir/0002` (per-screen persistent `WebEngineProfile`; also puts each host on its own screen, else both on DP-3). 0001 fixes qml6 probe (`.bashrc` output via `bash -lc`) + start race. After `./setup update` in `~/Dokumenty/Packets/inir` run `scp-wallpaper patch`; conflicts → `patches/README.md`. Upstream: snowarch/iNiR#310.
- Data comes from producers: `sysstats.json` (scp-sysstats.service), `audio.json` (scp-audioviz.service, sink monitor only, never mic), `claude-usage.json` (claude-hud `display.externalUsageWritePath`, only while a Claude session runs). Per-monitor page state in `~/.local/share/QtProject/Qml Runtime/QtWebEngine/inir-web-wallpaper-<screen>`.
- Interactive web mode is on, so iNiR's own desktop widgets aren't clickable.

## Testing
`scp-wallpaper preview N` renders offscreen (Nebula/WebGL shows black). `tools/qml/eval.qml` evals JS in page (cross-process state tests need persistent profile). `~/.bashrc`'s iNiR block still `cat`s colour sequences unconditionally (why 0001 exists).
