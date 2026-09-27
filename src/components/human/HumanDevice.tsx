import { useCallback, useState } from "react";
import { Knob } from "./Knob";
import { Mascot } from "./Mascot";

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

export function HumanDevice() {
  const [patch, setPatch] = useState<Patch>({ humanize: 35, timing: 42, velocity: 63 });
  const [seed, setSeed] = useState(12345);
  const [preset, setPreset] = useState<PresetKey | null>(null);
  const [bypassed, setBypassed] = useState(false);
  const [gen, setGen] = useState(0);

  const drunk = bypassed
    ? 0
    : (patch.humanize * 0.5 + patch.timing * 0.25 + patch.velocity * 0.25) / 100;

  const set = useCallback((k: keyof Patch) => (v: number) => {
    setPreset(null);
    setPatch((p) => ({ ...p, [k]: v }));
  }, []);

  const bumpSeed = (delta: number) =>
    setSeed((s) => Math.max(0, Math.min(9999999999, s + delta)));

  return (
    <div className="flex flex-col items-center gap-5">
      {/* ===== UPPER HALF ===== */}
      <div className="shell-surface w-[380px] rounded-[26px] rounded-b-[10px] p-4 pb-3 shadow-shell">
        <div className="flex items-start gap-3">
          <SpeakerGrille />
          <div className="screen-bezel flex-1 rounded-[6px] p-[6px]">
            <div className="screen-glass relative aspect-[4/3.1] overflow-hidden rounded-[3px]">
              <div className="absolute inset-0 grid grid-rows-[auto_1fr_auto]">
                <div className="flex items-center justify-between px-2 pt-1.5 font-pixel text-[8px] text-lcd-dim">
                  <span>HUMAN v1.0</span>
                  <span className={bypassed ? "text-crimson" : "text-lcd"}>
                    {bypassed ? "BYPASSED" : "ACTIVE"}
                  </span>
                </div>
                <div key={gen} className="min-h-0 px-6 pt-1">
                  <Mascot drunk={drunk} bypassed={bypassed} />
                </div>
                <div className="flex items-center justify-between border-t border-lcd-dim/30 px-2 py-1.5 font-pixel text-[9px]">
                  <span className="text-lcd text-glow">
                    STATUS: {bypassed ? "OFFLINE" : STATUS(drunk)}
                  </span>
                  <span className="text-amber tabular-nums">
                    {Math.round(drunk * 100)}%
                  </span>
                </div>
              </div>
              <div className="scanlines pointer-events-none absolute inset-0" />
            </div>
          </div>
          <SpeakerGrille />
        </div>
        <p className="mt-2.5 text-center font-pixel text-[8px] tracking-[0.3em] text-shell-line">
          HUMAN &nbsp;—&nbsp; MIDI HUMANIZER
        </p>
      </div>

      {/* hinge */}
      <div className="-my-4 flex w-[344px] items-center justify-center gap-2">
        <div className="shell-surface h-5 flex-1 rounded-[4px] shadow-shell" />
        <div className="shell-surface flex h-5 items-center gap-1.5 rounded-[4px] px-3">
          <span className="h-2 w-2 rounded-full bg-shell-line" />
          <span className="font-pixel text-[7px] text-shell-line">MIC</span>
        </div>
        <div className="shell-surface flex h-5 flex-1 items-center justify-end gap-[3px] rounded-[4px] px-2 shadow-shell">
          <span className="h-3 w-[3px] bg-shell-line" />
          <span className="h-3 w-[3px] bg-shell-line" />
        </div>
      </div>

      {/* ===== LOWER HALF ===== */}
      <div className="shell-surface w-[380px] rounded-[10px] rounded-b-[26px] p-4 shadow-shell">
        <div className="flex items-start gap-2">
          {/* D-PAD */}
          <div className="pt-8">
            <DPad
              onUp={() => bumpSeed(100000)}
              onDown={() => bumpSeed(-100000)}
              onLeft={() => bumpSeed(-1)}
              onRight={() => bumpSeed(1)}
            />
            <p className="mt-1.5 text-center font-pixel text-[7px] leading-[1.6] text-shell-line">
              SEED
              <br />
              NAV
            </p>
          </div>

          {/* LOWER SCREEN */}
          <div className="screen-bezel flex-1 rounded-[6px] p-[6px]">
            <div className="screen-glass relative overflow-hidden rounded-[3px] px-2 py-2.5">
              <div className="flex items-start justify-between gap-1">
                <Knob label="HUMANIZE" value={patch.humanize} onChange={set("humanize")} disabled={bypassed} />
                <Knob label="TIMING" value={patch.timing} onChange={set("timing")} disabled={bypassed} />
                <Knob label="VELOCITY" value={patch.velocity} onChange={set("velocity")} disabled={bypassed} />
              </div>
              <div className="mt-2.5 flex items-center justify-between border-t border-lcd-dim/30 pt-2">
                <div>
                  <p className="font-pixel text-[8px] text-lcd-dim">SEED</p>
                  <p className="font-pixel text-[13px] text-amber tabular-nums text-glow">
                    {String(seed).padStart(10, "0")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-pixel text-[8px] text-lcd-dim">PRESET</p>
                  <p className="font-pixel text-[11px] text-lcd">
                    {preset ? `${preset} · ${PRESETS[preset].name}` : "—— USER"}
                  </p>
                </div>
              </div>
              <div className="scanlines pointer-events-none absolute inset-0" />
            </div>
          </div>

          {/* A/B/X/Y */}
          <div className="relative h-[104px] w-[104px] shrink-0">
            {(
              [
                ["X", "top-0 left-1/2 -translate-x-1/2"],
                ["Y", "top-1/2 left-0 -translate-y-1/2"],
                ["A", "top-1/2 right-0 -translate-y-1/2"],
                ["B", "bottom-0 left-1/2 -translate-x-1/2"],
              ] as const
            ).map(([k, pos]) => (
              <button
                key={k}
                onClick={() => {
                  setPatch(PRESETS[k].patch);
                  setPreset(k);
                }}
                aria-label={`Preset ${k} — ${PRESETS[k].name}`}
                className={`absolute ${pos} flex h-9 w-9 flex-col items-center justify-center rounded-full bg-keycap font-pixel text-[11px] text-foreground/80 transition-all active:translate-y-[2px] ${
                  preset === k ? "text-lcd" : ""
                }`}
                style={{
                  boxShadow: preset === k ? "var(--shadow-key-down)" : "var(--shadow-key)",
                }}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* START / SELECT row */}
        <div className="mt-3 flex items-center justify-between px-1">
          <p className="max-w-[150px] font-pixel text-[7px] leading-[1.8] text-shell-line">
            ↑↓ SEED ±100000 &nbsp; ←→ SEED ±1
            <br />
            A B X Y &nbsp; PRESET 1—4
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setBypassed((b) => !b)}
              className="flex items-center gap-2 font-pixel text-[8px] text-shell-line"
            >
              <span
                className="grid h-4 w-8 place-items-center rounded-full bg-keycap transition-all active:translate-y-[1px]"
                style={{ boxShadow: bypassed ? "var(--shadow-key-down)" : "var(--shadow-key)" }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: bypassed ? "var(--crimson)" : "var(--lcd)",
                    boxShadow: `0 0 6px ${bypassed ? "var(--crimson)" : "var(--lcd)"}`,
                  }}
                />
              </span>
              BYPASS
            </button>
            <button
              onClick={() => {
                setSeed(Math.floor(Math.random() * 9999999999));
                setPreset(null);
                setGen((g) => g + 1);
              }}
              className="flex items-center gap-2 font-pixel text-[8px] text-shell-line"
            >
              <span
                className="grid h-4 w-8 place-items-center rounded-full bg-keycap transition-all active:translate-y-[1px]"
                style={{ boxShadow: "var(--shadow-key)" }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full bg-amber"
                  style={{
                    boxShadow: "0 0 6px var(--amber)",
                    animation: "blink-soft 1.8s ease-in-out infinite",
                  }}
                />
              </span>
              GENERATE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpeakerGrille() {
  return (
    <div className="grid shrink-0 grid-cols-3 gap-[5px] pt-10">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className="h-[3px] w-[3px] rounded-full bg-shell-line" />
      ))}
    </div>
  );
}

function DPad({
  onUp,
  onDown,
  onLeft,
  onRight,
}: Record<"onUp" | "onDown" | "onLeft" | "onRight", () => void>) {
  const base =
    "absolute bg-keycap text-foreground/70 grid place-items-center transition-all active:translate-y-[1px]";
  return (
    <div className="relative h-[84px] w-[84px]" style={{ filter: "drop-shadow(0 3px 4px oklch(0 0 0 / 0.45))" }}>
      <button aria-label="Seed up" onClick={onUp} className={`${base} left-[28px] top-0 h-7 w-7 rounded-t-[5px]`} />
      <button aria-label="Seed down" onClick={onDown} className={`${base} bottom-0 left-[28px] h-7 w-7 rounded-b-[5px]`} />
      <button aria-label="Seed step down" onClick={onLeft} className={`${base} left-0 top-[28px] h-7 w-7 rounded-l-[5px]`} />
      <button aria-label="Seed step up" onClick={onRight} className={`${base} right-0 top-[28px] h-7 w-7 rounded-r-[5px]`} />
      <span className="pointer-events-none absolute left-[28px] top-[28px] grid h-7 w-7 place-items-center bg-keycap">
        <span className="h-2.5 w-2.5 rounded-full bg-keycap-dark" />
      </span>
    </div>
  );
}
