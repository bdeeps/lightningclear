// Chapter 6: above the storm. Strong storms can also trigger glows far overhead: red sprites (about 50 to 90 km up,
// often after strong positive cloud-to-ground strokes), elves (a flat ring of light at about 90 km, hundreds of km
// across, lasting under a millisecond), blue jets and gigantic jets (cones climbing from the cloud top), and terrestrial
// gamma-ray flashes (about a millisecond of gamma rays seen by satellites). Worldwide there are roughly 40 to 50
// flashes every second (about 44/s in Christian et al. 2003, from NASA's Optical Transient Detector).
// Shapes are cartoons and the drawing is squashed: real elves are far wider than they are high.
import { THREE, M } from '../kit.js';
import { V, COL, clamp, cloud, ground, sky, growBolt, Bolt, glowBall, fmt } from '../storm.js';

const T = {
  sprite: { n: 'Red sprite', alt: 'About 50 to 90 km up', dur: 'A few to tens of milliseconds', say: 'A red, tendrilled glow high above a big storm, often after a strong positive stroke to the ground. The storm’s electric field reaches up into the thin air.' },
  elf: { n: 'Elve', alt: 'About 90 km up', dur: 'Under a millisecond', say: 'A faint ring of light that spreads outward at nearly the speed of light, made when the electromagnetic pulse of a strong stroke hits the lower ionosphere. It can be hundreds of kilometres across. Not to scale here.' },
  jet: { n: 'Blue jet', alt: 'Up to about 40 to 50 km', dur: 'A fraction of a second', say: 'A blue cone that climbs from the top of a storm cloud and fades out in the stratosphere.' },
  giant: { n: 'Gigantic jet', alt: 'Up to about 90 km', dur: 'A fraction of a second', say: 'A jet that keeps going and reaches the lower ionosphere, linking the cloud top to the upper atmosphere. Rare.' },
  tgf: { n: 'Terrestrial gamma-ray flash', alt: 'Made at about 10 to 15 km, seen from space', dur: 'About a millisecond or less', say: 'A burst of gamma rays from inside a thunderstorm, seen by orbiting satellites. It is made by very fast electrons slowed down in the air, and it is still being studied.' },
};
const LAYER = { sprite: [52, 86], giant: [16, 86], jet: [16, 44] };

export default {
  id: 'high',
  short: 'Above the storm',
  title: 'Sprites, jets and gamma flashes',
  subtitle: 'Lightning also lights up the sky above the cloud, and the world flashes about 44 times a second.',
  view: { pos: [18, 36, 98], target: [0, 33, 0] },
  learn: `<p>A big storm does not stop at the cloud top. Above it, brief glows flicker in the thin air: red <b>sprites</b>, ring-shaped <b>elves</b>, blue <b>jets</b> and the rare <b>gigantic jets</b>. Sprites and elves are triggered by the electric field and the electromagnetic pulse from very strong strokes. Jets climb straight out of the cloud top.</p>
    <p>Storms also make <b>terrestrial gamma-ray flashes</b>: about a millisecond of gamma rays that satellites in orbit have recorded. They are a sign that, somewhere in a storm, electrons are being accelerated to very high energies.</p>
    <p>All of this is tiny next to the whole picture. Satellites such as NASA’s Lightning Imaging Sensor and the GOES Geostationary Lightning Mapper count about <b>40 to 50 flashes every second</b> around the planet, over a billion a year. Lightning is not rare. It is happening right now.</p>
    <p class="tip"><b>Try it:</b> pick each phenomenon and watch where it appears. The counter shows how many flashes the world has made since you opened this chapter.</p>
    <p class="note">The drawing is squashed and the shapes are cartoons. Elves are really far wider than they are tall, and sprites vary a lot from one to the next.</p>`,
  terms: [
    { t: 'Sprite', d: 'A red, brief glow high above a thundercloud, roughly 50 to 90 km up.' },
    { t: 'Elve', d: 'A faint, flat ring of light at about 90 km that spreads outward in under a millisecond.' },
    { t: 'Gamma-ray flash', d: 'A very short burst of gamma rays made inside a storm and seen from space.' },
    { t: 'Lightning mapper', d: 'A satellite camera that watches for lightning flashes over a whole hemisphere.' },
  ],
  defaults: { what: 'sprite' },
  controls: [{ key: 'what', type: 'seg', label: 'Phenomenon', options: [{ v: 'sprite', label: 'Sprite' }, { v: 'elf', label: 'Elve' }, { v: 'jet', label: 'Blue jet' }, { v: 'giant', label: 'Gigantic jet' }, { v: 'tgf', label: 'Gamma flash' }] }],
  quiz: [
    { q: 'About how many lightning flashes happen around the world each second?', options: ['About 1', 'About 4', 'About 40 to 50', 'About 5,000'], answer: 2, why: 'Satellite counts give roughly 40 to 50 flashes per second, over a billion a year.' },
    { q: 'Where do red sprites appear?', options: ['Inside the cloud', 'Far above a big storm, roughly 50 to 90 km up', 'On the ground', 'Only at the poles'], answer: 1, why: 'They glow in the thin air high above large thunderstorms.' },
    { q: 'How are terrestrial gamma-ray flashes detected?', options: ['By eye', 'By satellites in orbit', 'By thermometers', 'By microphones'], answer: 1, why: 'The gamma rays escape upward and orbiting detectors have recorded them.' },
  ],
  reel: [
    { ms: 5200, caption: 'Above the storm, red sprites flicker about 50 to 90 km up.', set: { what: 'sprite' }, view: { pos: [18, 40, 92], target: [0, 38, 0] }, spin: 0 },
  ],
  build({ stage, s }) {
    ground(stage, { size: 90, cells: 36 });
    const skyc = sky(stage, { base: 0x05070e, flash: 0x3a4a80, pos: [0, 14, 4], gain: 6 });
    const root = new THREE.Group(); root.scale.setScalar(0.7); stage.root.add(root);
    const cl = [cloud({ seed: 4, count: 50, center: [0, 7.5, 0], spread: [7, 5, 6], size: [5, 9], opacity: 0.17, color: 0x98a3be }), cloud({ seed: 9, count: 26, center: [3, 14, 0], spread: [13, 1.2, 6], size: [5, 8], opacity: 0.17, color: 0xa4aec8 })];
    cl.forEach((c) => root.add(c));
    // altitude ruler
    const ruler = new THREE.Mesh(new THREE.BoxGeometry(0.15, 100, 0.15), M.glow(0x56627d)); ruler.position.set(-26, 50, 0); root.add(ruler);
    [10, 20, 40, 60, 80, 100].forEach((k) => { const t = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.15), M.glow(0x56627d)); t.position.set(-26, k, 0); root.add(t); stage.label(`${k} km`, [-30, k, 0], root); });
    const band = new THREE.Mesh(new THREE.CylinderGeometry(24, 24, 36, 48, 1, true), M.ghost(0xff5d4a, 0.018)); band.position.y = 70; root.add(band);
    stage.label('Airliners fly at about 10 km', [27, 10, 0], root); stage.label('Storm tops: about 12 to 16 km', [-27, 17, 0], root);
    stage.label('Satellites orbit far above this (hundreds of km)', [0, 104, 0], root);
    // elve ring, tgf cone
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 96), M.ghost(0xff8a5a, 0.9)); ring.rotation.x = -Math.PI / 2; ring.position.y = 90; root.add(ring);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 32, 1, true), M.ghost(0xc49bff, 0.3)); root.add(cone);
    const bolts = {};
    const mk = (id, a, b, tint, opt) => {
      const goalY = b;
      const g = growBolt({ seed: 5, start: V(0, a, 0), step: id === 'sprite' ? 1.5 : 1.1, jitter: opt.jit, persist: 0.35, branchP: opt.br, maxTips: opt.tips, spread: opt.spread, deathP: 0.04, aim: () => V(0, opt.up ? 1 : -1, 0), reach: (p) => ((opt.up ? p.y >= goalY : p.y <= goalY) ? { point: p.clone() } : null), maxGen: 120 });
      const bl = new Bolt(stage, g.segs, { core: opt.core, glow: opt.glow, glowTint: tint[1] }); bl.tint = tint[0]; bl.G = g.G + 1; bl.obj.renderOrder = 10; root.add(bl.obj); bolts[id] = bl;
    };
    mk('sprite', 86, 52, [[1, 0.25, 0.18], 0xc0301f], { jit: 0.9, br: 0.3, tips: 22, spread: 1.0, core: 2.4, glow: 10 });
    mk('jet', 15, 44, [[0.45, 0.6, 1], 0x3a50ff], { jit: 0.7, br: 0.28, tips: 20, spread: 0.9, core: 2.2, glow: 9, up: true });
    mk('giant', 15, 86, [[0.5, 0.65, 1], 0x3a50ff], { jit: 0.65, br: 0.25, tips: 20, spread: 0.8, core: 2.4, glow: 10, up: true });
    let tt = 0, world = 0, cur = '';
    return {
      update(dt, st) {
        dt = Math.min(dt, 0.05); tt += dt; world += dt * 44; if (tt > 4.5) tt = 0;
        const w = st.what, ev = tt - 0.5, env = ev > 0 ? Math.exp(-ev / 0.5) * (0.85 + 0.15 * Math.sin(ev * 60)) : 0, k = clamp(ev / 0.35, 0, 1);
        const cf = w === 'tgf' ? (ev > 0 ? Math.exp(-ev / 0.12) : 0) : (ev > 0 ? Math.exp(-ev / 0.25) * 0.6 : 0);
        cl.forEach((c) => c.flash(cf * 0.8)); skyc.set(cf * 0.6);
        Object.entries(bolts).forEach(([id, b]) => { b.obj.visible = w === id; if (w === id) b.set((sg) => [ev > 0 && sg.gen <= k * b.G ? (sg.main ? 1 : 0.75) * env : 0, 0.15]); });
        ring.visible = w === 'elf' && ev > 0; const rr = 2 + 30 * Math.min(1, ev / 0.3); ring.scale.set(rr, rr, 1); ring.material.opacity = 0.9 * Math.exp(-Math.max(0, ev - 0.15) / 0.2);
        cone.visible = w === 'tgf' && ev > 0; const hh = 6 + 70 * Math.min(1, ev / 0.25); cone.scale.set(14 + hh * 0.3, hh, 14 + hh * 0.3); cone.position.y = 12 + hh / 2; cone.material.opacity = 0.35 * Math.exp(-Math.max(0, ev - 0.12) / 0.2);
        band.visible = w === 'sprite'; cur = w;
      },
      readout(st) {
        const t = T[st.what];
        return `<div class="big">${t.n}</div><p class="r-say">${t.say}</p>
          <div class="row"><span>Altitude</span><b>${t.alt}</b></div><div class="row"><span>Lasts</span><b>${t.dur}</b></div>
          <div class="row"><span>Flashes worldwide since you opened this</span><b>${fmt(Math.floor(world))}</b></div>`;
      },
    };
  },
};
