# Left-Handed

A left-handed guitar reference. React + Vite.

Two views, switchable from the top nav:

- **Amazing Grace** — the hymn as a left-handed tab (key of G, open position), plus
  a mirrored fretboard showing the five notes it uses.
- **Scales** — nine common scales in the key of E, as left-handed fretboard
  diagrams across all positions.

## Left-handed convention

The fretboard diagrams are a horizontal mirror of a standard right-handed chart:
the nut is on the right, fret 1 is nearest the nut, and string order is unchanged
(high e on top, low E on bottom).

Note that a tab's fret numbers are the same for right- and left-handed players. You
fret the same number on the same string either way, so the tab is not mirrored. What
flips for a lefty is the view of the neck, which is why the fretboard diagrams are
mirrored and the tab is not.

## Run

```
npm install
npm run dev
```

Then open the printed URL (default http://localhost:5173/).

## Structure

- `src/App.jsx` — view toggle and the Scales reference.
- `src/AmazingGrace.jsx` — the Amazing Grace tab and its left-handed fretboard.
