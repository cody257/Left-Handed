import { useRef, useEffect, useCallback } from "react";

/*
  AMAZING GRACE — left-handed reference.

  Arrangement: key of G major, open position, standard tuning.
  The melody is the G major pentatonic (G A B D E) — the same five notes
  as the Major Pentatonic scale on the Scales page. It sits on three
  strings (D, G, B) and uses mostly open strings, the traditional
  beginner version of this hymn.

  Note -> position used in this arrangement (tab string 1 = high e ... 6 = low E):
    D3 -> string 4 (D), fret 0      E3 -> string 4 (D), fret 2
    G3 -> string 3 (G), fret 0      A3 -> string 3 (G), fret 2
    B3 -> string 2 (B), fret 0      D4 -> string 2 (B), fret 3

  LEFT-HANDED NOTE: a tab's fret numbers are the same for right- and
  left-handed players. You fret the same number on the same string either
  way, so the tab below is not mirrored. What flips for a lefty is the view
  of the neck, so the fretboard diagram IS mirrored (nut on the right,
  fret 1 nearest the nut) to match how a left-handed player sees it and to
  stay consistent with the rest of this reference.

  Source for the melody: noobnotes.net letter notes, cross-checked against a
  key-of-C transcription (identical contour: 5 1 3 1 3 2 1 6 5 ...).
*/

// Each note: s = tab string (1 = high e ... 6 = low E), f = fret, n = note letter.
const N = {
  D3: { s: 4, f: 0, n: "D" },
  E3: { s: 4, f: 2, n: "E" },
  G3: { s: 3, f: 0, n: "G" },
  A3: { s: 3, f: 2, n: "A" },
  B3: { s: 2, f: 0, n: "B" },
  D4: { s: 2, f: 3, n: "D" },
};

const PHRASES = [
  {
    lyric: "A- ma- zing grace, how sweet the sound,",
    notes: [N.D3, N.G3, N.B3, N.G3, N.B3, N.A3, N.G3, N.E3, N.D3],
  },
  {
    lyric: "that saved a wretch like me.",
    notes: [N.D3, N.G3, N.B3, N.G3, N.B3, N.A3, N.D4],
  },
  {
    lyric: "I once was lost, but now am found,",
    notes: [N.B3, N.D4, N.B3, N.G3, N.E3, N.G3, N.E3, N.D3],
  },
  {
    lyric: "was blind, but now I see.",
    notes: [N.D3, N.G3, N.B3, N.G3, N.B3, N.A3, N.G3],
  },
];

// Tab line labels, top to bottom: row 0 = high e (string 1) ... row 5 = low E (string 6).
const TAB_LABELS = ["e", "B", "G", "D", "A", "E"];

function buildTabLines(notes) {
  const w = Math.max(1, ...notes.map((nt) => String(nt.f).length));
  const lines = TAB_LABELS.map(() => "");
  notes.forEach((nt) => {
    for (let row = 0; row < 6; row++) {
      const sNum = row + 1; // row 0 -> string 1 (high e)
      const cell = sNum === nt.s ? String(nt.f).padEnd(w, "-") : "-".repeat(w);
      lines[row] += "-" + cell;
    }
  });
  return lines.map((l, row) => `${TAB_LABELS[row]}|${l}-|`);
}

// ---- Left-handed fretboard diagram (mirror of a standard chart) ----

const STRINGS = 6;
const FRETS = 4;
const DOT_FRETS = [3];

const COLORS = {
  root: { fill: "#6e9ef5", stroke: "#3a6ed0", text: "#fff" }, // G
  fifth: { fill: "#7ec8a0", stroke: "#3d9e68", text: "#0a2015" }, // D
  tone: { fill: "#e07a5f", stroke: "#b5503a", text: "#fff" }, // A B E
};

function colorForNote(n) {
  if (n === "G") return COLORS.root;
  if (n === "D") return COLORS.fifth;
  return COLORS.tone;
}

// String names to the right of the nut, top to bottom (high e ... low E).
const STRING_NAMES_LH = ["e", "B", "G", "D", "A", "E"];

function SongBoard({ width }) {
  const canvasRef = useRef(null);

  const draw = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    // Keep the diagram legible even before the container width is known or on
    // very narrow screens (the parent scrolls horizontally if needed).
    const drawW = Math.max(width || 0, 320);

    // Distinct positions used in the arrangement.
    const seen = new Set();
    const positions = [];
    PHRASES.forEach((p) =>
      p.notes.forEach((nt) => {
        const key = `${nt.s}:${nt.f}`;
        if (!seen.has(key)) {
          seen.add(key);
          positions.push(nt);
        }
      })
    );

    const FW = 56, SH = 30, ML = 16, MR = 56, MT = 22, MB = 22, NW = 9;
    const baseW = ML + FRETS * FW + NW + MR;
    const s = Math.min(drawW / baseW, 1.35);
    const fw = FW * s, sh = SH * s, ml = ML * s, mr = MR * s;
    const mt = MT * s, mb = MB * s, nw = NW * s;
    const totalW = ml + FRETS * fw + nw + mr;
    const totalH = mt + (STRINGS - 1) * sh + mb + 16 * s;
    const dpr = window.devicePixelRatio || 1;

    cvs.width = totalW * dpr;
    cvs.height = totalH * dpr;
    cvs.style.width = totalW + "px";
    cvs.style.height = totalH + "px";
    const ctx = cvs.getContext("2d");
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#12121a";
    ctx.fillRect(0, 0, totalW, totalH);

    const ox = ml, oy = mt;
    const noteR = Math.max(8, 11 * s);
    const fontSize = Math.max(7, 10 * s);
    const nutX = ox + FRETS * fw; // nut on the RIGHT

    // Inlay dot (fret 3) — LH: fret 1 on right, so x = ox + (FRETS - f + 0.5) * fw
    DOT_FRETS.forEach((f) => {
      const x = ox + (FRETS - f + 0.5) * fw;
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.beginPath();
      ctx.arc(x, oy + ((STRINGS - 1) / 2) * sh, 3.5 * s, 0, Math.PI * 2);
      ctx.fill();
    });

    // Fret lines
    for (let f = 0; f <= FRETS; f++) {
      const x = ox + f * fw;
      ctx.strokeStyle = f === FRETS ? "#3a3a4e" : "#252530";
      ctx.lineWidth = (f === FRETS ? 1.5 : 0.8) * s;
      ctx.beginPath();
      ctx.moveTo(x, oy);
      ctx.lineTo(x, oy + (STRINGS - 1) * sh);
      ctx.stroke();
    }

    // Nut (right side)
    ctx.fillStyle = "#2a2a3a";
    ctx.fillRect(nutX, oy - 4 * s, nw, (STRINGS - 1) * sh + 8 * s);
    ctx.strokeStyle = "#4a4a5e";
    ctx.lineWidth = s;
    ctx.strokeRect(nutX, oy - 4 * s, nw, (STRINGS - 1) * sh + 8 * s);

    // Strings — high e thin (top) to low E thick (bottom)
    for (let i = 0; i < STRINGS; i++) {
      const y = oy + i * sh;
      ctx.strokeStyle = "#3a3a4e";
      ctx.lineWidth = (0.5 + (i / STRINGS) * 1.5) * s;
      ctx.beginPath();
      ctx.moveTo(ox, y);
      ctx.lineTo(nutX + nw, y);
      ctx.stroke();
    }

    // Fret numbers — LH: 1 on right, 4 on left
    ctx.fillStyle = "#3a3a4a";
    ctx.font = `${Math.max(8, 10 * s)}px sans-serif`;
    ctx.textAlign = "center";
    for (let f = 1; f <= FRETS; f++) {
      ctx.fillText(f, ox + (FRETS - f + 0.5) * fw, totalH - 5 * s);
    }

    // String names — far right of the nut so open notes stay clear
    ctx.fillStyle = "#5a5a6a";
    ctx.font = `${Math.max(8, 10 * s)}px sans-serif`;
    ctx.textAlign = "left";
    STRING_NAMES_LH.forEach((nm, i) => {
      ctx.fillText(nm, nutX + nw + 34 * s, oy + i * sh + 3.5 * s);
    });

    // Notes
    positions.forEach((nt) => {
      const visualRow = nt.s - 1; // string 1 (high e) -> row 0 (top)
      const y = oy + visualRow * sh;
      const x =
        nt.f === 0
          ? nutX + nw + 15 * s
          : ox + (FRETS - nt.f + 0.5) * fw;
      const c = colorForNote(nt.n);
      ctx.beginPath();
      ctx.arc(x, y, noteR, 0, Math.PI * 2);
      ctx.fillStyle = c.fill;
      ctx.fill();
      ctx.strokeStyle = c.stroke;
      ctx.lineWidth = 1.5 * s;
      ctx.stroke();
      ctx.fillStyle = c.text;
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(nt.n, x, y + 0.5);
    });
  }, [width]);

  useEffect(() => {
    draw();
  }, [draw]);

  return <canvas ref={canvasRef} style={{ display: "block", maxWidth: "100%" }} />;
}

export default function AmazingGrace({ width }) {
  const legendDot = (bg, border) => ({
    width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
    background: bg, border: `2px solid ${border}`,
  });

  return (
    <div>
      <h1 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 700, letterSpacing: 2, color: "#c8a96e", marginBottom: 4, textTransform: "uppercase" }}>
        Amazing Grace
      </h1>
      <div style={{ textAlign: "center", fontSize: ".75rem", color: "#5a5a6e", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>
        Left-Handed Tab — Key of G — Open Position
      </div>
      <div style={{ textAlign: "center", fontSize: ".65rem", color: "#4a4a5e", letterSpacing: 1, marginBottom: 24 }}>
        Standard Tuning (E A D G B e)
      </div>

      <div style={{
        maxWidth: 620, margin: "0 auto 28px", background: "#15151d",
        border: "1px solid #24243a", borderRadius: 6, padding: "12px 16px",
        fontSize: ".72rem", lineHeight: 1.6, color: "#8a8a9e", letterSpacing: 0.3,
      }}>
        <strong style={{ color: "#c8a96e", letterSpacing: 1 }}>READING THIS LEFT-HANDED.</strong>{" "}
        A tab's fret numbers are identical for right and left handed players. You
        fret the same number on the same string either way, so the tab is not
        mirrored. What flips for a lefty is the view of the neck, so the fretboard
        below is mirrored (nut on the right, fret 1 nearest the nut) to match how
        you see your own guitar.
      </div>

      {/* Tab */}
      <div style={{ maxWidth: 620, margin: "0 auto 32px" }}>
        {PHRASES.map((p, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: ".68rem", color: "#7a7a9e", letterSpacing: 1, marginBottom: 6, paddingLeft: 2 }}>
              {p.lyric}
            </div>
            <pre style={{
              margin: 0, padding: "10px 12px", background: "#12121a",
              border: "1px solid #1e1e2a", borderRadius: 4, overflowX: "auto",
              fontFamily: "'Consolas', 'Courier New', monospace", fontSize: ".82rem",
              lineHeight: 1.4, color: "#c8c8d8", letterSpacing: 1,
            }}>
              {buildTabLines(p.notes).join("\n")}
            </pre>
          </div>
        ))}
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #1e1e2a", margin: "24px 0", maxWidth: 620, marginLeft: "auto", marginRight: "auto" }} />

      {/* Left-handed fretboard of the notes used */}
      <div style={{ fontSize: ".85rem", fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6, textAlign: "center", color: "#6e9ef5" }}>
        The Five Notes On Your Neck
      </div>
      <div style={{ textAlign: "center", fontSize: ".68rem", color: "#5a5a6e", letterSpacing: 1, marginBottom: 16, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
        Every note in the melody is one of these five (G major pentatonic, the same
        five notes as the Major Pentatonic scale on the Scales page), shown on a
        left-handed neck.
      </div>

      <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
        {[
          ["Root (G)", "#6e9ef5", "#4a7ee8"],
          ["5th (D)", "#7ec8a0", "#4fae7a"],
          ["Other tones (A B E)", "#e07a5f", "#c55a3f"],
        ].map(([label, bg, border]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: ".72rem", color: "#7a7a8e", letterSpacing: 1 }}>
            <div style={legendDot(bg, border)} />
            {label}
          </div>
        ))}
      </div>

      <div style={{ overflowX: "auto", display: "flex", justifyContent: "center" }}>
        <SongBoard width={width} />
      </div>
    </div>
  );
}
