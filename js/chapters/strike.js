// Chapter 4: where it strikes, and why. The stepped leader has no plan. Each leader tip grows toward the ground,
// and as it gets close, every sharp or tall object sends up streamers. The first to meet the tip within its
// "striking distance" wins (the electro-geometric model behind the rolling-sphere method used to place lightning
// rods; striking distance is often taken as r = 10 I^0.65 metres for peak current I in kA). Franklin proposed
// pointed iron rods in 1749-1753 and the first successful tests were in 1752. Rods do not "draw" lightning from
// the sky: they give it a safe path to ground where it would have struck nearby anyway.
// One unit here is 2 m. The leader is shown for its last stretch only.
import { THREE, M } from '../kit.js';
import { V, COL, clamp, hash, ground, sky, growBolt, growStreamers, Bolt, glowBall, fmt } from '../storm.js';

const U = 2; // metres per unit
const rOf = (kA) => (10 * Math.pow(kA, 0.65)) / U; // striking distance in units
const HOUSE = { x: -24, top: 5.0 }, TREE = { x: 24, top: 8 }, PERSON = { x: 0, top: 0.9 };

export default {
  id: 'strike',
  short: 'Where it strikes',
  title: 'Where lightning strikes, and why',
  subtitle: 'Tall things and sharp things win the race. A rod just makes sure it wins safely.',
  view: { pos: [18, 30, 95], target: [0, 28, 0] },
  learn: `<p>The leader does not aim. It wanders downward, and when it gets within a certain <b>striking distance</b> of something, usually tens to a couple of hundred metres, the electric field at that thing's tip grows so large that it sends up streamers. The first object to connect wins. A <b>tall</b> or <b>pointed</b> object gets there first. Open ground wins when nothing taller is near.</p>
    <p>Engineers capture this with the <b>rolling-sphere</b> idea: roll an imaginary ball, as wide as the striking distance, over a building and the ground. Wherever the ball touches, lightning can strike. Wherever it cannot reach, the building is shielded. A <b>lightning rod</b> (Franklin proposed them in the 1750s) is a tall point joined to the ground by a thick conductor. It does not pull lightning from far away. It makes sure the strike lands on the rod and flows safely to earth, rather than through the roof.</p>
    <p>There are other kinds too. Most lightning stays <b>inside or between clouds</b> and never touches the ground. <b>Positive</b> lightning comes from the positive top of a storm, can strike many kilometres from the rain, and tends to carry more current. <b>Ball lightning</b>, glowing spheres reported for centuries, is still unexplained.</p>
    <p class="tip"><b>Try it:</b> slide the leader sideways and press <b>Strike!</b>. See which object it picks. Turn on the rolling sphere and see where it touches. Add the rod and strike the house.</p>
    <p class="tip"><b>Staying safe, as commonly taught:</b> when thunder roars, go indoors. A fully enclosed building, or a hard-topped metal car with the windows up, is the safe choice, and it is the metal body that protects you, not the tyres. Stay off corded phones and away from plumbing and windows. Nowhere outside is safe in a thunderstorm. Wait 30 minutes after the last thunder.</p>`,
  terms: [
    { t: 'Striking distance', d: 'How close a leader tip must come to something before it is captured. It grows with the strength of the stroke.' },
    { t: 'Rolling sphere', d: 'An engineering method: roll a ball the size of the striking distance over a structure. Anything the ball can touch is exposed.' },
    { t: 'Lightning rod', d: 'A tall pointed conductor joined to the ground by a thick cable, to catch a strike and carry it safely to earth.' },
    { t: 'Positive lightning', d: 'A stroke that lowers positive charge to the ground, usually from the top of a storm. It is rarer and often stronger.' },
  ],
  defaults: { x: 14, kA: 30, rod: false, sphere: false, p: 0, seed: 3 },
  controls: [
    { key: 'x', type: 'range', label: 'Where the leader comes down', min: -40, max: 40, step: 1, fmt: (v) => (v < -12 ? 'Over the house' : v > 12 ? 'Over the tree' : 'Over the open field') },
    { key: 'kA', type: 'log', label: 'Peak current of the stroke', min: 3, max: 60, fmt: (v) => `${v.toFixed(0)} kA · reach ${Math.round(rOf(v) * U)} m` },
    { key: 'rod', type: 'toggle', label: 'Lightning rod on the house' },
    { key: 'sphere', type: 'toggle', label: 'Show the rolling sphere' },
    { key: 'go', type: 'buttons', label: 'Lightning', items: [{ label: 'Strike!', act: (s) => { s.seed = (s.seed * 7 + 5) % 997; s.p = 0; } }] },
  ],
  quiz: [
    { q: 'What does a lightning rod really do?', options: ['Pulls lightning from far away', 'Gives a strike a safe path to the ground', 'Repels lightning', 'Stores charge'], answer: 1, why: 'It makes a strike land on the rod and flow to earth through a thick conductor instead of through the roof.' },
    { q: 'In the rolling-sphere method, what is exposed to a strike?', options: ['Everything', 'Where the ball can touch', 'Only the tallest tree', 'Only metal'], answer: 1, why: 'Wherever the imaginary ball can touch a structure, a leader of that striking distance could connect.' },
    { q: 'Where is the safest place during a thunderstorm?', options: ['Under a tall tree', 'A fully enclosed building or hard-topped metal vehicle', 'An open field', 'A picnic shelter'], answer: 1, why: 'Enclosed buildings and metal-bodied cars carry the current around you. Nothing outside is safe.' },
    { q: 'How well is ball lightning explained?', options: ['Fully explained', 'It is reported but there is no agreed explanation', 'It is the same as sprites', 'It does not exist anywhere'], answer: 1, why: 'There are reports and a few recordings but no agreed explanation yet.' },
  ],
  reel: [
    { ms: 5400, caption: 'A leader has no plan. Whatever reaches it first within striking range wins.', set: { x: 14, kA: 30, rod: false, sphere: false, p: 0, seed: 3 }, anim: { p: [0.0, 0.8] }, view: { pos: [18, 30, 95], target: [0, 28, 0] }, spin: 0 },
  ],
  build({ stage, s }) {
    ground(stage, { size: 220, cells: 44 });
    const skyc = sky(stage, { base: 0x080b16, flash: 0x3f4f86, pos: [0, 40, 20], gain: 8 });
    const root = new THREE.Group(); stage.root.add(root);
    // house
    const house = new THREE.Group(); house.position.x = HOUSE.x;
    const body = new THREE.Mesh(new THREE.BoxGeometry(5.4, 3.4, 4.4), M.matte(0x7b6e60)); body.position.y = 1.7;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.7, 1.6, 4), M.matte(0x4a3f3a)); roof.rotation.y = Math.PI / 4; roof.position.y = 3.4 + 0.8;
    const rodM = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.1, 8), M.metal(0xd6dbe6)); rodM.position.y = 5.0 + 0.45;
    house.add(body, roof, rodM); root.add(house);
    // tree
    const tree = new THREE.Group(); tree.position.x = TREE.x;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 3, 8), M.matte(0x5a4331)); trunk.position.y = 1.5;
    const crown = new THREE.Mesh(new THREE.ConeGeometry(2.4, 5.2, 9), M.matte(0x1f4a31)); crown.position.y = 3 + 2.4;
    tree.add(trunk, crown); root.add(tree);
    // person
    const person = new THREE.Group(); person.position.x = PERSON.x;
    const pb = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.7, 8), M.plastic(0xff7a59)), ph = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), M.plastic(0xf3c9a6));
    pb.position.y = 0.45; ph.position.y = 0.9; person.add(pb, ph); root.add(person);
    const names = { house: stage.label('House', [HOUSE.x, 8, 0], root), tree: stage.label('Tree', [TREE.x, 11.5, 0], root), person: stage.label('Person in the open', [PERSON.x, 4, 0], root) };
    const marks = { house: glowBall(0.5, 0xff6b6b), tree: glowBall(0.5, 0xff6b6b), person: glowBall(0.5, 0xff6b6b) };
    Object.values(marks).forEach((m) => root.add(m));
    const sph = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), M.ghost(0x7aa2ff, 0.05)); const sphW = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 14), new THREE.MeshBasicMaterial({ color: 0x7aa2ff, wireframe: true, transparent: true, opacity: 0.12, depthWrite: false }));
    sph.add(sphW); root.add(sph);
    const touch = glowBall(0.7, 0xffd24a); root.add(touch);
    const tipBalls = Array.from({ length: 8 }, () => { const b = glowBall(0.45, 0xaec4ff); root.add(b); return b; });
    const lbSph = stage.label('', [0, 0, 0], root, 'hot'); lbSph.visible = false;

    let bolt = null, geo = null, strm = [], key = '', byGen = [], struck = 'none', R = 0, wall = 0, sweep = 0;
    const tops = (st) => [{ n: 'house', x: HOUSE.x, y: st.rod ? HOUSE.top + 1.0 : HOUSE.top }, { n: 'tree', x: TREE.x, y: TREE.top }, { n: 'person', x: PERSON.x, y: PERSON.top }];
    function regrow(st) {
      bolt?.dispose(); key = `${st.x}|${st.kA}|${st.rod}|${st.seed}`; R = rOf(st.kA);
      const T = tops(st).map((o) => ({ ...o, pt: V(o.x, o.y, 0) }));
      const reach = (p) => {
        let best = null, bd = R;
        for (const o of T) { const d = p.distanceTo(o.pt); if (d < bd) { bd = d; best = { point: o.pt.clone(), kind: o.n }; } }
        if (p.y < bd) { best = { point: V(p.x, 0, p.z), kind: 'ground' }; }
        return best;
      };
      geo = growBolt({ seed: st.seed, start: V(st.x, R + 55, 0), step: 7, jitter: 0.42, persist: 0.55, branchP: 0.1, maxTips: 5, spread: 0.8, deathP: 0.08, reach, maxGen: 80, flatten: 0 });
      struck = geo.hitInfo?.kind || 'ground';
      const P = geo.strikePoint;
      strm = growStreamers(P, { seed: st.seed, n: 4, len: R * 0.2, steps: 5 });
      // dimmer streamers on the objects that lost the race
      T.forEach((o) => { if (o.n !== struck && o.pt.distanceTo(geo.nodes[geo.hit ? geo.nodes[geo.hit].parent : 0].p) < R * 2.2) strm.push(...growStreamers(o.pt, { seed: st.seed + o.x, n: 2, len: R * 0.1, steps: 4 }).map((q) => ({ ...q, lose: true }))); });
      bolt = new Bolt(stage, [...geo.segs, ...strm], { core: 2.3, glow: 9 }); bolt.obj.renderOrder = 10; root.add(bolt.obj);
      byGen = []; geo.nodes.forEach((n, i) => { if (!n.jump) (byGen[n.gen] ||= []).push(i); });
      skyc.light.position.set(P.x, 40, 24);
      Object.entries(marks).forEach(([k, m]) => { m.position.set(...(k === 'house' ? [HOUSE.x, (st.rod ? HOUSE.top + 1 : HOUSE.top) + 1, 0] : k === 'tree' ? [TREE.x, TREE.top + 1, 0] : [PERSON.x, 2, 0])); });
      rodM.visible = st.rod;
    }
    regrow(s);

    function paint(p) {
      const lead = clamp(p / 0.6, 0, 1) * geo.G, ju = clamp((p - 0.6) / 0.1, 0, 1), RET = 0.72, DUR = 0.06;
      const q = p - RET; let flash = 0;
      if (q > 0) flash = (q < DUR ? 0.6 + 0.4 * (q / DUR) : 1) * Math.exp(-Math.max(0, q - DUR) / 0.05);
      bolt.set((sg, i) => {
        let b = 0, m = 0; const up = (v, mm) => { if (v > b) { b = v; m = mm; } };
        if (sg.stream) { if (ju > 0 && ju >= sg.st) up((sg.lose ? 0.35 : 0.65) * (p < RET ? 1 : Math.exp(-(p - RET) / 0.015)), 0.5); return [b, m]; }
        if (sg.jump) { if (ju >= sg.ji && ju > 0) up(p < RET + DUR ? 0.8 : 0, 0.3); }
        else if (sg.gen <= lead) up(p < RET ? 0.45 : 0.45 * Math.exp(-(p - RET) / 0.01), 0);
        if (q > 0) { const age = q - (sg.jf + 0.012 * sg.bd) * DUR; if (age > 0) up((sg.main ? 1 : 0.75) * (0.85 + 0.15 * Math.sin(age * 400 + i)) * Math.exp(-age / (sg.main ? 0.06 : 0.03)), 1); }
        if (sg.main && q > 0) { const age = q - DUR; if (age > 0) up(0.22 * Math.exp(-age / 0.08), 0.2); }
        return [b, m];
      });
      skyc.set(flash * 0.8);
      tipBalls.forEach((b) => { b.visible = false; });
      if (p > 0 && p < 0.6) { const list = byGen[Math.floor(lead)] || []; list.slice(0, 8).forEach((ni, i) => { tipBalls[i].visible = true; tipBalls[i].position.copy(geo.nodes[ni].p); }); }
      Object.entries(marks).forEach(([k, m]) => { m.visible = struck === k && q > 0 && q < 0.2; });
    }

    return {
      update(dt, st) {
        if (`${st.x}|${st.kA}|${st.rod}|${st.seed}` !== key) { regrow(st); if (!document.body.classList.contains('gb-reel')) st.p = 0; }
        if (!document.body.classList.contains('gb-reel')) { st.p += dt / 6; if (st.p > 1.7) st.p = 0; }
        paint(clamp(st.p, 0, 1.6));
        sph.visible = st.sphere; lbSph.visible = st.sphere;
        if (st.sphere) {
          sweep += dt * 0.12; const cx = Math.sin(sweep * 2.4) * 46, T = tops(st);
          let yc = R, who = 'ground';
          for (const o of T) { const dx = Math.abs(cx - o.x); if (dx < R) { const y = o.y + Math.sqrt(R * R - dx * dx); if (y > yc + 1e-6) { yc = y; who = o.n; } } }
          sph.scale.setScalar(R); sph.position.set(cx, yc, 0); sph.rotation.y += dt * 0.2;
          const tp = who === 'ground' ? V(cx, 0, 0) : (() => { const o = T.find((t) => t.n === who); return V(o.x, o.y, 0); })();
          touch.visible = true; touch.position.copy(tp); touch.material.color.set(who === 'ground' ? 0x7aa2ff : 0xffd24a);
          lbSph.position.set(cx, yc + R + 4, 0); lbSph.element.textContent = who === 'ground' ? 'Sphere touches open ground' : `Sphere touches the ${who === 'house' && st.rod ? 'rod' : who}`;
        } else touch.visible = false;
      },
      readout(st) {
        const nm = { house: st.rod ? 'The rod on the house' : 'The house roof', tree: 'The tree', person: 'The person', ground: 'Open ground', none: '—' };
        const hot = struck === 'person' ? 'no' : 'ok';
        const pr = st.p;
        const note = struck === 'house' && st.rod ? 'The rod takes it and a thick cable carries it to earth. The house is protected.' : struck === 'house' ? 'No rod: the current has to find its own way down through the building.' : struck === 'tree' ? 'Tall and near the leader. Standing under a tree is not shelter, because the current can jump to you.' : struck === 'person' ? 'Alone in the open, a person can be the highest point nearby. This is why the open is dangerous.' : 'Nothing tall was within reach, so the ground was the first thing to meet the leader.';
        return `<div class="big">${pr < 0.6 ? 'The leader comes down…' : 'Struck: ' + nm[struck]}</div>
          <p class="r-say">${pr < 0.6 ? 'Each tip grows toward the ground. The first thing within the striking distance of a tip wins.' : note}</p>
          <div class="row"><span>Striking distance</span><b>${Math.round(R * U)} m</b></div>
          <div class="row"><span>Peak current</span><b>${st.kA.toFixed(0)} kA</b></div>`;
      },
    };
  },
};
