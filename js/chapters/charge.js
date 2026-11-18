// Chapter 1: charging a storm cloud. The standard picture: strong updrafts carry small ice crystals up while
// heavier, soft hail (graupel) hovers or falls. Where they collide in the mixed-phase region (ice and
// supercooled water together, roughly -10 to -25 °C), they swap a little charge. Below the "reversal
// temperature" (around -10 to -20 °C, depending on cloud water) the sign flips. Rising crystals carry
// positive charge to the top, graupel keeps negative charge in the middle, and a smaller positive pocket
// sits near the base (Saunders 2008; Williams 1989; Takahashi 1978). It is a cartoon: real clouds are messier,
// and the details of charge separation are still debated. Speeds and charge sizes here are illustrative.
import { THREE, M } from '../kit.js';
import { V, rng, COL, clamp, cloud, ground, sky, growBolt, Bolt, glowBall, fmt } from '../storm.js';

const Y0 = 2.0, YT = 10.8, RC = 2.3, TOP0 = 8.4, MID0 = 5.9, REV = 6.6;
const temp = (y) => 27 - 6.5 * y; // a typical summer afternoon: 27 °C at the ground, 6.5 °C colder per km
const yAt = (t) => (27 - t) / 6.5;
const NC = 260, NG = 90, QREF = 40;
const SIGN = (q) => (q > 0.15 ? 1 : q < -0.15 ? -1 : 0);

export default {
  id: 'charge',
  short: 'Charging a cloud',
  title: 'How a storm cloud charges up',
  subtitle: 'Ice and hail rub shoulders in an updraft and sort themselves into layers of charge.',
  view: { pos: [3, 6.5, 19], target: [0, 6.3, 0] },
  learn: `<p>A thunderstorm is a giant engine for lifting wet air. In a strong <b>updraft</b> the water freezes high up, where it is far below 0 °C. Two kinds of ice matter: tiny, light <b>ice crystals</b> that the updraft carries to the top, and larger, heavier pellets of soft hail called <b>graupel</b> that hover in the updraft or sink out of it.</p>
    <p>Where they bump into each other, in the middle of the cloud where ice and supercooled water mix, a little electric charge is handed over in each collision. Above about <b>−15 °C</b> the graupel takes <b>negative</b> charge and the crystal takes positive. Lower down the sign flips. The updraft then does the sorting: crystals carry <b>positive</b> charge to the top, graupel keeps <b>negative</b> charge in the middle, and a smaller <b>positive</b> pocket sits near the base. This three-layer picture is called the <b>tripole</b>.</p>
    <p>When the field between the layers gets big enough, a spark leaps between them. Most lightning in fact never leaves the cloud.</p>
    <p class="tip"><b>Try it:</b> turn the updraft down until the graupel falls out and the charging stops, then turn it up and watch the layers form.</p>
    <p class="note">Honest caveat: how charge really separates is still an active research question. Collisions between graupel and ice crystals are the leading explanation, but other processes may help, and nobody can yet fully explain how a spark starts, because the fields measured inside clouds are lower than what air normally needs to break down.</p>`,
  terms: [
    { t: 'Updraft', d: 'Air rising inside a storm, often 10 to 30 m/s or more in strong storms.' },
    { t: 'Graupel', d: 'Soft, rimed pellets of ice a few millimetres across, like tiny snowy hailstones.' },
    { t: 'Mixed-phase region', d: 'The part of the cloud, roughly −10 to −25 °C, where ice and supercooled liquid water exist together.' },
    { t: 'Tripole', d: 'The common three-layer charge picture: positive top, negative middle, small positive base.' },
  ],
  defaults: { updraft: 1, show: 'both', zones: true },
  controls: [
    { key: 'updraft', type: 'range', label: 'Updraft strength', min: 0.2, max: 1.6, step: 0.01, fmt: (v) => `${v < 0.55 ? 'Weak' : v < 1.15 ? 'Moderate' : 'Strong'} · peak ~${Math.round(v * 25)} m/s` , hint: 'Model values. A real storm has a wide range.' },
    { key: 'show', type: 'seg', label: 'Show', options: [{ v: 'both', label: 'Both' }, { v: 'particles', label: 'Ice' }, { v: 'charges', label: 'Charge layers' }] },
    { key: 'zones', type: 'toggle', label: 'Temperature scale and mixed-phase zone' },
    { key: 'go', type: 'buttons', label: 'Start over', items: [{ label: 'Discharge the cloud', act: (s, inst) => inst.clear() }] },
  ],
  quiz: [
    { q: 'In the standard picture, which part of a thundercloud holds negative charge?', options: ['The very top', 'The middle', 'The ground', 'Nowhere'], answer: 1, why: 'Graupel carries negative charge and stays in the middle. Crystals carry positive charge to the top, and a small positive pocket sits below.' },
    { q: 'What happens to charging if the updraft is too weak to hold graupel up?', options: ['Charging speeds up', 'Charging nearly stops', 'Nothing changes', 'The cloud turns negative'], answer: 1, why: 'The graupel sinks out and there are far fewer collisions with rising crystals in the cold zone.' },
    { q: 'How well is charge separation understood?', options: ['Completely, it is textbook', 'The collision picture is the leading idea, but details are still researched', 'Not at all', 'It is caused by the Sun'], answer: 1, why: 'Scientists agree ice collisions matter, but the exact mechanisms and how a first spark starts are still being studied.' },
  ],
  reel: [
    { ms: 5600, caption: 'Collisions swap charge. Crystals carry plus to the top, graupel keeps minus in the middle.', set: { show: 'both', zones: false, updraft: 1.1 }, view: { pos: [-6, 7, 21], target: [0, 6.5, 0] }, spin: 0.25 },
  ],
  build({ stage, s }) {
    ground(stage, { size: 40, cells: 40 });
    const skyc = sky(stage, { base: 0x0a0d18, flash: 0x3c4c82, pos: [0, 6.5, 0], gain: 0 });
    const root = new THREE.Group(); stage.root.add(root);
    const clouds = [
      cloud({ seed: 4, count: 46, center: [0, 6.8, 0], spread: [2.9, 4.4, 2.9], size: [2.4, 4.4], opacity: 0.17, color: 0x98a3be }),
      cloud({ seed: 9, count: 28, center: [0, 10.5, 0], spread: [5.6, 0.75, 3], size: [2.4, 4.2], opacity: 0.17, color: 0xa4aec8 }),
      cloud({ seed: 2, count: 16, center: [0, 2.7, 0], spread: [3.4, 0.5, 3.4], size: [2.2, 3.6], opacity: 0.2, color: 0x717b96 }),
    ];
    clouds.forEach((c) => root.add(c));

    // temperature scale and zones
    const zones = new THREE.Group(); root.add(zones);
    const ruler = new THREE.Mesh(new THREE.BoxGeometry(0.03, 11.5, 0.03), M.glow(0x56627d)); ruler.position.set(-7.2, 5.75, 0); zones.add(ruler);
    [[0, '0 °C'], [-10, '−10 °C'], [-20, '−20 °C'], [-40, '−40 °C']].forEach(([t, txt]) => {
      const tick = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 0.03), M.glow(0x56627d)); tick.position.set(-7.2, yAt(t), 0); zones.add(tick);
      stage.label(txt, [-8.0, yAt(t), 0], zones);
    });
    const mp = new THREE.Mesh(new THREE.CylinderGeometry(RC + 0.7, RC + 0.7, yAt(-25) - yAt(-10), 40, 1, true), M.ghost(0x7aa2ff, 0.07)); mp.position.y = (yAt(-25) + yAt(-10)) / 2; zones.add(mp);
    stage.label('Mixed-phase zone (about −10 to −25 °C)', [RC + 3.4, 8.3, 0], zones);
    const rev = new THREE.Mesh(new THREE.TorusGeometry(RC + 0.7, 0.02, 6, 60), M.glow(0xffd24a)); rev.rotation.x = Math.PI / 2; rev.position.y = REV; zones.add(rev);
    stage.label('Charge sign flips around −15 °C (varies)', [-RC - 2.4, REV, 0], zones, 'hot');

    // charge layers
    const layers = [
      { key: 'top', y: 9.7, sign: 1, h: 0.9, name: 'Positive top' },
      { key: 'mid', y: 7.1, sign: -1, h: 1.0, name: 'Negative middle' },
      { key: 'low', y: 4.7, sign: 1, h: 0.7, name: 'Small positive base' },
    ].map((l) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(RC + 0.5, RC + 0.5, l.h, 40), M.ghost(l.sign > 0 ? COL.pos : COL.neg, 0.1)); mesh.position.y = l.y; root.add(mesh);
      const lb = stage.label(`${l.sign > 0 ? '+' : '−'} ${l.name}`, [RC + 0.7, l.y, 0], root, 'hot'); lb.element.style.color = l.sign > 0 ? '#ff9a4d' : '#6fb7ff';
      return { ...l, mesh, q: 0 };
    });

    // particles
    const r = rng(7);
    const mkInst = (n, rad) => { const m = new THREE.InstancedMesh(new THREE.SphereGeometry(rad, 8, 6), M.glow(0xffffff), n); m.setColorAt(0, new THREE.Color()); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; root.add(m); return m; };
    const crys = mkInst(NC, 0.06), grau = mkInst(NG, 0.13);
    const mkP = () => ({ x: 0, y: 0, z: 0, q: 0, cd: 0, ph: r() * 6.28 });
    const C = Array.from({ length: NC }, mkP), Gp = Array.from({ length: NG }, mkP);
    const place = (p, isG, rr = 1) => { const a = r() * 6.283, d = Math.sqrt(r()) * RC * rr; p.x = Math.cos(a) * d; p.z = Math.sin(a) * d; p.y = isG ? 5.8 + r() * 1.7 : 4.5 + r() * 2; p.q = 0; };
    C.forEach((p) => { place(p, false); p.y = 3 + r() * 7.5; }); Gp.forEach((p) => place(p, true, 0.85));
    const sparks = Array.from({ length: 24 }, () => { const b = glowBall(0.1, COL.spark); root.add(b); return { b, life: 0 }; });
    let sk = 0;
    const o = new THREE.Object3D(), col = new THREE.Color(), cNeu = new THREE.Color(0xbfe9ff), cGrau = new THREE.Color(0xdde3ee), cPos = new THREE.Color(COL.pos), cNeg = new THREE.Color(COL.neg);

    let tt = 0, flashes = 0, cd = 0, first = null, bolt = null, bt = 0, info = { E: 0, collisions: 0 };
    const w = (y, rr, up) => up * 3 * Math.max(0, Math.sin(Math.PI * clamp((y - 1.5) / 9.5, 0, 1))) * Math.max(0.12, 1 - (rr / (RC + 0.4)) ** 2);

    function step(dt, up, allowFlash = true) {
      tt += dt; cd -= dt;
      for (const p of C) {
        const rr = Math.hypot(p.x, p.z);
        p.cd -= dt; p.q *= Math.exp(-dt / 60);
        if (p.y > YT - 0.3) { const a = Math.atan2(p.z, p.x); p.x += Math.cos(a) * dt * 1.2; p.z += Math.sin(a) * dt * 1.2; p.y += (YT - 0.6 - p.y) * dt; if (rr > 4.6) place(p, false); continue; }
        p.y += (w(p.y, rr, up) - 0.2) * dt;
        p.x += Math.sin(tt * 1.3 + p.ph) * 0.35 * dt - (rr > RC ? (p.x / rr) * (rr - RC) * 2 * dt : 0); p.z += Math.cos(tt * 1.1 + p.ph) * 0.35 * dt - (rr > RC ? (p.z / rr) * (rr - RC) * 2 * dt : 0);
        if (p.y < Y0) place(p, false);
      }
      let hits = 0;
      for (const g of Gp) {
        const rr = Math.hypot(g.x, g.z);
        g.cd -= dt; g.q *= Math.exp(-dt / 60);
        g.y += (w(g.y, rr, up) - 1.6) * dt;
        g.x += Math.sin(tt * 0.9 + g.ph) * 0.3 * dt - (rr > RC ? (g.x / rr) * (rr - RC) * 2 * dt : 0); g.z += Math.cos(tt * 1.2 + g.ph) * 0.3 * dt - (rr > RC ? (g.z / rr) * (rr - RC) * 2 * dt : 0);
        if (g.y > 10.2 || g.y < 2.4) { place(g, true, 0.85); continue; }
        if (g.y < 4.3 || g.y > 8.6 || g.cd > 0) continue;
        for (const c of C) {
          if (c.cd > 0 || Math.abs(c.y - g.y) > 0.3) continue;
          const dx = c.x - g.x, dz = c.z - g.z; if (dx * dx + dz * dz + (c.y - g.y) ** 2 > 0.1) continue;
          const sg = (c.y + g.y) / 2 > REV ? 1 : -1; // above the reversal height the crystal gains positive charge
          c.q = clamp(c.q + sg, -2, 2); g.q = clamp(g.q - sg, -5, 5); c.cd = g.cd = 0.5; hits++;
          const sp = sparks[sk++ % sparks.length]; sp.life = 0.22; sp.b.position.set(g.x, g.y, g.z);
          break;
        }
      }
      info.collisions = hits;
      for (const l of layers) l.q = 0;
      let pos = 0, neg = 0;
      const tally = (p) => { const L = p.y > TOP0 ? layers[0] : p.y > MID0 ? layers[1] : p.y > 3.4 ? layers[2] : null; if (L) { L.q += p.q; } };
      C.forEach(tally); Gp.forEach(tally);
      pos = Math.max(0, layers[0].q); neg = Math.max(0, -layers[1].q);
      info.E = Math.sqrt(pos * neg) / QREF;
      if (allowFlash && info.E >= 1 && cd <= 0) discharge();
    }
    function discharge() {
      flashes++; cd = 4; bt = 0; first ??= tt;
      bolt?.dispose();
      const goal = V(0.3, 9.7, 0.1);
      const g = growBolt({ seed: flashes * 7 + 3, start: V(0, 7.0, 0), step: 0.3, jitter: 0.8, persist: 0.45, branchP: 0.22, maxTips: 10, aim: (p) => goal.clone().sub(p), reach: (p) => (p.distanceTo(goal) < 0.45 ? { point: goal } : null), maxGen: 60 });
      bolt = new Bolt(stage, g.segs, { core: 2.6, glow: 11 }); bolt.G = g.G + 1; bolt.obj.renderOrder = 10; root.add(bolt.obj);
      [...C, ...Gp].forEach((p) => { p.q *= 0.3; });
    }
    function clear() { [...C, ...Gp].forEach((p) => { p.q = 0; }); flashes = 0; first = null; cd = 3; }
    // let the cloud charge for a while before the first frame
    for (let i = 0; i < 260; i++) step(0.05, s.updraft, false);
    cd = 0.5;

    return {
      clear,
      update(dt, st) {
        dt = Math.min(dt, 0.05);
        step(dt, st.updraft);
        const showP = st.show !== 'charges', showQ = st.show !== 'particles';
        crys.visible = grau.visible = showP; zones.visible = st.zones;
        const put = (m, arr, isG) => {
          arr.forEach((p, i) => {
            o.position.set(p.x, p.y, p.z); o.scale.setScalar(isG ? 1 : 1); o.updateMatrix(); m.setMatrixAt(i, o.matrix);
            const k = clamp(Math.abs(p.q) / (isG ? 3 : 1.5), 0, 1);
            col.copy(isG ? cGrau : cNeu).lerp(p.q > 0 ? cPos : cNeg, k); m.setColorAt(i, col);
          });
          m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true;
        };
        put(crys, C, false); put(grau, Gp, true);
        for (const sp of sparks) { sp.life -= dt; sp.b.visible = sp.life > 0 && showP; sp.b.scale.setScalar(Math.max(0.01, sp.life / 0.22) * 1.6); }
        layers.forEach((l) => {
          const k = clamp(Math.abs(l.q) / QREF, 0, 1.4); l.mesh.visible = showQ; l.mesh.material.opacity = 0.03 + 0.34 * Math.min(1, k);
        });
        let flash = 0;
        if (bolt) {
          bt += dt;
          const reveal = clamp(bt / 0.12, 0, 1) * bolt.G, env = Math.exp(-Math.max(0, bt - 0.12) / 0.18) * (0.75 + 0.25 * Math.sin(bt * 90));
          bolt.set((sg) => [sg.gen <= reveal ? (sg.main ? 1 : 0.65) * env : 0, 0.85]);
          flash = env * 0.9; if (bt > 1) { bolt.dispose(); bolt = null; }
        }
        clouds.forEach((c) => c.flash(flash));
        skyc.set(flash * 0.4);
      },
      readout(st) {
        const [t, m, l] = layers, weak = st.updraft < 0.55, E = clamp(info.E, 0, 1);
        const bar = (v, c) => `<div style="height:6px;border-radius:3px;background:rgba(255,255,255,.1);margin:2px 0 6px"><i style="display:block;height:100%;width:${Math.round(clamp(Math.abs(v) / QREF, 0, 1) * 100)}%;border-radius:3px;background:${c}"></i></div>`;
        return `<div class="big">${weak ? 'Too weak to charge' : E > 0.9 ? 'About to flash' : 'Charging'}</div>
          <p class="r-say">${weak ? 'The updraft cannot hold the graupel up, so it falls out and collisions in the cold zone almost stop.' : 'Crystals carry + up, graupel keeps − in the middle. The charge shown is a model count, not coulombs.'}</p>
          <div class="row"><span>+ Top layer</span><b>${fmt(Math.max(0, t.q))}</b></div>${bar(t.q, '#ff9a4d')}
          <div class="row"><span>− Middle layer</span><b>${fmt(Math.abs(Math.min(0, m.q)))}</b></div>${bar(m.q, '#6fb7ff')}
          <div class="row"><span>+ Base pocket</span><b>${fmt(Math.max(0, l.q))}</b></div>${bar(l.q, '#ff9a4d')}
          <div class="row"><span>Ready to flash</span><b>${Math.round(E * 100)}%</b></div>
          <div class="row"><span>Flashes so far</span><b>${flashes}${first !== null ? '' : ''}</b></div>`;
      },
    };
  },
};
