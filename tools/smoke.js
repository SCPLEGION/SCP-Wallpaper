// Evaluated inside the loaded page by check.sh. Mounts every scene, ticks it, updates every widget; returns a summary.
(function () {
  const errs = [];
  const guard = (label, fn) => { try { fn(); } catch (e) { errs.push(label + ': ' + e.message); } };
  const d = new Date();
  SCENES.forEach((s, i) => guard('scene ' + (i + 1) + ' ' + s.name, () => { show(i, 12345); if (s.tick){ s.tick(1, .033); s.tick(1.04, .033); } }));
  WIDGETS.forEach(w => guard('widget ' + w.id, () => { if (!w.el) throw new Error('not mounted'); if (w.update) w.update(d, w.el); }));
  guard('menu', () => { if (document.querySelectorAll('.scene').length !== SCENES.length) throw new Error('scene buttons != scenes'); });
  guard('menu', () => { if (document.querySelectorAll('#wlist [data-w]').length !== WIDGETS.length) throw new Error('widget toggles != widgets'); });
  return errs.length ? 'FAIL ' + errs.join(' | ') : 'OK ' + SCENES.length + ' scenes, ' + WIDGETS.length + ' widgets';
})()
