// Bundles src/ into wallpaper/dist/app.js: one classic IIFE script, because Chromium blocks ES modules on file://.
//   node tools/build.mjs [--watch]
import * as esbuild from 'esbuild';

const opts = {
  entryPoints: ['src/main.ts'], outfile: 'wallpaper/dist/app.js',
  bundle: true, format: 'iife', target: 'chrome120', sourcemap: 'linked', legalComments: 'none', logLevel: 'info',
};
if (process.argv.includes('--watch')) await (await esbuild.context(opts)).watch();
else await esbuild.build(opts);
