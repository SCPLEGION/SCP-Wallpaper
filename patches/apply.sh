#!/usr/bin/env bash
# Apply (or verify) the local iNiR patches. Idempotent: a patch that is already in place is skipped.
#
#   patches/apply.sh              apply 0001 + 0002 to the iNiR checkout and the installed runtime copy
#   patches/apply.sh --check      only report what would happen
#   patches/apply.sh --with-lock  also include 0003 (lock.onlyOnScreen, unrelated to wallpapers)
#
# INIR_REPO / INIR_RUNTIME override the default locations.
set -u
HERE=$(cd "$(dirname "$(readlink -f "$0")")" && pwd)
REPO=${INIR_REPO:-$HOME/Dokumenty/Packets/inir}
RUNTIME=${INIR_RUNTIME:-$HOME/.config/quickshell/inir}
check=0; lock=0
for a in "$@"; do case $a in --check) check=1;; --with-lock) lock=1;; -h|--help) sed -n '2,9p' "$0"; exit 0;; esac; done

patches=("$HERE"/inir/0001-*.patch "$HERE"/inir/0002-*.patch)
[ $lock = 1 ] && patches+=("$HERE"/inir/0003-*.patch)
rc=0

apply_in() {  # dir patch
  local dir=$1 p=$2 name; name=$(basename "$p")
  if (cd "$dir" && patch -p1 -R --dry-run -s -f <"$p" >/dev/null 2>&1); then
    echo "  ok       $name (already applied)"
  elif (cd "$dir" && patch -p1 --dry-run -s -f <"$p" >/dev/null 2>&1); then
    if [ $check = 1 ]; then echo "  pending  $name"; rc=2
    else (cd "$dir" && patch -p1 -s <"$p") && echo "  applied  $name"; fi
  else
    echo "  CONFLICT $name (upstream changed this file; re-do the change by hand, see patches/README.md)"; rc=1
  fi
}

for dir in "$REPO" "$RUNTIME"; do
  if [ ! -d "$dir" ]; then echo "skip $dir (not found)"; continue; fi
  echo "$dir"
  for p in "${patches[@]}"; do apply_in "$dir" "$p"; done
done
[ $rc = 0 ] && [ $check = 0 ] && echo "Done. Reload the shell so it picks the patched files up:  scp-wallpaper reload"
exit $rc
