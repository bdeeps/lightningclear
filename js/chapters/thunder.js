// Chapter 3: the channel and thunder. A return stroke heats the channel, a few millimetres to a couple of
// centimetres wide, to around 30,000 K in microseconds (Orville 1968 measured about 30,000 K from spectra).
// The air expands faster than sound, which drives a shock wave that weakens into ordinary sound within roughly
// ten metres or so. Sound travels at about 343 m/s in 20 °C air (331.3 + 0.606 T m/s), so each kilometre takes
// about three seconds and each mile about five. Light is effectively instant. Because the channel is kilometres
// long and crooked, sound from its different parts reaches you at different times, which is why thunder rumbles.
// The model uses a straight cylinder wave and ignores wind, temperature layers and echoes.
import { THREE, M } from '../kit.js';
import { V, COL, clamp, cloud, ground, sky, growBolt, Bolt, glowBall, fmt } from '../storm.js';

const c20 = 343;
const cOf = (t) => 331.3 + 0.606 * t; // m/s at air temperature t (°C)

export default {
  id: 'thunder',
  short: 'Thunder and the delay',
  title: 'The channel and thunder',
  subtitle: 'A thin channel of air, heated to about 30,000 K, shouts at the whole sky.',
  view: { pos: [3.5, 3.6, 12], target: [1.6, 2.2, 0] },
  learn: `<p>The return stroke drives a huge current through a channel only a few centimetres wide. In microseconds it heats the air in it to roughly <b>30,000 K</b>, about five times hotter than the surface of the Sun. The superheated air expands faster than sound, which sends out a <b>shock wave</b>. Within a short distance, around ten metres or so, the shock weakens into an ordinary sound wave. That sound is <b>thunder</b>.</p>
    <p>Light reaches you almost instantly, but sound takes about <b>3 seconds per kilometre</b>, or about <b>5 seconds per mile</b>. Count the seconds between flash and bang, divide by three for kilometres or by five for miles, and you have the distance.</p>
    <p>Thunder <b>rumbles</b> for three reasons. The channel is kilometres long, so sound from its bottom reaches you first and sound from its top much later. The channel is crooked and branched, so different bends send sound in different directions. And air layers, hills and clouds bend and echo the sound. Close up you hear a sharp crack first. Far away only the low rumble gets through.</p>
    <p class="tip"><b>Try it:</b> change the delay and watch the sound front. The amber ball shows which part of the channel you are hearing right now: it climbs the bolt during the rumble. Then make the bolt longer.</p>
    <p class="note">The numbers on the readout come from the speed of sound only. Wind, heat layers and hills change what you hear, and the flash can be hidden behind rain or hills even when the bolt is close.</p>
    <p class="tip"><b>The 30-30 rule</b> is a common safety guide: if the delay between flash and bang is 30 seconds or less, go indoors, and wait 30 minutes after the last thunder before going back out. If you can hear thunder, you are close enough to be struck.</p>`,
  terms: [
    { t: 'Shock wave', d: 'A pressure jump that travels faster than sound. It weakens into an ordinary sound wave within a short distance of the channel.' },
    { t: 'Speed of sound', d: 'About 343 m/s in air at 20 °C. It is a little faster in warm air and slower in cold air.' },
    { t: 'Flash-to-bang time', d: 'The seconds between seeing the flash and hearing the thunder. About 3 seconds per kilometre.' },
    { t: 'Rumble', d: 'The long roll of thunder, made by sound arriving from different parts of a long, crooked channel at different times.' },
  ],
  defaults: { delay: 9, temp: 20, height: 5, speed: 3, clock: -0.4, playing: true, seed: 11 },
  controls: [
    { key: 'delay', type: 'range', label: 'Flash-to-bang delay', min: 0.5, max: 40, step: 0.1, fmt: (v, s) => `${v.toFixed(1)} s` },
    { key: 'temp', type: 'range', label: 'Air temperature', min: -10, max: 40, step: 1, fmt: (v) => `${v} °C · ${Math.round(cOf(v))} m/s` },
    { key: 'height', type: 'range', label: 'Length of the channel', min: 2, max: 9, step: 0.5, fmt: (v) => `${v} km`, hint: 'Cloud-to-ground channels are often several kilometres long.' },
    { key: 'speed', type: 'seg', label: 'Replay speed', options: [{ v: 1, label: 'Real time' }, { v: 3, label: '3×' }, { v: 10, label: '10×' }] },
    { key: 'go', type: 'buttons', label: 'Lightning', items: [{ label: 'Flash!', act: (s) => { s.clock = -0.4; s.playing = true; } }, { label: 'New bolt', act: (s) => { s.seed = (s.seed * 5 + 1) % 997; s.clock = -0.4; s.playing = true; } }] },
  ],
  quiz: [
    { q: 'You count 15 seconds between flash and bang. About how far away is the strike?', options: ['1.5 km (1 mile)', '5 km (3 miles)', '15 km', '500 m'], answer: 1, why: 'Fifteen seconds at about 3 seconds per kilometre is about 5 km, or about 3 miles.' },
    { q: 'Why does thunder rumble?', options: ['The cloud echoes it only', 'Sound from different parts of a long, crooked channel arrives at different times', 'The channel vibrates like a drum', 'Light interferes with the sound'], answer: 1, why: 'The channel is kilometres long, so its parts are at different distances from you.' },
    { q: 'What makes thunder in the first place?', options: ['Clouds colliding', 'Air in the channel heated to about 30,000 K expanding violently', 'Electrons breaking the sound barrier', 'Rain falling fast'], answer: 1, why: 'The sudden heating makes a shock wave that fades into sound.' },
  ],
  reel: [
    { ms: 5400, caption: 'The channel heats to about 30,000 K in microseconds. The air blasts outward as a shock wave: thunder.', set: { delay: 5, height: 5, speed: 1, playing: false, temp: 20 }, anim: { clock: [-0.1, 6] }, view: { pos: [3, 3.2, 8], target: [0.8, 2.2, 0] }, spin: 0 },
    { ms: 5600, caption: 'Light is instant. Sound takes about 3 seconds per kilometre. Count the gap to find the distance.', set: { delay: 12, height: 5, speed: 1, playing: false, temp: 20 }, anim: { clock: [-0.1, 14] }, view: { pos: [4, 3.6, 12], target: [2.1, 2.2, 0] }, spin: 0 },
  ],
  build({ stage, s }) {
    ground(stage, { size: 60, cells: 60 });
    const skyc = sky(stage, { base: 0x080b16, flash: 0x3a4a80, pos: [2, 4, 1], gain: 5 });
    const root = new THREE.Group(); stage.root.add(root);
    const cl = cloud({ seed: 21, count: 60, center: [3, 6.2, 0], spread: [9, 1.2, 5], size: [3.5, 6], opacity: 0.22, color: 0x7d88a6 }); root.add(cl);
    const chan = new THREE.Group(); root.add(chan);
    // observer
    const you = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 10), M.glow(0x5ce1a9)), head = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), M.glow(0x5ce1a9));
    body.position.y = 0.06; head.position.y = 0.16; you.add(body, head); root.add(you);
    stage.label('You', [0, 0.4, 0], you, 'hot');
    // the sound wave: a cylinder around the channel, and a ring on the ground
    const waveMat = M.ghost(0xffd24a, 0.1), wave = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 72, 1, true), waveMat); chan.add(wave);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.97, 1, 96), M.ghost(0xffd24a, 0.8)); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02; chan.add(ring);
    const mark = glowBall(0.1, 0xffb547); chan.add(mark);
    const pathLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0, 0, 0), V(1, 1, 0)]), new THREE.LineBasicMaterial({ color: 0xffb547, transparent: true, opacity: 0.7 })); root.add(pathLine);
    const lbHot = stage.label('Channel: about 30,000 K for microseconds', [0.35, 2, 0], chan, 'hot');
    const lbSound = stage.label('Sound front', [0, 0.3, 0], chan);

    let bolt = null, geom = null, bseed = -1, bh = -1, lastD = -1, frameT = 0, t = s.clock;
    const dist = (st) => (st.delay * cOf(st.temp)) / 1000; // km
    function regrow(st) {
      bolt?.dispose(); bseed = st.seed; bh = st.height;
      geom = growBolt({ seed: bseed, start: V(0, st.height, 0), step: 0.2, jitter: 0.75, persist: 0.45, branchP: 0.07, maxTips: 6, spread: 1, reach: (p) => (p.y <= 0.12 ? { point: V(p.x, 0, p.z) } : null), maxGen: 200 });
      bolt = new Bolt(stage, geom.segs, { core: 2.6, glow: 10 }); bolt.obj.renderOrder = 10; chan.add(bolt.obj);
      lbHot.position.set(0.4, st.height * 0.55, 0);
    }
    regrow(s);

    const fit = (st) => {
      const D = dist(st), d = Math.max(9, D * 1.05 + 5);
      stage.setView([D / 2 + d * 0.25, d * 0.3, d], [D / 2, Math.min(2.4, st.height / 2.2), 0], 0.8);
    };

    return {
      update(dt, st) {
        if (st.seed !== bseed || st.height !== bh) regrow(st);
        const D = dist(st), c = cOf(st.temp) / 1000, H = st.height; // km, km/s
        chan.position.x = D; skyc.light.position.set(D * 0.6, 3, 1);
        if (!document.body.classList.contains('gb-reel') && st.delay !== lastD) { lastD = st.delay; frameT = 0.3; }
        if (frameT > 0) { frameT -= dt; if (frameT <= 0) fit(st); }
        const tEnd = Math.hypot(D, H) / c + 3;
        if (st.playing) { st.clock += dt * st.speed; if (st.clock > tEnd) st.clock = -0.5; }
        t = st.clock;
        const flash = t >= 0 ? Math.exp(-t / 0.18) * (0.8 + 0.2 * Math.sin(t * 60)) : 0;
        bolt.set((sg) => [t < 0 ? 0 : sg.main ? 0.1 + flash : 0.06 + 0.7 * flash, 0.5 + 0.5 * flash]);
        cl.flash(flash); skyc.set(flash * 0.8);
        // sound
        const r = Math.max(0.001, c * Math.max(0, t));
        wave.visible = ring.visible = t > 0;
        wave.scale.set(r, H, r); wave.position.y = H / 2; waveMat.opacity = 0.1 * Math.exp(-r / 14) + 0.015;
        ring.scale.set(r, r, 1); ring.material.opacity = 0.8 * Math.exp(-r / 8) + 0.06;
        lbSound.visible = t > 0.3 && r < 14; lbSound.position.set(-r, 0.25, 0);
        // which part of the channel are you hearing?
        const reach = c * t, hmax = Math.hypot(D, H);
        let hear = false;
        if (t > 0 && reach >= D && reach <= hmax + 0.05) { const h = Math.sqrt(Math.max(0, reach * reach - D * D)); mark.visible = true; mark.position.set(0, Math.min(H, h), 0); hear = true; }
        else mark.visible = false;
        pathLine.visible = hear;
        if (hear) pathLine.geometry.setFromPoints([V(0, 0.1, 0), V(D, mark.position.y, 0)]);
      },
      readout(st) {
        const D = dist(st), c = cOf(st.temp), H = st.height, rumble = (Math.hypot(D, H) * 1000 - D * 1000) / c;
        const tEnd = Math.hypot(D, H) / (c / 1000) + 3, now = t;
        const first = D / (c / 1000), last = Math.hypot(D, H) / (c / 1000);
        const pos = (x) => clamp(x / tEnd, 0, 1) * 100;
        const heard = now >= first && now <= last ? 'Rumbling' : now > last ? 'Silence again' : now >= 0 ? 'Sound travelling…' : 'Waiting for the flash';
        const tl = `<div style="position:relative;height:30px;margin:8px 2px 4px">
          <div style="position:absolute;left:0;right:0;top:13px;height:3px;border-radius:2px;background:rgba(255,255,255,.14)"></div>
          <div style="position:absolute;left:${pos(first)}%;width:${pos(last) - pos(first)}%;top:9px;height:11px;border-radius:5px;background:rgba(255,181,71,.55)" title="rumble"></div>
          <div style="position:absolute;left:0;top:2px;font-size:13px">⚡</div>
          <div style="position:absolute;left:calc(${pos(Math.max(0, now))}% - 4px);top:8px;width:8px;height:13px;border-radius:4px;background:#fff"></div></div>
          <div class="row" style="font-size:12px"><span>⚡ flash</span><span>first bang · rumble ends</span></div>`;
        const adv = st.delay <= 30 ? '<span class="no">30 seconds or less: lightning is close. Go indoors.</span>' : '<span class="ok">Over 30 seconds, but if you can hear thunder you can still be struck. Head in anyway.</span>';
        return `<div class="big">${fmt(D, 2)} km · ${fmt(D / 1.609344, 2)} miles</div>
          <div class="row"><span>${heard}</span><b>${now < 0 ? '—' : now.toFixed(1) + ' s'}</b></div>${tl}
          <div class="row"><span>Sound speed</span><b>${Math.round(c)} m/s → ${(1000 / c).toFixed(2)} s/km · ${(1609.344 / c).toFixed(1)} s/mile</b></div>
          <div class="row"><span>Light's travel time</span><b>${fmt((D * 1000) / 2.998e8 * 1e6, 0)} µs</b></div>
          <div class="row"><span>Rumble lasts about</span><b>${rumble.toFixed(1)} s (straight channel)</b></div>
          <p class="r-say">${adv}</p>`;
      },
    };
  },
};
