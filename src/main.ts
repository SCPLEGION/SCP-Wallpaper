// Boot. Everything else is wired up by the imported modules.
import { SCENES } from './scenes/index.ts';
import { WIDGETS } from './widgets/index.ts';
import { startSources } from './data/sources.ts';
import { state } from './app/state.ts';
import { app, show, go, sceneIndex, startLoop } from './app/stage.ts';
import { initDash } from './app/dashboard.ts';
import { initMenu, armAuto } from './app/menu.ts';

initMenu();
initDash();
show(sceneIndex());
armAuto();
startSources();
startLoop();

// Test/eval hook (tools/smoke.js, tools/qml/eval.qml). Not used by the page itself.
Object.assign(window, { scp: { SCENES, WIDGETS, state, app, show, go } });
