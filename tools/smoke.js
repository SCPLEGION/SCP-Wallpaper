// Evaluated inside the loaded page by check.sh. Mounts every scene, ticks it, updates every widget; returns a summary.
(function () {
  const { SCENES, WIDGETS, show, app } = window.scp, errs = [];
  const guard = (label, fn) => { try { fn(); } catch (e) { errs.push(label + ': ' + e.message); } };
  const d = new Date();
  SCENES.forEach((s, i) => guard('scene ' + s.id, () => { show(i, 12345); const r = app.run; if (r.tick){ r.tick(1, .033); r.tick(1.04, .033); } }));
  WIDGETS.forEach(w => guard('widget ' + w.id, () => { const el = document.querySelector('#' + w.id + '-w .wc'); if (!el) throw new Error('not mounted'); if (w.update) w.update(el, d); }));
  guard('menu', () => { if (document.querySelectorAll('.scene').length !== SCENES.length) throw new Error('scene buttons != scenes'); });
  guard('menu', () => { if (document.querySelectorAll('#wlist [data-w]').length !== WIDGETS.length) throw new Error('widget toggles != widgets'); });
  guard('ids', () => { const ids = SCENES.map(s => s.id).concat(WIDGETS.map(w => 'w:' + w.id)); if (new Set(ids).size !== ids.length) throw new Error('duplicate id'); });
  return errs.length ? 'FAIL ' + errs.join(' | ') : 'OK ' + SCENES.length + ' scenes, ' + WIDGETS.length + ' widgets';
})()
