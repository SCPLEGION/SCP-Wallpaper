#!/usr/bin/env bash
# Install / upgrade the SCP wallpaper. Idempotent; installs nothing system-wide (only ~/.local/bin, ~/.config).
#
#   ./install.sh                 everything below
#   ./install.sh --no-services   skip the two systemd --user helper services
#   ./install.sh --no-inir       do not touch iNiR's config.json / do not patch iNiR
#   ./install.sh --no-claude-hud do not enable the Claude usage snapshot in the claude-hud plugin
#   ./install.sh --uninstall     remove links and services (data and iNiR config are left alone)
set -eu
ROOT=$(cd "$(dirname "$(readlink -f "$0")")" && pwd)
BIN=$HOME/.local/bin; UNITS=$HOME/.config/systemd/user; CACHE=$HOME/.cache/scp-center
INIR_CFG=$HOME/.config/illogical-impulse/config.json
HUD_CFG=$HOME/.claude/plugins/claude-hud/config.json
services=1; inir=1; hud=1; uninstall=0
for a in "$@"; do case $a in
  --no-services) services=0;; --no-inir) inir=0;; --no-claude-hud) hud=0;; --uninstall) uninstall=1;;
  -h|--help) sed -n '2,9p' "$0"; exit 0;; *) echo "unknown flag $a"; exit 2;; esac; done
say() { printf '\033[1m%s\033[0m\n' "$*"; }

if [ $uninstall = 1 ]; then
  say "Removing services and links"
  for u in scp-sysstats scp-audioviz scp-nowplaying; do systemctl --user disable --now $u.service 2>/dev/null || true; rm -f "$UNITS/$u.service"; done
  systemctl --user daemon-reload || true
  rm -f "$BIN/scp-sysstats" "$BIN/scp-audioviz" "$BIN/scp-nowplaying" "$BIN/scp-wallpaper"
  echo "Left in place: $CACHE, iNiR config, claude-hud config, iNiR patches."; exit 0
fi

say "Checking requirements"
miss=0
for c in python3 parec playerctl systemctl; do command -v $c >/dev/null || { echo "  missing: $c"; miss=1; }; done
python3 -I -c "import numpy" 2>/dev/null || { echo "  missing: python numpy (needed by scp-audioviz)"; miss=1; }
command -v qml6 >/dev/null || echo "  note: qml6 not found (iNiR's web wallpaper host needs Qt6 qml + QtWebEngine)"
[ $miss = 0 ] || { echo "Install the missing packages first."; exit 1; }

say "Linking commands into $BIN"
mkdir -p "$BIN" "$CACHE"
ln -sfn "$ROOT/helpers/scp-sysstats" "$BIN/scp-sysstats"
ln -sfn "$ROOT/helpers/scp-audioviz" "$BIN/scp-audioviz"
ln -sfn "$ROOT/helpers/scp-nowplaying" "$BIN/scp-nowplaying"
ln -sfn "$ROOT/bin/scp-wallpaper"    "$BIN/scp-wallpaper"
chmod +x "$ROOT"/helpers/* "$ROOT"/bin/* "$ROOT"/tools/*.sh "$ROOT"/patches/apply.sh

if [ $services = 1 ]; then
  say "Installing systemd --user services"
  mkdir -p "$UNITS"
  for u in scp-sysstats scp-audioviz scp-nowplaying; do ln -sfn "$ROOT/systemd/$u.service" "$UNITS/$u.service"; done
  systemctl --user daemon-reload
  systemctl --user enable --now scp-sysstats.service scp-audioviz.service scp-nowplaying.service
fi

if [ $inir = 1 ]; then
  say "Pointing iNiR at the project page"
  if [ -f "$INIR_CFG" ]; then
    cp -n "$INIR_CFG" "$INIR_CFG.bak-scp-wallpaper" || true
    python3 -I - "$INIR_CFG" "$ROOT/wallpaper/index.html" <<'PY'
import json, sys
p, src = sys.argv[1:3]
c = json.load(open(p))
b = c.setdefault("background", {}).setdefault("backend", {})
b["provider"] = "web"
b.setdefault("web", {})["source"] = src
json.dump(c, open(p, "w"), indent=4, ensure_ascii=False); open(p, "a").write("\n")
print("  provider=web, source=" + src)
PY
  else echo "  $INIR_CFG not found; start iNiR once, then re-run"; fi
  say "Applying local iNiR patches"
  "$ROOT/patches/apply.sh" || true
fi

if [ $hud = 1 ]; then
  say "Enabling the Claude usage snapshot (claude-hud)"
  if [ -f "$HUD_CFG" ]; then
    python3 -I - "$HUD_CFG" "$CACHE/claude-usage.json" <<'PY'
import json, sys
p, out = sys.argv[1:3]
c = json.load(open(p)); c.setdefault("display", {})["externalUsageWritePath"] = out
json.dump(c, open(p, "w"), indent=2); open(p, "a").write("\n")
print("  display.externalUsageWritePath=" + out)
PY
  else echo "  claude-hud config not found; skipped (the Claude widget will just stay empty)"; fi
fi

say "Done"
echo "Reload the shell to show it:   scp-wallpaper reload     (status: scp-wallpaper status)"
echo "Clicking the wallpaper needs iNiR Settings -> Background -> Interactive mode."
