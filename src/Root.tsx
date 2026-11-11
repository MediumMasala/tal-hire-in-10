import React from "react";
import { Composition } from "remotion";
import { END_TRIM, FPS, H, HireIn10, TOTAL, TOTAL_Q, W } from "./HireIn10";
import { ROLE_KEYS } from "./roles";
import FIND_TOP from "./findTop.json";
import FIND_TOP_HOOKS from "./findTopHooks.json";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="HireIn10" component={HireIn10} durationInFrames={TOTAL} fps={FPS} width={W} height={H} defaultProps={{ city: "Pune" as const }} />
    <Composition id="HireIn10Bangalore" component={HireIn10} durationInFrames={TOTAL} fps={FPS} width={W} height={H} defaultProps={{ city: "Bangalore" as const }} />
    <Composition id="HireIn10BangaloreLite" component={HireIn10} durationInFrames={TOTAL} fps={FPS} width={W} height={H} defaultProps={{ city: "Bangalore" as const, liteBook: true }} />
    <Composition id="HireIn10BangaloreQuery" component={HireIn10} durationInFrames={TOTAL_Q} fps={FPS} width={W} height={H} defaultProps={{ city: "Bangalore" as const, query: true }} />
    {/* role cuts: HireIn10Bangalore-<role> (see roles.ts) */}
    {ROLE_KEYS.map((role) => (
      <Composition key={role} id={`HireIn10Bangalore-${role}`} component={HireIn10} durationInFrames={TOTAL_Q} fps={FPS} width={W} height={H} defaultProps={{ city: "Bangalore" as const, query: true, role }} />
    ))}
    {/* "FIND GREAT CANDIDATES IN 10 MINS" hook: FindIn10Bangalore-<role> (candidate-card fan), -briefcase keeps the briefcase */}
    {ROLE_KEYS.map((role) => (
      <Composition key={`find-${role}`} id={`FindIn10Bangalore-${role}`} component={HireIn10} durationInFrames={TOTAL_Q} fps={FPS} width={W} height={H} defaultProps={{ city: "Bangalore" as const, query: true, role, hook: "find" as const, hero: "cards" as const }} />
    ))}
    {ROLE_KEYS.map((role) => (
      <Composition key={`find-bc-${role}`} id={`FindIn10Bangalore-${role}-briefcase`} component={HireIn10} durationInFrames={TOTAL_Q} fps={FPS} width={W} height={H} defaultProps={{ city: "Bangalore" as const, query: true, role, hook: "find" as const, hero: "briefcase" as const }} />
    ))}
    {/* OG tagline, chrome 2-line lockups (tools/lettering.py), no pill, briefcase */}
    <Composition id="FindTopCandidates" component={HireIn10} durationInFrames={TOTAL_Q - END_TRIM} fps={FPS} width={W} height={H} defaultProps={{ city: "Bangalore" as const, query: true, role: "engineers" as const, noPill: true, tidy: true, hookLayout: "app" as const, endWhat: "top candidates", hookImg: { src: "k-ftc-a.png", ar: 492 / 1612 } }} />
    <Composition id="FindTopEngineers" component={HireIn10} durationInFrames={TOTAL_Q - END_TRIM} fps={FPS} width={W} height={H} defaultProps={{ city: "Bangalore" as const, query: true, role: "engineers" as const, noPill: true, tidy: true, hookLayout: "app" as const, endWhat: "top software engineers", hookImg: { src: "k-fte-a.png", ar: 446 / 1612 } }} />
    <Composition id="FindTopEngineersPhoto" component={HireIn10} durationInFrames={TOTAL_Q - END_TRIM} fps={FPS} width={W} height={H} defaultProps={{ city: "Bangalore" as const, query: true, role: "engineers" as const, noPill: true, tidy: true, heroPhoto: true, hookLayout: "app" as const, endWhat: "top software engineers", hookImg: { src: "k-fte-a.png", ar: 446 / 1612 } }} />
    {/* rollout: FindTop-<role> = white-tag 3-line title (tools/role_hooks.py) + 3 photos + compact Let's go */}
    {ROLE_KEYS.map((role) => {
      const ft = FIND_TOP[role] as { tag: string; endWhat: string; file: string; subline?: string; trio?: { name: string; photo: string; fx: number }[] };
      return <Composition key={`ft-${role}`} id={`FindTop-${role}`} component={HireIn10} durationInFrames={TOTAL_Q - END_TRIM} fps={FPS} width={W} height={H} defaultProps={{ city: "Bangalore" as const, query: true, role, noPill: true, tidy: true, hookLayout: "app" as const, heroPhotos: 3 as const, bigHook: true, endWhat: ft.endWhat, subline: ft.subline, trio: ft.trio, hookImg: FIND_TOP_HOOKS[role] }} />;
    })}
    {/* "FIND TOP [CANDIDATES] / IN 10 MINS" (2 lines, justified) + "For founders & leaders of India" pill on top (stampStyle: ink = red rubber stamp, seal = clean white stamp) */}
    <Composition id="FindTopAnyRole" component={HireIn10} durationInFrames={TOTAL_Q - END_TRIM} fps={FPS} width={W} height={H} defaultProps={{ city: "Bangalore" as const, query: true, role: "engineers" as const, noPill: true, tidy: true, hookLayout: "app" as const, heroPhotos: 3 as const, bigHook: true, endWhat: "top candidates", trio: [{ name: "Aman Verma", photo: "aman-verma", fx: 0.5 }, { name: "Ritika Agarwal", photo: "ritika-agarwal", fx: 0.5 }, { name: "Shruti Raman", photo: "shruti-raman", fx: 0.5 }], stamp: ["FOR FOUNDERS & LEADERS OF INDIA"], stampStyle: "kicker" as const, hookImg: { src: "k-ftc2j.png", ar: 589 / 1680 } }} />
    <Composition id="HireIn10Chennai" component={HireIn10} durationInFrames={TOTAL} fps={FPS} width={W} height={H} defaultProps={{ city: "Chennai" as const }} />
  </>
);
