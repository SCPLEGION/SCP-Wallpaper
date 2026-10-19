# SCP Wallpaper

An animated, interactive wallpaper for the [iNiR](https://github.com/snowarch/iNiR) niri shell: 15 procedural scenes
(minimal SVG art, HUD/"Jarvis" scenes, a WebGL nebula, a live audio equalizer) plus a dashboard of widgets (clock,
system stats, Claude usage, calendar, pomodoro, todo, countdown, a live reactor gauge) that you can drag, resize and save
as layouts. It is one static web page shown by iNiR's web-wallpaper backend on every monitor, no server involved.

```
iNiR shell ──starts──▶ WebWallpaperHost.qml (one per monitor, QtWebEngine)
                              │ loads file://…/wallpaper/index.html
                              ▼
        scenes ◀── page ──▶ widgets          reads (XHR on file://)
                              ▲
   scp-sysstats  ─▶ ~/.cache/scp-center/sysstats.json
   scp-audioviz  ─▶ ~/.cache/scp-center/audio.json
   claude-hud    ─▶ ~/.cache/scp-center/claude-usage.json
```

## Quick start

```bash
./install.sh              # links commands, installs the two helper services, points iNiR at the page, patches iNiR
scp-wallpaper reload      # restart the shell so it loads the page
scp-wallpaper status      # what is running and what iNiR is showing
```

Clicking the wallpaper only works in iNiR's *interactive* web mode (Settings → Background → "Interactive mode");
iNiR's own desktop widgets are not clickable while it is on.

## Using it

| Input | Action |
|---|---|
| click on the wallpaper | next scene (PPM: previous) |
| `M` or the ⋯ button | menu (Tapeta / Dashboard tabs) |
| `D` | show/hide the dashboard |
| `E` | edit mode: drag widgets, drag the corner handle or use the wheel to resize, `Shift` = no snapping |
| `1` `2` `3` | load saved layout 1–3 (saved from the menu) |
| `Space` | another random variant of the current scene |
| `←` `→`, `Esc` | scenes, leave menu/edit mode |

Each scene can have its **own widget layout** (menu → Dashboard → "Własny układ tej sceny"); the *Dashboard* scene ships
with one. Every monitor keeps its own scene, layouts and todo list.

## Everyday commands

```
scp-wallpaper status        services, iNiR config, data freshness, layer surfaces, patch state
scp-wallpaper reload        restart the shell (needed after editing anything under wallpaper/)
scp-wallpaper scenes        list scenes and widgets (0-based scene index = menu order)
scp-wallpaper preview 14    render scene 14 offscreen to /tmp/scp-wallpaper-14.png
scp-wallpaper check         syntax + consistency + shader + smoke test of every scene and widget
scp-wallpaper patch         re-apply the iNiR patches (after ./setup update)
```

## Repository layout

```
wallpaper/            the page (static, no build step)
  index.html            markup + the ordered list of scripts
  css/                  base, widgets (incl. HUD skin), menu
  js/core/              config (paths), util, draw helpers, xhr
  js/scenes/NN-*.js     one file per scene          js/scenes/registry.js
  js/widgets/NN-*.js    one file per widget         js/widgets/registry.js, helpers.js
  js/data/sources.js    live data the widgets read
  js/app/               state, menu, dashboard engine, main loop
helpers/              scp-sysstats, scp-audioviz   (Python, write JSON under ~/.cache/scp-center)
systemd/              user units for the two helpers
patches/              local patches to iNiR + apply.sh           (see patches/README.md)
tools/                check.sh, preview.sh, smoke.js, qml harnesses
bin/scp-wallpaper     the command above
install.sh            idempotent installer / --uninstall
docs/                 ARCHITECTURE, EXTENDING, STATE, TROUBLESHOOTING
archive/              earlier single-file versions, for reference only
```

## Requirements

Qt 6 with QtWebEngine and LayerShellQt (what iNiR's web wallpaper needs), `python3` + `numpy` and `parec` (PipeWire/Pulse)
for the audio equalizer, `systemd --user`. Optional: `node` and `glslangValidator` for `scp-wallpaper check`.

More: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · [docs/EXTENDING.md](docs/EXTENDING.md) ·
[docs/STATE.md](docs/STATE.md) · [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) · [patches/README.md](patches/README.md)
