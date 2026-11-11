// Reads a JSON file from disk (file:// XHR works because the host allows local file access).
export function xhr<T>(url: string, cb: (v: T | null) => void){
  const x = new XMLHttpRequest();
  x.open('GET', url + '?' + Date.now()); x.responseType = 'text';
  x.onload = () => { let v: T | null = null; try { v = JSON.parse(x.responseText); } catch (e) {} cb(v); };
  x.onerror = () => cb(null);
  x.send();
}
