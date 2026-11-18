// Shared parts for LightningClear: a soft cloud made of sprites, a procedural branching lightning
// generator (a stepped-leader style random growth), a glowing bolt renderer whose brightness can be set
// per segment every frame, and a sky that flashes.
import { THREE, M, canvasTexture, clamp, lerp, smooth } from './kit.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';

export { clamp, lerp, smooth };
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
export const COL = { pos: 0xff9a4d, neg: 0x6fb7ff, ice: 0xbfe9ff, graupel: 0xe8ecf4, spark: 0xfff3c4, sky: 0x070a14, bolt: 0xdfe8ff, amber: 0xffd24a, coral: 0xff7a59, lime: 0xa3e635 };
export const hash = (a, b = 0) => { let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

// ---------------------------------------------------------------- clouds
let puffTex = null;
function puffTexture() {
  if (puffTex) return puffTex;
  puffTex = canvasTexture(128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }).tex;
  return puffTex;
}
// A cloud of soft sprites. spread is the half-size of an ellipsoid; flatBase squashes the underside.
export function cloud({ seed = 1, count = 50, center = [0, 0, 0], spread = [3, 2, 3], size = [1.5, 3], color = 0x8c96ad, opacity = 0.16, flatBase = true } = {}) {
  const r = rng(seed), g = new THREE.Group();
  const mat = new THREE.SpriteMaterial({ map: puffTexture(), color, transparent: true, opacity, depthWrite: false });
  for (let i = 0; i < count; i++) {
    let x, y, z; do { x = r() * 2 - 1; y = r() * 2 - 1; z = r() * 2 - 1; } while (x * x + y * y + z * z > 1);
    if (flatBase && y < -0.5) y = -0.5 + (y + 0.5) * 0.25;
    const s = new THREE.Sprite(mat), sz = size[0] + (size[1] - size[0]) * r();
    s.position.set(center[0] + x * spread[0], center[1] + y * spread[1], center[2] + z * spread[2]);
    s.scale.set(sz, sz * 0.8, 1); g.add(s);
  }
  g.mat = mat; g.base = new THREE.Color(color); g.baseOpacity = opacity;
  g.flash = (k, tint = 0xbcd0ff) => { mat.color.copy(g.base).lerp(new THREE.Color(tint), clamp(k, 0, 1)); mat.opacity = g.baseOpacity * (1 + 2.2 * clamp(k, 0, 1)); };
  return g;
}

// ---------------------------------------------------------------- ground
export function ground(stage, { size = 200, cells = 40, color = 0x10151d, line = 0x232c3a } = {}) {
  const g = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CircleGeometry(size, 64), new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0 }));
  disc.rotation.x = -Math.PI / 2; disc.receiveShadow = true;
  const grid = new THREE.GridHelper(size * 2, cells, line, line); grid.position.y = 0.01; grid.material.transparent = true; grid.material.opacity = 0.5;
  g.add(disc, grid); stage.root.add(g); stage.floor.visible = false;
  return g;
}

// ---------------------------------------------------------------- the sky and its flash
export function sky(stage, { base = COL.sky, flash = 0x3a4c86, light = 0xaec8ff, pos = [0, 10, 0], gain = 6 } = {}) {
  const b = new THREE.Color(base), f = new THREE.Color(flash), c = new THREE.Color();
  stage.scene.background = c.clone().copy(b);
  const pl = new THREE.PointLight(light, 0, 0, 0); pl.position.set(...pos); stage.root.add(pl);
  return { light: pl, set(k) { k = clamp(k, 0, 1); stage.scene.background = c.copy(b).lerp(f, k); pl.intensity = k * gain; } };
}

// ---------------------------------------------------------------- the lightning generator
// Grows a random tree of segments, one generation at a time. Every live tip takes a step that is part
// momentum, part pull toward where it is going (aim), part random jitter, and sometimes splits in two.
// The first tip to come within reach of something to strike joins it, and the walk stops. The path from
// that point back to the root is the "main channel" that the return stroke will follow.
export function growBolt({ seed = 1, start, step = 1, maxGen = 220, jitter = 0.55, persist = 0.5, aim = () => V(0, -1, 0), reach, branchP = 0.12, maxTips = 14, spread = 0.9, deathP = 0.05, minGen = 3, flatten = 0 }) {
  const r = rng(seed);
  const nodes = [{ p: start.clone(), parent: -1, gen: 0 }];
  let tips = [{ n: 0, dir: aim(start).normalize(), age: 0, root: true }];
  let hit = -1, hitInfo = null, gen = 0, jumpCount = 0;
  const rnd = () => V(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1);
  outer: for (gen = 1; gen <= maxGen; gen++) {
    const born = [];
    for (const tip of tips) {
      const from = nodes[tip.n].p, rc = reach(from);
      if (rc) {
        // the final jump: a few jagged links from the tip to the thing it has found
        const P = rc.point, k = 3; let prev = tip.n;
        for (let i = 1; i <= k; i++) {
          const p = from.clone().lerp(P, i / k); if (i < k) p.add(rnd().multiplyScalar(from.distanceTo(P) * 0.06));
          nodes.push({ p, parent: prev, gen, jump: true, ji: i / k }); prev = nodes.length - 1; jumpCount++;
        }
        hit = prev; hitInfo = rc; break outer;
      }
      const a = aim(from).normalize();
      const d = tip.dir.clone().multiplyScalar(persist).add(a).add(rnd().multiplyScalar(jitter)).normalize();
      if (flatten) d.y *= (1 - flatten);
      d.normalize();
      const p = from.clone().addScaledVector(d, step * (0.75 + 0.5 * r()));
      nodes.push({ p, parent: tip.n, gen }); const idx = nodes.length - 1;
      tip.n = idx; tip.dir = d; tip.age++;
      if (gen > minGen && r() < branchP && tips.length + born.length < maxTips) {
        const ax = rnd().cross(d).normalize(), ang = spread * (0.5 + r() * 0.6) * (r() < 0.5 ? -1 : 1);
        const d2 = d.clone().applyAxisAngle(ax, ang).add(a.clone().multiplyScalar(0.5)).normalize();
        born.push({ n: idx, dir: d2, age: 0 });
      }
    }
    tips = tips.filter((t) => t.root || !(t.age > 3 && r() < deathP)).concat(born);
    if (tips.length > maxTips) tips = tips.slice(0, maxTips);
  }
  if (hit < 0) { // never reached anything: use the lowest tip
    hit = tips.reduce((b, t) => (nodes[t.n].p.y < nodes[b].p.y ? t.n : b), tips[0].n); hitInfo = { point: nodes[hit].p.clone(), kind: 'none' };
  }
  // main channel and fractions along it (0 at the strike point, 1 at the cloud end)
  const main = new Set(); const len = new Map(); let c = hit, L = 0; len.set(c, 0); main.add(c);
  while (nodes[c].parent >= 0) { const p = nodes[c].parent; L += nodes[c].p.distanceTo(nodes[p].p); len.set(p, L); main.add(p); c = p; }
  const f = nodes.map(() => 0), bd = nodes.map(() => 0);
  nodes.forEach((n, i) => {
    if (main.has(i)) f[i] = L ? len.get(i) / L : 0;
    else if (n.parent >= 0) { f[i] = f[n.parent]; bd[i] = bd[n.parent] + 1; }
  });
  const segs = [], mainPts = [];
  nodes.forEach((n, i) => { if (n.parent >= 0) segs.push({ a: nodes[n.parent].p, b: n.p, gen: n.gen, main: main.has(i), jf: f[i], bd: bd[i], jump: !!n.jump, ji: n.ji || 0, id: i, len: n.p.distanceTo(nodes[n.parent].p) }); });
  for (let i = hit; i >= 0; i = nodes[i].parent) mainPts.push(nodes[i].p);
  const leaderGens = nodes.filter((n) => !n.jump).reduce((m, n) => Math.max(m, n.gen), 1);
  return { nodes, segs, mainPts, hit, hitInfo, G: leaderGens, jumpCount, length: L, strikePoint: nodes[hit].p.clone() };
}

// Short upward streamers that grow from a point on the ground or the top of an object.
export function growStreamers(P, { seed = 1, n = 4, len = 1, steps = 5 } = {}) {
  const r = rng(seed), segs = [];
  for (let i = 0; i < n; i++) {
    let p = P.clone().add(V((r() - 0.5) * len * 0.3, 0, (r() - 0.5) * len * 0.3)), dir = V((r() - 0.5) * 0.5, 1, (r() - 0.5) * 0.5).normalize();
    const L = len * (0.45 + 0.55 * r()), k = steps;
    for (let j = 0; j < k; j++) {
      dir.add(V((r() - 0.5) * 0.9, (r() - 0.5) * 0.3, (r() - 0.5) * 0.9)).normalize(); if (dir.y < 0.25) dir.y = 0.25; dir.normalize();
      const q = p.clone().addScaledVector(dir, (L / k) * (0.8 + 0.4 * r()));
      segs.push({ a: p, b: q, st: (j + 1) / k, stream: true }); p = q;
      if (r() < 0.25) { const d2 = dir.clone().add(V((r() - 0.5) * 1.6, 0, (r() - 0.5) * 1.6)).normalize(); segs.push({ a: p, b: p.clone().addScaledVector(d2, (L / k) * 0.8), st: Math.min(1, (j + 1.6) / k), stream: true }); }
    }
  }
  return segs;
}

// ---------------------------------------------------------------- the glowing bolt
const LEADER = [0.42, 0.55, 1.0], WHITE = [1, 0.97, 0.92];
export class Bolt {
  constructor(stage, segs, { core = 2.2, glow = 9, glowTint = 0x4a63c8, glowGain = 0.55 } = {}) {
    this.segs = segs; this.n = segs.length;
    const n = Math.max(1, this.n), pos = new Float32Array(n * 6);
    segs.forEach((s, i) => { pos.set([s.a.x, s.a.y, s.a.z, s.b.x, s.b.y, s.b.z], i * 6); });
    this.geo = new LineSegmentsGeometry(); this.geo.setPositions(pos); this.geo.setColors(new Float32Array(n * 6));
    this.col = this.geo.attributes.instanceColorStart.data;
    const mk = (color, w, op) => stage.lineMaterial({ color, linewidth: w, transparent: true, opacity: op, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false, worldUnits: false });
    this.glowObj = new LineSegments2(this.geo, mk(glowTint, glow, glowGain)); this.coreObj = new LineSegments2(this.geo, mk(0xffffff, core, 1));
    this.glowObj.frustumCulled = this.coreObj.frustumCulled = false;
    this.tint = [1, 1, 1];
    this.obj = new THREE.Group(); this.obj.add(this.glowObj, this.coreObj);
  }
  // fn(seg, i) -> [brightness 0..1.4, mix 0 (blue leader) .. 1 (white-hot)]
  set(fn) {
    const a = this.col.array;
    for (let i = 0; i < this.n; i++) {
      const [b, m] = fn(this.segs[i], i), o = i * 6;
      const T = this.tint, r = lerp(LEADER[0], WHITE[0], m) * b * T[0], g = lerp(LEADER[1], WHITE[1], m) * b * T[1], bl = lerp(LEADER[2], WHITE[2], m) * b * T[2];
      a[o] = a[o + 3] = r; a[o + 1] = a[o + 4] = g; a[o + 2] = a[o + 5] = bl;
    }
    this.col.needsUpdate = true;
  }
  width(core, glow) { this.coreObj.material.linewidth = core; this.glowObj.material.linewidth = glow; }
  dispose() { this.obj.parent?.remove(this.obj); this.geo.dispose(); this.coreObj.material.dispose(); this.glowObj.material.dispose(); }
}

// A small glowing ball to mark leader tips, the return-stroke front and so on.
export function glowBall(r = 0.15, color = 0xffffff) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), M.glow(color)); m.visible = false; return m; }
export const fmt = (v, d = 0) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
