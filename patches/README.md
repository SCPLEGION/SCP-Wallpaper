# Local patches to iNiR

iNiR's web-wallpaper backend does not support this project out of the box. These patches fix that. They are kept
here (not in the iNiR checkout) so they survive `./setup update` and can be re-applied in one command:

    patches/apply.sh            # or: scp-wallpaper patch

| Patch | File | Why |
|---|---|---|
| `0002` | `modules/shared/background/WebWallpaperHost.qml` | (a) A persistent per-screen `WebEngineProfile` (`inir-web-wallpaper-<screen>`). The default profile is off-the-record, so `localStorage` (scene, layouts, todo...) was lost on every restart. (b) Appends `?screen=<output>` to the page URL, so the page knows which monitor it is on (per-screen commands, occlusion pause). |
| `0003` | `modules/lock/Lock.qml`, `modules/common/Config.qml` | Optional, unrelated to wallpapers: `lock.onlyOnScreen` shows the lock surface on one output only. Apply with `--with-lock`. |

`0001` (runner probe, host start race) and the per-screen placement that used to be part of 0002 are upstream since
iNiR 1b847319 (snowarch/iNiR#310); both were dropped here.

Applying the patch to the runtime copy makes quickshell hot-reload, which leaks the old wallpaper hosts: run
`scp-wallpaper reload` afterwards.

## When `apply.sh` reports CONFLICT

Upstream changed the same lines. Open the patch, find the hunk in the new file, redo the change by hand in both the
checkout (`~/Dokumenty/Packets/inir`) and the runtime copy (`~/.config/quickshell/inir`), then regenerate the patch:

    cd ~/Dokumenty/Packets/inir && git diff -- modules/shared/background/WebWallpaperHost.qml > <project>/patches/inir/0002-...patch

## Regenerating all patches after editing the iNiR checkout

    cd ~/Dokumenty/Packets/inir
    git diff -- modules/shared/background/WebWallpaperHost.qml > <project>/patches/inir/0002-web-wallpaper-host-profile-and-screen.patch
    git diff -- modules/lock/Lock.qml modules/common/Config.qml > <project>/patches/inir/0003-lock-only-on-screen.patch
