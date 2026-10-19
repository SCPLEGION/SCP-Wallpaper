// Animation loop (30 fps) and boot sequence.
'use strict';

/* ---------------- main loop (30 fps, only scenes that animate) ---------------- */
let last = 0, tPrev = 0, nCurve = 0;
function frame(now){
  requestAnimationFrame(frame);
  if (now - last < 1000 / 30 - 1) return;
  const t = now / 1000, dt = Math.min(.2, t - tPrev); tPrev = t; last = now;
  if (cur && cur.tick && !busy) cur.tick(t, dt);
  if (cur && cur.curved && ++nCurve % 2 === 0) curveWidgets();
}

initDash();
show(state.scene);
armAuto();
requestAnimationFrame(frame);
