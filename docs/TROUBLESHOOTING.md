# Troubleshooting

Start with `scp-wallpaper status` and `scp-wallpaper check`.

| Symptom | Cause / fix |
|---|---|
| Wallpaper is plain grey after a restart | The host did not start, or `wallpaper/dist/app.js` is missing (`scp-wallpaper build`). Settings → Background stuck on "Checking interactive web wallpaper support…" means the runner probe failed: something in `~/.bashrc` prints to stdout (`bash -c 'echo x'` must print only `x`). |
| Animation stutters, high CPU, status shows 2 hosts per output | A QML hot reload of iNiR (editing its files, applying the patch) leaves the old hosts running, orphaned. `scp-wallpaper reload` kills them all and restarts the shell. |
| Scene/layout/todo forgotten on restart | Patch 0002 (persistent profile) is missing (`scp-wallpaper patch` after an iNiR update), or the profile dir was deleted. |
| `scene`/`dash`/... commands do nothing | `scp-wallpaperd` is down (`systemctl --user status scp-wallpaperd`), or the page lacks `?screen=` (patch 0002) and you used `--screen`. Commands sent before a page loaded are not replayed. |
| Wallpaper frozen although nothing covers it | The active window on that output's workspace covers ≥ 92% of it (a maximized column with gaps counts). Shrink it or open the overview. Floating windows never pause. |
| Nothing happens on click | Interactive mode is off (Settings → Background). |
| Claude widget is dim / empty | `claude-usage.json` is only refreshed while a Claude Code session is running (claude-hud writes it). Dims after 15 min. Check `display.externalUsageWritePath` in `~/.claude/plugins/claude-hud/config.json`. |
| System widget says "brak danych" | `systemctl --user status scp-wallpaperd`; `scp-wallpaper logs` (a producer that crashes is restarted after 5 s and logged). |
| Equalizer is flat | Nothing is playing, or the daemon is down. It follows the default sink; switching output devices is picked up within ~5 s. |
| Equalizer shows "brak sygnału audio" | `audio.json` is older than 1.5 s: the service is not running. |
| Nebula is black in `preview` | Expected: offscreen rendering has no GPU. It is fine in the real wallpaper. |
| `scp-wallpaper patch` says CONFLICT | Upstream changed those lines; see `patches/README.md`. |

## Gotchas when working on this

* `pkill -f <pattern>` kills your own shell if the pattern is also in your command line (exit 144). Use `pkill -x` or the `[x]` trick.
* `ls` may be aliased to `eza` (breaks scripts); use `command ls`.
* Plain `inir` only prints help; the shell process is `inir-shell`, restarted with `inir restart`.
* Page-only changes need no shell restart: `scp-wallpaper refresh` (or `dev`). iNiR/patch changes need `reload`.
