# State and data formats

## Page state

Stored in the web profile's `localStorage` under the key `scp-wallpaper` (JSON, `v: 2`). The iNiR host uses a persistent
profile per screen (`~/.local/share/QtProject/Qml Runtime/QtWebEngine/inir-web-wallpaper-<screen>`), so **each monitor
keeps its own state**. (The profile is persistent only thanks to patch 0002; stock iNiR loses it on every restart.)

Types: `src/app/model.ts`. On load, `migrate()` (`src/app/migrate.ts`) turns whatever is stored into a valid state; the
old `minwall` key (v1: scene as a menu index, per-scene keys by Polish name) is read once and converted.

| Key | Meaning |
|---|---|
| `v` | schema version (2) |
| `scene`, `seed` | current scene id and its random seed |
| `dash` | dashboard visible |
| `auto` | auto-rotate minutes (0 = off) |
| `layout` | global widget layout `{ id: { x, y, s } }` (fractions of viewport, scale) |
| `widgets` | global visibility `{ id: bool }` |
| `sc`, `scSeen` | per-scene overrides `{ sceneId: { layout, widgets } }` and "preset already applied" flags |
| `slots`, `slot` | three saved layouts (layout + widgets + dscale + wbg + h24 + secs) and the last used one |
| `h24`, `secs` | clock options |
| `dscale`, `wbg` | widget size % (60–160) and background (`none`/`scrim`/`glass`) |
| `tab` | menu tab (`p1`/`p2`) |
| `todo`, `pomo`, `cd` | todo items, pomodoro timer, countdown target |

To reset one monitor: stop the shell, delete its `inir-web-wallpaper-<screen>` directory, start the shell.

## URL hash parameters (for previews and tests)

`#scene=N|id&seed=S&dash=0|1&menu=1&tab=p2&edit=1&cv=cpu|gpu`. `tools/preview.sh` builds these for you.
The query string carries `?screen=<output>` (added by patch 0002).

## JSON files written by the helpers

`~/.cache/scp-center/sysstats.json`
```json
{"t": 1792435703561, "cpu": 6.6, "cpu_temp": 50.0, "mem_used": 11494400000, "mem_total": 33501859840,
 "gpu": 6, "gpu_temp": 51.0, "vram_used": 2624270336, "vram_total": 8573157376, "load": [2.5, 2.5, 2.6],
 "uptime": 21704.2, "net": {"iface": "enp5s0", "rx": 4717.5, "tx": 3992.5},
 "disks": [{"mount": "/", "used": 312989364224, "total": 336286711808}]}
```
`audio.json`: `{"t": <ms>, "b": [72 floats 0..1]}`, bands log-spaced 40 Hz–16 kHz. The page treats data older than 1.5 s as "no signal".

`nowplaying.json`: `{"t", "status": "playing"|"paused"|"none", "player", "title", "artist", "album", "art", "length", "position"}` (seconds).

`control.json` (scp-wallpaperd): `{"t": <ms>, "pause": {"DP-3": true, ...}, "cmds": [{"seq", "screen": null|"DP-3", "cmd", "arg"}]}`.
The last 32 commands are kept; a page runs only those with a `seq` above the highest it saw on its first read.

`claude-usage.json` (claude-hud): `{"updated_at": ISO, "five_hour": {"used_percentage", "resets_at"}, "seven_day": {…}}`.
