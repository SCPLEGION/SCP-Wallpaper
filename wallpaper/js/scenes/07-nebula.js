// Scene 7: Nebula (WebGL shader)
'use strict';

// 7. Nebula (WebGL shader)
SCENES.push({
  name: 'Mgławica', swatch: 'linear-gradient(135deg,#2a1450,#c43c78 55%,#2aa3a8)', gl: true,
  mount(seed){ this.seed = seed % 97; return '<canvas id="glc"></canvas>'; },
  after(){
    const c = $('glc'), gl = c.getContext('webgl', { antialias: false, powerPreference: 'low-power' });
    this.gl = gl; if (!gl) return;
    const sh = (ty, src) => { const s = gl.createShader(ty); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s)); return s; };
    const p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, 'attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }'));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, NEBULA_FRAG));
    gl.linkProgram(p); gl.useProgram(p);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const l = gl.getAttribLocation(p, 'p'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
    this.uR = gl.getUniformLocation(p, 'res'); this.uT = gl.getUniformLocation(p, 't');
    const sc = .6, dpr = Math.min(devicePixelRatio || 1, 2) * sc;
    c.width = Math.floor(innerWidth * dpr); c.height = Math.floor(innerHeight * dpr);
    gl.viewport(0, 0, c.width, c.height); gl.uniform2f(this.uR, c.width, c.height);
  },
  tick(t){ if (!this.gl) return; this.gl.uniform1f(this.uT, ((Date.now() - 1.7e12) / 1000) % 100000 + this.seed * 37); this.gl.drawArrays(this.gl.TRIANGLES, 0, 3); },
  unmount(){ const e = this.gl && this.gl.getExtension('WEBGL_lose_context'); if (e) e.loseContext(); this.gl = null; }
});

const NEBULA_FRAG = `
precision highp float;
uniform vec2 res; uniform float t;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec2 hash2(vec2 p){ return vec2(hash(p), hash(p + 17.31)); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; mat2 r = mat2(0.8,-0.6,0.6,0.8);
  for(int i = 0; i < 5; i++){ v += a * noise(p); p = r * p * 2.02 + 7.3; a *= 0.5; } return v; }
vec3 pal(float x, float s){ return 0.5 + 0.5 * cos(6.28318 * (x + vec3(0.0, 0.33, 0.67) + s)); }
vec3 stars(vec2 uv, float scale, float density, float size, float seed){
  vec2 g = uv * scale, id = floor(g), f = fract(g) - 0.5; float h = hash(id + seed);
  if(h < density) return vec3(0.0);
  vec2 off = (hash2(id + seed + 3.7) - 0.5) * 0.7; float d = length(f - off);
  float tw = 0.55 + 0.45 * sin(t * (0.8 + h * 3.0) + h * 50.0);
  float core = smoothstep(size, 0.0, d), halo = smoothstep(size * 4.0, 0.0, d) * 0.18;
  return mix(vec3(0.7,0.85,1.0), vec3(1.0,0.85,0.65), hash(id + seed + 9.1)) * (core + halo) * tw; }
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * res) / min(res.x, res.y);
  float time = t * 0.045, shift = 0.62 + 0.22 * sin(t * 0.012) + 0.12 * sin(t * 0.0071 + 1.3);
  vec2 q = vec2(fbm(uv*1.3 + time), fbm(uv*1.3 + vec2(5.2,1.3) - time));
  vec2 r = vec2(fbm(uv*1.3 + 3.0*q + vec2(1.7,9.2) + time*1.4), fbm(uv*1.3 + 3.0*q + vec2(8.3,2.8) - time*1.1));
  float f = fbm(uv*1.2 + 3.0*r), neb = smoothstep(0.2, 0.95, f*1.1 + length(q)*0.3);
  vec3 col = mix(vec3(0.012,0.016,0.045), pal(0.35 + f*0.4, shift) * 0.55, neb * 0.85);
  col *= 0.65 + 0.7 * smoothstep(0.25, 0.75, fbm(uv*2.4 + r*2.0 - time));
  float ridge = 1.0 - abs(2.0 * fbm(uv*2.0 + 2.4*r + time*1.8) - 1.0);
  col += pow(ridge, 7.0) * pal(0.55 + f*0.3, shift) * 0.45;
  vec2 drift = vec2(time * 0.35, 0.0);
  col += stars(uv + drift*0.4, 28.0, 0.93, 0.045, 1.0) * 0.8 + stars(uv + drift, 14.0, 0.965, 0.06, 7.0);
  col *= 1.0 - 0.6 * dot(uv*0.75, uv*0.75);
  col += (hash(gl_FragCoord.xy + fract(t)) - 0.5) * 0.018;
  col = col / (1.0 + col * 0.35);
  gl_FragColor = vec4(pow(max(col, 0.0), vec3(0.92)), 1.0);
}`;
