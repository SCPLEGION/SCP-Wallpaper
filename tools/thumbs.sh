#!/usr/bin/env bash
# Render a 480x270 thumbnail of every scene for SCP Center's scene picker.
#   tools/thumbs.sh [--force] [scene-id ...]
# Output: ~/.cache/scp-center/wallpaper-thumbs/<id>.png. A thumbnail newer than wallpaper/dist/app.js is kept
# unless --force. Uses preview.sh (offscreen, no dashboard), 4 at a time; Nebula (WebGL) comes out black.
set -eu
ROOT=$(cd "$(dirname "$(readlink -f "$0")")/.." && pwd)
OUT=${XDG_CACHE_HOME:-$HOME/.cache}/scp-center/wallpaper-thumbs
JOBS=${JOBS:-4}
force=0; [ "${1:-}" = --force ] && { force=1; shift; }
mkdir -p "$OUT"
[ -f "$ROOT/wallpaper/dist/app.js" ] || "$ROOT/bin/scp-wallpaper" build

render() {  # index id
  local tmp; tmp=$(mktemp --suffix=.png)
  "$ROOT/tools/preview.sh" "$1" "$tmp" "dash=0" >/dev/null
  if [ -s "$tmp" ]; then magick "$tmp" -resize 480x270 "$OUT/$2.png.part" && mv "$OUT/$2.png.part" "$OUT/$2.png" && echo "$2"
  else echo "$2: render failed" >&2; fi
  rm -f "$tmp"
}

i=0; running=0
for f in "$ROOT"/src/scenes/[0-9]*.ts; do
  id=$(grep -o "id: '[^']*'" "$f" | head -1 | cut -d"'" -f2)
  idx=$i; i=$((i+1))
  if [ $# -gt 0 ]; then case " $* " in *" $id "*) ;; *) continue ;; esac; fi
  if [ $force = 0 ] && [ "$OUT/$id.png" -nt "$ROOT/wallpaper/dist/app.js" ]; then continue; fi
  render "$idx" "$id" &
  running=$((running+1)); [ $running -ge "$JOBS" ] && { wait -n || true; running=$((running-1)); }
done
wait
