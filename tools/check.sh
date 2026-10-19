#!/usr/bin/env bash
# Static + smoke checks. Run before committing:  tools/check.sh   (or: scp-wallpaper check)
set -u
ROOT=$(cd "$(dirname "$(readlink -f "$0")")/.." && pwd)
W=$ROOT/wallpaper; fail=0
ok()  { printf '  \033[32mok\033[0m   %s\n' "$1"; }
bad() { printf '  \033[31mFAIL\033[0m %s\n' "$1"; fail=1; }

echo "JavaScript syntax"
for f in $(find "$W/js" -name '*.js' | sort); do node --check "$f" 2>/tmp/scp-wp-check.err && : || { bad "${f#$ROOT/}: $(head -1 /tmp/scp-wp-check.err)"; }; done
[ $fail = 0 ] && ok "$(find "$W/js" -name '*.js' | wc -l) files parse"

echo "index.html <-> files on disk"
listed=$(grep -o 'src="[^"]*"' "$W/index.html" | sed 's/src="//; s/"$//' | sort)
for s in $listed; do [ -f "$W/$s" ] || bad "listed but missing: $s"; done
for f in $(cd "$W" && find js -name '*.js' | sort); do echo "$listed" | grep -qx "$f" || bad "not loaded by index.html: $f"; done
css=$(grep -o 'href="[^"]*"' "$W/index.html" | sed 's/href="//; s/"$//'); for s in $css; do [ -f "$W/$s" ] || bad "missing stylesheet: $s"; done
[ $fail = 0 ] && ok "all scripts/styles referenced exist and every js file is loaded"

echo "Python helpers"
for f in "$ROOT"/helpers/*; do python3 -I -m py_compile "$f" 2>/dev/null && ok "$(basename "$f") compiles" || bad "$(basename "$f") does not compile"; rm -rf "$ROOT/helpers/__pycache__"; done
python3 -I "$ROOT/helpers/scp-audioviz" --selftest >/dev/null 2>&1 && ok "scp-audioviz --selftest" || bad "scp-audioviz --selftest"

echo "Shader"
if command -v glslangValidator >/dev/null; then
  node -e "const s=require('fs').readFileSync('$W/js/scenes/07-nebula.js','utf8');const m=s.match(/NEBULA_FRAG = \`([\s\S]*?)\`;/);require('fs').writeFileSync('/tmp/scp-wp-neb.frag','#version 100\n'+m[1])" \
    && glslangValidator -S frag /tmp/scp-wp-neb.frag >/dev/null 2>&1 && ok "nebula fragment shader validates" || bad "nebula fragment shader"
else echo "  (glslangValidator not installed, skipped)"; fi

echo "Page smoke test (every scene + widget, offscreen)"
if command -v qml6 >/dev/null; then
  out=$(QT_QPA_PLATFORM=offscreen QTWEBENGINE_CHROMIUM_FLAGS="--disable-gpu" QT_FORCE_STDERR_LOGGING=1 timeout 60 \
        qml6 "$ROOT/tools/qml/eval.qml" -- "file://$W/index.html#dash=1" "$(cat "$ROOT/tools/smoke.js")" 2>&1)
  res=$(echo "$out" | grep -a "RESULT" | head -1); jserr=$(echo "$out" | grep -a "^js:" | head -3)
  case $res in *"RESULT OK"*) ok "${res#*RESULT }";; *) bad "${res:-no result (did the page load?)}";; esac
  [ -n "$jserr" ] && bad "page logged errors: $jserr"
else echo "  (qml6 not found, skipped)"; fi

echo "iNiR patches"
"$ROOT/patches/apply.sh" --check | sed 's/^/  /' | grep -E "CONFLICT|pending" && fail=1 || ok "applied (or nothing to do)"

[ $fail = 0 ] && echo "All good." || { echo "Problems found."; exit 1; }
