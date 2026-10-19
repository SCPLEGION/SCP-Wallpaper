# Local patches to iNiR

iNiR's web-wallpaper backend does not support this project out of the box. These patches fix that. They are kept
here (not in the iNiR checkout) so they survive `./setup update` and can be re-applied in one command:

    patches/apply.sh            # or: scp-wallpaper patch

| Patch | File | Why |
|---|---|---|
| `0001` | `services/WebWallpaper.qml` | The "is qml6 available" probe ran `bash -lc`; a login shell prints `~/.bashrc` output (fastfetch banner, terminal colour sequences) and the first line became the "runner path", so hosts never started. Also, `refresh()` bumped `revision` before `active` had re-evaluated, so every host read `active == false`; it is now deferred with `Qt.callLater`. |
| `0002` | `modules/background/WebWallpaperHost.qml` | (a) Each host places its window inside its own screen (`x/y/width/height` from `targetScreen`). Qt otherwise resets every layer surface to the first output, so the second monitor stayed empty. (b) A persistent per-screen `WebEngineProfile` (`inir-web-wallpaper-<screen>`). The default profile is off-the-record, so `localStorage` (scene, layouts, todo...) was lost on every restart. |
| `0003` | `modules/lock/Lock.qml`, `modules/common/Config.qml` | Optional, unrelated to wallpapers: `lock.onlyOnScreen` shows the lock surface on one output only. Apply with `--with-lock`. |

Upstream report for 0001 and the geometry part of 0002: <https://github.com/snowarch/iNiR/issues/310>.

## When `apply.sh` reports CONFLICT

Upstream changed the same lines. Open the patch, find the hunk in the new file, redo the change by hand in both the
checkout (`~/Dokumenty/Packets/inir`) and the runtime copy (`~/.config/quickshell/inir`), then regenerate the patch:

    cd ~/Dokumenty/Packets/inir && git diff -- services/WebWallpaper.qml > <project>/patches/inir/0001-...patch

## Regenerating all patches after editing the iNiR checkout

    cd ~/Dokumenty/Packets/inir
    git diff -- services/WebWallpaper.qml                     > <project>/patches/inir/0001-web-wallpaper-probe-and-host-start.patch
    git diff -- modules/background/WebWallpaperHost.qml       > <project>/patches/inir/0002-web-wallpaper-host-screen-and-profile.patch
    git diff -- modules/lock/Lock.qml modules/common/Config.qml > <project>/patches/inir/0003-lock-only-on-screen.patch
