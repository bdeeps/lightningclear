// Chapter 5: the many kinds of lightning. Most flashes never reach the ground: they run inside a cloud (intracloud)
// or between clouds. Of those that do, most lower negative charge from the cloud's middle layer (negative
// cloud-to-ground). Positive cloud-to-ground flashes start from the positive upper part of a storm, often from the
// anvil, can land many kilometres from the rain core ("bolt from the blue"), and often carry larger peak currents.
// Ball lightning is reported but unexplained. Bolt shapes are generated at random; they show the kinds, not real paths.
import { THREE, M } from '../kit.js';
import { V, COL, clamp, cloud, ground, sky, growBolt, Bolt } from '../storm.js';

const KINDS = {
  cgn: { n: 'Negative cloud-to-ground', start: [-3, 6.6, 0], goal: [-3.6, 0, 0], ground: true, say: 'The classic bolt. The leader carries negative charge from the middle of the cloud down to the ground. Most flashes that strike the ground are of this kind.', facts: 'Typical peak current: tens of kiloamps', flat: 0 },
  cgp: { n: 'Positive cloud-to-ground', start: [-3, 10.2, 0], goal: [5.2, 0, 0], ground: true, say: 'It starts from the positive top of the storm, often the anvil, and can land many kilometres from the rain, so it can seem to come out of a blue sky. It is less common, and often carries more current.', facts: 'Can strike 10+ miles (16+ km) from the storm', flat: 0.45 },
  ic: { n: 'Intracloud', start: [-3, 6.9, 0], goal: [-3.2, 10, 0.4], ground: false, say: 'A spark between the negative and positive layers of the same cloud. This is the most common kind, and the one that never touches the ground. It lights the whole cloud up.', facts: 'Most flashes never reach the ground', flat: 0 },
  cc: { n: 'Cloud-to-cloud', start: [-1.8, 7.3, 0], goal: [7.2, 6.2, 0.4], ground: false, say: 'A channel that jumps from one cloud to another, sometimes across many kilometres of clear sky.', facts: 'Often seen as sheet or crawling lightning', flat: 0.3 },
};

export default {
  id: 'kinds',
  short: 'Kinds of lightning',
  title: 'Not all lightning is the same',
  subtitle: 'Most of it never touches the ground.',
  view: { pos: [3, 6.5, 26], target: [2, 5.5, 0] },
  learn: `<p>When people picture lightning they picture a bolt hitting the ground, but <b>most lightning stays in the sky</b>. A spark inside a cloud (<b>intracloud</b>) or between clouds is far more common than a strike on the ground. Of the flashes that do reach the ground, most are <b>negative</b>: they carry negative charge down from the middle of the storm.</p>
    <p><b>Positive</b> lightning is the odd one out. It starts at the positive top of a storm, and the anvil can stretch far downwind, so the stroke can land well outside the rain. That is the "bolt from the blue". Positive strokes are rarer but often carry more current and can last longer.</p>
    <p><b>Ball lightning</b> is different again. People have reported glowing spheres drifting through the air for centuries, often during storms. There are a few rare recordings, yet there is still no agreed explanation of what they are.</p>
    <p class="tip"><b>Try it:</b> pick each kind, then press <b>Again</b> for a different bolt. Watch where each one starts and where it ends.</p>`,
  terms: [
    { t: 'Intracloud', d: 'Lightning that stays inside a single cloud.' },
    { t: 'Anvil', d: 'The flat spreading top of a big thundercloud, pushed downwind by the high-altitude winds.' },
    { t: 'Bolt from the blue', d: 'A positive stroke that lands far from the storm, where the sky overhead may look clear.' },
  ],
  defaults: { kind: 'cgn', seed: 4 },
  controls: [
    { key: 'kind', type: 'seg', label: 'Kind', options: [{ v: 'cgn', label: 'Cloud–ground −' }, { v: 'cgp', label: 'Cloud–ground +' }, { v: 'ic', label: 'Inside a cloud' }, { v: 'cc', label: 'Cloud to cloud' }] },
    { key: 'go', type: 'buttons', label: 'Lightning', items: [{ label: 'Again', act: (s) => { s.seed = (s.seed * 5 + 3) % 997; } }] },
  ],
  quiz: [
    { q: 'Which kind of lightning is the most common?', options: ['Cloud-to-ground', 'Lightning that stays in or between clouds', 'Positive lightning', 'Ball lightning'], answer: 1, why: 'Most flashes never reach the ground.' },
    { q: 'Why can positive lightning strike far from the rain?', options: ['It is faster', 'It starts at the anvil, which spreads far from the rain core', 'It ignores the ground', 'It bounces off the sun'], answer: 1, why: 'The positive charge sits at the top and the anvil, which can extend many kilometres downwind.' },
  ],
  reel: [
    { ms: 5000, caption: 'Positive lightning starts at the anvil and can land miles from the rain: a bolt from the blue.', set: { kind: 'cgp', seed: 4 }, view: { pos: [4, 6, 24], target: [2, 5, 0] }, spin: 0 },
  ],
  build({ stage, s }) {
    ground(stage, { size: 60, cells: 60 });
    const skyc = sky(stage, { base: 0x080b16, flash: 0x3a4a80, pos: [0, 6, 4], gain: 5 });
    const root = new THREE.Group(); stage.root.add(root);
    const A = [cloud({ seed: 4, count: 46, center: [-3, 6.8, 0], spread: [2.9, 4.2, 2.9], size: [2.4, 4.4], opacity: 0.17, color: 0x98a3be }), cloud({ seed: 9, count: 26, center: [1.5, 10.4, 0], spread: [5.6, 0.7, 2.6], size: [2.4, 4.2], opacity: 0.17, color: 0xa4aec8 }), cloud({ seed: 2, count: 14, center: [-3, 2.9, 0], spread: [3.2, 0.5, 3.2], size: [2.2, 3.4], opacity: 0.2, color: 0x717b96 }), cloud({ seed: 33, count: 30, center: [7.5, 6, 0], spread: [2.5, 1.8, 2.2], size: [2.2, 3.8], opacity: 0.17, color: 0x8892ac })];
    A.forEach((c) => root.add(c));
    const lab = (t, p, c) => { const l = stage.label(t, p, root, 'hot'); l.element.style.color = c; return l; };
    lab('+', [-3, 10.4, 1.8], '#ff9a4d'); lab('−', [-3, 7.2, 1.8], '#6fb7ff'); lab('+', [-3, 4.4, 1.8], '#ff9a4d');
    let bolt = null, key = '', tt = 0, K = null, G = 0;
    function regrow(st) {
      bolt?.dispose(); key = st.kind + '|' + st.seed; K = KINDS[st.kind];
      const goal = V(...K.goal);
      const g = growBolt({ seed: st.seed, start: V(...K.start), step: K.ground ? 0.3 : 0.28, jitter: 0.7, persist: 0.45, branchP: 0.15, maxTips: 10, flatten: K.flat, aim: (p) => goal.clone().sub(p), reach: (p) => (p.distanceTo(goal) < (K.ground ? 0.3 : 0.5) ? { point: goal.clone() } : null), maxGen: 160 });
      G = g.G; bolt = new Bolt(stage, g.segs, { core: 2.6, glow: 11 }); bolt.obj.renderOrder = 10; root.add(bolt.obj); tt = 0;
    }
    regrow(s);
    return {
      update(dt, st) {
        dt = Math.min(dt, 0.05);
        if (st.kind + '|' + st.seed !== key) regrow(st);
        tt += dt; if (tt > 4.5) tt = 0;
        const reveal = clamp(tt / 0.6, 0, 1) * (G + 4), env = tt < 0.6 ? 0.45 : tt < 1.6 ? Math.exp(-(tt - 0.6) / 0.35) * (0.8 + 0.2 * Math.sin(tt * 70)) + 0.05 : 0;
        const cg = K.ground, ret = tt > 0.6 ? Math.exp(-(tt - 0.6) / 0.3) : 0;
        bolt.set((sg) => (sg.gen <= reveal ? [(sg.main ? 1 : 0.7) * (tt < 0.6 ? 0.45 : env), tt < 0.6 ? 0.1 : 1] : [0, 0]));
        const f = tt > 0.6 && tt < 2 ? ret * 0.8 : 0;
        A.forEach((c) => c.flash(cg ? f * 0.3 : f)); skyc.set(f * 0.7);
      },
      readout(st) { const k = KINDS[st.kind]; return `<div class="big">${k.n}</div><p class="r-say">${k.say}</p><div class="row"><span>Good to know</span><b>${k.facts}</b></div>`; },
    };
  },
};
