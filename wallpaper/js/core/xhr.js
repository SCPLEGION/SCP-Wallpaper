// Reads a JSON file from disk (file:// XHR works because the host allows local file access).
'use strict';

function xhr(url, cb){
  const x = new XMLHttpRequest();
  x.open('GET', url + '?' + Date.now()); x.responseType = 'text';
  x.onload = () => { try { cb(JSON.parse(x.responseText)); } catch (e) { cb(null); } };
  x.onerror = () => cb(null);
  x.send();
}
