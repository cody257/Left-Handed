import { useState, useEffect, useRef, useCallback } from "react";

/*
Standard tuning open string semitones from C0:
6th(E2)=40, 5th(A2)=45, 4th(D3)=50, 3rd(G3)=55, 2nd(B3)=59, 1st(e4)=64

We compute scale degrees by checking if (openSemitone + fret) mod 12
matches any interval in the scale, relative to a chosen root.

Root = E (semitone 4 mod 12) so all scales shown in key of E.
*/

const STRINGS = 6;
const FRETS_SHOWN = 15;
const BASE_FRET_W = 46;
const BASE_STRING_H = 26;
const BASE_MARGIN_L = 14;
const BASE_MARGIN_R = 28;
const BASE_MARGIN_T = 20;
const BASE_MARGIN_B = 18;
const BASE_NUT_W = 8;
const DOT_FRETS = [3, 5, 7, 9, 12, 15];
// LH chart = horizontal mirror of RH chart. Strings keep TAB order: high e on top.
const STRING_NAMES_LH = ["e", "B", "G", "D", "A", "E"];

// Open string pitches in semitones mod 12: E=4, A=9, D=2, G=7, B=11, E=4
const OPEN_SEMI = [4, 9, 2, 7, 11, 4]; // low E to high e

const ROOT_SEMI = 4; // E

const COLORS = {
  root: { fill: "#6e9ef5", stroke: "#3a6ed0", text: "#fff" },
  tone: { fill: "#e07a5f", stroke: "#b5503a", text: "#fff" },
  flat: { fill: "#f2cc6b", stroke: "#c09030", text: "#1a1200" },
  fifth: { fill: "#7ec8a0", stroke: "#3d9e68", text: "#0a2015" },
};

// Scale definitions: intervals in semitones from root, with degree labels
const SCALE_DEFS = [
  {
    name: "Major (Ionian)", color: "#6e9ef5", formula: "1  2  3  4  5  6  7",
    desc: "The foundation of Western music. Bright, happy, resolved.",
    intervals: [
      [0, "R"], [2, "2"], [4, "3"], [5, "4"], [7, "5"], [9, "6"], [11, "7"]
    ],
  },
  {
    name: "Natural Minor (Aeolian)", color: "#a07be8", formula: "1  2  b3  4  5  b6  b7",
    desc: "Dark, emotional, melancholic. Relative to major scale.",
    intervals: [
      [0, "R"], [2, "2"], [3, "b3"], [5, "4"], [7, "5"], [8, "b6"], [10, "b7"]
    ],
  },
  {
    name: "Major Pentatonic", color: "#5ec4c4", formula: "1  2  3  5  6",
    desc: "Five notes of the major scale. Clean, country, folk, pop.",
    intervals: [
      [0, "R"], [2, "2"], [4, "3"], [7, "5"], [9, "6"]
    ],
  },
  {
    name: "Minor Pentatonic", color: "#e07a5f", formula: "1  b3  4  5  b7",
    desc: "Rock, blues, metal go-to. Five notes, endless expression.",
    intervals: [
      [0, "R"], [3, "b3"], [5, "4"], [7, "5"], [10, "b7"]
    ],
  },
  {
    name: "Blues", color: "#f2cc6b", formula: "1  b3  4  b5  5  b7",
    desc: "Minor pentatonic + the blue note (b5). Tension and soul.",
    intervals: [
      [0, "R"], [3, "b3"], [5, "4"], [6, "b5"], [7, "5"], [10, "b7"]
    ],
  },
  {
    name: "Dorian", color: "#8bc34a", formula: "1  2  b3  4  5  6  b7",
    desc: "Minor but with a raised 6th. Jazzy, funky, modal coolness.",
    intervals: [
      [0, "R"], [2, "2"], [3, "b3"], [5, "4"], [7, "5"], [9, "6"], [10, "b7"]
    ],
  },
  {
    name: "Mixolydian", color: "#ff8c69", formula: "1  2  3  4  5  6  b7",
    desc: "Major with a flat 7. Rock, blues-rock, dominant grooves.",
    intervals: [
      [0, "R"], [2, "2"], [4, "3"], [5, "4"], [7, "5"], [9, "6"], [10, "b7"]
    ],
  },
  {
    name: "Phrygian", color: "#c06baa", formula: "1  b2  b3  4  5  b6  b7",
    desc: "Dark, Spanish-flavored, intense. Metal and flamenco favorite.",
    intervals: [
      [0, "R"], [1, "b2"], [3, "b3"], [5, "4"], [7, "5"], [8, "b6"], [10, "b7"]
    ],
  },
  {
    name: "Harmonic Minor", color: "#e8755a", formula: "1  2  b3  4  5  b6  7",
    desc: "Natural minor with raised 7. Exotic, classical, dramatic.",
    intervals: [
      [0, "R"], [2, "2"], [3, "b3"], [5, "4"], [7, "5"], [8, "b6"], [11, "7"]
    ],
  },
];

// Generate note positions for a scale across all strings
function generateNotes(intervals) {
  const intervalMap = new Map();
  intervals.forEach(([semi, deg]) => intervalMap.set(semi, deg));

  const notes = [];
  for (let s = 0; s < STRINGS; s++) {
    const stringNotes = [];
    for (let f = 0; f <= FRETS_SHOWN; f++) {
      const pitch = (OPEN_SEMI[s] + f - ROOT_SEMI + 120) % 12;
      if (intervalMap.has(pitch)) {
        stringNotes.push([f, intervalMap.get(pitch)]);
      }
    }
    notes.push(stringNotes);
  }
  return notes;
}

function colorFor(d) {
  if (d === "R") return COLORS.root;
  if (d === "5") return COLORS.fifth;
  if (typeof d === "string" && d.startsWith("b")) return COLORS.flat;
  return COLORS.tone;
}

function rr(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function ScaleCanvas({ scale, containerWidth }) {
  const canvasRef = useRef(null);

  const draw = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs || !containerWidth) return;

    const notes = generateNotes(scale.intervals);

    const baseW = BASE_MARGIN_L + FRETS_SHOWN * BASE_FRET_W + BASE_NUT_W + BASE_MARGIN_R;
    const s = Math.min(containerWidth / baseW, 1.6);
    const fw = BASE_FRET_W * s;
    const sh = BASE_STRING_H * s;
    const ml = BASE_MARGIN_L * s;
    const mr = BASE_MARGIN_R * s;
    const mt = BASE_MARGIN_T * s;
    const mb = BASE_MARGIN_B * s;
    const nw = BASE_NUT_W * s;
    const totalW = ml + FRETS_SHOWN * fw + nw + mr;
    const totalH = mt + (STRINGS - 1) * sh + mb + 16 * s;
    const dpr = window.devicePixelRatio || 1;

    cvs.width = totalW * dpr;
    cvs.height = totalH * dpr;
    cvs.style.width = totalW + "px";
    cvs.style.height = totalH + "px";
    const ctx = cvs.getContext("2d");
    ctx.scale(dpr, dpr);

    // bg
    ctx.fillStyle = "#12121a";
    ctx.beginPath();
    rr(ctx, 0, 0, totalW, totalH, 6 * s);
    ctx.fill();

    const ox = ml; // fretboard starts here (high frets on left for LH)
    const oy = mt;
    const noteR = Math.max(6, 9 * s);
    const fontSize = Math.max(5, 8 * s);

    // Nut position — LH: nut on right
    const nutX = ox + FRETS_SHOWN * fw;

    // Fret position dots — LH mirrored
    DOT_FRETS.forEach((f) => {
      if (f > FRETS_SHOWN) return;
      const x = ox + (FRETS_SHOWN - f + 0.5) * fw;
      if (f === 12) {
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.beginPath(); ctx.arc(x, oy + sh * 1.5, 3.5 * s, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x, oy + sh * 3.5, 3.5 * s, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        ctx.beginPath(); ctx.arc(x, oy + ((STRINGS - 1) / 2) * sh, 3.5 * s, 0, Math.PI * 2); ctx.fill();
      }
    });

    // Fret lines
    for (let f = 0; f <= FRETS_SHOWN; f++) {
      const x = ox + f * fw;
      ctx.strokeStyle = f === FRETS_SHOWN ? "#3a3a4e" : "#252530";
      ctx.lineWidth = (f === FRETS_SHOWN ? 1.5 : 0.8) * s;
      ctx.beginPath(); ctx.moveTo(x, oy); ctx.lineTo(x, oy + (STRINGS - 1) * sh); ctx.stroke();
    }

    // Nut
    ctx.fillStyle = "#2a2a3a";
    ctx.fillRect(nutX, oy - 4 * s, nw, (STRINGS - 1) * sh + 8 * s);
    ctx.strokeStyle = "#4a4a5e";
    ctx.lineWidth = s;
    ctx.strokeRect(nutX, oy - 4 * s, nw, (STRINGS - 1) * sh + 8 * s);

    // Strings
    for (let i = 0; i < STRINGS; i++) {
      const y = oy + i * sh;
      ctx.strokeStyle = "#3a3a4e";
      ctx.lineWidth = (0.5 + (i / STRINGS) * 1.5) * s;
      ctx.beginPath(); ctx.moveTo(ox, y); ctx.lineTo(nutX + nw, y); ctx.stroke();
    }

    // Fret numbers — LH mirrored
    ctx.fillStyle = "#3a3a4a";
    ctx.font = `${Math.max(7, 9 * s)}px sans-serif`;
    ctx.textAlign = "center";
    for (let f = 1; f <= FRETS_SHOWN; f++) {
      ctx.fillText(f, ox + (FRETS_SHOWN - f + 0.5) * fw, totalH - 4 * s);
    }

    // String names — LH: on the right past nut
    ctx.fillStyle = "#4a4a5a";
    ctx.font = `${Math.max(7, 9 * s)}px sans-serif`;
    ctx.textAlign = "left";
    STRING_NAMES_LH.forEach((n, i) => {
      ctx.fillText(n, nutX + nw + 5 * s, oy + i * sh + 3.5 * s);
    });

    // Notes — LH = RH mirrored horizontally. String order unchanged from TAB:
    // high e on top (visual row 0), low E on bottom (visual row 5).
    // notes array index 0 = low E, so visual row = 5 - origStr.
    notes.forEach((sn, origStr) => {
      const vs = STRINGS - 1 - origStr;
      const y = oy + vs * sh;
      sn.forEach(([fret, deg]) => {
        if (fret > FRETS_SHOWN) return;
        const c = colorFor(deg);
        const x = fret === 0
          ? nutX + nw + 9 * s
          : ox + (FRETS_SHOWN - fret + 0.5) * fw;
        ctx.beginPath(); ctx.arc(x, y, noteR, 0, Math.PI * 2);
        ctx.fillStyle = c.fill; ctx.fill();
        ctx.strokeStyle = c.stroke; ctx.lineWidth = 1.5 * s; ctx.stroke();
        ctx.fillStyle = c.text;
        ctx.font = `${deg === "R" ? "bold " : ""}${fontSize}px sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(deg, x, y + 0.5);
      });
    });
  }, [scale, containerWidth]);

  useEffect(() => { draw(); }, [draw]);

  return <canvas ref={canvasRef} style={{ display: "block", maxWidth: "100%" }} />;
}

export default function App() {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setWidth(e.contentRect.width);
    });
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const legendDot = (bg, border) => ({
    width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
    background: bg, border: `2px solid ${border}`,
  });

  return (
    <div ref={containerRef} style={{
      background: "#0e0e12", color: "#e0ddd8", fontFamily: "'Segoe UI', sans-serif",
      padding: "24px 16px", minHeight: "100vh",
    }}>
      <h1 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 700, letterSpacing: 2, color: "#c8a96e", marginBottom: 4, textTransform: "uppercase" }}>
        Guitar Scales
      </h1>
      <div style={{ textAlign: "center", fontSize: ".75rem", color: "#5a5a6e", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>
        Left-Handed Reference — Key of E — All Positions
      </div>
      <div style={{ textAlign: "center", fontSize: ".65rem", color: "#4a4a5e", letterSpacing: 1, marginBottom: 28 }}>
        Standard Tuning (E A D G B e)
      </div>

      <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
        {[
          ["Root", "#6e9ef5", "#4a7ee8"],
          ["Scale tone", "#e07a5f", "#c55a3f"],
          ["Flat / Blue note", "#f2cc6b", "#d4a83a"],
          ["5th", "#7ec8a0", "#4fae7a"],
        ].map(([label, bg, border]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: ".72rem", color: "#7a7a8e", letterSpacing: 1 }}>
            <div style={legendDot(bg, border)} />
            {label}
          </div>
        ))}
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #1e1e2a", margin: "24px 0" }} />

      {SCALE_DEFS.map((sc, i) => (
        <div key={sc.name}>
          <div style={{ marginBottom: 32 }}>
            <div style={{
              display: "inline-block", background: "#1a1a24", border: "1px solid #2a2a3a",
              borderRadius: 4, padding: "2px 8px", fontSize: ".65rem", color: "#7a7a9e",
              letterSpacing: 2, textTransform: "uppercase", marginBottom: 8,
            }}>
              {sc.formula}
            </div>
            <div style={{ fontSize: ".85rem", fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8, paddingLeft: 2, color: sc.color }}>
              {sc.name}
            </div>
            <div style={{ fontSize: ".68rem", color: "#5a5a6e", letterSpacing: 1, marginBottom: 10, paddingLeft: 2 }}>
              {sc.desc}
            </div>
            <div style={{ overflowX: "auto" }}>
              <ScaleCanvas scale={sc} containerWidth={width} />
            </div>
          </div>
          {i < SCALE_DEFS.length - 1 && (
            <hr style={{ border: "none", borderTop: "1px solid #1e1e2a", margin: "24px 0" }} />
          )}
        </div>
      ))}
    </div>
  );
}
