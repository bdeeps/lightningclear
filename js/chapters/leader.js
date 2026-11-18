// Chapter 2: the stepped leader and the return stroke. A faint, branching "leader" of ionised air creeps down from the
// negative charge in the cloud in steps tens of metres long, pausing between them (Schonland and Collens, 1930s, with
// the Boys camera). When it nears the ground, upward streamers rise to meet it. The moment they connect, a bright
// "return stroke" races back up the ionised channel at roughly a third of the speed of light, carrying tens of kiloamps.
// Often the cloud then sends a smoother "dart leader" down the same channel and a second return stroke follows.
// The branching tree is a random growth model (not a full dielectric-breakdown calculation); times are stretched.
import { THREE, M } from '../kit.js';
import { V, COL, clamp, smooth, hash, cloud, ground, sky, growBolt, growStreamers, Bolt, glowBall, fmt } from '../storm.js';

const BASE = 22, T_LEAD = 0.4, T_ATT = 0.5, RET = 0.05;
const plan = (n) => {
  const w = n > 1 ? Math.min(0.12, 0.36 / (n - 1)) : 0;
  const strokes = [{ dart: null, ret: T_ATT, dur: RET }];
  for (let k = 2; k <= n; k++) { const a = 0.64 + (k - 2) * w; strokes.push({ dart: [a, a + 0.55 * w], ret: a + 0.55 * w, dur: Math.max(0.025, 0.15 * w) }); }
  return { strokes, total: n > 1 ? 0.64 + (n - 1) * w + 0.06 : 0.72 };
};
const PHASES = [
  { id: 'lead', name: 'Stepped leader', real: 'A few to tens of milliseconds', say: 'A faint, branching channel of ionised air creeps down from the cloud in steps of tens of metres, pausing between steps. It carries negative charge, and it does not know yet where it will end up.' },
  { id: 'attach', name: 'Streamers meet it', real: 'Microseconds to a few hundred microseconds', say: 'Within some tens of metres of the ground, electric fields at pointed things grow so strong that streamers climb up to meet it. The first to join the leader completes the circuit.' },
  { id: 'return', name: 'Return stroke', real: 'About 100 microseconds', say: 'The circuit is complete. A huge current flows and a bright wave of ionisation rushes up the channel at roughly a third of the speed of light. This is the flash you see. Typical peak current is tens of thousands of amps.' },
  { id: 'glow', name: 'Afterglow', real: 'Tens of milliseconds', say: 'The channel is still hot and conducting. The cloud may have more charge nearby to send down it.' },
  { id: 'dart', name: 'Dart leader', real: 'A millisecond or so', say: 'A smoother leader runs straight down the old, still-warm channel without stepping, much faster than the first one.' },
  { id: 'return2', name: 'Next return stroke', real: 'About 100 microseconds', say: 'Another bright return stroke follows. A typical flash has three or four strokes, but some have just one and some have many. Your eye sees them as flicker.' },
];

export default {
  id: 'leader',
  short: 'Leader and return stroke',
  title: 'The stepped leader and the return stroke',
  subtitle: 'The bolt you see runs upward. A faint leader finds the way first.',
  view: { pos: [3, 11, 30], target: [0, 13, 0] },
  learn: `<p>Lightning does not simply fall. First a faint <b>stepped leader</b> of ionised air creeps down from the negative charge in the cloud. It moves in jumps of tens of metres, pausing about a few tens of microseconds between them, and it branches as it goes. It is dim, and too quick for your eye.</p>
    <p>As it nears the ground, strong electric fields at pointed objects send up <b>streamers</b> to meet it. The moment one joins the leader, the cloud and the ground are wired together by a conducting channel. A huge pulse of current races back up it. This <b>return stroke</b> moves at roughly a third of the speed of light and heats the channel until it is dazzling. <b>That upward flash is the lightning you see.</b></p>
    <p>If the cloud has more charge nearby, a smoother <b>dart leader</b> may run down the same channel and a second return stroke follows. A typical flash has several strokes (three or four on average), which is why lightning flickers.</p>
    <p class="tip"><b>Try it:</b> press <b>Play</b>, or drag <b>Time through the flash</b> slowly. Then pick a different number of strokes and make a new bolt. The branches never reach the ground except one, and each bolt is different.</p>
    <p class="note">The shape comes from a random-growth model that steps, branches and finds the ground, which captures the look but not the full physics. Real times are stretched: the whole flash lasts about a second, and a return stroke lasts a tenth of a millisecond.</p>`,
  terms: [
    { t: 'Stepped leader', d: 'The faint, branching channel that creeps down from a cloud in steps and finds a path to the ground.' },
    { t: 'Streamer', d: 'A short, thin discharge that grows out of a pointed object toward an approaching leader.' },
    { t: 'Return stroke', d: 'The bright, fast pulse of current that runs up the finished channel. It makes the flash.' },
    { t: 'Dart leader', d: 'A smooth, fast leader that runs down an old channel before a later stroke.' },
  ],
  defaults: { p: 0, playing: true, speed: 1, strokes: 3, seed: 5 },
  controls: [
    { key: 'p', type: 'range', label: 'Time through the flash', min: 0, max: 1, step: 0.001, fmt: (v) => `${Math.round(v * 100)}%` },
    { key: 'playing', type: 'toggle', label: 'Play' },
    { key: 'speed', type: 'range', label: 'Playback speed', min: 0.2, max: 2, step: 0.01, fmt: (v) => `${v.toFixed(1)}×` },
    { key: 'strokes', type: 'seg', label: 'Return strokes in the flash', options: [1, 2, 3, 4].map((v) => ({ v, label: String(v) })) },
    { key: 'go', type: 'buttons', label: 'Bolt', items: [{ label: 'New bolt', act: (s) => { s.seed = (s.seed * 7 + 3) % 1000; s.p = 0; s.playing = true; } }, { label: 'Replay', act: (s) => { s.p = 0; s.playing = true; } }] },
  ],
  quiz: [
    { q: 'Which part of lightning do you actually see as the bright flash?', options: ['The leader coming down', 'The return stroke going up', 'The thunder', 'The cloud glowing'], answer: 1, why: 'The leader is faint. The return stroke is the bright pulse that heats the channel and rushes up it.' },
    { q: 'What do the upward streamers do?', options: ['Meet the leader and complete the path', 'Make the thunder', 'Cool the air', 'Push the leader away'], answer: 0, why: 'Once a streamer joins the leader the channel is complete and the return stroke follows.' },
    { q: 'Why does lightning often flicker?', options: ['The cloud is switching', 'The flash has several strokes along the same channel', 'The wind moves the bolt', 'Our eyes are tired'], answer: 1, why: 'Dart leaders and return strokes can repeat down the same channel several times in about a second.' },
  ],
  reel: [
    { ms: 5200, caption: 'First, a faint leader creeps down from the cloud in steps, branching as it goes.', set: { playing: false, strokes: 3, p: 0, seed: 5 }, anim: { p: [0.02, 0.4] }, view: { pos: [2, 11, 34], target: [0, 11.5, 0] }, spin: 0 },
    { ms: 5200, caption: 'Streamers rise to meet it. The instant they touch, a bright return stroke races UP the channel.', set: { playing: false, strokes: 3 }, anim: { p: [0.4, 0.62] }, view: { pos: [-3, 8, 26], target: [0, 8, 0] }, spin: 0 },
    { ms: 5000, caption: 'Dart leaders and more return strokes follow the same channel. That is the flicker.', set: { playing: false, strokes: 3 }, anim: { p: [0.62, 1] }, view: { pos: [3, 11, 36], target: [0, 11.5, 0] }, spin: 0 },
  ],
  build({ stage, s }) {
    ground(stage, { size: 90, cells: 36 });
    const skyc = sky(stage, { base: 0x080b16, flash: 0x425088, pos: [0, 10, 0], gain: 9 });
    const root = new THREE.Group(); stage.root.add(root);
    const cl = cloud({ seed: 12, count: 70, center: [0, BASE + 4.5, 0], spread: [17, 4.2, 12], size: [5, 9], opacity: 0.3, color: 0x8893b2 }); root.add(cl);
    // a few tiny houses and trees, for scale (a house is about 8 m tall, a tree about 20 m)
    const props = new THREE.Group(); root.add(props);
    const rr = (a) => hash(a, 4);
    for (let i = 0; i < 14; i++) {
      const x = (rr(i) - 0.5) * 34, z = (rr(i + 20) - 0.5) * 20 - 3; if (Math.hypot(x, z) < 2.5) continue;
      if (i % 3 === 0) { const h = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.2), M.matte(0x4a4f5c)); h.position.set(x, 0.04, z); props.add(h); }
      else { const t = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 7), M.matte(0x1f3b2c)); t.position.set(x, 0.11, z); props.add(t); }
    }
    const tipBalls = Array.from({ length: 16 }, () => { const b = glowBall(0.12, 0xaec4ff); root.add(b); return b; });
    const front = glowBall(0.22, 0xffffff); root.add(front);
    const lbCloud = stage.label('Negative charge in the cloud', [-10, BASE + 1, 0], root, 'hot');
    const lbGround = stage.label('Ground, positively charged by comparison', [11, 0.3, 4], root);
    const tree = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.32, 7), M.matte(0x1f3b2c)); root.add(tree);

    let bolt = null, G = null, strm = null, seed = -1, nStrokes = -1, byGen = [], pf = [], balls = 0, lastP = 0, wall = 0, ps = { strokes: [], total: 1 };
    function regrow() {
      bolt?.dispose(); seed = s.seed; nStrokes = s.strokes; ps = plan(nStrokes);
      G = growBolt({ seed, start: V(0, BASE, 0), step: 0.5, jitter: 0.8, persist: 0.35, branchP: 0.16, maxTips: 14, spread: 1.15, deathP: 0.035, reach: (p) => (p.y <= 0.6 ? { point: V(p.x, 0, p.z) } : null), maxGen: 260 });
      strm = growStreamers(G.strikePoint, { seed, n: 6, len: 0.9, steps: 5 });
      bolt = new Bolt(stage, [...G.segs, ...strm], { core: 2.4, glow: 10 }); bolt.obj.renderOrder = 10; root.add(bolt.obj);
      byGen = []; G.nodes.forEach((n, i) => { if (!n.jump) (byGen[n.gen] ||= []).push(i); });
      // positions along the main channel from the strike point up (for moving heads)
      const pts = G.mainPts; let acc = 0; pf = [{ f: 0, p: pts[0] }];
      for (let i = 1; i < pts.length; i++) { acc += pts[i].distanceTo(pts[i - 1]); pf.push({ f: acc / G.length, p: pts[i] }); }
      skyc.light.position.set(G.strikePoint.x, 6, G.strikePoint.z + 4);
      tree.position.set(G.strikePoint.x + 0.3, 0.16, G.strikePoint.z + 0.1);
    }
    const posAt = (f) => { f = clamp(f, 0, 1); for (let i = 1; i < pf.length; i++) if (pf[i].f >= f) { const a = pf[i - 1], b = pf[i], k = (f - a.f) / Math.max(1e-6, b.f - a.f); return a.p.clone().lerp(b.p, k); } return pf[pf.length - 1].p.clone(); };
    regrow();

    const phaseAt = (p) => {
      if (p < T_LEAD) return PHASES[0]; if (p < T_ATT) return PHASES[1];
      const st = ps.strokes;
      if (p < st[0].ret + st[0].dur) return PHASES[2];
      for (let k = 1; k < st.length; k++) { const d = st[k].dart; if (p >= d[0] && p < d[1]) return PHASES[4]; if (p >= st[k].ret && p < st[k].ret + st[k].dur) return PHASES[5]; }
      return PHASES[3];
    };

    function render(p) {
      const st = ps.strokes, lead = clamp(p / T_LEAD, 0, 1) * G.G, ju = clamp((p - T_LEAD) / (T_ATT - T_LEAD), 0, 1);
      const lastRet = st.reduce((m, k) => (p >= k.ret ? k : m), null), t1 = st[0].ret + st[0].dur;
      let flash = 0;
      for (const k of st) { const q = p - k.ret; if (q > 0) flash = Math.max(flash, (q < k.dur ? 0.6 + 0.4 * (q / k.dur) : 1) * Math.exp(-Math.max(0, q - k.dur) / 0.03)); }
      if (ju > 0.7 && p < T_ATT) flash = Math.max(flash, 0.06);
      bolt.set((sg, i) => {
        let b = 0, m = 0;
        const up = (v, mm) => { if (v > b) { b = v; m = mm; } };
        if (sg.stream) { if (ju > 0 && ju >= sg.st) up(0.65 * (p < T_ATT ? 1 : Math.exp(-(p - T_ATT) / 0.012)), 0.5); return [b, m]; }
        if (sg.jump) { if (ju >= sg.ji && ju > 0) up(p < t1 ? 0.8 : 0, 0.3); }
        else if (sg.gen <= lead) up(p < st[0].ret ? 0.42 : 0.42 * Math.exp(-(p - st[0].ret) / 0.01), 0);
        // return strokes
        st.forEach((k, ki) => {
          const q = p - k.ret; if (q < 0) return;
          const fr = sg.jf + 0.012 * sg.bd, tp = fr * k.dur, age = q - tp; if (age < 0) return;
          if (!sg.main && ki > 0 && hash(sg.id, ki) > 0.4) return;
          const amp = (sg.main ? 1 : 0.75) * (ki === 0 ? 1 : 0.85), flick = 0.85 + 0.15 * Math.sin(age * 400 + i);
          up(amp * flick * Math.exp(-age / (sg.main ? 0.05 : 0.025)), 1);
        });
        if (sg.main && lastRet) { const age = p - lastRet.ret - lastRet.dur; if (age > 0) up(0.22 * Math.exp(-age / 0.07), 0.2); }
        // dart leaders
        st.forEach((k) => {
          if (!k.dart || p < k.dart[0] || p > k.ret) return;
          const hf = 1 - clamp((p - k.dart[0]) / (k.dart[1] - k.dart[0]), 0, 1);
          if (sg.main && sg.jf >= hf) up(0.35 + 0.5 * Math.exp(-(sg.jf - hf) * 5), 0.15);
        });
        return [b, m];
      });
      skyc.set(flash * 0.85); cl.flash(flash * 0.9);
      // moving heads
      tipBalls.forEach((b) => { b.visible = false; });
      if (p < T_LEAD && p > 0) { const g = Math.floor(lead), list = byGen[g] || []; list.slice(0, 16).forEach((ni, i) => { tipBalls[i].visible = true; tipBalls[i].position.copy(G.nodes[ni].p); tipBalls[i].scale.setScalar(0.9 + 0.3 * Math.sin(p * 200 + i)); }); }
      let fh = false;
      st.forEach((k) => {
        if (p >= k.ret && p < k.ret + k.dur * 1.1) { const u = clamp((p - k.ret) / k.dur, 0, 1); front.position.copy(posAt(u)); fh = true; front.scale.setScalar(1.3); }
        if (k.dart && p >= k.dart[0] && p < k.dart[1]) { const u = (p - k.dart[0]) / (k.dart[1] - k.dart[0]); front.position.copy(posAt(1 - u)); fh = true; front.scale.setScalar(0.6); }
      });
      front.visible = fh;
    }

    return {
      update(dt, st, time) {
        if (st.seed !== seed || st.strokes !== nStrokes) { regrow(); }
        if (st.playing) {
          st.p += (dt * st.speed) / (16 * ps.total);
          if (st.p >= 1.1) st.p = 0; // short hold, then loop
        }
        render(clamp(st.p, 0, 1) * ps.total);
        lastP = st.p;
      },
      readout(st) {
        const pp = clamp(st.p, 0, 1) * ps.total, ph = phaseAt(pp);
        return `<div class="big">${ph.name}</div><p class="r-say">${ph.say}</p>
          <div class="row"><span>Real duration</span><b>${ph.real}</b></div>
          <div class="row"><span>Strokes in this flash</span><b>${st.strokes}</b></div>
          <div class="row"><span>Leader steps (about 50 m each)</span><b>${Math.floor(clamp(pp / T_LEAD, 0, 1) * (G?.G || 0))}</b></div>`;
      },
    };
  },
};
