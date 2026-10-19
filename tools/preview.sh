#!/usr/bin/env bash
# Render a scene to a PNG without touching the desktop (offscreen software rendering).
#   tools/preview.sh <scene-index> [out.png] [extra hash params, e.g. "dash=1&seed=7"]
# Scene indices are 0-based, in menu order (`scp-wallpaper scenes`). Note: the WebGL scene (Nebula) renders
# black here because offscreen has no GPU; use a real window for it.
set -eu
ROOT=$(cd "$(dirname "$(readlink -f "$0")")/.." && pwd)
scene=${1:?usage: preview.sh <scene-index> [out.png] [hash-params]}
out=${2:-/tmp/scp-wallpaper-$scene.png}
extra=${3:-dash=1}
QT_QPA_PLATFORM=offscreen QTWEBENGINE_CHROMIUM_FLAGS="--disable-gpu" \
  qml6 "$ROOT/tools/qml/shot.qml" -- "file://$ROOT/wallpaper/index.html#scene=$scene&seed=${SEED:-12345}&$extra" "$out" >/dev/null 2>&1
echo "$out"
