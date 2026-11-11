# SCP Wallpaper

An animated, interactive wallpaper for the [iNiR](https://github.com/snowarch/iNiR) niri shell: 25 procedural scenes
(minimal art, HUD/"Jarvis" scenes, a WebGL nebula, a live audio equalizer, and ten SCP Foundation scenes: emblem,
containment breach, CCTV, containment cell, redacted file, biomonitor, reality anchor, site map, SCiPNET terminal, rift) plus a dashboard of widgets (clock,
system stats, Claude usage, calendar, pomodoro, todo, countdown, now playing, niri workspaces, SCP Center state, a live reactor gauge) that you can drag, resize and save
as layouts, each with its own refresh rate (menu › Widżety, or `scp-wallpaper rate ID MS`). Seven widget skins,
four of them Foundation-themed (dossier, SCiPNET, breach, O5 Council). It is one web page (TypeScript, bundled to a single script) shown by iNiR's web-wallpaper backend on every
monitor, plus one small background service.

```
iNiR shell ──starts──▶ WebWallpaperHost.qml (one per monitor, QtWebEngine)
                              │ loads file://…/wallpaper/index.html?screen=DP-3
                              ▼
        scenes ◀── page ──▶ widgets          polls JSON files (XHR on file://)
                              ▲
   scp-wallpaperd ─▶ ~/.cache/scp-center/{sysstats,audio,nowplaying}.json   live data
                  ─▶ ~/.cache/scp-center/control.json   pause per screen (niri: covered?), CLI commands
   usage-saver    ─▶ ~/.cache/scp-center/claude-usage.json ─▶ scp-wallpaperd (desk) ─▶ desk.json
```

## Quick start

```bash
./install.sh              # npm ci + build, links commands, installs scp-wallpaperd, points iNiR at the page, patches iNiR
scp-wallpaper reload      # build, restart the shell so it loads the page
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

A monitor whose wallpaper is covered by a maximized or fullscreen window stops animating (about 2% CPU instead of
25%); the overview or a smaller window brings it back.

## Everyday commands

```
scp-wallpaper status        service, iNiR config, data freshness, hosts per output, patch state
scp-wallpaper reload        build + restart the shell (after changing iNiR or the patches)
scp-wallpaper refresh       reload the pages in place (after a build)
scp-wallpaper dev           rebuild on every change in src/ and refresh the pages automatically
scp-wallpaper scenes        list scenes (index, id) and widgets
scp-wallpaper scene radar   switch scene; also next|prev|reseed|dash|layout N|widget ID on|off|auto MIN, --screen DP-3
scp-wallpaper preview 14    render scene 14 offscreen to /tmp/scp-wallpaper-14.png
scp-wallpaper check         types, unit tests, bundle, Python selftests, shader, smoke test of every scene and widget
scp-wallpaper patch         re-apply the iNiR patch (after ./setup update)
```

## Repository layout

```
src/                  the page, TypeScript ES modules (see docs/ARCHITECTURE.md)
  main.ts               boot
  core/                 config (paths), util, canvas helpers, Source, xhr
  data/                 sources (live data), control (daemon channel), world + sites (globe data)
  scenes/NN-*.ts        one file per scene, listed in scenes/index.ts
  widgets/NN-*.ts       one file per widget, listed in widgets/index.ts
  app/                  state + migration, stage (mount/switch/loop/pause), dashboard, curve, menu, commands
wallpaper/            what iNiR loads: index.html, css/, dist/app.js (built, gitignored)
test/                 node unit tests (state migration, curve maths)
helpers/              scp-wallpaperd + the three producers it runs (each also runs standalone)
systemd/              scp-wallpaperd.service
patches/              local patch to iNiR + apply.sh           (see patches/README.md)
tools/                build.mjs, check.sh, preview.sh, smoke.js, qml harnesses, gen-world.py
bin/scp-wallpaper     the command above
install.sh            idempotent installer / --uninstall
docs/                 ARCHITECTURE, EXTENDING, STATE, TROUBLESHOOTING
archive/              earlier single-file versions, for reference only
```

## Requirements

Qt 6 with QtWebEngine and LayerShellQt (what iNiR's web wallpaper needs), `python3` + `numpy` and `parec` (PipeWire/Pulse)
for the audio equalizer, `playerctl` for now-playing, `systemd --user`, `node` + `npm` to build. Optional:
`glslangValidator` for `scp-wallpaper check`.

More: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · [docs/EXTENDING.md](docs/EXTENDING.md) ·
[docs/STATE.md](docs/STATE.md) · [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) · [patches/README.md](patches/README.md)
