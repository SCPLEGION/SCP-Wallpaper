// Live data the widgets read: Claude usage and system stats (refreshed by initDash).
'use strict';

let usage = null, sys = null; const hist = { cpu: [], rx: [] };

function loadSys(){
  xhr(PATHS.sys, d => {
    sys = d;
    if (d){ hist.cpu.push(d.cpu); if (d.net) hist.rx.push(d.net.rx); hist.cpu = hist.cpu.slice(-60); hist.rx = hist.rx.slice(-60); }
    const w = WIDGETS.find(x => x.id === 'system'); if (w.el && isOn('system')) w.el.innerHTML = sysHtml();
    updateAll();
  });
}
const loadUsage = () => xhr(PATHS.usage, d => { usage = d; });
