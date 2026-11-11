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
import emblem from './16-emblem.ts';
import breach from './17-breach.ts';
import cctv from './18-cctv.ts';
import cell from './19-cell.ts';
import redacted from './20-redacted.ts';
import vitals from './21-vitals.ts';
import anchor from './22-anchor.ts';
import site from './23-site.ts';
import scipnet from './24-scipnet.ts';
import rift from './25-rift.ts';
import type { Scene } from './types.ts';

export const SCENES: Scene[] = [dusk, moon, waves, topo, orbits, dots, nebula, reactor, radar, hexgrid, datastream, circuit, globe, equalizer, dashboard,
  emblem, breach, cctv, cell, redacted, vitals, anchor, site, scipnet, rift];
