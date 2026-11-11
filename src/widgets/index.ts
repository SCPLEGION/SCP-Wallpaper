// The ordered list of dashboard widgets (= menu order). Add a widget: create NN-name.ts, import it here.
import clock from './01-clock.ts';
import reactor from './02-reactor.ts';
import progress from './03-progress.ts';
import week from './04-week.ts';
import claude from './05-claude.ts';
import system from './06-system.ts';
import calendar from './07-calendar.ts';
import pomo from './08-pomo.ts';
import todo from './09-todo.ts';
import countdown from './10-countdown.ts';
import nowplaying from './11-nowplaying.ts';
import workspaces from './12-workspaces.ts';
import type { Widget } from './types.ts';

export const WIDGETS: Widget[] = [clock, reactor, progress, week, claude, system, calendar, pomo, todo, countdown, nowplaying, workspaces];
