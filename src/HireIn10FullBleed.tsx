// ============================================================
// "Hire in 10 mins": tal in 10 as a 4:5 ad. Full-bleed, Pune cut.
// Source: Prometheus Figma, Page 1 frames 677:4279 → 677:5264.
// The real UI fills the frame (thin stage border only) and a camera moves
// inside it. Flow: 01 promise (+ Pune) → 02 pick two slots fast → speed clock
// streak → 05 hold to launch → the run (06–09) over a crowd of real faces that
// thins at every step → 10 shortlist → 11 book → 13 4:21 → 14 locked in →
// tal BOSS, download the app.
// A finger (👆) travels between every tap so the clicks read as a person.
// Faces: Unsplash photos (free licence) face-cropped into public/faces.
// Live counters/timers and changed copy are drawn over feathered colour
// patches that hide the static Figma text. s11p.png = s11 with "Bengaluru"
// inpainted out (re-set as Pune).
// (The floating-phone version lives in HireIn10Phone.tsx.)
// ============================================================
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont } from "@remotion/fonts";

const FPS = 30;
const W = 1080;
const H = 1350;

const OBV = "Obviously Narrow";
loadFont({ family: OBV, url: staticFile("fonts/ObviouslyNarrowBold.otf"), weight: "700" });
const inter = loadInter("normal", { weights: ["300", "400", "500", "600"], ignoreTooManyRequestsWarning: true });
const interItalic = loadInter("italic", { weights: ["200"], ignoreTooManyRequestsWarning: true });
const mono = loadMono("normal", { weights: ["700"], ignoreTooManyRequestsWarning: true });

const s = (sec: number) => Math.round(sec * FPS);
const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EIO = Easing.inOut(Easing.cubic);
const lerp = (f: number, i: number[], o: number[], e = EIO) => interpolate(f, i, o, { ...C, easing: e });
const fig = (n: string) => staticFile(`fig/${n}`);

// ---------------- timeline (seconds) ----------------
const T = {
  s01: [0, 2.4], // promise: HIRE IN 10 MINS + Pune + briefcase
  s02: [2.4, 4.6], // pick one slot, launch
  run: [4.6, 10.8], // scan → filter → ask → yes, one continuous scene
  s10: [10.8, 12.4], // shortlist ready
  s11: [12.4, 13.8], // book Aarav
  book: [13.8, 16.8], // interview ticket: you confirmed → Aarav confirming → confirmed
  end: [16.8, 19.4], // tal BOSS + store badges
} as const;
type K = keyof typeof T;
export const TOTAL_FB = s(T.end[1]);
const st = (k: K) => s(T[k][0]);
const en = (k: K) => s(T[k][1]);
const SCREENS: K[] = ["s01", "s02", "run", "s10", "s11", "book"];

// ---------------- viewport ----------------
const M = 34;
const VW = W - 2 * M;
const VH = H - 2 * M;
const K0 = VW / 393;

type Key = [number, number, number]; // [sec, native y at top, zoom]
const CAM: Record<string, Key[]> = {
  s01: [[0, 70, 0.9]],
  s02: [[0, 128, 0.72]],
  run: [[0, 50, 0.86]],
  s10: [[0, 114, 0.775]],
  s11: [[0, 48, 0.88]],
  book: [[0, 269, 1.1]],
};
const camOf = (k: K, local: number) => {
  const keys = CAM[k];
  if (keys.length === 1) return { y: keys[0][1], z: keys[0][2] };
  const t = keys.map((q) => s(q[0]));
  return {
    y: interpolate(local, t, keys.map((q) => q[1]), { ...C, easing: EIO }),
    z: interpolate(local, t, keys.map((q) => q[2]), { ...C, easing: EIO }),
  };
};

// run phases (seconds into the run): scan, filter, ask, yes
const PH = [0, 1.5, 3.0, 4.4, 6.2];
const runSec = (f: number) => (f - st("run")) / FPS;
const remaining = (f: number) => interpolate(runSec(f), [0, 6.2], [600, 318], C);
// the profile count falls continuously (log-linear between the Figma checkpoints)
const countAt = (f: number) => {
  const t = runSec(f);
  const lg = interpolate(t, [0, 1.5, 3.0, 4.4, 5.2], [500000, 442190, 62613, 75, 14].map(Math.log), C);
  return Math.exp(lg);
};
const phaseP = (f: number, i: number) => interpolate(runSec(f), [PH[i], PH[i + 1]], [0, 1], C);
const mmss = (secs: number, pad = true) => {
  const m = Math.floor(secs / 60);
  return `${pad ? String(m).padStart(2, "0") : m}:${String(Math.floor(secs % 60)).padStart(2, "0")}`;
};
const lakh = (n: number) => {
  const x = Math.round(n).toString();
  if (x.length <= 3) return x;
  return `${x.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${x.slice(-3)}`;
};

// ---------------- the finger ----------------
// taps: [sec, x, y, holdSec?] in a screen's native coords
type TapK = [number, number, number, number?];
const TAPS: Partial<Record<K, TapK[]>> = {
  s02: [[0.4, 209, 326], [0.8, 196, 574], [1.4, 258, 786]],
  s10: [[1.2, 196, 728]],
  s11: [[0.95, 196, 510]],
};
const PRESS = 5;
const Finger: React.FC<{ k: K; local: number }> = ({ k, local }) => {
  const taps = TAPS[k];
  if (!taps) return null;
  const lead = 9; // frames to travel to each target
  const t = taps.map((q) => s(q[0]));
  const last = taps[taps.length - 1];
  const lastEnd = s(last[0]) + s(last[3] ?? 0) + 6;
  // entry point below-right of the first target, exit back the same way
  const ix = taps[0][1] + 70;
  const iy = taps[0][2] + 170;
  const times = [t[0] - lead - 8, ...t.flatMap((v, i) => [v - (i === 0 ? 0 : 0), v + s(taps[i][3] ?? 0)]), lastEnd + 10];
  const xs = [ix, ...taps.flatMap((q) => [q[1], q[1]]), last[1] + 70];
  const ys = [iy, ...taps.flatMap((q) => [q[2], q[2]]), last[2] + 170];
  // between consecutive taps, travel in the `lead` frames before the next one
  const keyT: number[] = [];
  const keyX: number[] = [];
  const keyY: number[] = [];
  keyT.push(times[0]); keyX.push(xs[0]); keyY.push(ys[0]);
  taps.forEach((q, i) => {
    const arrive = t[i];
    const leave = arrive + s(q[3] ?? 0) + 3;
    keyT.push(Math.max(keyT[keyT.length - 1] + 1, arrive - 1)); keyX.push(q[1]); keyY.push(q[2]);
    keyT.push(Math.max(keyT[keyT.length - 1] + 1, leave)); keyX.push(q[1]); keyY.push(q[2]);
  });
  keyT.push(keyT[keyT.length - 1] + 12); keyX.push(xs[xs.length - 1]); keyY.push(ys[ys.length - 1]);
  void times;
  const x = interpolate(local, keyT, keyX, { ...C, easing: EIO });
  const y = interpolate(local, keyT, keyY, { ...C, easing: EIO });
  const vis = interpolate(local, [keyT[0], keyT[0] + 6, keyT[keyT.length - 1] - 6, keyT[keyT.length - 1]], [0, 1, 1, 0], C);
  const pressed = taps.some((q) => {
    const a = s(q[0]);
    return local >= a && local <= a + Math.max(PRESS, s(q[3] ?? 0));
  });
  if (vis <= 0) return null;
  return (
    <>
      {taps.map((q, i) => {
        const p = (local - s(q[0])) / 14;
        if (p < 0 || p > 1) return null;
        const r = 10 + 22 * p;
        return <div key={i} style={{ position: "absolute", left: q[1] - r, top: q[2] - r, width: r * 2, height: r * 2, borderRadius: 99, border: "1.5px solid rgba(255,255,255,0.95)", background: "rgba(255,255,255,0.12)", opacity: 1 - p }} />;
      })}
    </>
  );
};

// ---------------- small parts ----------------
const Patch: React.FC<{ x: number; y: number; w: number; h: number; c: string; r?: number }> = ({ x, y, w, h, c, r = 6 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: c, borderRadius: r, boxShadow: `0 0 6px 5px ${c}` }} />
);

const RegionPop: React.FC<{ src: string; x: number; y: number; w: number; h: number; p: number; from?: number }> = ({ src, x, y, w, h, p, from = 1.6 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `scale(${from + (1 - from) * p})`, opacity: Math.min(1, p * 2) }}>
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <Img src={fig(src)} style={{ position: "absolute", left: -x, top: -y, width: 393, height: 852 }} />
    </div>
  </div>
);

const Sheen: React.FC<{ src: string; pos: number }> = ({ src, pos }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: `linear-gradient(100deg, transparent ${pos - 10}%, rgba(255,255,255,0.9) ${pos}%, transparent ${pos + 10}%)`,
      WebkitMaskImage: `url(${fig(src)})`,
      maskImage: `url(${fig(src)})`,
      WebkitMaskSize: "100% 100%",
      maskSize: "100% 100%",
      mixBlendMode: "overlay",
    }}
  />
);

// slot chips (02), drawn to match the Figma selected / unselected states
const chipSel: React.CSSProperties = { background: "linear-gradient(180deg,#fbfbfc,#dcdce1)", color: "#111", boxShadow: "0 0 18px rgba(255,255,255,0.35)" };
const chipOff: React.CSSProperties = { background: "rgb(20,20,20)", color: "#fff", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.16)" };
const DAY_W = 62;
const dayX = (i: number) => 24 + i * ((345 - DAY_W) / 4);
const DayChip: React.FC<{ x: number; dow: string; d: string; on: boolean }> = ({ x, dow, d, on }) => (
  <div style={{ position: "absolute", left: x, top: 292, width: DAY_W, height: 68, borderRadius: 16, textAlign: "center", fontFamily: inter.fontFamily, ...(on ? chipSel : chipOff) }}>
    <div style={{ marginTop: 11, fontSize: 12.5, opacity: on ? 0.55 : 0.6 }}>{dow}</div>
    <div style={{ marginTop: 3, fontSize: 19.5, fontWeight: 600 }}>{d}</div>
  </div>
);
const TimeChip: React.FC<{ x: number; y: number; t: string; on: boolean }> = ({ x, y, t, on }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 105, height: 48, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: inter.fontFamily, fontSize: 14, fontWeight: 500, ...(on ? chipSel : chipOff) }}>{t}</div>
);

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
const NAMES = ["Sahil M.", "Riya N.", "Rahul P.", "Divya K.", "Vikram R.", "Priya D."];
const FACE_IMG = (i: number) => staticFile(`faces/f${String(i).padStart(3, "0")}.jpg`);
const DUST = Array.from({ length: 150 }, (_, i) => {
  const r = 22 + 145 * Math.sqrt(rnd(i + 500));
  const th = rnd(i + 900) * Math.PI * 2;
  return { x: CX + r * Math.cos(th), y: CY + r * Math.sin(th), deg: ((th * 180) / Math.PI + 360) % 360, ph: rnd(i + 1300) };
});

const Crowd: React.FC<{ frame: number }> = ({ frame }) => {
  const sweep = (frame - st("run")) * 8;
  // smooth progress into each stage (with a little per-face stagger)
  const stageP = (stage: number, i: number) => {
    const t0 = st("run") + s(PH[stage]) - 2 + Math.floor(rnd(i + stage * 31) * 8);
    return interpolate(frame, [t0, t0 + 20], [0, 1], { ...C, easing: EIO });
  };
  const thinDust = lerp(frame, [st("run") + s(PH[1]), st("run") + s(PH[2])], [1, 0.15]);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, top: 136, width: 393, height: 424, background: "linear-gradient(180deg, rgb(24,24,26) 0%, rgb(20,20,21) 30%, rgb(16,16,18) 60%, rgb(10,10,11) 100%)" }} />
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
        const revealAt = st("run") + Math.floor(p0.deg / 8);
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
            <Img src={FACE_IMG(i)} style={{ width: "100%", height: "100%", borderRadius: 999, objectFit: "cover", filter: `grayscale(${out})`, boxShadow: `0 0 0 ${1 + yesP}px rgba(255,255,255,${0.3 + 0.6 * Math.max(askP, yesP)})` }} />
            {askP > 0.05 && (
              <div style={{ position: "absolute", right: -2, bottom: -2, width: 11 + 3 * yesP, height: 11 + 3 * yesP, borderRadius: 99, background: "#fff", color: "#111", fontSize: 7.5 + 2 * yesP, lineHeight: `${11 + 3 * yesP}px`, textAlign: "center", fontWeight: 700, opacity: askP }}>✓</div>
            )}
            {yesP > 0.05 && (
              <div style={{ position: "absolute", left: "50%", top: size + 3, transform: `translateX(-50%) scale(${yesP})`, background: "#fff", color: "#111", borderRadius: 5, padding: "1.5px 6px", fontFamily: inter.fontFamily, fontSize: 9, fontWeight: 600, whiteSpace: "nowrap" }}>{NAMES[rank]}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const Radar: React.FC<{ frame: number; tint: number }> = ({ frame, tint }) => {
  const a = (frame * 9) % 360;
  const pulse = (frame % 30) / 30;
  return (
    <>
      <div style={{ position: "absolute", left: CX - 166, top: CY - 166, width: 332, height: 332, borderRadius: 999, background: `conic-gradient(from ${a}deg, rgba(255,255,255,${0.26 * tint}) 0deg, transparent 70deg, transparent 360deg)`, mixBlendMode: "screen", transform: "scaleX(-1)" }} />
      <div style={{ position: "absolute", left: CX - 40 - 120 * pulse, top: CY - 40 - 120 * pulse, width: 80 + 240 * pulse, height: 80 + 240 * pulse, borderRadius: 999, border: "1.5px solid rgba(255,255,255,0.5)", opacity: (1 - pulse) * 0.6 * tint }} />
    </>
  );
};

// ---------------- each screen + its build-on-top ----------------
const Screen: React.FC<{ k: K; local: number; frame: number }> = ({ k, local, frame }) => {
  const base = <Img src={fig(k === "s11" ? "s11p.png" : `${k}.png`)} style={{ position: "absolute", left: 0, top: 0, width: 393, height: 852 }} />;

  if (k === "s01") {
    const slam = spring({ frame: local - 1, fps: FPS, config: { damping: 13, stiffness: 170, mass: 0.8 } });
    const pune = spring({ frame: local - 9, fps: FPS, config: { damping: 13, stiffness: 180, mass: 0.7 } });
    const bag = spring({ frame: local - 10, fps: FPS, config: { damping: 12, stiffness: 90, mass: 1 } });
    const sheen = lerp(local, [12, 48], [-40, 140], Easing.inOut(Easing.quad));
    const float = Math.sin(local / 9) * 4;
    return (
      <>
        {base}
        <div style={{ position: "absolute", left: 10, top: 80, width: 373, height: 550, background: "linear-gradient(180deg, rgb(25,25,26) 0%, rgb(17,17,18) 40%, rgb(8,8,9) 100%)", boxShadow: "0 0 10px 8px rgba(20,20,21,0.6)" }} />
        <div style={{ position: "absolute", left: 28, top: 82, width: 336, height: 177, transform: `scale(${1.12 - 0.12 * slam})`, opacity: Math.min(1, slam * 2.5), filter: `blur(${(1 - slam) * 3}px)` }}>
          <Img src={fig("k-hire.png")} style={{ width: "100%", height: "100%" }} />
          <Sheen src="k-hire.png" pos={sheen} />
        </div>
        {/* PUNE tag */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 268, display: "flex", justifyContent: "center", opacity: Math.min(1, pune * 2), transform: `translateY(${(1 - pune) * 12}px) scale(${0.8 + 0.2 * pune})` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 14px 4px 11px", borderRadius: 999, background: "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.28), 0 6px 18px rgba(0,0,0,0.5)" }}>
            <svg width="11" height="14" viewBox="0 0 11 14"><path d="M5.5 0C2.5 0 0 2.4 0 5.4 0 9.4 5.5 14 5.5 14S11 9.4 11 5.4C11 2.4 8.5 0 5.5 0zm0 7.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="#e9e9ee" /></svg>
            <span style={{ fontFamily: OBV, fontWeight: 700, fontSize: 24, lineHeight: "24px", letterSpacing: 1, transform: "skewX(-9deg)", backgroundImage: "linear-gradient(180deg,#fff 0%,#e9e9ee 40%,#8d8d96 55%,#fff 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>NOW IN PUNE</span>
          </div>
        </div>
        <Img src={fig("k-briefcase.png")} style={{ position: "absolute", left: 56, top: 325 + (1 - bag) * 260 + float, width: 281, height: 281, opacity: Math.min(1, bag * 2), transform: `rotate(${(1 - bag) * -14 + Math.sin(local / 13) * 2}deg)` }} />
      </>
    );
  }

  if (k === "s02") {
    const at = (sec: number) => local >= s(sec);
    const ready = at(0.8);
    const bump = spring({ frame: local - s(0.8), fps: FPS, config: { damping: 10, stiffness: 260, mass: 0.5 } });
    const days: [string, string][] = [["Mon", "06"], ["Tue", "07"], ["Wed", "08"], ["Thu", "09"], ["Fri", "10"]];
    const tick = lerp(local, [s(0.8), s(0.8) + 6], [0, 1]);
    return (
      <>
        {base}
        {/* big heading in place of the Figma title */}
        <div style={{ position: "absolute", left: 0, top: 64, width: 393, height: 186, background: "linear-gradient(180deg, rgb(26,26,27), rgb(23,23,24) 30%, rgb(20,20,21))" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: OBV, fontWeight: 700, fontSize: 44, lineHeight: 0.98, textTransform: "uppercase", transform: "skewX(-9deg)", backgroundImage: "linear-gradient(180deg,#ffffff 0%,#e9e9ee 40%,#8d8d96 55%,#ffffff 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
          Select date
          <br />
          and time
        </div>
        <div style={{ position: "absolute", left: 0, top: 286, width: 393, height: 80, background: "linear-gradient(180deg, rgb(19,19,20), rgb(16,16,17))" }} />
        {days.map(([dow, d], i) => (
          <DayChip key={d} x={dayX(i)} dow={dow} d={d} on={i === 2 && at(0.4)} />
        ))}
        <TimeChip x={144} y={550} t="11:00 AM" on={at(0.8)} />
        <div style={{ position: "absolute", left: 144, top: 758, width: 229, height: 56, borderRadius: 28, background: "linear-gradient(180deg,#fbfbfc,#d6d6db)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: inter.fontFamily, fontSize: 15.5, fontWeight: 500, color: "#111", transform: `scale(${1 + 0.05 * Math.sin(Math.min(1, bump) * Math.PI)})`, boxShadow: "0 0 22px rgba(255,255,255,0.35)" }}>{ready ? "Launch →" : "Add slot (1/3) →"}</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 706 - 8 * tick, textAlign: "center", fontFamily: inter.fontFamily, fontSize: 13, fontWeight: 500, color: "#fff", opacity: tick }}>✓ Wed 08 · 11:00 AM</div>
        <Finger k="s02" local={local} />
      </>
    );
  }

  if (k === "run") {
    const labels = ["SCAN", "FILTER", "ASK", "YES"];
    const counts = ["PROFILES SCANNED", "MATCH YOUR ROLE", "TOP PICKS ASKED", "SAID YES"];
    const cur = Math.min(3, PH.findIndex((p, i) => runSec(frame) < PH[i + 1]) === -1 ? 3 : PH.findIndex((p, i) => runSec(frame) < PH[i + 1]));
    const yesFade = lerp(frame, [st("run") + s(PH[3]), st("run") + s(PH[3]) + 16], [1, 0]);
    return (
      <>
        <Img src={fig("s06.png")} style={{ position: "absolute", left: 0, top: 0, width: 393, height: 852 }} />
        <Crowd frame={frame} />
        <Radar frame={frame} tint={yesFade} />
        {/* progress bars + labels, filling continuously */}
        <div style={{ position: "absolute", left: 0, top: 100, width: 393, height: 38, background: "rgb(25,25,26)" }} />
        {labels.map((l, i) => {
          const p = phaseP(frame, i);
          const active = i <= cur;
          return (
            <div key={l} style={{ position: "absolute", left: 22 + i * 90, top: 108, width: 80 }}>
              <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.16)", overflow: "hidden" }}>
                <div style={{ width: `${p * 100}%`, height: "100%", background: "#fff" }} />
              </div>
              <div style={{ marginTop: 7, fontFamily: inter.fontFamily, fontSize: 9.5, letterSpacing: 1.4, color: active ? "#fff" : "rgba(255,255,255,0.32)" }}>{l}</div>
            </div>
          );
        })}
        <Patch x={289} y={64} w={62} h={27} c="rgb(42,42,44)" r={4} />
        <div style={{ position: "absolute", left: 291, top: 66, fontFamily: mono.fontFamily, fontWeight: 700, fontSize: 19.5, lineHeight: "23px", color: "#fff", letterSpacing: -0.3 }}>{mmss(remaining(frame))}</div>
        {/* counter moved up so it sits inside the shot */}
        <div style={{ position: "absolute", left: 0, top: 548, width: 393, height: 140, background: "linear-gradient(180deg, rgb(10,10,11), rgb(6,6,7))" }} />
        <div style={{ position: "absolute", left: 20, top: 556, fontFamily: inter.fontFamily, fontWeight: 300, fontSize: 52, lineHeight: "58px", color: "#fff", letterSpacing: -1.2 }}>{lakh(countAt(frame))}</div>
        {counts.map((c, i) => {
          const o = interpolate(runSec(frame), [PH[i] - 0.15, PH[i] + 0.15, PH[i + 1] - 0.15, PH[i + 1] + 0.15], [i === 0 ? 1 : 0, 1, 1, i === 3 ? 1 : 0], C);
          return <div key={c} style={{ position: "absolute", left: 22, top: 616, fontFamily: inter.fontFamily, fontSize: 10.5, letterSpacing: 1.6, color: "rgba(255,255,255,0.55)", opacity: o }}>{c}</div>;
        })}
      </>
    );
  }

  if (k === "s10") {
    const faces = [32, 84, 136, 187, 239, 291];
    const slam = spring({ frame: local - s(0.35), fps: FPS, config: { damping: 11, stiffness: 180, mass: 0.7 } });
    return (
      <>
        {base}
        <Patch x={30} y={238} w={327} h={68} c="rgb(19,19,20)" r={34} />
        {faces.map((x, i) => (
          <RegionPop key={i} src="s10.png" x={x} y={240} w={64} h={64} p={spring({ frame: local - 3 - i * 3, fps: FPS, config: { damping: 16, stiffness: 200, mass: 0.6 } })} from={0.4} />
        ))}
        <div style={{ position: "absolute", left: 60, top: 325, width: 273, height: 130, background: "radial-gradient(closest-side, rgb(18,18,19) 70%, rgba(18,18,19,0))", opacity: 1 - Math.min(1, slam) }} />
        <RegionPop src="s10.png" x={81} y={329} w={231} h={125} p={slam} from={0.5} />
        <Finger k="s10" local={local} />
      </>
    );
  }

  if (k === "s11") {
    const up = spring({ frame: local, fps: FPS, config: { damping: 16, stiffness: 130, mass: 0.85 } });
    return (
      <>
        {base}
        <div style={{ position: "absolute", left: 24, top: 160, width: 345, height: 388, transform: `scale(${0.9 + 0.1 * up})`, opacity: Math.min(1, up * 2) }}>
          <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
            <Img src={fig("s11p.png")} style={{ position: "absolute", left: -24, top: -160, width: 393, height: 852 }} />
            <div style={{ position: "absolute", left: 213, top: 208, fontFamily: inter.fontFamily, fontSize: 14.5, lineHeight: "17px", color: "rgb(205,205,205)" }}>Pune</div>
          </div>
        </div>
        <Finger k="s11" local={local} />
      </>
    );
  }

  if (k === "book") {
    const ticket = spring({ frame: local, fps: FPS, config: { damping: 16, stiffness: 130, mass: 0.85 } });
    const r1 = spring({ frame: local - s(0.45), fps: FPS, config: { damping: 12, stiffness: 200, mass: 0.6 } });
    const wait = local >= s(0.8) && local < s(2.0);
    const conf = lerp(local, [s(2.0), s(2.0) + 6], [0, 1]);
    const r2 = spring({ frame: local - s(2.0), fps: FPS, config: { damping: 11, stiffness: 220, mass: 0.6 } });
    const r3 = lerp(local, [s(2.35), s(2.35) + 6], [0, 1]);
    const pulse = (local % 24) / 24;
    const row = (src: string, y: number, o: number, sc = 1) => (
      <div style={{ position: "absolute", left: 40, top: y - 6, width: 320, height: 44, overflow: "hidden", opacity: o, transform: `scale(${sc})`, transformOrigin: "left center" }}>
        <Img src={fig(src)} style={{ position: "absolute", left: -40, top: -(y - 6), width: 393, height: 852 }} />
      </div>
    );
    return (
      <>
        <Img src={fig("s13.png")} style={{ position: "absolute", left: 0, top: 0, width: 393, height: 852 }} />
        {/* hide the 4:21 header copy above the ticket */}
        <div style={{ position: "absolute", left: 0, top: 230, width: 393, height: 96, background: "rgb(23,23,25)" }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: 393, height: 852, transform: `translateY(${(1 - ticket) * 40}px) scale(${0.96 + 0.04 * ticket})`, transformOrigin: "50% 495px", opacity: Math.min(1, ticket * 2) }}>
          <div style={{ position: "absolute", left: 22, top: 328, width: 349, height: 334, background: "rgb(23,23,25)", borderRadius: 22 }} />
          <div style={{ position: "absolute", left: 24, top: 330, width: 345, height: 330, overflow: "hidden", borderRadius: 20 }}>
            <Img src={fig("s13.png")} style={{ position: "absolute", left: -24, top: -330, width: 393, height: 852 }} />
          </div>
          {/* row 1: you confirmed (tick pops) */}
          <div style={{ position: "absolute", left: 40, top: 504, width: 320, height: 44, background: "rgb(30,30,32)" }} />
          {row("s13.png", 510, Math.min(1, r1 * 2), 0.9 + 0.1 * r1)}
          {/* row 2: Aarav is confirming → Aarav confirmed */}
          {row("s13.png", 560, 1 - conf)}
          {wait && <div style={{ position: "absolute", left: 58 - 14 * pulse, top: 574 - 14 * pulse, width: 28 * pulse, height: 28 * pulse, borderRadius: 99, border: "1.5px solid rgba(255,255,255,0.8)", opacity: 1 - pulse }} />}
          {row("s14.png", 560, conf, 0.92 + 0.08 * r2)}
          {/* row 3: meet link sent */}
          {row("s13.png", 610, 1 - r3)}
          {row("s14.png", 610, r3)}
        </div>
      </>
    );
  }
  return base;
};

// ---------------- speed clock streak (02 → 05) ----------------
const ClockStreak: React.FC<{ frame: number }> = ({ frame }) => {
  const t0 = st("run") - 14;
  const p = (frame - t0) / 22;
  if (p < 0 || p > 1) return null;
  const w = 980;
  const x = -w + (W + w) * Easing.inOut(Easing.cubic)(p);
  return (
    <>
      {[0.12, 0.06, 0].map((lag, i) => {
        const ee = Easing.inOut(Easing.cubic)(Math.max(0, p - lag));
        return <Img key={i} src={fig("k-clock.png")} style={{ position: "absolute", left: -w + (W + w) * ee, top: 420, width: w, height: w * (713 / 1252), opacity: i === 2 ? 1 : 0.3, filter: i === 2 ? "drop-shadow(0 30px 60px rgba(0,0,0,0.8))" : "blur(6px)" }} />;
      })}
      <div style={{ position: "absolute", left: 0, top: 420 + w * 0.28, width: Math.max(0, x + w * 0.4), height: 3, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7))", opacity: 1 - p }} />
    </>
  );
};

// ---------------- viewport ----------------
const Viewport: React.FC<{ frame: number; opacity: number }> = ({ frame, opacity }) => {
  const layers = SCREENS.filter((k) => frame >= st(k) && frame < en(k) + 6);
  return (
    <div style={{ position: "absolute", left: M, top: M, width: VW, height: VH, borderRadius: 46, overflow: "hidden", background: "#0b0b0c", opacity, boxShadow: "0 0 0 1px rgba(255,255,255,0.08)" }}>
      {layers.map((k) => {
        const local = frame - st(k);
        const cam = camOf(k, local);
        const fade = lerp(local, [0, 6], [0, 1], Easing.out(Easing.cubic));
        const kk = K0 * cam.z * (1.025 - 0.025 * fade);
        const bg = k === "run" ? "s06.png" : k === "s11" ? "s11p.png" : k === "book" ? "s13.png" : `${k}.png`;
        return (
          <React.Fragment key={k}>
          {/* sides: the screen's own edge column stretched outward, so the UI reads as filling the frame */}
          {[0, 1].map((side) => {
            const sw = (VW - 393 * kk) / 2 + 2;
            if (sw <= 2) return null;
            const sx = sw / 2;
            return (
              <div
                key={side}
                style={{
                  position: "absolute",
                  left: side === 0 ? 0 : VW - sw,
                  top: 0,
                  width: sw,
                  height: VH,
                  opacity: fade,
                  backgroundImage: `url(${fig(bg)})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: `${393 * sx}px ${852 * kk}px`,
                  backgroundPosition: `${side === 0 || k === "s02" ? -1 * sx : -390 * sx}px ${-cam.y * kk}px`,
                }}
              />
            );
          })}
          <div
            style={{
              position: "absolute",
              left: (VW - 393 * kk) / 2,
              top: -cam.y * kk,
              width: 393,
              height: 852,
              transformOrigin: "top left",
              transform: `scale(${kk})`,
              opacity: fade,
            }}
          >
            <Screen k={k} local={local} frame={frame} />
          </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Stage: React.FC<{ frame: number }> = ({ frame }) => {
  const flash = interpolate(frame, [st("run") - 3, st("run"), st("run") + 9], [0, 0.6, 0], C);
  return (
    <AbsoluteFill style={{ background: "#050506" }}>
      <AbsoluteFill style={{ background: "#fff", opacity: flash, zIndex: 50 }} />
    </AbsoluteFill>
  );
};

// ---------------- end: tal BOSS, download the app ----------------
const End: React.FC<{ local: number }> = ({ local }) => {
  const a = (d: number) => spring({ frame: local - s(d), fps: FPS, config: { damping: 14, stiffness: 150, mass: 0.8 } });
  const [logo, cta] = [a(0), a(0.35)];
  return (
    <AbsoluteFill style={{ background: "#0b0b0c" }}>
      <Img src={staticFile("brand/tal-boss-wordmark-cream.png")} style={{ position: "absolute", left: "50%", top: 380, height: 320, transform: `translateX(-50%) scale(${1.15 - 0.15 * logo})`, opacity: Math.min(1, logo * 2), filter: `blur(${(1 - logo) * 4}px)` }} />
      <Img src={staticFile("brand/badges-stores.png")} style={{ position: "absolute", left: "50%", top: 750, width: 640, transform: `translateX(-50%) translateY(${(1 - cta) * 20}px)`, opacity: cta }} />
    </AbsoluteFill>
  );
};

// ---------------- root ----------------
export const HireIn10FullBleed: React.FC = () => {
  const frame = useCurrentFrame();
  const vpOut = lerp(frame, [st("end") - 3, st("end") + 8], [1, 0]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Stage frame={frame} />
      {frame < st("end") + 10 && <Viewport frame={frame} opacity={vpOut} />}
      <ClockStreak frame={frame} />
      {frame >= st("end") && <End local={frame - st("end")} />}
    </AbsoluteFill>
  );
};
