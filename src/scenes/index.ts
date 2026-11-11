// The ordered list of wallpaper scenes (= menu order). Add a scene: create NN-name.ts, import it here.
import dusk from './01-dusk.ts';
import moon from './02-moon.ts';
import waves from './03-waves.ts';
import topo from './04-topo.ts';
import orbits from './05-orbits.ts';
import dots from './06-dots.ts';
import nebula from './07-nebula.ts';
import reactor from './08-reactor.ts';
import radar from './09-radar.ts';
import hexgrid from './10-hexgrid.ts';
import datastream from './11-datastream.ts';
import circuit from './12-circuit.ts';
import globe from './13-globe.ts';
import equalizer from './14-equalizer.ts';
import dashboard from './15-dashboard.ts';
import type { Scene } from './types.ts';

export const SCENES: Scene[] = [dusk, moon, waves, topo, orbits, dots, nebula, reactor, radar, hexgrid, datastream, circuit, globe, equalizer, dashboard];
