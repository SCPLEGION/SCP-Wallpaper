# Troubleshooting

Start with `scp-wallpaper status` and `scp-wallpaper check`.

| Symptom | Cause / fix |
|---|---|
| Wallpaper is plain grey after a restart | The host did not start. `scp-wallpaper patch` (patches 0001/0002 missing after an iNiR update?) then `scp-wallpaper reload`. Settings → Background stuck on "Checking interactive web wallpaper support…" means the runner probe failed: something in `~/.bashrc` prints to stdout in non-interactive shells (the probe is patched to `bash -c`, but check anyway with `bash -lc 'echo x'`). |
| Only one monitor shows it | Patch 0002 (per-screen placement) is missing. `niri msg layers` must show one `inir:web-wallpaper` under every output. |
| Scene/layout/todo forgotten on restart | The persistent profile (patch 0002) is missing, or the profile dir was deleted. |
| Nothing happens on click | Interactive mode is off (Settings → Background). |
| Claude widget is dim / empty | `claude-usage.json` is only refreshed while a Claude Code session is running (claude-hud writes it). Dims after 15 min. Check `display.externalUsageWritePath` in `~/.claude/plugins/claude-hud/config.json`. |
| System widget says "brak danych" | `systemctl --user status scp-sysstats`; `scp-wallpaper logs`. |
| Equalizer is flat | Nothing is playing, or the service is down (`systemctl --user status scp-audioviz`). It follows the default sink; switching output devices is picked up within ~5 s. |
| Equalizer shows "brak sygnału audio" | `audio.json` is older than 1.5 s: the service is not running. |
| Nebula is black in `preview` | Expected: offscreen rendering has no GPU. It is fine in the real wallpaper. |
| `scp-wallpaper patch` says CONFLICT | Upstream changed those lines; see `patches/README.md`. |

## Gotchas when working on this

* `pkill -f <pattern>` kills your own shell if the pattern is also in your command line (exit 144). Use `pkill -x qs` or the `[x]` trick.
* `ls` may be aliased to `eza` (breaks scripts); use `command ls`.
* Plain `inir` only prints help; the shell is started with `inir run`.
* The hosts are children of the shell (`qs`): to reload the page, restart the shell (`scp-wallpaper reload`), not just the page.
