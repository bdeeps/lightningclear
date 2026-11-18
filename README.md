<!-- glassbox:start -->
<!-- Generated from glassbox.json by the Glassbox hub (npm run readme -- lightningclear). Edit glassbox.json, not this block. -->

<h1 align="center">LightningClear</h1>

<p align="center"><b>How do lightning and thunder work?</b><br>A bolt is hotter than the Sun's surface, and what you see runs upward, not down. Watch a storm charge, a leader find the ground, and thunder race the light.</p>

<p align="center"><a href="https://glassbox.how/lightningclear/"><b>▶ Play with it</b></a> &nbsp;·&nbsp; <a href="https://glassbox.how/e/lightningclear/">Read the 60-second explainer</a></p>

<p align="center">
  <a href="https://glassbox.how/e/lightningclear/"><img alt="Glassbox No. 234" src="https://img.shields.io/badge/Glassbox-No.%20234-8ef0ff"></a>
  <a href="https://glassbox.how/e/lightningclear/"><img alt="Physics" src="https://img.shields.io/badge/field-Physics-7aa2ff"></a>
  <a href="LICENSE"><img alt="Code: MIT" src="https://img.shields.io/badge/code-MIT-3fb950"></a>
  <a href="LICENSE-CONTENT.md"><img alt="Content: CC BY 4.0" src="https://img.shields.io/badge/content-CC%20BY%204.0-ef9421"></a>
  <a href="#privacy"><img alt="Privacy: explained" src="https://img.shields.io/badge/privacy-explained-555"></a>
</p>

## In 60 seconds

1. **A cloud sorts itself into charges.** In a strong updraft, light ice crystals rise and heavy graupel hovers or falls. Their collisions swap charge. The usual picture has positive charge on top, negative in the middle and a small positive pocket below. Scientists still research the details.
2. **A faint leader finds the ground.** A branching stepped leader creeps down from the cloud in steps of tens of metres. Near the ground, streamers rise from tall and pointed things to meet it. The first connection wins.
3. **The bright flash runs upward.** When the path is complete, a return stroke races up the channel at roughly a third of light speed with tens of thousands of amps. A flash often has several strokes, which is why it flickers.
4. **Thunder is a shock wave.** The channel heats to about 30,000 K in microseconds. The air expands faster than sound, and the shock fades into thunder. It rumbles because sound from a long, crooked channel arrives at different times.
5. **Count to find the distance.** Light is instant. Sound takes about 3 seconds per kilometre, or 5 seconds per mile. If the gap is 30 seconds or less, go indoors, and wait 30 minutes after the last thunder.
6. **A rod makes the strike safe.** A rod does not pull lightning from afar. It gives a strike a safe path to the ground. Above storms, sprites, jets and gamma flashes show how far a storm's electricity reaches, and the Earth flashes about 44 times a second.

## Words worth knowing

| Term | Meaning |
|---|---|
| **Updraft** | Air rising inside a storm, often tens of metres per second in strong ones. |
| **Graupel** | Soft, rimed ice pellets that collide with ice crystals and swap charge. |
| **Tripole** | The common picture of a thundercloud: positive top, negative middle, small positive base. |
| **Stepped leader** | The faint, branching channel that creeps down from a cloud in steps and finds the ground. |
| **Streamer** | A short discharge that grows from a pointed object toward an approaching leader. |
| **Return stroke** | The bright current pulse that runs up the finished channel. It is the flash you see. |
| **Dart leader** | A smooth, fast leader that runs down an old channel before a later stroke. |
| **Shock wave** | A pressure jump faster than sound, made by the sudden heating of the channel. It fades into thunder. |
| **Rolling sphere** | An engineering method: roll a ball the size of the striking distance over a structure to find where lightning can strike. |
| **Sprite** | A red glow high above a big thundercloud, roughly 50 to 90 km up. |

## A short history

**From a thunder god's weapon to satellites that watch every flash.**

- **350 BCE** · Aristotle blames a dry exhalation (Aristotle, Greece)
- **80** · Wang Chong says Heaven is not angry (Wang Chong, Shangyu, Kuaiji, China)
- **1752** · Sparks from a storm cloud in France (Thomas-François Dalibard and Delor, Marly-la-Ville, France)
- **1752** · Franklin's kite (Benjamin Franklin, Philadelphia, USA)
- **1753** · Richmann is killed by lightning (Georg Wilhelm Richmann, St Petersburg, Russia)
- **1754** · The first grounded rod in Moravia (Prokop Diviš, Přímětice, Moravia)
- **1935** · Schonland films the stepped leader (Basil Schonland, Johannesburg, South Africa)
- **1989** · Sprites are caught on camera (Robert Franz, Robert Nemzek and John Winckler, Minnesota, USA)

The full story, with 31 moments, charts, people and 36 sources: [glassbox.how/e/lightningclear/history](https://glassbox.how/e/lightningclear/history/). The data lives in [`history.json`](history.json).

## Privacy

This box has no accounts and no ads, and it ships its own fonts and libraries. When you run it yourself it sends nothing anywhere. On glassbox.how, the site's `/bar.js` also loads Glassbox's analytics: **Google Analytics** to count visits (it asks first in the EU, UK and Switzerland, and stays off when your browser sends Global Privacy Control or Do Not Track) and **ClickTrust** to detect bots.

It remembers a few things **in your own browser only**, and never sends them anywhere:

| Browser storage key | What it holds |
|---|---|
| `lightningclear.v1` | Which chapters you have opened, your best quiz scores, and sound on or off. |

Exactly what each one sees is at [glassbox.how/privacy](https://glassbox.how/privacy/).

## Licences

- **Code:** [MIT](LICENSE). Use it, change it, ship it.
- **Explanations, text, images and videos** (`glassbox.json`, `glassbox/`): [CC BY 4.0](LICENSE-CONTENT.md). Credit “Glassbox, glassbox.how/e/lightningclear”.
- **Third-party parts** keep their own licences: [three.js](https://threejs.org) (MIT), [Geist, Instrument Serif](https://openfontlicense.org) (SIL OFL 1.1).
- The Glassbox name and logo aren't covered by either licence. See the [terms](https://glassbox.how/terms/).

Found a mistake? [Open an issue](https://github.com/bdeeps/lightningclear/issues). Corrections happen in public.
<!-- glassbox:end -->

## Run it

It's plain HTML, CSS and JavaScript. No build step and no dependencies. Run locally, it contacts no other website.

```bash
python3 -m http.server 8000
```

Three.js and the fonts ship in `vendor/` and `fonts/`, so it also works offline.

Then open http://localhost:8000.

## How it's built

| File | What |
|---|---|
| `index.html`, `css/app.css` | The page and its styles |
| `js/app.js`, `js/stage.js`, `js/ui.js`, `js/kit.js` | The shared Glassbox 3D engine: chapters, 3D stage, controls, quiz, video director |
| `js/chapters/*.js` | One file per chapter: the 3D model, controls, text, key terms, quiz and video scenes |
| `glassbox.json` | Title, question, explainer beats, key terms, browser storage and credits shown on glassbox.how |
| `reel` in each chapter | The storyboard the Glassbox studio records into short videos |
| `glassbox/` | The published video, slides, thumbnail and post copy |
| `fonts/`, `vendor/three/` | Self-hosted Geist and Instrument Serif (SIL OFL 1.1) and three.js (MIT) |
