# Left-Handed

Guitar references — scales, chords, and tabs — **mirrored for left-handed players**.

Most guitar resources online are drawn for right-handed players, leaving lefties
to mentally flip every diagram. **Left-Handed** does the flipping for you: every
chart is rendered in a true left-handed orientation so what you see on screen
matches what you see looking down at your own fretboard.

## Status

Early development. The first feature is a **left-handed scales reference**.

### Left-handed chart convention

All diagrams use a horizontal mirror of the standard right-handed chart:

- High **e** string on top, low **E** on the bottom (same as tab).
- **Nut on the right.** Fret 1 is rightmost (next to the nut); higher frets
  run to the left.
- String names are shown to the right of the nut.

## Current feature — Scales reference

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
- [ ] Chord / tab translator: paste a right-handed tab and get it mirrored
- [ ] Selectable root key and alternate tunings
- [ ] Audio playback

## Tech stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for dev server and build
- HTML Canvas for fretboard rendering (no charting dependencies)

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build to dist/
npm run preview  # preview the production build locally
```

## Deployment (Cloudflare Pages)

This project is configured for [Cloudflare Pages](https://pages.cloudflare.com/).
When connecting the repository in the Cloudflare dashboard, use:

| Setting                | Value           |
| ---------------------- | --------------- |
| Framework preset       | Vite            |
| Build command          | `npm run build` |
| Build output directory | `dist`          |

Every push to the connected branch triggers a new deployment.
