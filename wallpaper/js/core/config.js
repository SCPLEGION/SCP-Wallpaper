// Sizes and data-file locations shared by every module.
'use strict';

// Logical canvas of the SVG scenes (they scale to the viewport with `slice`).
const W = 1600, H = 900;

// The helper services write their JSON under ~/.cache/scp-center/. The home directory is taken from
// the page URL so nothing here is tied to one user name.
const HOME_URL = 'file://' + ((location.pathname.match(/^\/home\/[^/]+/) || ['/home/scplegion'])[0]);
const CACHE_URL = HOME_URL + '/.cache/scp-center/';
const PATHS = {
  usage: CACHE_URL + 'claude-usage.json',   // claude-hud plugin (display.externalUsageWritePath)
  sys: CACHE_URL + 'sysstats.json',         // helpers/scp-sysstats
  audio: CACHE_URL + 'audio.json',          // helpers/scp-audioviz
  nowplaying: CACHE_URL + 'nowplaying.json', // helpers/scp-nowplaying
};
