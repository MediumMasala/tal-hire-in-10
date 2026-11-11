// ============================================================
// "Hire in 10 mins": tal in 10 as a 4:5 ad. City cuts (Pune, Chennai, Bangalore), re-laid-out.
// `query` swaps the slot picker (S02) for the boss typing the role (S02Q).
// Source: Prometheus Figma, Page 1 frames 677:4279 → 677:5264.
// Each scene is composed on a canvas shaped like the 4:5 frame (373 × 473
// native units), so the UI fills the frame instead of sitting in a phone-shaped
// column with padding. Figma pieces are reused as-is (HIRE IN 10 MINS
// lettering, briefcase, 10 MINS badge, centre bolt, shortlist faces, Aarav's
// card, the interview ticket); simple controls (chips, buttons, progress bars,
// counters) are drawn in code at the larger size. Flat backgrounds, no
// gradients. Faces in the run: Unsplash portraits (free licence), public/faces.
// Earlier versions: HireIn10Phone.tsx (floating phone), HireIn10FullBleed.tsx.
// ============================================================
import React, { createContext, useContext } from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadInterTight } from "@remotion/google-fonts/InterTight";
import { loadFont as loadBricolage } from "@remotion/google-fonts/BricolageGrotesque";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont } from "@remotion/fonts";
import { Underline } from "@remotion/rough-notation";
import { Person, ROLES, RoleKey, TrioPerson } from "./roles";

export const FPS = Number(process.env.REMOTION_FPS ?? 30);
export const W = 1080;
export const H = 1350;

const OBV = "Obviously Narrow";
loadFont({ family: OBV, url: staticFile("fonts/ObviouslyNarrowBold.otf"), weight: "700" });
const OBV_BI = "Obviously Narrow Black Italic";
loadFont({ family: OBV_BI, url: staticFile("fonts/ObviouslyNarrowBlackItalic.otf"), weight: "900" });
const OBV_CB = "Obviously Condensed Black";
loadFont({ family: OBV_CB, url: staticFile("fonts/ObviouslyCondensedBlack.otf"), weight: "900" });
const inter = loadInter("normal", { weights: ["300", "400", "500", "600", "700"], ignoreTooManyRequestsWarning: true });
// display fonts for typeset hooks (headline prop); SF Pro Display is a local system font
const HOOK_FONTS = {
  sf: "SF Pro Display",
  interTight: loadInterTight("normal", { weights: ["700", "800"], ignoreTooManyRequestsWarning: true }).fontFamily,
  bricolage: loadBricolage("normal", { weights: ["700", "800"], ignoreTooManyRequestsWarning: true }).fontFamily,
  spaceGrotesk: loadSpaceGrotesk("normal", { weights: ["700"], ignoreTooManyRequestsWarning: true }).fontFamily,
  geist: loadGeist("normal", { weights: ["700", "800"], ignoreTooManyRequestsWarning: true }).fontFamily,
  archivo: loadArchivo("normal", { weights: ["800", "900"], ignoreTooManyRequestsWarning: true }).fontFamily,
} as const;
export type Headline = { text: string; font: keyof typeof HOOK_FONTS; size: number; weight?: number; lh?: number; tracking?: number; upper?: boolean; chrome?: boolean; dim?: number[] };
const mono = loadMono("normal", { weights: ["700"], ignoreTooManyRequestsWarning: true });

const s = (sec: number) => Math.round(sec * FPS);
const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EIO = Easing.inOut(Easing.cubic);
const lerp = (f: number, i: number[], o: number[], e = EIO) => interpolate(f, i, o, { ...C, easing: e });
const fig = (n: string) => staticFile(`fig/${n}`);
const BG = "rgb(17,17,19)";

// the run (radar) plays at RUN_K of its original 4.6s; everything after it shifts up
const RUN_K = 0.65;
const RUN = 4.6 * RUN_K;
const T = {
  s01: [0, 2.4],
  s02: [2.4, 4.6],
  run: [4.6, 4.6 + RUN],
  s10: [4.6 + RUN, 6.2 + RUN],
  s11: [6.2 + RUN, 9.2 + RUN],
  book: [9.2 + RUN, 12.4 + RUN],
  end: [12.4 + RUN, 16.9 + RUN],
} as const;
type K = keyof typeof T;
export const TOTAL = s(T.end[1]);
const st = (k: K) => s(T[k][0]);
const en = (k: K) => s(T[k][1]);
const SCENES: K[] = ["s01", "s02", "run", "s10", "s11", "book"];

// ---------------- canvas ----------------
const M = 34;
const VW = W - 2 * M;
const VH = H - 2 * M;
const CW = 373; // canvas width in native units (10 padding each side → 353 usable)
const KK = VW / CW;
const CH = VH / KK; // ≈ 473
const PX = 10;
const PY = 12;
const IW = CW - 2 * PX; // 353
const IH = CH - 2 * PY; // ≈ 449

// run phases
const PH = [0, 1.1, 2.2, 3.2, 4.6].map((x) => x * RUN_K);
const runSec = (f: number) => (f - st("run")) / FPS;
const remaining = (f: number) => interpolate(runSec(f), [0, PH[4]], [600, 318], C);
const countAt = (f: number) => Math.exp(interpolate(runSec(f), [0, 1.1, 2.2, 3.2, 3.8].map((x) => x * RUN_K), [500000, 442190, 62613, 75, 14].map(Math.log), C));
const phaseP = (f: number, i: number) => interpolate(runSec(f), [PH[i], PH[i + 1]], [0, 1], C);
const mmss = (secs: number) => `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(Math.floor(secs % 60)).padStart(2, "0")}`;
const lakh = (n: number) => {
  const x = Math.round(n).toString();
  if (x.length <= 3) return x;
  return `${x.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${x.slice(-3)}`;
};

// ---------------- shared bits ----------------
const chrome: React.CSSProperties = {
  fontFamily: OBV,
  fontWeight: 700,
  textTransform: "uppercase",
  transform: "skewX(-9deg)",
  backgroundImage: "linear-gradient(180deg,#ffffff 0%,#ececf0 42%,#8d8d96 56%,#ffffff 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};
const Ripple: React.FC<{ local: number; at: number; x: number; y: number }> = ({ local, at, x, y }) => {
  const p = (local - s(at)) / 14;
  if (p < 0 || p > 1) return null;
  const r = 10 + 24 * p;
  return <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: 99, border: "1.5px solid rgba(255,255,255,0.95)", background: "rgba(255,255,255,0.14)", opacity: 1 - p, zIndex: 20 }} />;
};
const pressScale = (local: number, at: number) => (local >= s(at) && local < s(at) + 5 ? 0.95 : 1);
// a crop of a Figma screen, with its own rounding
const Crop: React.FC<{ src: string; x: number; y: number; w: number; h: number; r?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ src, x, y, w, h, r = 0, style, children }) => (
  <div style={{ position: "absolute", width: w, height: h, borderRadius: r, overflow: "hidden", ...style }}>
    <Img src={fig(src)} style={{ position: "absolute", left: -x, top: -y, width: 393, height: 852 }} />
    {children}
  </div>
);
const Sheen: React.FC<{ src: string; pos: number }> = ({ src, pos }) => (
  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, transparent ${pos - 10}%, rgba(255,255,255,0.9) ${pos}%, transparent ${pos + 10}%)`, WebkitMaskImage: `url(${fig(src)})`, maskImage: `url(${fig(src)})`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%", mixBlendMode: "overlay" }} />
);
const btnLight: React.CSSProperties = { background: "linear-gradient(180deg,#fbfbfc,#d9d9de)", color: "#111", boxShadow: "0 0 22px rgba(255,255,255,0.28)" };
const btnDark: React.CSSProperties = { background: "rgb(28,28,30)", color: "#fff", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.16)" };
const chipOn: React.CSSProperties = { background: "linear-gradient(180deg,#fbfbfc,#dcdce1)", color: "#111", boxShadow: "0 0 18px rgba(255,255,255,0.3)" };
const chipOff: React.CSSProperties = { background: "rgb(24,24,26)", color: "#fff", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14)" };

// ---------------- the crowd (run) ----------------
// 59 real faces. Each cut removes most of the field and the survivors glide
// into a roomier layout at a bigger size: 59 @20 → 19 @30 → 12 @40 → 6 @54.
const N = 59;
const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const CX = 197;
const CY = 350;
const phyllo = (j: number, n: number, r0: number, r1: number, rot = 0) => {
  const r = r0 + (r1 - r0) * Math.sqrt((j + 0.5) / n);
  const th = (j * 137.508 + rot) * (Math.PI / 180);
  return { x: CX + r * Math.cos(th), y: CY + r * Math.sin(th), deg: ((((j * 137.508 + rot) % 360) + 360) % 360) };
};
// survival rank: first 6 say yes (3 men, 3 women), next 6 are asked, next 7 pass the filter
const PICKS = [1, 2, 6, 12, 16, 17, 10, 19, 25, 33, 40, 50, 4, 7, 20, 28, 35, 44, 54];
const ORDER = [...PICKS, ...Array.from({ length: N }, (_, i) => i).filter((i) => !PICKS.includes(i)).sort((a, b) => rnd(a) - rnd(b))];
const RANK = new Map(ORDER.map((i, r) => [i, r]));
const STAGES = [
  { n: 59, size: 20, r0: 52, r1: 160 },
  { n: 19, size: 31, r0: 62, r1: 150 },
  { n: 12, size: 40, r0: 74, r1: 142 },
  { n: 6, size: 54, r0: 82, r1: 150 },
];
// stages 1–3: an irregular, non-overlapping scatter (seeded), not a neat ring
const scatter = (stage: number) => {
  const g = STAGES[stage];
  const minD = stage === 3 ? g.size + 22 : g.size + 6;
  const pts: { x: number; y: number }[] = [];
  let k = 0;
  while (pts.length < g.n && k < 5000) {
    k++;
    const r = g.r0 + (g.r1 - g.r0) * Math.sqrt(rnd(stage * 1000 + k));
    const th = rnd(stage * 2000 + k * 7) * Math.PI * 2;
    const x = CX + r * Math.cos(th);
    const y = CY + r * Math.sin(th) * 0.92;
    if (pts.every((q) => Math.hypot(q.x - x, (q.y - y) * (stage === 3 ? 0.8 : 1)) > minD)) pts.push({ x, y });
  }
  return pts;
};
const SCATTER = [null, scatter(1), scatter(2), scatter(3)];
const posAt = (i: number, stage: number) => {
  const g = STAGES[stage];
  if (stage === 0) return phyllo(i, N, g.r0, g.r1);
  const p = SCATTER[stage]![RANK.get(i)!];
  return { ...p, deg: 0 };
};
// PICKS[0..5] = faces 1,2,6,12,16,17 = the city's PEOPLE in order (names come from the city config)
const FACE_IMG = (i: number) => staticFile(`faces/f${String(i).padStart(3, "0")}.jpg`);
const DUST = Array.from({ length: 150 }, (_, i) => {
  const r = 22 + 145 * Math.sqrt(rnd(i + 500));
  const th = rnd(i + 900) * Math.PI * 2;
  return { x: CX + r * Math.cos(th), y: CY + r * Math.sin(th), deg: ((th * 180) / Math.PI + 360) % 360, ph: rnd(i + 1300) };
});

const Crowd: React.FC<{ frame: number }> = ({ frame }) => {
  const cast = usePeople();
  const people = cast.map((p) => p.name);
  const sweep = ((frame - st("run")) * 11) / RUN_K;
  // smooth progress into each stage (with a little per-face stagger)
  const stageP = (stage: number, i: number) => {
    const t0 = st("run") + s(PH[stage]) - 2 + Math.floor(rnd(i + stage * 31) * 8 * RUN_K);
    return interpolate(frame, [t0, t0 + Math.round(20 * RUN_K)], [0, 1], { ...C, easing: EIO });
  };
  const thinDust = lerp(frame, [st("run") + s(PH[1]), st("run") + s(PH[2])], [1, 0.15]);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg style={{ position: "absolute", left: 0, top: 0, width: 393, height: 852, overflow: "visible" }}>
        {[165, 128, 92, 56].map((r) => (
          <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="rgba(255,255,255,0.11)" strokeWidth={1} />
        ))}
        {DUST.map((d, i) => {
          const on = sweep >= d.deg ? 1 : 0;
          return <circle key={i} cx={d.x} cy={d.y} r={1.1} fill="#fff" opacity={on * (0.35 + 0.4 * Math.sin(frame / 6 + d.ph * 10)) * thinDust} />;
        })}
        {/* ask: lines out to the 12 being asked, kept for the 6 who say yes */}
        {ORDER.slice(0, 12).map((i, r) => {
          const p2 = stageP(2, i);
          const p3 = stageP(3, i);
          const a = posAt(i, 2);
          const b = posAt(i, 3);
          const x = r < 6 ? a.x + (b.x - a.x) * p3 : a.x;
          const y = r < 6 ? a.y + (b.y - a.y) * p3 : a.y;
          const len = Math.hypot(x - CX, y - CY);
          const keep = r < 6 ? 1 : 1 - p3;
          return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="rgba(255,255,255,0.5)" strokeWidth={0.9} strokeDasharray={`${len * p2} ${len}`} opacity={keep} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 161, top: 314, width: 72, height: 72, borderRadius: 999, overflow: "hidden" }}>
        <Img src={fig("s06.png")} style={{ position: "absolute", left: -161, top: -314, width: 393, height: 852 }} />
      </div>
      {Array.from({ length: N }, (_, i) => {
        const rank = RANK.get(i)!;
        const p0 = posAt(i, 0);
        const revealAt = st("run") + Math.floor(p0.deg / 11);
        if (frame < revealAt) return null;
        const pop = spring({ frame: frame - revealAt, fps: FPS, config: { damping: 13, stiffness: 220, mass: 0.5 } });
        // how far this face has travelled through the stages it survives
        let x = p0.x;
        let y = p0.y;
        let size = STAGES[0].size;
        let out = 0;
        for (let stg = 1; stg <= 3; stg++) {
          const p = stageP(stg, i);
          if (rank < STAGES[stg].n) {
            const to = posAt(i, stg);
            x += (to.x - x) * p;
            y += (to.y - y) * p;
            size += (STAGES[stg].size - size) * p;
          } else {
            out = Math.max(out, p);
            break;
          }
        }
        if (out >= 1) return null;
        const yesP = rank < 6 ? stageP(3, i) : 0;
        const askP = rank < 12 ? stageP(2, i) : 0;
        return (
          <div key={i} style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, zIndex: 10 - Math.min(9, Math.floor(rank / 7)), opacity: Math.min(1, pop * 1.5) * (1 - out), transform: `scale(${(0.3 + 0.7 * pop) * (1 - 0.5 * out)})` }}>
            <Img src={rank < 6 && cast[rank]?.photo ? photoSm(cast[rank]) : FACE_IMG(i)} style={{ width: "100%", height: "100%", borderRadius: 999, objectFit: "cover", filter: `grayscale(${out})`, boxShadow: `0 0 0 ${1 + yesP}px rgba(255,255,255,${0.3 + 0.6 * Math.max(askP, yesP)})` }} />
            {askP > 0.05 && (
              <div style={{ position: "absolute", right: -2, bottom: -2, width: 11 + 3 * yesP, height: 11 + 3 * yesP, borderRadius: 99, background: "#fff", color: "#111", fontSize: 7.5 + 2 * yesP, lineHeight: `${11 + 3 * yesP}px`, textAlign: "center", fontWeight: 700, opacity: askP }}>✓</div>
            )}
            {yesP > 0.05 && (
              <div style={{ position: "absolute", left: "50%", top: size + 3, transform: `translateX(-50%) scale(${yesP})`, background: "#fff", color: "#111", borderRadius: 5, padding: "1.5px 6px", fontFamily: inter.fontFamily, fontSize: 9, fontWeight: 600, whiteSpace: "nowrap" }}>{short(people[rank])}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const Radar: React.FC<{ frame: number; tint: number }> = ({ frame, tint }) => {
  const a = ((frame * 9) / RUN_K) % 360;
  const pulse = (frame % 30) / 30;
  return (
    <>
      <div style={{ position: "absolute", left: CX - 166, top: CY - 166, width: 332, height: 332, borderRadius: 999, background: `conic-gradient(from ${a}deg, rgba(255,255,255,${0.26 * tint}) 0deg, transparent 70deg, transparent 360deg)`, mixBlendMode: "screen", transform: "scaleX(-1)" }} />
      <div style={{ position: "absolute", left: CX - 40 - 120 * pulse, top: CY - 40 - 120 * pulse, width: 80 + 240 * pulse, height: 80 + 240 * pulse, borderRadius: 999, border: "1.5px solid rgba(255,255,255,0.5)", opacity: (1 - pulse) * 0.6 * tint }} />
    </>
  );
};


// The Figma "⚡ 10 MINS" badge (k-pill) with any text: k-pill-blank.png is the badge cropped to
// the pill (698×206), text wiped, right end mirrored from the (bolt-free) left end; 9-sliced at
// 150 | stretch | 111 so the middle stretches. Text sits like "10 MINS" did: 25 after the left
// slice, ending 42 short of the right edge (i.e. into the right cap). Text matches the badge:
// solid white Obviously Narrow Black Italic, cap height ≈ 41% of the pill.
const BoltPill: React.FC<{ text: string; em: number; h?: number }> = ({ text, em, h = 46 }) => {
  const k = h / 206;
  // badge proportions, shrunk if the line would push the pill past the frame (296 = text room at h=46)
  const size = Math.min((0.413 * h) / 0.75, 296 / em);
  return (
    <div style={{ display: "flex", alignItems: "center", height: h, boxSizing: "border-box", borderStyle: "solid", borderWidth: `0 ${111 * k}px 0 ${150 * k}px`, borderImage: `url(${fig("k-pill-blank.png")}) 0 111 0 150 fill stretch`, paddingLeft: 25 * k }}>
      <span style={{ fontFamily: OBV_BI, fontWeight: 900, fontSize: size, lineHeight: 1, color: "#fff", whiteSpace: "nowrap", marginRight: -69 * k, transform: `translateY(${-(0.1425 * size + 0.022 * h)}px)` }}>
        {/* the Obviously demo cut has no "&": set it in Impact, sized so its 0.69em height matches the 0.75em caps, slanted to match */}
        {text.split("&").map((part, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ display: "inline-block", fontFamily: "Impact, sans-serif", fontWeight: 400, fontSize: "1.09em", transform: "skewX(-10deg)" }}>&amp;</span>}
            {part}
          </React.Fragment>
        ))}
      </span>
    </div>
  );
};

// The hero under the hook (hero: "cards"): the top pick plus runners-up as photo cards,
// dealt up from below and fanned out. Same people/faces as the shortlist later on.
// fan 3: grows (k) into whatever room the hook leaves; side cards pinned 8 in from the edge.
// fan 5 (for "5 great …" hooks): widths fixed so every face shows, cards stretch taller (kv).
type FanCard = { i: number; w: number; h: number; side: number; x?: number; dy: number; rot: number; at: number };
const FAN3: FanCard[] = [
  { i: 0, w: 112, h: 142, side: -1, dy: 24, rot: -9, at: 15 },
  { i: 2, w: 112, h: 142, side: 1, dy: 24, rot: 9, at: 15 },
  { i: 1, w: 140, h: 176, side: 0, dy: 0, rot: 0, at: 10 },
];
const FAN5: FanCard[] = [
  { i: 3, w: 84, h: 150, side: -2, x: -132, dy: 26, rot: -11, at: 19 },
  { i: 5, w: 84, h: 150, side: 2, x: 132, dy: 26, rot: 11, at: 19 },
  { i: 0, w: 96, h: 170, side: -1, x: -70, dy: 9, rot: -5.5, at: 15 },
  { i: 2, w: 96, h: 170, side: 1, x: 70, dy: 9, rot: 5.5, at: 15 },
  { i: 1, w: 112, h: 196, side: 0, x: 0, dy: 0, rot: 0, at: 10 },
];
const HeroCards: React.FC<{ local: number; top: number; fan?: 3 | 5; room?: number; bare?: boolean }> = ({ local, top, fan = 3, room, bare }) => {
  const PEOPLE = usePeople();
  // fan 5 grows uniformly too (positions included), so the outer pair bleeds off the sides
  const k = fan === 5 ? Math.max(1, Math.min(1.3, (IH - 4 - top - 26) / 196)) : Math.max(room ? 0.8 : 1, Math.min(1.32, (room ?? IH - 2 - top) / 186));
  const kv = fan === 5 && k === 1 ? Math.max(0.8, Math.min(1.08, (IH - 4 - top - 26) / 196)) : 1;
  return (
    <>
      {(fan === 5 ? FAN5 : FAN3).map(({ i, w, h: h0, side, x, dy, rot, at }) => {
        const h = h0 * kv;
        const dx = x !== undefined ? x * k : side * (IW / 2 - 8 - (w / 2) * k);
        const p = PEOPLE[i];
        const hero = side === 0;
        const up = spring({ frame: local - 10, fps: FPS, config: { damping: 13, stiffness: 90, mass: 1 } });
        const fan = spring({ frame: local - at, fps: FPS, config: { damping: 14, stiffness: 120, mass: 0.8 } });
        const bob = Math.sin(local / 9 + i) * 2.5;
        return (
          <div key={p.face} style={{ position: "absolute", left: IW / 2 - w / 2 + dx * fan, top: top + (dy + h / 2) * k - h / 2 + (1 - up) * 220 + bob, width: w, height: h, borderRadius: 18, overflow: "hidden", background: "rgb(30,30,33)", opacity: Math.min(1, up * 2), transform: `rotate(${rot * fan + Math.sin(local / 13 + i) * 1.2}deg) scale(${k})`, boxShadow: hero ? "0 0 0 1.5px rgba(255,255,255,0.6), 0 0 34px rgba(255,255,255,0.16), 0 18px 40px rgba(0,0,0,0.6)" : "inset 0 0 0 1px rgba(255,255,255,0.12), 0 14px 30px rgba(0,0,0,0.6)" }}>
            <Img src={photoHi(p)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: photoPos(p), filter: hero ? "none" : "brightness(0.78)" }} />
            {hero && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: h * 0.55, background: "linear-gradient(180deg, rgba(20,20,22,0), rgba(20,20,22,0.92))" }} />}
            {/* the outer pair of a grown 5-fan bleeds off the frame, so it drops the chip */}
            {!(Math.abs(side) === 2 && k > 1.05) && <div style={{ position: "absolute", ...(dx > 0 ? { right: 9 } : { left: 9 }), top: 9, padding: "3px 7px", borderRadius: 10, background: "rgba(245,245,247,0.92)", color: "#111", fontFamily: mono.fontFamily, fontWeight: 700, fontSize: hero ? 9.5 : 8.5, letterSpacing: 0.4 }}>{p.match} MATCH</div>}
            {/* side cards tuck under the hero: face + match only, the hero carries name and role */}
            {hero && !bare && <div style={{ position: "absolute", left: 11, right: 8, bottom: 25, fontFamily: inter.fontFamily, fontWeight: 600, fontSize: 16, color: "#fff", letterSpacing: -0.3, whiteSpace: "nowrap" }}>{p.name}</div>}
            {hero && !bare && <div style={{ position: "absolute", left: 11, right: 8, bottom: 11, fontFamily: inter.fontFamily, fontSize: fit(`${p.role} · ${p.co}`, 10.5, 22), color: "rgba(255,255,255,0.72)", whiteSpace: "nowrap" }}>{p.role} · {p.co}</div>}
          </div>
        );
      })}
    </>
  );
};

// Rubber stamp (stamp: [big line, small line]): red ink in a double rule, rough edges + speckle
// from SVG turbulence, slammed down at frame `at` (drops from 2.6x, lands with a squash).
const STAMP_INK = "#ff4a3d";
const Stamp: React.FC<{ lines: string[]; w: number; h: number; local: number; at: number; clean?: boolean }> = ({ lines, w, h, local, at, clean }) => {
  const ink = clean ? "#f4f4f6" : STAMP_INK;
  const p = interpolate(local, [at, at + 5], [0, 1], { ...C, easing: Easing.in(Easing.cubic) });
  const squash = local < at + 5 ? 1 : 1 - 0.05 * Math.exp(-(local - at - 5) / 2.5) * Math.cos((local - at - 5) * 1.3);
  const sc = (2.6 - 1.6 * p) * squash;
  const [big, small] = lines;
  const bigSize = Math.min(h * 0.42, (w - 28) / (big.length * 0.41));
  const smallSize = h * 0.25;
  const ry = h * 0.79;
  const half = (small.length * smallSize * 0.62) / 2 + 10;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: Math.min(1, p * 2.5), transform: `scale(${sc}) rotate(${-5 + 4 * (1 - p)}deg)` }}>
      <defs>
        <filter id="ink" x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves={2} seed={4} result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale={1.4} xChannelSelector="R" yChannelSelector="G" result="rough" />
          {/* fine speckle: only the rare noise peaks punch through */}
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={2} seed={11} result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -20 13.8" result="holes" />
          {/* uneven pressure: big soft patches a little lighter */}
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={1} seed={2} result="press" />
          <feColorMatrix in="press" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.8 1.32" result="pressA" />
          <feComposite in="holes" in2="pressA" operator="arithmetic" k1={1} k2={0} k3={0} k4={0} result="mask" />
          <feComposite in="rough" in2="mask" operator="in" />
        </filter>
      </defs>
      <g filter={clean ? undefined : "url(#ink)"} fill={ink} stroke={ink}>
        <rect x={1.7} y={1.7} width={w - 3.4} height={h - 3.4} rx={5} fill={clean ? "rgba(14,14,16,0.82)" : "none"} strokeWidth={clean ? 2.4 : 3.4} />
        <rect x={6.5} y={6.5} width={w - 13} height={h - 13} rx={2.5} fill="none" strokeWidth={clean ? 0.9 : 1.2} />
        <text x={w / 2} y={h * 0.53} textAnchor="middle" stroke="none" style={{ fontFamily: OBV_CB, fontWeight: 900, fontSize: bigSize, letterSpacing: 0.3 }}>{big}</text>
        <line x1={15} x2={w / 2 - half} y1={ry - smallSize * 0.36} y2={ry - smallSize * 0.36} strokeWidth={1.5} />
        <line x1={w / 2 + half} x2={w - 15} y1={ry - smallSize * 0.36} y2={ry - smallSize * 0.36} strokeWidth={1.5} />
        <text x={w / 2} y={ry} textAnchor="middle" stroke="none" style={{ fontFamily: OBV_CB, fontWeight: 900, fontSize: smallSize, letterSpacing: 2.2 }}>★ {small} ★</text>
      </g>
    </svg>
  );
};
// screen shake when the stamp lands
const stampShake = (local: number, at: number) => {
  const t = local - at - 5;
  if (t < 0 || t > 10) return 0;
  return 3.2 * Math.exp(-t / 2.8) * Math.sin(t * 2.4);
};

// ---------------- scenes (canvas coords inside the IW × IH area) ----------------
// hook lettering: the Figma "HIRE IN 10 MINS" export, or a lockup from tools/lettering.py
// (same font + gradient as the Figma vector)
const HOOKS = {
  hire: { src: "k-hire.png", ar: 707 / 1344 },
  find: { src: "k-find.png", ar: 908 / 1612 },
  // two-line versions: kicker + big "IN 10 MINS" (2a), 1 : 1.55 (2b), same size (2c)
  find2a: { src: "k-find2a.png", ar: 476 / 1612 },
  find2b: { src: "k-find2b.png", ar: 366 / 1612 },
  find2c: { src: "k-find2c.png", ar: 290 / 1612 },
} as const;
export type Hook = keyof typeof HOOKS;
// the hook already says what you get, so "find" drops the pill's "HIRE " (1.973em in the pill font)
const hookPill = (pill: string, em: number, hook: Hook) => (hook.startsWith("find") && pill.startsWith("HIRE ") ? { text: pill.slice(5), em: em - 1.973 } : { text: pill, em });
// Hook as a poster (tidy cuts, hookLayout): the lockup gets real margins and the hero is staged.
//  spotlight: briefcase on a lit floor (glow, reflection, sparkles) + small tal BOSS mark
//  app: the Figma "01 Promise" screen — briefcase, one line, "Let's go →" tapped into the query
//  speed: the chrome speeding clock flies in and lands under the lockup
export type HookLayout = "spotlight" | "app" | "speed";
const HookPoster: React.FC<{ local: number; layout: HookLayout }> = ({ local, layout }) => {
  const { hookImg, endWhat, heroPhoto, heroPhotos, bigHook, subline, stamp, stampStyle = "ink" } = useCity();
  const kick = !!stamp && stampStyle === "kicker";
  const HERO = usePeople()[1];
  const img = hookImg!;
  const slam = spring({ frame: local - 1, fps: FPS, config: { damping: 14, stiffness: 170, mass: 0.8 } });
  const sheen = lerp(local, [12, 48], [-40, 140], Easing.inOut(Easing.quad));
  const bag = spring({ frame: local - 5, fps: FPS, config: { damping: 13, stiffness: 90, mass: 1 } });
  const MX = bigHook ? 5 : 16;
  const TOP = (bigHook ? 12 : 20) + (kick ? 30 : 0);
  const lw = IW - 2 * MX;
  const lh = lw * img.ar;
  const bob = Math.sin(local / 9) * 3;
  const tilt = Math.sin(local / 13) * 2;
  const head = (
    <div style={{ position: "absolute", left: MX, top: TOP, width: lw, height: lh, transform: `scale(${1.03 - 0.03 * slam})`, zIndex: 3 }}>
      <Img src={fig(img.src)} style={{ width: "100%", height: "100%" }} />
      <Sheen src={img.src} pos={sheen} />
    </div>
  );
  const star = (x: number, y: number, size: number, ph: number) => {
    const tw = 0.75 + 0.25 * Math.sin(local / 5 + ph);
    const on = spring({ frame: local - 14 - ph * 3, fps: FPS, config: { damping: 10, stiffness: 200, mass: 0.5 } });
    return <Img src={fig("k-star.png")} style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size * (237 / 288), transform: `scale(${on * tw}) rotate(${ph * 20 + local * 0.6}deg)`, opacity: Math.min(1, on * 1.5) }} />;
  };
  if (layout === "spotlight") {
    const bw = 236;
    const areaTop = TOP + lh + 6;
    const areaBot = IH - 50;
    const cy = (areaTop + areaBot) / 2 - 6;
    const bx = (IW - bw) / 2;
    const by = cy - bw / 2 + (1 - bag) * 200 + bob;
    return (
      <>
        <div style={{ position: "absolute", left: IW / 2 - 200, top: cy - 200, width: 400, height: 400, background: "radial-gradient(circle, rgba(214,222,255,0.22) 0%, rgba(214,222,255,0.07) 34%, rgba(0,0,0,0) 64%)", opacity: bag }} />
        <div style={{ position: "absolute", left: IW / 2 - 150, top: cy + bw * 0.43, width: 300, height: 40, background: "radial-gradient(ellipse, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0) 70%)", opacity: bag }} />
        {/* reflection on the floor */}
        <Img src={fig("k-briefcase.png")} style={{ position: "absolute", left: bx, top: cy + bw / 2 + bw * 0.43 - bob, width: bw, height: bw, transform: `scaleY(-1) rotate(${-tilt}deg)`, opacity: 0.24 * bag, WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 34%)", maskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 34%)" }} />
        <Img src={fig("k-briefcase.png")} style={{ position: "absolute", left: bx, top: by, width: bw, height: bw, opacity: Math.min(1, bag * 2), transform: `rotate(${(1 - bag) * -12 + tilt}deg)` }} />
        {star(IW / 2 + bw * 0.45, cy - bw * 0.36, 42, 0)}
        {star(IW / 2 - bw * 0.52, cy - bw * 0.04, 26, 2)}
        {star(IW / 2 + bw * 0.55, cy + bw * 0.24, 20, 4)}
        <Img src={staticFile("brand/tal-boss-wordmark-cream.png")} style={{ position: "absolute", left: IW / 2 - 21, top: IH - 44, height: 42, opacity: lerp(local, [24, 36], [0, 0.95]) }} />
        {head}
      </>
    );
  }
  if (layout === "app") {
    const bw = 214;
    // bigHook: a compact "Let's go" pill and a one-line promise, so the title carries the frame
    const btnH = bigHook ? 42 : 56;
    const btnW = bigHook ? 176 : IW;
    const btnY = IH - btnH - (bigHook ? 6 : 2);
    const lineY = bigHook ? btnY - 12 - 21 : btnY - 64;
    // stamp: no promise line; the cards run down to the button and the stamp lands across their bottoms
    const seal = !!stamp && stampStyle === "seal";
    const SW = seal ? 286 : 300;
    const SH = seal ? 56 : 64;
    const SAT = 20;
    const stampY = btnY - 8 - SH;
    const cardsBot = kick ? btnY - 12 : stamp ? stampY + (seal ? 10 : 18) : lineY - (bigHook ? 10 : 16);
    const promise = subline ?? `Meet ${endWhat ?? "top candidates"} in 10 minutes.`;
    const by = TOP + lh + 8 + (1 - bag) * 200 + bob;
    const line = spring({ frame: local - 16, fps: FPS, config: { damping: 15, stiffness: 160, mass: 0.7 } });
    const btn = spring({ frame: local - (stamp ? 29 : 22), fps: FPS, config: { damping: 15, stiffness: 160, mass: 0.7 } });
    const tap = 1.95;
    const shake = stamp && !kick ? stampShake(local, SAT) * (seal ? 0.6 : 1) : 0;
    return (
      <div style={{ position: "absolute", inset: 0, transform: `translate(${shake * 0.6}px, ${shake}px)` }}>
        <div style={{ position: "absolute", left: IW / 2 - 170, top: TOP + lh + 8 + bw / 2 - 170, width: 340, height: 340, background: "radial-gradient(circle, rgba(214,222,255,0.12) 0%, rgba(0,0,0,0) 62%)", opacity: bag }} />
        {heroPhotos === 3 ? (
          // test: the top pick + two runners-up (same fan as the card hero), sized to the gap
          <HeroCards local={local} top={TOP + lh + (bigHook ? 12 : 16)} room={cardsBot - (TOP + lh + (bigHook ? 12 : 16))} fan={3} bare={!!stamp && !kick} />
        ) : heroPhoto ? (
          // test: the top pick's photo card (same person who gets booked at the end) instead of the briefcase
          (() => {
            const pt = TOP + lh + 16;
            const ph = lineY - 16 - pt;
            const pw = Math.round(ph * 0.8);
            return (
              <div style={{ position: "absolute", left: (IW - pw) / 2, top: pt + (1 - bag) * 200 + bob, width: pw, height: ph, borderRadius: 22, overflow: "hidden", background: "rgb(30,30,33)", opacity: Math.min(1, bag * 2), transform: `rotate(${(1 - bag) * -8 + tilt * 0.6}deg)`, boxShadow: "0 0 0 1.5px rgba(255,255,255,0.6), 0 0 40px rgba(255,255,255,0.16), 0 20px 44px rgba(0,0,0,0.6)" }}>
                <Img src={photoHi(HERO)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: photoPos(HERO) }} />
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: ph * 0.5, background: "linear-gradient(180deg, rgba(20,20,22,0), rgba(20,20,22,0.92))" }} />
                <div style={{ position: "absolute", left: 10, top: 10, padding: "4px 8px", borderRadius: 11, background: "rgba(245,245,247,0.92)", color: "#111", fontFamily: mono.fontFamily, fontWeight: 700, fontSize: 10.5, letterSpacing: 0.4 }}>{HERO.match} MATCH</div>
                <div style={{ position: "absolute", left: 13, right: 8, bottom: 30, fontFamily: inter.fontFamily, fontWeight: 600, fontSize: 19, color: "#fff", letterSpacing: -0.3, whiteSpace: "nowrap" }}>{HERO.name}</div>
                <div style={{ position: "absolute", left: 13, right: 8, bottom: 13, fontFamily: inter.fontFamily, fontSize: fit(`${HERO.role} at ${HERO.co}`, 12.5, 24), color: "rgba(255,255,255,0.75)", whiteSpace: "nowrap" }}>{HERO.role} at {HERO.co}</div>
              </div>
            );
          })()
        ) : (
          <Img src={fig("k-briefcase.png")} style={{ position: "absolute", left: (IW - bw) / 2, top: by, width: bw, height: bw, opacity: Math.min(1, bag * 2), transform: `rotate(${(1 - bag) * -12 + tilt}deg)` }} />
        )}
        {kick ? (
          // kicker: a small glass pill above the title, caps + Indian flag right after INDIA
          <div style={{ position: "absolute", left: 0, right: 0, top: 10, display: "flex", justifyContent: "center", opacity: lerp(local, [4, 12], [0, 1]), transform: `translateY(${lerp(local, [4, 12], [-6, 0])}px)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, height: 25, padding: "0 11px 0 13px", borderRadius: 13, border: "1px solid rgba(255,255,255,0.16)", background: "linear-gradient(180deg, rgba(255,255,255,0.11), rgba(255,255,255,0.05))", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)", fontFamily: inter.fontFamily, fontWeight: 600, fontSize: 10.5, letterSpacing: 0.9, color: "rgba(255,255,255,0.92)", whiteSpace: "nowrap" }}>
              {stamp.join(" ")}
              <div style={{ position: "relative", width: 15, height: 10.5, borderRadius: 2, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 0 0 0.5px rgba(255,255,255,0.25)" }}>
                <div style={{ flex: 1, background: "#ff9933" }} />
                <div style={{ flex: 1, background: "#ffffff" }} />
                <div style={{ flex: 1, background: "#138808" }} />
                <div style={{ position: "absolute", left: 6, top: 3.75, width: 3, height: 3, borderRadius: 2, border: "0.6px solid #000080", boxSizing: "border-box" }} />
              </div>
            </div>
          </div>
        ) : stamp ? (
          <div style={{ position: "absolute", left: (IW - SW) / 2, top: stampY, width: SW, height: SH, zIndex: 4 }}>
            <Stamp lines={stamp} w={SW} h={SH} local={local} at={SAT} clean={seal} />
          </div>
        ) : (
        <div style={{ position: "absolute", left: bigHook ? 6 : 24, right: bigHook ? 6 : 24, top: lineY, textAlign: "center", fontFamily: inter.fontFamily, fontSize: bigHook ? fit(promise, 15, 46) : 17, lineHeight: bigHook ? "21px" : "24px", color: "rgba(255,255,255,0.72)", textWrap: "balance", opacity: line, transform: `translateY(${(1 - line) * 10}px)` }}>
          {promise}
        </div>
        )}
        <div style={{ position: "absolute", left: (IW - btnW) / 2, top: btnY, width: btnW, height: btnH, borderRadius: btnH / 2, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: inter.fontFamily, fontSize: bigHook ? 15 : 17, fontWeight: 600, ...btnLight, opacity: btn, transform: `translateY(${(1 - btn) * 14}px) scale(${pressScale(local, tap)})` }}>Let’s go →</div>
        <Ripple local={local} at={tap} x={IW / 2} y={btnY + btnH / 2} />
        {head}
      </div>
    );
  }
  // speed
  const cw = 318;
  const ch = cw * (713 / 1252);
  const cy = (TOP + lh + IH) / 2 - ch / 2 - 10;
  const fly = (lag: number) => Easing.out(Easing.cubic)(interpolate(local, [3 + lag, 19 + lag], [0, 1], C));
  const cx = (p: number) => -cw - 40 + ((IW - cw) / 2 + cw + 40) * p;
  const land = spring({ frame: local - 19, fps: FPS, config: { damping: 9, stiffness: 220, mass: 0.6 } });
  return (
    <>
      <div style={{ position: "absolute", left: IW / 2 - 190, top: cy + ch / 2 - 190, width: 380, height: 380, background: "radial-gradient(circle, rgba(214,222,255,0.14) 0%, rgba(0,0,0,0) 62%)", opacity: fly(0) }} />
      {[4, 2].map((lag) => (
        <Img key={lag} src={fig("k-clock.png")} style={{ position: "absolute", left: cx(fly(lag)), top: cy, width: cw, height: ch, opacity: 0.25 * (1 - land), filter: "blur(5px)" }} />
      ))}
      <Img src={fig("k-clock.png")} style={{ position: "absolute", left: cx(fly(0)) + Math.sin(land * Math.PI) * 6, top: cy + bob, width: cw, height: ch, transform: `rotate(${(1 - land) * 6 + tilt * 0.6}deg)` }} />
      {star((IW + cw) / 2 - 18, cy - 6, 26, 1)}
      {head}
    </>
  );
};

const S01: React.FC<{ local: number }> = ({ local }) => {
  const slam = spring({ frame: local - 1, fps: FPS, config: { damping: 14, stiffness: 170, mass: 0.8 } });
  const pune = spring({ frame: local - 9, fps: FPS, config: { damping: 14, stiffness: 180, mass: 0.7 } });
  const bag = spring({ frame: local - 10, fps: FPS, config: { damping: 13, stiffness: 90, mass: 1 } });
  const sheen = lerp(local, [12, 48], [-40, 140], Easing.inOut(Easing.quad));
  const { city, role, hook = "hire", hero = "briefcase", headline, fan, hookImg, pillText, noPill, tidy, hookLayout } = useCity();
  const img = hookImg ?? HOOKS[hook];
  const lw = IW;
  const hl = headline;
  const hlLines = hl ? hl.text.split("\n") : [];
  const lh = hl ? hlLines.length * hl.size * (hl.lh ?? 1.04) : lw * img.ar;
  const HL_GAP = 34;
  const hlTop = hl ? Math.max(4, (IH - (lh + HL_GAP + 196 * 1.08 + 26)) / 2) : 4;
  const r = role ? ROLES[role] : undefined;
  const pill = r && !hl && (pillText ?? hookPill(r.pill, r.pillEm, hook));
  if (tidy && hookImg && hookLayout) return <HookPoster local={local} layout={hookLayout} />;
  // the briefcase grows into the room a shorter hook leaves, keeping the original bottom bleed
  // (noPill: the briefcase moves up into the pill's slot)
  const bagTop = noPill ? lh + 22 : lh + 58;
  const bagW = Math.max(238, Math.min(290, IH + 33 - bagTop));
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: hlTop, width: lw, height: lh, ...(tidy ? { transform: `scale(${1.03 - 0.03 * slam})` } : { transform: `scale(${1.08 - 0.08 * slam})`, opacity: Math.min(1, slam * 2.5), filter: `blur(${(1 - slam) * 3}px)` }) }}>
        {hl ? (
          <div style={{ fontFamily: HOOK_FONTS[hl.font], fontWeight: hl.weight ?? 800, fontSize: hl.size, lineHeight: hl.lh ?? 1.04, letterSpacing: `${hl.tracking ?? -0.03}em`, textAlign: "center", color: "#fff", textTransform: hl.upper ? "uppercase" : "none" }}>
            {hlLines.map((l, i) => (
              <div key={i} style={{ whiteSpace: "nowrap", ...(hl.chrome ? { backgroundImage: "linear-gradient(180deg,#ffffff 0%,#ececf0 42%,#8d8d96 56%,#ffffff 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" } : {}), ...(hl.dim?.includes(i) ? { color: "rgba(255,255,255,0.45)" } : {}) }}>{l}</div>
            ))}
          </div>
        ) : (
          <>
            <Img src={fig(img.src)} style={{ width: "100%", height: "100%" }} />
            <Sheen src={img.src} pos={sheen} />
          </>
        )}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: r ? lh + 12 : lh + 14, display: "flex", justifyContent: "center", opacity: Math.min(1, pune * 2), transform: `translateY(${(1 - pune) * 10}px)`, zIndex: 2 }}>
        {hl || noPill ? null : pill ? (
          <BoltPill text={pill.text} em={pill.em} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, height: 40, padding: "0 16px 0 17px", borderRadius: 999, background: "rgb(30,30,33)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.25)" }}>
            <svg width="13" height="17" viewBox="0 0 11 14" style={{ display: "block", flex: "0 0 auto" }}><path d="M5.5 0C2.5 0 0 2.4 0 5.4 0 9.4 5.5 14 5.5 14S11 9.4 11 5.4C11 2.4 8.5 0 5.5 0zm0 7.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="#e9e9ee" /></svg>
            <span style={{ ...chrome, display: "block", fontSize: 27, lineHeight: "27px", marginTop: -3.2, letterSpacing: 1, transform: "translateY(-1.5px) skewX(-9deg)" }}>{city === "Bangalore" ? "In" : "Now in"} {city}</span>
          </div>
        )}
      </div>
      {hero === "cards" ? (
        <HeroCards local={local} top={hl ? hlTop + lh + HL_GAP : lh + 70} fan={fan} />
      ) : (
        <Img src={fig("k-briefcase.png")} style={{ position: "absolute", left: (IW - bagW) / 2, top: bagTop + (1 - bag) * 200 + Math.sin(local / 9) * 3, width: bagW, height: bagW, opacity: Math.min(1, bag * 2), transform: `rotate(${(1 - bag) * -12 + Math.sin(local / 13) * 2}deg)` }} />
      )}
    </>
  );
};

const DAYS: [string, string][] = [["Mon", "06"], ["Tue", "07"], ["Wed", "08"], ["Thu", "09"], ["Fri", "10"]];
const TIMES = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM"];
const S02: React.FC<{ local: number }> = ({ local }) => {
  const at = (sec: number) => local >= s(sec);
  const dayW = (IW - 4 * 8) / 5;
  const tW = (IW - 2 * 9) / 3;
  const ready = at(0.8);
  const bump = spring({ frame: local - s(0.8), fps: FPS, config: { damping: 10, stiffness: 260, mass: 0.5 } });
  const dayY = 120;
  const gridY = 228;
  const btnY = IH - 58;
  const label = (t: string, y: number) => <div style={{ position: "absolute", left: 2, top: y, fontFamily: inter.fontFamily, fontSize: 13.5, color: "rgba(255,255,255,0.6)" }}>{t}</div>;
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 2, textAlign: "center", ...chrome, fontSize: 38, lineHeight: 1, whiteSpace: "nowrap" }}>
        When can you
        <br />
        interview this week<span style={{ fontFamily: "Impact, sans-serif", fontWeight: 400, fontSize: "0.9em" }}>?</span>
      </div>
      {label("Select day", dayY - 21)}
      {DAYS.map(([dow, d], i) => {
        const on = i === 2 && at(0.4);
        return (
          <div key={d} style={{ position: "absolute", left: i * (dayW + 8), top: dayY, width: dayW, height: 74, borderRadius: 18, textAlign: "center", fontFamily: inter.fontFamily, ...(on ? chipOn : chipOff), transform: `scale(${i === 2 ? pressScale(local, 0.4) : 1})` }}>
            <div style={{ marginTop: 13, fontSize: 13, opacity: 0.6 }}>{dow}</div>
            <div style={{ marginTop: 2, fontSize: 23, fontWeight: 600 }}>{d}</div>
          </div>
        );
      })}
      {label("Select time", gridY - 21)}
      {TIMES.map((t, i) => {
        const on = i === 4 && at(0.8);
        return (
          <div key={t} style={{ position: "absolute", left: (i % 3) * (tW + 9), top: gridY + Math.floor(i / 3) * 53, width: tW, height: 46, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: inter.fontFamily, fontSize: 15.5, fontWeight: 500, ...(on ? chipOn : chipOff), transform: `scale(${i === 4 ? pressScale(local, 0.8) : 1})` }}>{t}</div>
        );
      })}
      <div style={{ position: "absolute", left: 0, top: btnY, width: 112, height: 56, borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: inter.fontFamily, fontSize: 16, fontWeight: 500, ...btnDark }}>Previous</div>
      <div style={{ position: "absolute", left: 122, top: btnY, width: IW - 122, height: 56, borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: inter.fontFamily, fontSize: 17, fontWeight: 600, ...btnLight, transform: `scale(${(1 + 0.05 * Math.sin(Math.min(1, bump) * Math.PI)) * pressScale(local, 1.4)})` }}>
        {ready ? "Launch →" : "Add slot →"}
      </div>
      <Ripple local={local} at={0.4} x={2 * (dayW + 8) + dayW / 2} y={dayY + 37} />
      <Ripple local={local} at={0.8} x={tW + 9 + tW / 2} y={gridY + 53 + 23} />
      <Ripple local={local} at={1.4} x={122 + (IW - 122) / 2} y={btnY + 28} />
    </>
  );
};

// Query variant of S02: the boss types the role instead of picking slots.
// Runs Q_EXTRA longer than S02; HireIn10 holds the timeline early in s02 to make room.
export const Q_EXTRA = 1.2;
const Q_T0 = 0.35;
const Q_T1 = 1.95;
const Q_PRESS = 2.65;
const S02Q: React.FC<{ local: number }> = ({ local }) => {
  const { city, role } = useCity();
  const text = ROLES[role ?? "engineers"].query(city);
  const tags = ROLES[role ?? "engineers"].tags(city);
  // per-character reveal times: roughly even, seeded jitter, short pauses after punctuation
  const w = [...text].map((c, i) => (/[.,]/.test(c) ? 2.4 : c === " " ? 1.3 : 1) * (0.7 + 0.6 * rnd(i + 70)));
  const sum = w.reduce((a, b) => a + b, 0);
  let acc = 0;
  const at = w.map((x) => ((acc += x), s(Q_T0 + (Q_T1 - Q_T0) * (acc / sum))));
  const n = at.filter((f) => local >= f).length;
  const typing = n > 0 && n < text.length;
  const caret = typing || Math.floor(local / 15) % 2 === 0 ? 1 : 0;
  const focus = lerp(local, [s(Q_T0) - 6, s(Q_T0)], [0, 1]);
  const ready = spring({ frame: local - s(Q_T1 + 0.1), fps: FPS, config: { damping: 10, stiffness: 260, mass: 0.5 } });
  const boxY = 118;
  const boxH = 104;
  const chipY = boxY + boxH + 46;
  const btnY = IH - 58;
  const label = (t: string, y: number, o = 1) => <div style={{ position: "absolute", left: 2, top: y, fontFamily: inter.fontFamily, fontSize: 13.5, color: "rgba(255,255,255,0.6)", opacity: o }}>{t}</div>;
  const caretEl = <span style={{ display: "inline-block", width: 2.5, height: 25, marginLeft: 1, verticalAlign: -5, background: "#fff", opacity: caret }} />;
  const firstTag = at[text.indexOf(tags[0]) + tags[0].length - 1];
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 2, textAlign: "center", ...chrome, fontSize: 38, lineHeight: 1, whiteSpace: "nowrap" }}>
        Who are you
        <br />
        hiring today<span style={{ fontFamily: "Impact, sans-serif", fontWeight: 400, fontSize: "0.9em" }}>?</span>
      </div>
      {label("Your role", boxY - 21)}
      <div style={{ position: "absolute", left: 0, top: boxY, width: IW, height: boxH, borderRadius: 20, background: "rgb(24,24,26)", boxShadow: `inset 0 0 0 ${1 + 0.5 * focus}px rgba(255,255,255,${0.14 + 0.36 * focus}), 0 0 ${24 * focus}px rgba(255,255,255,${0.1 * focus})` }}>
        <div style={{ position: "absolute", left: 18, right: 18, top: 16, fontFamily: inter.fontFamily, fontSize: 22, lineHeight: "32px", fontWeight: 500, color: "#fff", letterSpacing: -0.3 }}>
          {n === 0 ? (
            <>
              {caretEl}
              <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>Describe the role…</span>
            </>
          ) : (
            <>
              {text.slice(0, n)}
              {caretEl}
            </>
          )}
        </div>
      </div>
      {label("Tal picked up", chipY - 21, lerp(local, [firstTag, firstTag + 6], [0, 1]))}
      <div style={{ position: "absolute", left: 0, top: chipY, width: IW, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {tags.map((t) => {
          const done = at[text.indexOf(t) + t.length - 1];
          const p = spring({ frame: local - done, fps: FPS, config: { damping: 12, stiffness: 240, mass: 0.5 } });
          return (
            <div key={t} style={{ height: 36, padding: "0 14px 0 11px", borderRadius: 18, display: "flex", alignItems: "center", gap: 7, fontFamily: inter.fontFamily, fontSize: 15, fontWeight: 500, color: "#fff", background: "rgb(30,30,33)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.22)", opacity: Math.min(1, p * 2), transform: `scale(${0.6 + 0.4 * p})` }}>
              <span style={{ width: 16, height: 16, borderRadius: 99, background: "#fff", color: "#111", fontSize: 10, fontWeight: 700, lineHeight: "16px", textAlign: "center" }}>✓</span>
              {t}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, top: btnY, width: IW, height: 56, borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: inter.fontFamily, fontSize: 17, fontWeight: 600, ...btnDark, color: "rgba(255,255,255,0.4)" }}>Launch →</div>
      <div style={{ position: "absolute", left: 0, top: btnY, width: IW, height: 56, borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: inter.fontFamily, fontSize: 17, fontWeight: 600, ...btnLight, opacity: Math.min(1, ready * 2), transform: `scale(${(1 + 0.05 * Math.sin(Math.min(1, ready) * Math.PI)) * pressScale(local, Q_PRESS)})` }}>
        Launch →
      </div>
      <Ripple local={local} at={Q_PRESS} x={IW / 2} y={btnY + 28} />
    </>
  );
};

const RUN_CX = IW / 2;
const RUN_CY = 314;
const RUN_SC = 0.82;
const Run: React.FC<{ frame: number }> = ({ frame }) => {
  const labels = ["SCAN", "SCREENING", "SHORTLIST", "CONSENT"];
  const counts = ["PROFILES SCANNED", "MATCH YOUR ROLE", "SHORTLISTED", "SAID YES"];
  const t = runSec(frame);
  const cur = t < PH[1] ? 0 : t < PH[2] ? 1 : t < PH[3] ? 2 : 3;
  const yesFade = lerp(frame, [st("run") + s(PH[3]), st("run") + s(PH[3]) + Math.round(16 * RUN_K)], [1, 0]);
  const barW = (IW - 3 * 10) / 4;
  return (
    <>
      <Img src={fig("k-pill.png")} style={{ position: "absolute", left: -10, top: -10, height: 64, width: 64 * (880 / 375) }} />
      <div style={{ position: "absolute", right: 0, top: 2, height: 42, padding: "0 16px", borderRadius: 21, display: "flex", alignItems: "center", gap: 9, background: "rgb(40,40,43)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14)" }}>
        <div style={{ width: 6, height: 6, borderRadius: 9, background: "#fff" }} />
        <div style={{ fontFamily: mono.fontFamily, fontWeight: 700, fontSize: 22, color: "#fff", letterSpacing: -0.3 }}>{mmss(remaining(frame))}</div>
      </div>
      {labels.map((l, i) => (
        <div key={l} style={{ position: "absolute", left: i * (barW + 10), top: 60, width: barW }}>
          <div style={{ height: 3.5, borderRadius: 2, background: "rgba(255,255,255,0.16)", overflow: "hidden" }}>
            <div style={{ width: `${phaseP(frame, i) * 100}%`, height: "100%", background: "#fff" }} />
          </div>
          <div style={{ marginTop: 8, fontFamily: inter.fontFamily, fontSize: 11, letterSpacing: 1.6, color: i <= cur ? "#fff" : "rgba(255,255,255,0.32)" }}>{l}</div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 0, top: 96, fontFamily: inter.fontFamily, fontWeight: 300, fontSize: 50, lineHeight: "56px", color: "#fff", letterSpacing: -1.2 }}>{lakh(countAt(frame))}</div>
      {counts.map((c, i) => {
        const o = interpolate(t, [PH[i] - 0.07, PH[i] + 0.07, PH[i + 1] - 0.07, PH[i + 1] + 0.07], [i === 0 ? 1 : 0, 1, 1, i === 3 ? 1 : 0], C);
        return <div key={c} style={{ position: "absolute", left: 2, top: 152, fontFamily: inter.fontFamily, fontSize: 11, letterSpacing: 1.8, color: "rgba(255,255,255,0.55)", opacity: o }}>{c}</div>;
      })}
      {/* crowd, drawn in its native frame and mapped onto the canvas */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 393, height: 852, transformOrigin: `${CX}px ${CY}px`, transform: `translate(${RUN_CX - CX}px, ${RUN_CY - CY}px) scale(${RUN_SC})` }}>
        <Crowd frame={frame} />
        <Radar frame={frame} tint={yesFade} />
      </div>
    </>
  );
};

// the people who consented (same faces as the radar), with card details
type CityCfg = { city: string; people: Person[]; liteBook?: boolean; query?: boolean; qLocal?: number; role?: RoleKey; hook?: Hook; hero?: "briefcase" | "cards"; headline?: Headline; fan?: 3 | 5; hookImg?: { src: string; ar: number }; pillText?: { text: string; em: number }; noPill?: boolean; tidy?: boolean; endWhat?: string; hookLayout?: HookLayout; heroPhoto?: boolean; heroPhotos?: 1 | 3; bigHook?: boolean; subline?: string; trio?: TrioPerson[]; stamp?: string[]; stampStyle?: "ink" | "seal" | "kicker" };
const PUNE: Person[] = [
  { face: 1, name: "Sahil Mehta", role: "Backend Lead", co: "Cred", yrs: 8, match: 91, slot: "Thu 09, 12:00 PM", skills: ["Go", "Kafka", "AWS"] },
  { face: 2, name: "Riya Nair", role: "SDE-3", co: "Zepto", yrs: 6, match: 94, slot: "Wed 08, 11:00 AM", skills: ["Go", "Kafka", "Postgres", "Startup exp"] },
  { face: 6, name: "Rahul Patil", role: "Senior SDE", co: "Druva", yrs: 7, match: 90, slot: "Fri 10, 03:00 PM", skills: ["Java", "Redis", "gRPC"] },
  { face: 12, name: "Divya Kulkarni", role: "SDE-2", co: "Pubmatic", yrs: 5, match: 88, slot: "Wed 08, 11:00 AM", skills: ["Node", "Postgres"] },
  { face: 16, name: "Vikram Rao", role: "Platform Eng", co: "Bajaj Finserv", yrs: 6, match: 87, slot: "Thu 09, 12:00 PM", skills: ["K8s", "Go"] },
  { face: 17, name: "Priya Deshmukh", role: "SDE-3", co: "Icertis", yrs: 7, match: 89, slot: "Fri 10, 03:00 PM", skills: ["Python", "Kafka"] },
];
const CHENNAI: Person[] = [
  { face: 1, name: "Sahil Mehta", role: "Backend Lead", co: "Zoho", yrs: 8, match: 91, slot: "Thu 09, 12:00 PM", skills: ["Go", "Kafka", "AWS"] },
  { face: 2, name: "Riya Nair", role: "SDE-3", co: "Freshworks", yrs: 6, match: 94, slot: "Wed 08, 11:00 AM", skills: ["Go", "Kafka", "Postgres", "Startup exp"] },
  { face: 6, name: "Rahul Iyer", role: "Senior SDE", co: "Chargebee", yrs: 7, match: 90, slot: "Fri 10, 03:00 PM", skills: ["Java", "Redis", "gRPC"] },
  { face: 12, name: "Divya Krishnan", role: "SDE-2", co: "Kissflow", yrs: 5, match: 88, slot: "Wed 08, 11:00 AM", skills: ["Node", "Postgres"] },
  { face: 16, name: "Vikram Rao", role: "Platform Eng", co: "Uniphore", yrs: 6, match: 87, slot: "Thu 09, 12:00 PM", skills: ["K8s", "Go"] },
  { face: 17, name: "Priya Subramanian", role: "SDE-3", co: "Rocketlane", yrs: 7, match: 89, slot: "Fri 10, 03:00 PM", skills: ["Python", "Kafka"] },
];
const BANGALORE: Person[] = [
  { face: 1, name: "Sahil Mehta", role: "Backend Lead", co: "Flipkart", yrs: 8, match: 91, slot: "Thu 09, 12:00 PM", skills: ["Go", "Kafka", "AWS"] },
  { face: 2, name: "Riya Nair", role: "SDE-3", co: "Zepto", yrs: 6, match: 94, slot: "Wed 08, 11:00 AM", skills: ["Go", "Kafka", "Postgres", "Startup exp"] },
  { face: 6, name: "Rahul Shetty", role: "Senior SDE", co: "Razorpay", yrs: 7, match: 90, slot: "Fri 10, 03:00 PM", skills: ["Java", "Redis", "gRPC"] },
  { face: 12, name: "Divya Hegde", role: "SDE-2", co: "Swiggy", yrs: 5, match: 88, slot: "Wed 08, 11:00 AM", skills: ["Node", "Postgres"] },
  { face: 16, name: "Vikram Rao", role: "Platform Eng", co: "Meesho", yrs: 6, match: 87, slot: "Thu 09, 12:00 PM", skills: ["K8s", "Go"] },
  { face: 17, name: "Priya Gowda", role: "SDE-3", co: "Groww", yrs: 7, match: 89, slot: "Fri 10, 03:00 PM", skills: ["Python", "Kafka"] },
];
const Ctx = createContext<CityCfg>({ city: "Pune", people: PUNE });
const useCity = () => useContext(Ctx);
const usePeople = () => useCity().people;
// shrink a one-line label past `chars` characters (Inter averages ~0.49em per char)
const fit = (t: string, size: number, chars: number) => Math.min(size, (size * chars) / t.length);
const short = (n: string) => `${n.split(" ")[0]} ${n.split(" ")[1][0]}.`;
const faceSm = (i: number) => staticFile(`faces/f${String(i).padStart(3, "0")}.jpg`);
const faceHi = (i: number) => staticFile(`faces_hi/c${String(i).padStart(3, "0")}.jpg`);
const photoHi = (p: Person) => (p.photo ? staticFile(`people/${p.photo}.jpg`) : faceHi(p.face));
const photoSm = (p: Person) => (p.photo ? staticFile(`people/${p.photo}_sq.jpg`) : faceSm(p.face));
// keep the face in frame when a 3:2 photo is cropped into a narrow card
const photoPos = (p: Person) => `${Math.round((p.fx ?? 0.5) * 100)}% 40%`;

const S10: React.FC<{ local: number }> = ({ local }) => {
  const PEOPLE = usePeople();
  const slam = spring({ frame: local - s(0.35), fps: FPS, config: { damping: 12, stiffness: 180, mass: 0.7 } });
  const title = spring({ frame: local - s(0.5), fps: FPS, config: { damping: 15, stiffness: 160, mass: 0.7 } });
  const fs = 60;
  const ov = 14;
  const n = PEOPLE.length + 1;
  const rowW = n * fs - (n - 1) * ov;
  const left = (IW - rowW) / 2;
  return (
    <>
      {PEOPLE.map((p, i) => {
        const q = spring({ frame: local - 3 - i * 3, fps: FPS, config: { damping: 15, stiffness: 200, mass: 0.6 } });
        return <Img key={p.face} src={photoSm(p)} style={{ position: "absolute", left: left + i * (fs - ov), top: 34, width: fs, height: fs, borderRadius: 99, objectFit: "cover", boxShadow: "0 0 0 3px rgb(17,17,19)", transform: `scale(${0.4 + 0.6 * q})`, opacity: Math.min(1, q * 2) }} />;
      })}
      <div style={{ position: "absolute", left: left + PEOPLE.length * (fs - ov), top: 34, width: fs, height: fs, borderRadius: 99, background: "rgb(40,40,43)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: inter.fontFamily, fontSize: 18, color: "rgba(255,255,255,0.85)", boxShadow: "0 0 0 3px rgb(17,17,19)", opacity: lerp(local, [20, 26], [0, 1]) }}>+8</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 108, textAlign: "center", fontFamily: inter.fontFamily, fontWeight: 300, fontSize: 132, lineHeight: "140px", color: "#fff", letterSpacing: -4, transform: `scale(${0.6 + 0.4 * slam})`, opacity: Math.min(1, slam * 2) }}>14</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 262, textAlign: "center", fontFamily: inter.fontFamily, fontSize: 30, lineHeight: "38px", color: "#fff", letterSpacing: -0.5, opacity: title, transform: `translateY(${(1 - title) * 10}px)` }}>
        candidates want
        <br />
        to work with you
      </div>
      <div style={{ position: "absolute", left: 0, top: IH - 58, width: IW, height: 56, borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: inter.fontFamily, fontSize: 17, fontWeight: 600, ...btnLight, transform: `scale(${pressScale(local, 1.2)})` }}>Review shortlist →</div>
      <Ripple local={local} at={1.2} x={IW / 2} y={IH - 30} />
    </>
  );
};

// a candidate card, drawn in code in the Figma card style
const CARD_H = 392;
const CandidateCard: React.FC<{ p: Person; top: boolean; local: number; book: boolean }> = ({ p, top, local, book }) => {
  const { city } = useCity();
  return (
  <div style={{ position: "relative", width: IW, height: CARD_H, borderRadius: 24, overflow: "hidden", background: "rgb(30,30,33)", boxShadow: top ? "0 0 0 1.5px rgba(255,255,255,0.55), 0 0 30px rgba(255,255,255,0.12)" : "inset 0 0 0 1px rgba(255,255,255,0.1)" }}>
    <Img src={photoHi(p)} style={{ position: "absolute", left: 0, top: 0, width: IW, height: 236, objectFit: "cover" }} />
    <div style={{ position: "absolute", left: 0, top: 120, width: IW, height: 116, background: "linear-gradient(180deg, rgba(30,30,33,0), rgb(30,30,33))" }} />
    <div style={{ position: "absolute", left: 14, top: 14, padding: "5px 11px", borderRadius: 14, background: "rgba(245,245,247,0.92)", color: "#111", fontFamily: mono.fontFamily, fontWeight: 700, fontSize: 12, letterSpacing: 0.5 }}>{p.match} MATCH</div>
    {top && <div style={{ position: "absolute", right: 14, top: 14, padding: "5px 11px", borderRadius: 14, background: "rgba(20,20,22,0.75)", color: "#fff", fontFamily: mono.fontFamily, fontWeight: 700, fontSize: 12, letterSpacing: 0.5, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.3)" }}>★ TOP PICK</div>}
    <div style={{ position: "absolute", left: 18, top: 176, fontFamily: inter.fontFamily, fontWeight: 600, fontSize: 29, color: "#fff", letterSpacing: -0.5 }}>{p.name}</div>
    <div style={{ position: "absolute", left: 18, top: 214, fontFamily: inter.fontFamily, fontSize: fit(`${p.role} at ${p.co} · ${p.yrs} yrs · ${city}`, 15, 42), color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap" }}>{p.role} at {p.co} · {p.yrs} yrs · {city}</div>
    <div style={{ position: "absolute", left: 18, top: 250, display: "flex", gap: 7 }}>
      {p.skills.map((k) => <div key={k} style={{ padding: "6px 12px", borderRadius: 15, fontFamily: inter.fontFamily, fontSize: 13.5, color: "#fff", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)", background: "rgb(38,38,41)" }}>{k}</div>)}
    </div>
    <div style={{ position: "absolute", left: 18, top: 296, fontFamily: inter.fontFamily, fontSize: 13.5, color: "rgba(255,255,255,0.8)" }}>● Free {p.slot}{top && !useCity().query ? ". Matches your slot." : ""}</div>
    <div style={{ position: "absolute", left: 16, top: 326, width: IW - 32, height: 50, borderRadius: 25, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: inter.fontFamily, fontSize: 16, fontWeight: 600, ...(top ? btnLight : btnDark), transform: `scale(${book ? pressScale(local, 2.25) : 1})` }}>Book {p.slot.split(",")[0].split(" ")[0]} {p.slot.split(", ")[1]} →</div>
  </div>
);
};

const S11: React.FC<{ local: number }> = ({ local }) => {
  const PEOPLE = usePeople();
  const HERO = PEOPLE[1];
  const up = spring({ frame: local, fps: FPS, config: { damping: 16, stiffness: 130, mass: 0.85 } });
  const gap = 14;
  const startY = 52;
  // scroll: show card 1, then glide to card 2 (the top pick)
  const scroll = lerp(local, [s(0.9), s(1.7)], [0, CARD_H + gap]);
  const list = [PEOPLE[0], HERO, PEOPLE[2]];
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: startY, width: IW, height: IH - startY, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: -scroll + (1 - up) * 30, opacity: Math.min(1, up * 2) }}>
          {list.map((p, i) => (
            <div key={p.face} style={{ position: "absolute", left: 0, top: i * (CARD_H + gap), width: IW }}>
              <CandidateCard p={p} top={i === 1} local={local} book={i === 1} />
            </div>
          ))}
        </div>
        <Ripple local={local} at={2.25} x={IW / 2} y={CARD_H + gap - scroll + 351} />
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, width: IW, height: startY, background: BG }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 2, textAlign: "center", fontFamily: inter.fontFamily, fontSize: 22.5, lineHeight: "40px", color: "#fff", letterSpacing: -0.4, whiteSpace: "nowrap" }}>
        <span style={{ fontWeight: 700 }}>14 people</span> want to work with you
      </div>
    </>
  );
};

// interview ticket, drawn in code for the top pick
const Book: React.FC<{ local: number }> = ({ local }) => {
  const HERO = usePeople()[1];
  const head = spring({ frame: local - s(1.25), fps: FPS, config: { damping: 12, stiffness: 190, mass: 0.6 } });
  const enter = spring({ frame: local, fps: FPS, config: { damping: 16, stiffness: 130, mass: 0.85 } });
  const conf = lerp(local, [s(1.2), s(1.2) + 6], [0, 1]);
  const r3 = lerp(local, [s(1.5), s(1.5) + 6], [0, 1]);
  const r1 = spring({ frame: local - s(0.35), fps: FPS, config: { damping: 12, stiffness: 200, mass: 0.6 } });
  const wait = local >= s(0.6) && local < s(1.2);
  const pulse = (local % 24) / 24;
  const TH = 372;
  const ticketY = interpolate(head, [0, 1], [(IH - TH) / 2, 58], C);
  const first = HERO.name.split(" ")[0];
  const Step: React.FC<{ y: number; done: number; t1: string; t2: string }> = ({ y, done, t1, t2 }) => (
    <div style={{ position: "absolute", left: 20, top: y, display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{ width: 30, height: 30, borderRadius: 99, flex: "0 0 auto", background: done > 0.5 ? "#fff" : "transparent", boxShadow: done > 0.5 ? "none" : "inset 0 0 0 1.5px rgba(255,255,255,0.45)", color: "#111", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.85 + 0.15 * Math.min(1, done)})` }}>{done > 0.5 ? "✓" : ""}</div>
      <div>
        <div style={{ fontFamily: inter.fontFamily, fontSize: 17, color: done > 0.5 ? "#fff" : "rgba(255,255,255,0.6)" }}>{t1}</div>
        <div style={{ fontFamily: inter.fontFamily, fontSize: 12.5, letterSpacing: 0.6, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{t2}</div>
      </div>
    </div>
  );
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 2, textAlign: "center", ...chrome, fontSize: 44, lineHeight: 1, whiteSpace: "nowrap", opacity: Math.min(1, head * 2), transform: `skewX(-9deg) scale(${1.15 - 0.15 * head})` }}>Interview booked</div>
      <div style={{ position: "absolute", left: 0, top: ticketY + (1 - enter) * 30, width: IW, height: TH, borderRadius: 24, background: "rgb(30,30,33)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)", opacity: Math.min(1, enter * 2) }}>
        <div style={{ position: "absolute", left: 20, top: 20, fontFamily: inter.fontFamily, fontSize: 12, letterSpacing: 1.6, color: "rgba(255,255,255,0.55)" }}>INTERVIEW · 30 MIN · GOOGLE MEET</div>
        <div style={{ position: "absolute", left: 20, top: 42, fontFamily: inter.fontFamily, fontWeight: 600, fontSize: 32, color: "#fff", letterSpacing: -0.6 }}>Wed 08 · 11:00 AM</div>
        <Img src={photoSm(HERO)} style={{ position: "absolute", left: 20, top: 98, width: 52, height: 52, borderRadius: 99, objectFit: "cover" }} />
        <div style={{ position: "absolute", left: 84, top: 100, fontFamily: inter.fontFamily, fontWeight: 600, fontSize: 18, color: "#fff" }}>{HERO.name}</div>
        <div style={{ position: "absolute", left: 84, top: 126, fontFamily: inter.fontFamily, fontSize: fit(`${HERO.role} at ${HERO.co} · ${HERO.match} match`, 14, 35), color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>{HERO.role} at {HERO.co} · {HERO.match} match</div>
        <div style={{ position: "absolute", left: 20, right: 20, top: 170, borderTop: "1.5px dashed rgba(255,255,255,0.2)" }} />
        <div style={{ position: "absolute", left: 34.5, top: 222, width: 1.5, height: 108, background: "rgba(255,255,255,0.25)" }} />
        <Step y={190} done={r1} t1="You confirmed" t2="04:21" />
        {wait && <div style={{ position: "absolute", left: 35 - 16 * pulse, top: 260 - 16 * pulse, width: 32 * pulse, height: 32 * pulse, borderRadius: 99, border: "1.5px solid rgba(255,255,255,0.8)", opacity: 1 - pulse }} />}
        <Step y={245} done={conf} t1={conf > 0.5 ? `${first} confirmed` : `${first} is confirming`} t2={conf > 0.5 ? "04:48" : "USUALLY UNDER 2 MINS"} />
        <Step y={300} done={r3} t1={r3 > 0.5 ? "Meet link sent to your email" : "Meet link lands in your email"} t2={r3 > 0.5 ? "04:49" : "AFTER BOTH CONFIRM"} />
      </div>
    </>
  );
};

// Lighter booking card (test variant): same 3-step ticket, far less text.
const BookLite: React.FC<{ local: number }> = ({ local }) => {
  const HERO = usePeople()[1];
  const first = HERO.name.split(" ")[0];
  const head = spring({ frame: local - s(1.25), fps: FPS, config: { damping: 12, stiffness: 190, mass: 0.6 } });
  const enter = spring({ frame: local, fps: FPS, config: { damping: 16, stiffness: 130, mass: 0.85 } });
  const r1 = spring({ frame: local - s(0.35), fps: FPS, config: { damping: 12, stiffness: 200, mass: 0.6 } });
  const conf = lerp(local, [s(1.2), s(1.2) + 6], [0, 1]);
  const r3 = lerp(local, [s(1.5), s(1.5) + 6], [0, 1]);
  const wait = local >= s(0.6) && local < s(1.2);
  const pulse = (local % 24) / 24;
  const TH = 318;
  const ticketY = interpolate(head, [0, 1], [(IH - TH) / 2, 66], C);
  const steps: [number, number, string][] = [
    [r1, 176, "You confirmed"],
    [conf, 226, conf > 0.5 ? `${first} confirmed` : `${first} confirming…`],
    [r3, 276, "Meet link sent"],
  ];
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 2, textAlign: "center", ...chrome, fontSize: 44, lineHeight: 1, whiteSpace: "nowrap", opacity: Math.min(1, head * 2), transform: `skewX(-9deg) scale(${1.15 - 0.15 * head})` }}>Interview booked</div>
      <div style={{ position: "absolute", left: 0, top: ticketY + (1 - enter) * 30, width: IW, height: TH, borderRadius: 24, background: "rgb(30,30,33)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)", opacity: Math.min(1, enter * 2) }}>
        <div style={{ position: "absolute", left: 22, top: 22, fontFamily: inter.fontFamily, fontWeight: 600, fontSize: 34, color: "#fff", letterSpacing: -0.6 }}>Wed 08 · 11:00 AM</div>
        <Img src={photoSm(HERO)} style={{ position: "absolute", left: 22, top: 80, width: 50, height: 50, borderRadius: 99, objectFit: "cover" }} />
        <div style={{ position: "absolute", left: 84, top: 82, fontFamily: inter.fontFamily, fontWeight: 600, fontSize: 19, color: "#fff" }}>{HERO.name}</div>
        <div style={{ position: "absolute", left: 84, top: 108, fontFamily: inter.fontFamily, fontSize: fit(`${HERO.role} at ${HERO.co}`, 14.5, 34), color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>{HERO.role} at {HERO.co}</div>
        <div style={{ position: "absolute", left: 22, right: 22, top: 152, borderTop: "1.5px dashed rgba(255,255,255,0.2)" }} />
        <div style={{ position: "absolute", left: 36.5, top: 196, width: 1.5, height: 100, background: "rgba(255,255,255,0.25)" }} />
        {wait && <div style={{ position: "absolute", left: 37 - 16 * pulse, top: 241 - 16 * pulse, width: 32 * pulse, height: 32 * pulse, borderRadius: 99, border: "1.5px solid rgba(255,255,255,0.8)", opacity: 1 - pulse }} />}
        {steps.map(([done, y, t]) => (
          <div key={y} style={{ position: "absolute", left: 22, top: y, display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 30, height: 30, borderRadius: 99, background: done > 0.5 ? "#fff" : "rgb(30,30,33)", boxShadow: done > 0.5 ? "none" : "inset 0 0 0 1.5px rgba(255,255,255,0.45)", color: "#111", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.85 + 0.15 * Math.min(1, done)})` }}>{done > 0.5 ? "✓" : ""}</div>
            <div style={{ fontFamily: inter.fontFamily, fontSize: 19, color: done > 0.5 ? "#fff" : "rgba(255,255,255,0.55)" }}>{t}</div>
          </div>
        ))}
      </div>
    </>
  );
};

const SceneBody: React.FC<{ k: K; local: number; frame: number }> = ({ k, local, frame }) => {
  if (k === "s01") return <S01 local={local} />;
  if (k === "s02") return useCity().query ? <S02Q local={useCity().qLocal ?? local} /> : <S02 local={local} />;
  if (k === "run") return <Run frame={frame} />;
  if (k === "s10") return <S10 local={local} />;
  if (k === "s11") return <S11 local={local} />;
  return useCity().liteBook ? <BookLite local={local} /> : <Book local={local} />;
};

// ---------------- speed clock streak into the run ----------------
const ClockStreak: React.FC<{ frame: number }> = ({ frame }) => {
  const t0 = st("run") - 14;
  const p = (frame - t0) / 22;
  if (p < 0 || p > 1) return null;
  const w = 980;
  return (
    <>
      {[0.12, 0.06, 0].map((lag, i) => {
        const ee = Easing.inOut(Easing.cubic)(Math.max(0, p - lag));
        return <Img key={i} src={fig("k-clock.png")} style={{ position: "absolute", left: -w + (W + w) * ee, top: 420, width: w, height: w * (713 / 1252), opacity: i === 2 ? 1 : 0.3, filter: i === 2 ? "drop-shadow(0 30px 60px rgba(0,0,0,0.8))" : "blur(6px)" }} />;
      })}
    </>
  );
};

const Viewport: React.FC<{ frame: number; opacity: number }> = ({ frame, opacity }) => {
  const { tidy } = useCity();
  const layers = SCENES.filter((k) => frame >= st(k) && frame < en(k) + 6);
  return (
    <div style={{ position: "absolute", left: M, top: M, width: VW, height: VH, borderRadius: 46, overflow: "hidden", background: BG, opacity, boxShadow: "0 0 0 1px rgba(255,255,255,0.08)" }}>
      {layers.map((k) => {
        const local = frame - st(k);
        const fade = k === "s01" && tidy ? 1 : tidy ? lerp(local, [3, 8], [0, 1], Easing.out(Easing.cubic)) : lerp(local, [0, 6], [0, 1], Easing.out(Easing.cubic));
        const out = tidy ? lerp(frame, [en(k), en(k) + 3], [1, 0]) : lerp(frame, [en(k), en(k) + 6], [1, 0]);
        return (
          <div key={k} style={{ position: "absolute", left: 0, top: 0, width: CW, height: CH, transformOrigin: "top left", transform: `scale(${KK * (1.02 - 0.02 * fade)})`, opacity: fade * out, background: BG }}>
            <div style={{ position: "absolute", left: PX, top: PY, width: IW, height: IH }}>
              <SceneBody k={k} local={local} frame={frame} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const End: React.FC<{ local: number }> = ({ local }) => {
  const a = (d: number) => spring({ frame: local - s(d), fps: FPS, config: { damping: 14, stiffness: 150, mass: 0.8 } });
  const [logo, line, cta] = [a(0), a(0.3), a(0.55)];
  const draw1 = lerp(local, [s(0.7), s(1.2)], [0, 1], Easing.out(Easing.quad));
  const draw2 = lerp(local, [s(1.1), s(1.6)], [0, 1], Easing.out(Easing.quad));
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Img src={staticFile("brand/tal-boss-wordmark-cream.png")} style={{ position: "absolute", left: "50%", top: 380, height: 300, transform: `translateX(-50%) scale(${1.15 - 0.15 * logo})`, opacity: Math.min(1, logo * 2), filter: `blur(${(1 - logo) * 4}px)` }} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 722, textAlign: "center", fontFamily: inter.fontFamily, fontWeight: 400, fontSize: 40, lineHeight: "56px", color: "rgba(255,255,255,0.6)", opacity: line, transform: `translateY(${(1 - line) * 16}px)` }}>
        Get{" "}
        <Underline progress={draw1} color="#fff" strokeWidth={4} padding={{ top: 2 }} iterations={2} seed={4}>
          <span style={{ color: "#fff", fontWeight: 700 }}>{useCity().endWhat ?? `${useCity().city}’s best candidates`}</span>
        </Underline>
        <br />
        on calendar in{" "}
        <Underline progress={draw2} color="#fff" strokeWidth={4} padding={{ top: 2 }} iterations={2} seed={9}>
          <span style={{ color: "#fff", fontWeight: 700 }}>10 mins</span>
        </Underline>
      </div>
      <Img src={staticFile("brand/badges-stores.png")} style={{ position: "absolute", left: "50%", top: 892, width: 620, transform: `translateX(-50%) translateY(${(1 - cta) * 20}px)`, opacity: cta }} />
    </AbsoluteFill>
  );
};

export const TOTAL_Q = TOTAL + s(Q_EXTRA);
const withTrio = (people: Person[], trio?: TrioPerson[]) => (trio ? people.map((p, i) => (trio[i] ? { ...p, ...trio[i] } : p)) : people);
// tidy cuts drop 1.5s of the end card's static hold
export const END_TRIM = s(1.5);
export const HireIn10: React.FC<{ city?: "Pune" | "Chennai" | "Bangalore"; liteBook?: boolean; query?: boolean; role?: RoleKey; hook?: Hook; hero?: "briefcase" | "cards"; headline?: Headline; fan?: 3 | 5; hookImg?: { src: string; ar: number }; pillText?: { text: string; em: number }; noPill?: boolean; tidy?: boolean; endWhat?: string; hookLayout?: HookLayout; heroPhoto?: boolean; heroPhotos?: 1 | 3; bigHook?: boolean; subline?: string; trio?: TrioPerson[]; stamp?: string[]; stampStyle?: "ink" | "seal" | "kicker" }> = ({ city = "Pune", liteBook = false, query = false, role, hook = "hire", hero = "briefcase", headline, fan, hookImg, pillText, noPill, tidy, endWhat, hookLayout, heroPhoto, heroPhotos, bigHook, subline, trio, stamp, stampStyle }) => {
  const real = useCurrentFrame();
  // query cut: freeze the timeline just after s02 fades in while S02Q plays its extra time, then shift
  const hold = st("s02") + 6;
  const D = query ? s(Q_EXTRA) : 0;
  const frame = real <= hold ? real : real <= hold + D ? hold : real - D;
  const vpOut = lerp(frame, [st("end") - 3, st("end") + 8], [1, 0]);
  const flash = interpolate(frame, [st("run") - 3, st("run"), st("run") + 9], [0, 0.6, 0], C);
  return (
    <Ctx.Provider value={{ city, liteBook, query, role, hook, hero, headline, fan, hookImg, pillText, noPill, tidy, endWhat, hookLayout, heroPhoto, heroPhotos, bigHook, subline, stamp, stampStyle, qLocal: real - st("s02"), people: withTrio(role ? ROLES[role].people : city === "Chennai" ? CHENNAI : city === "Bangalore" ? BANGALORE : PUNE, trio) }}>
    <AbsoluteFill style={{ background: "#050506" }}>
      {frame < st("end") + 10 && <Viewport frame={frame} opacity={vpOut} />}
      <ClockStreak frame={frame} />
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
      {frame >= st("end") && <End local={frame - st("end")} />}
    </AbsoluteFill>
    </Ctx.Provider>
  );
};
