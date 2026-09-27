import { useCallback, useEffect, useRef, useState } from "react";
import { Knob } from "./Knob";
import { Mascot } from "./Mascot";
import dsAsset from "@/assets/design_vst.png.asset.json";

type Patch = { humanize: number; timing: number; velocity: number };
type PresetKey = "A" | "B" | "X" | "Y";

const PRESETS: Record<PresetKey, { name: string; patch: Patch }> = {
  A: { name: "TIGHT", patch: { humanize: 12, timing: 8, velocity: 18 } },
  B: { name: "LOOSE", patch: { humanize: 46, timing: 52, velocity: 38 } },
  X: { name: "SWAYED", patch: { humanize: 68, timing: 74, velocity: 55 } },
  Y: { name: "RUINED", patch: { humanize: 94, timing: 88, velocity: 96 } },
};

const STATUS = (d: number) =>
  d === 0 ? "NORMAL" : d < 0.28 ? "LOOSE" : d < 0.62 ? "TIPSY" : d < 0.85 ? "DRUNK" : "GONE";

// Geometry in native PNG pixels (373 x 385). Stage renders at K x.
const W = 373;
const H = 385;
const K = 3;
const px = (n: number) => n * K;
const TOP = { x: 100, y: 28, w: 173, h: 129 };
const BOT = { x: 100, y: 225, w: 173, h: 129 };
const ABXY: Record<PresetKey, [number, number]> = { X: [328, 243], Y: [307, 265], A: [349, 265], B: [328, 286] };

export function HumanDevice() {
  const [patch, setPatch] = useState<Patch>({ humanize: 35, timing: 42, velocity: 63 });
  const [seed, setSeed] = useState(12345);
  const [preset, setPreset] = useState<PresetKey | null>(null);
  const [bypassed, setBypassed] = useState(false);
  const [gen, setGen] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const fit = () => {
      const s = Math.min(el.clientWidth / px(W), (window.innerHeight - 140) / px(H), 1);
      setScale(Math.max(0.25, s));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  const drunk = bypassed ? 0 : (patch.humanize * 0.5 + patch.timing * 0.25 + patch.velocity * 0.25) / 100;

  const set = useCallback((k: keyof Patch) => (v: number) => {
    setPreset(null);
    setPatch((p) => ({ ...p, [k]: v }));
  }, []);

  const bumpSeed = (d: number) => setSeed((s) => Math.max(0, Math.min(9999999999, s + d)));

  const rect = (r: { x: number; y: number; w: number; h: number }) => ({
    left: px(r.x), top: px(r.y), width: px(r.w), height: px(r.h),
  });
  const hit = (cx: number, cy: number, w: number, h: number) => ({
    left: px(cx - w / 2), top: px(cy - h / 2), width: px(w), height: px(h),
  });

  return (
    <div ref={wrapRef} className="flex w-full justify-center">
      <div style={{ width: px(W) * scale, height: px(H) * scale }}>
        <div
          className="relative origin-top-left"
          style={{ width: px(W), height: px(H), transform: `scale(${scale})` }}
        >
          {/* HARDWARE — the PNG is the permanent base layer */}
          <img
            src={dsAsset.url}
            alt="HUMAN handheld"
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full select-none"
            style={{ imageRendering: "pixelated" }}
          />

          {/* UPPER SCREEN */}
          <div className="screen-glass absolute overflow-hidden" style={rect(TOP)}>
            <div className="absolute inset-0 grid grid-rows-[auto_1fr_auto]">
              <div className="flex items-center justify-between px-3 pt-2 font-pixel text-[13px] text-lcd-dim">
                <span>HUMAN v1.0</span>
                <span className={bypassed ? "text-crimson" : "text-lcd"}>{bypassed ? "BYPASSED" : "ACTIVE"}</span>
              </div>
              <div key={gen} className="mx-auto flex min-h-0 w-[52%] items-center overflow-hidden">
                <Mascot drunk={drunk} bypassed={bypassed} />
              </div>
              <div className="flex items-center justify-between border-t border-lcd-dim/30 px-3 py-2 font-pixel text-[14px]">
                <span className="text-lcd text-glow">HUMAN STATUS: {bypassed ? "OFFLINE" : STATUS(drunk)}</span>
                <span className="text-amber tabular-nums">{Math.round(drunk * 100)}%</span>
              </div>
            </div>
            <div className="scanlines pointer-events-none absolute inset-0" />
          </div>

          {/* LOWER SCREEN */}
          <div className="screen-glass absolute overflow-hidden" style={rect(BOT)}>
            <div className="flex h-full flex-col justify-between p-4" style={{ zoom: 1.35 } as React.CSSProperties}>
              <div className="flex items-start justify-between gap-1">
                <Knob label="HUMANIZE" value={patch.humanize} onChange={set("humanize")} disabled={bypassed} />
                <Knob label="TIMING" value={patch.timing} onChange={set("timing")} disabled={bypassed} />
                <Knob label="VELOCITY" value={patch.velocity} onChange={set("velocity")} disabled={bypassed} />
              </div>
              <div className="flex items-end justify-between border-t border-lcd-dim/30 pt-2">
                <div>
                  <p className="font-pixel text-[8px] text-lcd-dim">SEED</p>
                  <p className="font-pixel text-[14px] text-amber tabular-nums text-glow">{String(seed).padStart(10, "0")}</p>
                </div>
                <div className="text-right">
                  <p className="font-pixel text-[8px] text-lcd-dim">PRESET</p>
                  <p className="font-pixel text-[11px] text-lcd">{preset ? `${preset} · ${PRESETS[preset].name}` : "USER"}</p>
                </div>
              </div>
            </div>
            <div className="scanlines pointer-events-none absolute inset-0" />
          </div>

          {/* D-PAD hit zones (drawn by the PNG) */}
          {(
            [
              ["Seed up", 42, 255, () => bumpSeed(100000)],
              ["Seed down", 42, 285, () => bumpSeed(-100000)],
              ["Seed step down", 27, 270, () => bumpSeed(-1)],
              ["Seed step up", 57, 270, () => bumpSeed(1)],
            ] as const
          ).map(([label, cx, cy, fn]) => (
            <button key={label} aria-label={label} onClick={fn} className="hw-hit absolute" style={hit(cx, cy, 15, 15)} />
          ))}

          {/* A/B/X/Y hit zones */}
          {(Object.keys(ABXY) as PresetKey[]).map((k) => {
            const [cx, cy] = ABXY[k];
            return (
              <button
                key={k}
                aria-label={`Preset ${k} — ${PRESETS[k].name}`}
                onClick={() => {
                  setPatch(PRESETS[k].patch);
                  setPreset(k);
                }}
                className="hw-hit absolute rounded-full"
                data-on={preset === k}
                style={hit(cx, cy, 20, 20)}
              />
            );
          })}

          {/* START = BYPASS, SELECT = GENERATE */}
          <button
            aria-label="Start — Bypass"
            onClick={() => setBypassed((b) => !b)}
            className="hw-hit absolute rounded-full"
            data-on={bypassed}
            style={hit(302, 333, 12, 12)}
          />
          <button
            aria-label="Select — Generate"
            onClick={() => {
              setSeed(Math.floor(Math.random() * 9999999999));
              setPreset(null);
              setGen((g) => g + 1);
            }}
            className="hw-hit absolute rounded-full"
            style={hit(302, 354, 12, 12)}
          />
        </div>
      </div>
    </div>
  );
}
