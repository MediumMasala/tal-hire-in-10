// ============================================================
// "Hire in 10 mins": the tal in 10 flow as a 4:5 ad.
// Source: Prometheus Figma, Page 1 frames 677:4279 → 677:5264
//   row 1 onboarding (01 Promise → 05 Launch)
//   row 2 the run    (06 Scan → 10 Ready)
//   row 3 booking    (11 Shortlist → 14 Locked in)
// Every screen is a 3x Figma export (public/fig/sNN.png). The chrome kit
// pieces (HIRE IN 10 MINS lettering, briefcase, speed clock, star, 10 MINS
// pill, slot cards) are exported separately and keyed so they can leave the
// phone. On top we build: a floating chrome phone with a moving camera,
// chrome kinetic captions, live counters and timers (masked over the static
// Figma copy), a radar sweep, hold-to-launch ring, taps, slams and a ghost
// stopwatch behind everything that runs from launch to booked (0:00 → 4:21).
// ============================================================
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont } from "@remotion/fonts";

export const FPS = 30;
export const W = 1080;
export const H = 1350;

const OBV = "Obviously Narrow";
loadFont({ family: OBV, url: staticFile("fonts/ObviouslyNarrowBold.otf"), weight: "700" });
const inter = loadInter("normal", { weights: ["200", "300", "400", "600"], ignoreTooManyRequestsWarning: true });
const interItalic = loadInter("italic", { weights: ["200", "300"], ignoreTooManyRequestsWarning: true });
const mono = loadMono("normal", { weights: ["700"], ignoreTooManyRequestsWarning: true });

const s = (sec: number) => Math.round(sec * FPS);
const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EIO = Easing.inOut(Easing.cubic);
const EOUT = Easing.out(Easing.cubic);
const lerp = (f: number, i: number[], o: number[], e = EIO) => interpolate(f, i, o, { ...C, easing: e });
const fig = (n: string) => staticFile(`fig/${n}`);

// ---------------- timeline (seconds) ----------------
const T = {
  hook: [0, 3.3],
  s01: [3.3, 4.5],
  s02: [4.5, 7.0],
  s03: [7.0, 8.8],
  s04: [8.8, 11.0],
  s05: [11.0, 13.6],
  s06: [13.6, 15.6],
  s07: [15.6, 17.4],
  s08: [17.4, 19.4],
  s09: [19.4, 21.6],
  s10: [21.6, 23.6],
  s11: [23.6, 25.4],
  s12: [25.4, 26.8],
  s13: [26.8, 28.9],
  s14: [28.9, 31.0],
  end: [31.0, 34.0],
} as const;
type K = keyof typeof T;
export const TOTAL_PHONE = s(T.end[1]);
const st = (k: K) => s(T[k][0]);
const en = (k: K) => s(T[k][1]);
const SCREENS: K[] = ["s01", "s02", "s03", "s04", "s05", "s06", "s07", "s08", "s09", "s10", "s11", "s12", "s13", "s14"];

// ---------------- phone geometry ----------------
const PH = 1.22; // native 393 → stage px
const PW = 393 * PH;
const PHH = 852 * PH;
const PX = (W - PW) / 2;
const PY = 258;

// camera per scene: scale about the phone centre + offset (stage px) + tilt
type Cam = { z: number; x: number; y: number; rx: number; ry: number };
const CAM: Record<string, Cam> = {
  base: { z: 1, x: 0, y: 0, rx: 4, ry: -6 },
  s01: { z: 1, x: 0, y: 0, rx: 4, ry: 6 },
  s02: { z: 1.05, x: 0, y: 10, rx: 3, ry: -5 },
  s03: { z: 1, x: 0, y: 0, rx: 4, ry: 6 },
  s04: { z: 1, x: 0, y: 0, rx: 2, ry: -4 },
  s05: { z: 1.06, x: 0, y: -10, rx: 0, ry: 0 },
  s06: { z: 1.12, x: 0, y: -20, rx: 0, ry: 0 },
  s07: { z: 1.12, x: 0, y: -20, rx: 0, ry: 0 },
  s08: { z: 1.12, x: 0, y: -20, rx: 0, ry: 0 },
  s09: { z: 1.0, x: 0, y: 0, rx: 3, ry: 5 },
  s10: { z: 1.0, x: 0, y: 0, rx: 3, ry: -5 },
  s11: { z: 1.0, x: 0, y: 0, rx: 3, ry: 5 },
  s12: { z: 1.0, x: 0, y: 0, rx: 2, ry: -4 },
  s13: { z: 1.08, x: 0, y: -10, rx: 0, ry: 0 },
  s14: { z: 1.0, x: 0, y: 0, rx: 3, ry: 4 },
};
const camAt = (frame: number): Cam => {
  // ease from the previous scene's camera into this one over the first 18 frames
  const i = SCREENS.findIndex((k) => frame >= st(k) && frame < en(k));
  const k = SCREENS[Math.max(0, i === -1 ? (frame < st("s01") ? 0 : SCREENS.length - 1) : i)];
  const prev = i > 0 ? CAM[SCREENS[i - 1]] : CAM.base;
  const cur = CAM[k];
  const p = lerp(frame - st(k), [0, 18], [0, 1]);
  const mix = (a: number, b: number) => a + (b - a) * p;
  const t = frame / FPS;
  return {
    z: mix(prev.z, cur.z),
    x: mix(prev.x, cur.x),
    y: mix(prev.y, cur.y),
    rx: mix(prev.rx, cur.rx) + Math.sin(t * 1.3) * 1.2,
    ry: mix(prev.ry, cur.ry) + Math.cos(t * 0.9) * 1.6,
  };
};

// ---------------- the stopwatch (launch → booked) ----------------
// elapsed seconds: 0:00 at launch, 4:12 when the shortlist is ready, 4:21 booked
const elapsed = (f: number) =>
  interpolate(f, [st("s06"), st("s10"), st("s13") + 20], [0, 252, 261], C);
// in-app countdown pill (Figma values): 09:41 scan, 08:36 filter, 07:11 ask, 05:24 yes
const remaining = (f: number) =>
  interpolate(f, [st("s06"), st("s06") + 18, st("s07"), st("s08"), st("s09"), en("s09")], [600, 581, 516, 431, 324, 300], C);
const mmss = (secs: number, pad = true) => {
  const m = Math.floor(secs / 60);
  const ss = String(Math.floor(secs % 60)).padStart(2, "0");
  return `${pad ? String(m).padStart(2, "0") : m}:${ss}`;
};
const lakh = (n: number) => {
  const x = Math.round(n).toString();
  if (x.length <= 3) return x;
  const last3 = x.slice(-3);
  const rest = x.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${rest},${last3}`;
};

// ---------------- small parts ----------------
const Patch: React.FC<{ x: number; y: number; w: number; h: number; c: string; r?: number }> = ({ x, y, w, h, c, r = 6 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: c, borderRadius: r, boxShadow: `0 0 6px 5px ${c}` }} />
);

const Tap: React.FC<{ local: number; at: number; x: number; y: number }> = ({ local, at, x, y }) => {
  const p = (local - s(at)) / 16;
  if (p < -0.25 || p > 1) return null;
  const pre = p < 0 ? 1 + p * 4 : 1; // finger lands
  const r = 12 + 22 * Math.max(0, p);
  return (
    <>
      <div style={{ position: "absolute", left: x - 13, top: y - 13, width: 26, height: 26, borderRadius: 99, background: "rgba(255,255,255,0.85)", opacity: p < 0 ? pre : 1 - p, transform: `scale(${p < 0 ? 1.3 - 0.3 * pre : 1 - 0.3 * p})` }} />
      {p >= 0 && <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: 99, border: "2px solid rgba(255,255,255,0.9)", opacity: 1 - p }} />}
    </>
  );
};

// a copy of a region of a screen that can slam/pop over itself
const RegionPop: React.FC<{ src: string; x: number; y: number; w: number; h: number; p: number; from?: number }> = ({ src, x, y, w, h, p, from = 1.6 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, overflow: "visible", transform: `scale(${from + (1 - from) * p})`, opacity: Math.min(1, p * 2), transformOrigin: "center" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, overflow: "hidden" }}>
      <Img src={fig(src)} style={{ position: "absolute", left: -x, top: -y, width: 393, height: 852 }} />
    </div>
  </div>
);

// ---------------- chrome captions ----------------
const chromeText: React.CSSProperties = {
  backgroundImage: "linear-gradient(180deg, #ffffff 0%, #e9e9ee 38%, #8d8d96 52%, #dcdce2 64%, #ffffff 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};
const CAPTIONS: Partial<Record<K, string>> = {
  s01: "Post a role",
  s02: "Book 3 slots",
  s03: "Slots locked",
  s04: "tal in 10. Unlocked",
  s05: "Hold to launch",
  s06: "Scan 5 lakh profiles",
  s07: "Filter for fit",
  s08: "Ask the top 150",
  s09: "14 said yes",
  s10: "Shortlist ready",
  s11: "Pick your hire",
  s12: "Book the slot",
  s13: "Faster than a chai break",
  s14: "Interview booked",
};
const Caption: React.FC<{ k: K; local: number; dur: number }> = ({ k, local, dur }) => {
  const text = CAPTIONS[k];
  if (!text) return null;
  const words = text.split(" ");
  const size = Math.min(104, 1900 / Math.max(10, text.length));
  const out = lerp(local, [dur - 6, dur], [1, 0]);
  const sheen = lerp(local, [4, 34], [-30, 130], Easing.inOut(Easing.quad));
  return (
    <div style={{ position: "absolute", top: 70, left: 0, right: 0, height: 150, display: "flex", alignItems: "center", justifyContent: "center", opacity: out }}>
      <div style={{ position: "relative", display: "flex", gap: size * 0.22, transform: "skewX(-9deg)" }}>
        {words.map((w, i) => {
          const p = spring({ frame: local - i * 2, fps: FPS, config: { damping: 16, stiffness: 190, mass: 0.7 } });
          return (
            <div key={i} style={{ overflow: "hidden", paddingBottom: 6 }}>
              <div
                style={{
                  fontFamily: OBV,
                  fontWeight: 700,
                  fontSize: size,
                  lineHeight: 1,
                  textTransform: "uppercase",
                  ...chromeText,
                  transform: `translateY(${(1 - p) * 110}%)`,
                  filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.6))",
                }}
              >
                {w}
              </div>
            </div>
          );
        })}
        {/* a light sheen travelling across the caption */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(100deg, transparent ${sheen - 12}%, rgba(255,255,255,0.55) ${sheen}%, transparent ${sheen + 12}%)`,
            mixBlendMode: "overlay",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
};

// ---------------- radar sweep (run scenes) ----------------
const Radar: React.FC<{ local: number; tint?: number }> = ({ local, tint = 1 }) => {
  const a = (local * 9) % 360;
  const pulse = (local % 30) / 30;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 197 - 165,
          top: 350 - 165,
          width: 330,
          height: 330,
          borderRadius: 999,
          background: `conic-gradient(from ${a}deg, rgba(255,255,255,${0.32 * tint}) 0deg, rgba(255,255,255,0.0) 70deg, transparent 360deg)`,
          mixBlendMode: "screen",
          transform: "scaleX(-1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 197 - 40 - 120 * pulse,
          top: 350 - 40 - 120 * pulse,
          width: 80 + 240 * pulse,
          height: 80 + 240 * pulse,
          borderRadius: 999,
          border: "1.5px solid rgba(255,255,255,0.5)",
          opacity: (1 - pulse) * 0.7 * tint,
        }}
      />
    </>
  );
};

// ---------------- per-screen content (native 393 coords) ----------------
const Screen: React.FC<{ k: K; local: number; frame: number }> = ({ k, local, frame }) => {
  const base = <Img src={fig(`${k}.png`)} style={{ position: "absolute", left: 0, top: 0, width: 393, height: 852 }} />;
  if (k === "s01") return <>{base}<Tap local={local} at={0.75} x={196} y={776} /></>;
  if (k === "s02") {
    return (
      <>
        {base}
        <Tap local={local} at={0.5} x={209} y={326} />
        <Tap local={local} at={1.05} x={196} y={574} />
        <Tap local={local} at={1.6} x={258} y={786} />
        <Tap local={local} at={2.05} x={258} y={786} />
      </>
    );
  }
  if (k === "s03") {
    // the three slot cards drop in one by one (Figma card group, sliced)
    const bands = [[0, 76], [92, 167], [184, 260]];
    return (
      <>
        {base}
        <Patch x={22} y={285} w={349} h={264} c="rgb(25,25,27)" r={14} />
        {bands.map(([a, b], i) => {
          const p = spring({ frame: local - 3 - i * 5, fps: FPS, config: { damping: 14, stiffness: 160, mass: 0.8 } });
          return (
            <div key={i} style={{ position: "absolute", left: 24, top: 287 + a, width: 345, height: b - a, overflow: "hidden", opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * 260}px) rotate(${(1 - p) * 6}deg)` }}>
              <Img src={fig("k-slots.png")} style={{ position: "absolute", left: 0, top: -a, width: 345, height: 260 }} />
            </div>
          );
        })}
        <Tap local={local} at={1.45} x={196} y={776} />
      </>
    );
  }
  if (k === "s04") {
    const fly = spring({ frame: local - 2, fps: FPS, config: { damping: 15, stiffness: 90, mass: 1.1 } });
    const cnt = lerp(local, [s(0.55), s(1.5)], [0, 1], Easing.out(Easing.quad));
    const stat = (v: number, x: number) => (
      <div style={{ position: "absolute", left: x, top: 514, width: 115, textAlign: "center", fontFamily: inter.fontFamily, fontWeight: 400, fontSize: 26, lineHeight: "33px", color: "#fff", letterSpacing: -0.5 }}>{v}</div>
    );
    return (
      <>
        {base}
        <Patch x={40} y={130} w={313} h={178} c="rgb(21,21,22)" r={20} />
        {/* the speed clock streaks in from off-screen left */}
        {[0.24, 0.12, 0].map((lag, i) => {
          const p = spring({ frame: local - 2 - lag * 20, fps: FPS, config: { damping: 15, stiffness: 90, mass: 1.1 } });
          return (
            <Img key={i} src={fig("k-clock.png")} style={{ position: "absolute", left: 40 + (1 - p) * -520, top: 130, width: 313, height: 178, opacity: i === 2 ? 1 : (1 - fly) * 0.35, filter: i === 2 ? "none" : "blur(2px)" }} />
          );
        })}
        <Patch x={28} y={514} w={106} h={33} c="rgb(25,25,26)" />
        <Patch x={144} y={514} w={106} h={33} c="rgb(25,25,26)" />
        <Patch x={259} y={514} w={106} h={33} c="rgb(25,25,26)" />
        <div style={{ position: "absolute", left: 24, top: 514, width: 115, textAlign: "center", fontFamily: inter.fontFamily, fontSize: 26, lineHeight: "33px", color: "#fff" }}>{lakh(500000 * cnt)}</div>
        {stat(Math.round(150 * cnt), 139)}
        {stat(cnt > 0.95 ? 1 : 0, 254)}
        <Tap local={local} at={1.75} x={196} y={776} />
      </>
    );
  }
  if (k === "s05") {
    // hold to launch: the button fills, a ring sweeps round the dial, then a flash
    const hold = lerp(local, [s(0.6), s(2.0)], [0, 1], Easing.inOut(Easing.quad));
    const R = 108;
    const circ = 2 * Math.PI * R;
    return (
      <>
        {base}
        <svg style={{ position: "absolute", left: 196.5 - R - 6, top: 373 - R - 6, width: 2 * R + 12, height: 2 * R + 12, overflow: "visible" }}>
          <circle cx={R + 6} cy={R + 6} r={R} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeDasharray={`${circ * hold} ${circ}`} transform={`rotate(-90 ${R + 6} ${R + 6})`} style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.9))" }} />
        </svg>
        <div style={{ position: "absolute", left: 20, top: 748, width: 353, height: 56, borderRadius: 28, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${hold * 100}%`, background: "rgba(0,0,0,0.28)" }} />
        </div>
        {local > s(0.45) && local < s(2.1) && <div style={{ position: "absolute", left: 196 - 22, top: 776 - 22, width: 44, height: 44, borderRadius: 99, background: "rgba(255,255,255,0.75)", transform: `scale(${0.9 + 0.1 * Math.sin(local / 3)})` }} />}
      </>
    );
  }
  if (k === "s06" || k === "s07" || k === "s08" || k === "s09") {
    const nums: Record<string, [number, number]> = { s06: [500000, 442190], s07: [442190, 62613], s08: [62613, 75], s09: [75, 14] };
    const [a, b] = nums[k];
    const v = interpolate(local, [0, s(1.2)], [a, b], { ...C, easing: Easing.out(Easing.cubic) });
    const radarTint = k === "s09" ? lerp(local, [0, 20], [1, 0]) : 1;
    return (
      <>
        {base}
        <Radar local={frame} tint={radarTint} />
        <Patch x={289} y={64} w={62} h={27} c="rgb(42,42,44)" r={4} />
        <div style={{ position: "absolute", left: 291, top: 66, fontFamily: mono.fontFamily, fontWeight: 700, fontSize: 19.5, lineHeight: "23px", color: "#fff", letterSpacing: -0.3 }}>{mmss(remaining(frame))}</div>
        <Patch x={18} y={566} w={300} h={84} c="rgb(7,7,7)" />
        <div style={{ position: "absolute", left: 18, top: 570, fontFamily: inter.fontFamily, fontWeight: 300, fontSize: 66, lineHeight: "77px", color: "#fff", letterSpacing: -1.5 }}>{lakh(v)}</div>
      </>
    );
  }
  if (k === "s10") {
    const faces = [32, 84, 136, 187, 239, 291];
    const n = Math.round(lerp(local, [s(0.5), s(1.3)], [0, 30], Easing.out(Easing.quad)));
    const slam = spring({ frame: local - s(0.45), fps: FPS, config: { damping: 11, stiffness: 180, mass: 0.7 } });
    return (
      <>
        {base}
        <Patch x={30} y={238} w={327} h={68} c="rgb(19,19,20)" r={34} />
        {faces.map((x, i) => {
          const p = spring({ frame: local - 4 - i * 3, fps: FPS, config: { damping: 12, stiffness: 200, mass: 0.6 } });
          return <RegionPop key={i} src="s10.png" x={x} y={240} w={64} h={64} p={p} from={0.2} />;
        })}
        <Patch x={81} y={331} w={231} h={118} c="rgb(18,18,19)" />
        <div style={{ position: "absolute", left: 81, top: 329, width: 231, textAlign: "center", fontFamily: inter.fontFamily, fontWeight: 300, fontSize: 112, lineHeight: "130px", color: "#fff", letterSpacing: -3, transform: `scale(${0.6 + 0.4 * slam})` }}>{n}</div>
        <Tap local={local} at={1.65} x={196} y={728} />
      </>
    );
  }
  if (k === "s11") {
    const up = spring({ frame: local, fps: FPS, config: { damping: 16, stiffness: 120, mass: 0.9 } });
    return (
      <>
        {base}
        <RegionPop src="s11.png" x={24} y={160} w={345} h={388} p={up} from={0.88} />
        <Tap local={local} at={1.3} x={196} y={510} />
      </>
    );
  }
  if (k === "s12") {
    return (
      <>
        {base}
        <Tap local={local} at={0.35} x={196} y={390} />
        <Tap local={local} at={0.95} x={196} y={776} />
      </>
    );
  }
  if (k === "s13") {
    const run = lerp(local, [2, s(0.9)], [0, 261], Easing.out(Easing.quad));
    const slam = spring({ frame: local - s(0.9), fps: FPS, config: { damping: 10, stiffness: 220, mass: 0.6 } });
    const ticket = spring({ frame: local - s(0.55), fps: FPS, config: { damping: 15, stiffness: 120, mass: 0.9 } });
    return (
      <>
        {base}
        <Patch x={8} y={64} w={377} h={178} c="rgb(23,23,25)" />
        <div style={{ position: "absolute", left: 0, top: 62, width: 393, textAlign: "center", fontFamily: interItalic.fontFamily, fontStyle: "italic", fontWeight: 200, fontSize: 150, lineHeight: "182px", color: "#fff", letterSpacing: -4, transform: `scale(${local < s(0.9) ? 1 : 1.25 - 0.25 * slam})` }}>{mmss(run, false)}</div>
        <Patch x={22} y={328} w={349} h={334} c="rgb(23,23,25)" r={22} />
        <RegionPop src="s13.png" x={24} y={330} w={345} h={330} p={ticket} from={0.85} />
      </>
    );
  }
  if (k === "s14") {
    const star = spring({ frame: local - 2, fps: FPS, config: { damping: 12, stiffness: 110, mass: 0.9 } });
    const rows = [510, 560, 610];
    return (
      <>
        <Img src={fig("s13.png")} style={{ position: "absolute", left: 0, top: 0, width: 393, height: 852 }} />
        <Img src={fig("s14.png")} style={{ position: "absolute", left: 0, top: 0, width: 393, height: 852, WebkitMaskImage: "linear-gradient(to bottom, black 0, black 300px, transparent 300px)", maskImage: "linear-gradient(to bottom, black 0, black 300px, transparent 300px)" }} />
        {rows.map((y, i) => {
          const p = lerp(local, [s(0.5) + i * 6, s(0.5) + i * 6 + 6], [0, 1]);
          return (
            <div key={i} style={{ position: "absolute", left: 40, top: y - 4, width: 320, height: 40, overflow: "hidden", opacity: p }}>
              <Img src={fig("s14.png")} style={{ position: "absolute", left: -40, top: -(y - 4), width: 393, height: 852 }} />
            </div>
          );
        })}
        <Patch x={158} y={68} w={76} h={63} c="rgb(25,25,26)" r={10} />
        <Img src={fig("k-star.png")} style={{ position: "absolute", left: 160, top: 70, width: 72, height: 59, transform: `scale(${star * 1}) rotate(${(1 - star) * 300}deg)` }} />
      </>
    );
  }
  return base;
};

// ---------------- the phone ----------------
const Phone: React.FC<{ frame: number; opacity: number }> = ({ frame, opacity }) => {
  const cam = camAt(frame);
  const layers = SCREENS.filter((k) => frame >= st(k) && frame < en(k) + 5);
  const sheen = ((frame % 150) / 150) * 260 - 80;
  return (
    <div style={{ position: "absolute", inset: 0, perspective: 2200, opacity }}>
      <div
        style={{
          position: "absolute",
          left: PX,
          top: PY,
          width: PW,
          height: PHH,
          transformStyle: "preserve-3d",
          transform: `translate(${cam.x}px, ${-cam.y + (cam.z - 1) * 0}px) scale(${cam.z}) rotateX(${cam.rx}deg) rotateY(${cam.ry}deg)`,
          transformOrigin: "50% 40%",
        }}
      >
        {/* chrome bezel */}
        <div style={{ position: "absolute", inset: -10, borderRadius: 66, background: "linear-gradient(140deg,#d7d7dc 0%,#4a4a50 22%,#1b1b1e 45%,#8e8e95 62%,#2a2a2e 80%,#c9c9cf 100%)", boxShadow: "0 60px 120px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", inset: -3, borderRadius: 60, background: "#050506" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 56, overflow: "hidden", background: "#0b0b0c" }}>
          {layers.map((k) => {
            const local = frame - st(k);
            const fade = lerp(local, [0, 5], [0, 1], EOUT);
            return (
              <div key={k} style={{ position: "absolute", left: 0, top: 0, width: 393, height: 852, transformOrigin: "top left", transform: `scale(${PH}) translateY(${(1 - fade) * 14}px)`, opacity: fade }}>
                <Screen k={k} local={local} frame={frame} />
              </div>
            );
          })}
          {/* glass sheen */}
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(115deg, transparent ${sheen}%, rgba(255,255,255,0.07) ${sheen + 8}%, transparent ${sheen + 16}%)`, pointerEvents: "none" }} />
        </div>
      </div>
    </div>
  );
};

// ---------------- stage: background + ghost stopwatch ----------------
const Backdrop: React.FC<{ frame: number }> = ({ frame }) => {
  const t = frame / FPS;
  const ghostOn = lerp(frame, [st("s06"), st("s06") + 10, en("s14") - 10, en("s14")], [0, 1, 1, 0]);
  const flash = interpolate(frame, [st("s06") - 4, st("s06"), st("s06") + 10], [0, 0.9, 0], C);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 45%, #1e1e22 0%, #0b0b0d 55%, #030304 100%)" }}>
      {/* slow light beams */}
      <div style={{ position: "absolute", left: -400, top: -200, width: 1900, height: 1800, background: `conic-gradient(from ${t * 12}deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.045) 20deg, transparent 45deg, transparent 180deg, rgba(255,255,255,0.035) 200deg, transparent 230deg)` }} />
      {/* ghost stopwatch: launch → booked */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: interItalic.fontFamily, fontStyle: "italic", fontWeight: 200, fontSize: 470, lineHeight: 1, letterSpacing: -20, color: "transparent", WebkitTextStroke: "2px rgba(255,255,255,0.09)", opacity: ghostOn }}>
        {mmss(elapsed(frame), false)}
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

// ---------------- hook + end ----------------
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const slam = spring({ frame: frame - 2, fps: FPS, config: { damping: 13, stiffness: 170, mass: 0.8 } });
  const bag = spring({ frame: frame - 10, fps: FPS, config: { damping: 12, stiffness: 90, mass: 1 } });
  const sub = lerp(frame, [26, 40], [0, 1]);
  // morph into the phone: title + briefcase shrink into their Figma spots on screen 01
  const m = lerp(frame, [s(2.65), s(3.3)], [0, 1], EIO);
  const sheen = lerp(frame, [14, 50], [-40, 140], Easing.inOut(Easing.quad));
  const titleFrom = { x: 90, y: 190, w: 900 };
  const titleTo = { x: PX + 28 * PH, y: PY + 89 * PH, w: 336 * PH };
  const bagFrom = { x: 290, y: 640, w: 500 };
  const bagTo = { x: PX + 46 * PH, y: PY + 315 * PH, w: 299 * PH };
  const mix = (a: number, b: number) => a + (b - a) * m;
  const tW = mix(titleFrom.w, titleTo.w);
  const bW = mix(bagFrom.w, bagTo.w);
  const float = Math.sin(frame / 9) * 8 * (1 - m);
  if (frame >= s(3.45)) return null;
  return (
    <AbsoluteFill style={{ opacity: lerp(frame, [s(3.25), s(3.45)], [1, 0]) }}>
      <div style={{ position: "absolute", left: mix(titleFrom.x, titleTo.x), top: mix(titleFrom.y, titleTo.y), width: tW, height: tW * (707 / 1344), transform: `scale(${1.5 - 0.5 * slam})`, opacity: Math.min(1, slam * 2), filter: `blur(${(1 - slam) * 6}px)` }}>
        <Img src={fig("k-hire.png")} style={{ width: "100%", height: "100%" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(100deg, transparent ${sheen - 10}%, rgba(255,255,255,0.9) ${sheen}%, transparent ${sheen + 10}%)`,
            WebkitMaskImage: `url(${fig("k-hire.png")})`,
            maskImage: `url(${fig("k-hire.png")})`,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            mixBlendMode: "overlay",
          }}
        />
      </div>
      <Img
        src={fig("k-briefcase.png")}
        style={{ position: "absolute", left: mix(bagFrom.x, bagTo.x), top: mix(bagFrom.y, bagTo.y) + (1 - bag) * 500 + float, width: bW, height: bW, transform: `rotate(${(1 - bag) * -18 + Math.sin(frame / 13) * 3 * (1 - m)}deg)` }}
      />
      <div style={{ position: "absolute", top: 1190, left: 0, right: 0, textAlign: "center", fontFamily: inter.fontFamily, fontWeight: 400, fontSize: 36, color: "rgba(255,255,255,0.78)", opacity: sub * (1 - m), transform: `translateY(${(1 - sub) * 16}px)` }}>
        Post a role. Interview a top candidate in 10 minutes.
      </div>
    </AbsoluteFill>
  );
};

const End: React.FC<{ local: number }> = ({ local }) => {
  const a = (d: number) => spring({ frame: local - s(d), fps: FPS, config: { damping: 14, stiffness: 150, mass: 0.8 } });
  const [t1, pill, logo, cta] = [a(0), a(0.35), a(0.7), a(1.0)];
  const sheen = lerp(local, [10, 46], [-40, 140], Easing.inOut(Easing.quad));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, top: 200, width: 840, height: 840 * (707 / 1344), transform: `scale(${1.35 - 0.35 * t1})`, opacity: Math.min(1, t1 * 2), filter: `blur(${(1 - t1) * 6}px)` }}>
        <Img src={fig("k-hire.png")} style={{ width: "100%", height: "100%" }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, transparent ${sheen - 10}%, rgba(255,255,255,0.9) ${sheen}%, transparent ${sheen + 10}%)`, WebkitMaskImage: `url(${fig("k-hire.png")})`, maskImage: `url(${fig("k-hire.png")})`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%", mixBlendMode: "overlay" }} />
      </div>
      <Img src={fig("k-pill.png")} style={{ position: "absolute", left: (W - 440) / 2, top: 690, width: 440, height: 440 * (375 / 880), transform: `scale(${pill})` }} />
      <Img src={staticFile("brand/tal-boss-wordmark-cream.png")} style={{ position: "absolute", left: "50%", top: 900, height: 120, transform: `translateX(-50%) translateY(${(1 - logo) * 20}px)`, opacity: logo }} />
      <Img src={staticFile("brand/badges-stores.png")} style={{ position: "absolute", left: "50%", top: 1060, width: 560, transform: `translateX(-50%) translateY(${(1 - cta) * 20}px)`, opacity: cta }} />
      <div style={{ position: "absolute", top: 1180, left: 0, right: 0, textAlign: "center", fontFamily: inter.fontFamily, fontSize: 30, color: "rgba(255,255,255,0.65)", opacity: cta }}>
        Post a role. Interview in 10 minutes.
      </div>
    </AbsoluteFill>
  );
};

// ---------------- root ----------------
export const HireIn10Phone: React.FC = () => {
  const frame = useCurrentFrame();
  const phoneIn = lerp(frame, [s(2.9), s(3.35)], [0, 1]);
  const phoneOut = lerp(frame, [st("end") - 2, st("end") + 10], [1, 0]);
  const cur = SCREENS.find((k) => frame >= st(k) && frame < en(k));
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: inter.fontFamily }}>
      <Backdrop frame={frame} />
      {frame >= s(2.9) && frame < st("end") + 12 && <Phone frame={frame} opacity={phoneIn * phoneOut} />}
      {cur && <Caption k={cur} local={frame - st(cur)} dur={en(cur) - st(cur)} />}
      <Hook frame={frame} />
      {frame >= st("end") && <End local={frame - st("end")} />}
    </AbsoluteFill>
  );
};
