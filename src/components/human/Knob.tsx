import { useCallback, useRef } from "react";

type Props = {
  label: string;
  value: number; // 0..100
  onChange: (v: number) => void;
  disabled?: boolean;
};

const MIN_ANGLE = -135;
const MAX_ANGLE = 135;

export function Knob({ label, value, onChange, disabled }: Props) {
  const drag = useRef<{ y: number; v: number } | null>(null);
  const angle = MIN_ANGLE + (value / 100) * (MAX_ANGLE - MIN_ANGLE);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      (e.target as Element).setPointerCapture(e.pointerId);
      drag.current = { y: e.clientY, v: value };
    },
    [value, disabled],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag.current) return;
      const delta = (drag.current.y - e.clientY) * 0.6;
      onChange(Math.max(0, Math.min(100, Math.round(drag.current.v + delta))));
    },
    [onChange],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      const step = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowUp" || e.key === "ArrowRight") {
        e.preventDefault();
        onChange(Math.min(100, value + step));
      } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
        e.preventDefault();
        onChange(Math.max(0, value - step));
      }
    },
    [value, onChange, disabled],
  );

  // Tick ring
  const ticks = Array.from({ length: 11 }, (_, i) => MIN_ANGLE + (i / 10) * 270);

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <span className="font-pixel text-[9px] text-lcd text-glow">{label}</span>
      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => (drag.current = null)}
        onKeyDown={onKeyDown}
        className="relative h-[58px] w-[58px] cursor-ns-resize touch-none outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
        style={{ opacity: disabled ? 0.45 : 1 }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full">
          {ticks.map((t, i) => (
            <line
              key={i}
              x1="50"
              y1="8"
              x2="50"
              y2={i % 5 === 0 ? 15 : 12}
              stroke={
                t <= angle ? "var(--lcd)" : "var(--lcd-dim)"
              }
              strokeWidth={i % 5 === 0 ? 3 : 2}
              transform={`rotate(${t} 50 50)`}
            />
          ))}
          <circle cx="50" cy="50" r="28" fill="var(--keycap-dark)" />
          <circle cx="50" cy="48" r="28" fill="var(--keycap)" />
          <circle cx="50" cy="48" r="22" fill="var(--shell-dark)" />
          <g transform={`rotate(${angle} 50 48)`}>
            <rect x="47" y="26" width="6" height="16" fill="var(--lcd)" />
          </g>
        </svg>
      </div>
      <span className="font-pixel text-[11px] text-amber tabular-nums">{value}%</span>
      <div className="flex w-[58px] justify-between font-pixel text-[7px] text-lcd-dim">
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  );
}
