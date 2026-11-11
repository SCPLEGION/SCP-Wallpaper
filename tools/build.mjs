// Bundles src/ into wallpaper/dist/app.js: one classic IIFE script, because Chromium blocks ES modules on file://.
//   node tools/build.mjs [--watch]   --watch also tells running pages to reload after each rebuild (via scp-wallpaperd)
import * as esbuild from 'esbuild';
import { execFile } from 'node:child_process';

// After a watch rebuild, reload the pages in place (no shell restart). Silently does nothing if the daemon is not running.
const live = { name: 'live-reload', setup(b){ let first = true; b.onEnd(r => { if (first){ first = false; return; } if (!r.errors.length) execFile('helpers/scp-wallpaperd', ['send', 'reload'], () => {}); }); } };

const opts = {
  entryPoints: ['src/main.ts'], outfile: 'wallpaper/dist/app.js',
  bundle: true, format: 'iife', target: 'chrome120', sourcemap: 'linked', legalComments: 'none', logLevel: 'info',
};
if (process.argv.includes('--watch')) await (await esbuild.context({ ...opts, plugins: [live] })).watch();
else await esbuild.build(opts);
