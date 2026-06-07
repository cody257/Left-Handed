# Left-Handed

Guitar references (scales and tabs) **mirrored for left-handed players**. React + Vite.

Most guitar resources online are drawn for right-handed players, leaving lefties
to mentally flip every diagram. **Left-Handed** does the flipping for you: every
chart is rendered in a true left-handed orientation, so what you see on screen
matches what you see looking down at your own fretboard.

Two views, switchable from the top nav:

- **Amazing Grace** the hymn as a left-handed tab (key of G, open position), plus
  a mirrored fretboard of the five notes the melody uses.
- **Scales** nine common scales in the key of E, as left-handed fretboard
  diagrams across all positions.

## Left-handed chart convention

All diagrams use a horizontal mirror of the standard right-handed chart:

- High **e** string on top, low **E** on the bottom (same as tab).
- **Nut on the right.** Fret 1 is rightmost (next to the nut); higher frets
  run to the left.
- String names are shown to the right of the nut.

Note that a tab's fret numbers are the same for right- and left-handed players.
You fret the same number on the same string either way, so the tab is not
mirrored. What flips for a lefty is the view of the neck, which is why the
fretboard diagrams are mirrored and the tab is not.

## Scales reference

An interactive, responsive fretboard reference covering 9 scales in the key of
**E**, standard tuning (E A D G B e), across the first 15 frets:

- Major (Ionian)
- Natural Minor (Aeolian)
- Major Pentatonic
- Minor Pentatonic
- Blues
- Dorian
- Mixolydian
- Phrygian
- Harmonic Minor

Notes are color-coded by scale degree: **root**, **scale tone**,
**flat / blue note**, and **5th**.

## Roadmap

- [ ] Chord library (left-handed chord diagrams)
- [ ] More songs as left-handed tabs
- [ ] Selectable root key and alternate tunings
- [ ] Audio playback

## Tech stack

- [React 18](https://react.dev/)
- [Vite](https://vite.dev/) for dev server and build
- HTML Canvas for fretboard rendering (no charting dependencies)

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5180)
npm run build    # production build to dist/
npm run preview  # preview the production build locally
```

## Deployment (Cloudflare Pages)

This project deploys as a [Cloudflare Pages](https://pages.cloudflare.com/) site.
When connecting the repository in the Cloudflare dashboard, use:

| Setting                | Value           |
| ---------------------- | --------------- |
| Framework preset       | Vite            |
| Build command          | `npm run build` |
| Build output directory | `dist`          |

Every push to the connected branch triggers a new deployment.

## Structure

- `src/App.jsx` view toggle and the Scales reference.
- `src/AmazingGrace.jsx` the Amazing Grace tab and its left-handed fretboard.
- `src/main.jsx` React entry point.
