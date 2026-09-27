/**
 * Pixel-art mascot rendered on the upper LCD.
 * Posture, tilt and expression are driven by `drunk` (0..1).
 */
type Props = { drunk: number; bypassed: boolean };

const P = 8; // pixel unit

function Px({
  x,
  y,
  w = 1,
  h = 1,
  fill,
  opacity,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  fill: string;
  opacity?: number;
}) {
  return (
    <rect x={x * P} y={y * P} width={w * P} height={h * P} fill={fill} opacity={opacity} />
  );
}

export function Mascot({ drunk, bypassed }: Props) {
  const d = bypassed ? 0 : drunk;
  const tilt = d * 22;
  const lean = d * 5;
  const squash = 1 - d * 0.08;
  const body = "var(--lcd)";
  const dim = "var(--lcd-dim)";

  // Eye shapes progress: open -> half -> crossed
  const eyeStage = d < 0.28 ? 0 : d < 0.62 ? 1 : 2;

  return (
    <svg
      viewBox="0 0 176 160"
      className="pixel-crisp h-full w-full"
      role="img"
      aria-label={`HUMAN mascot, humanization ${Math.round(d * 100)} percent`}
    >
      <g
        transform={`translate(88 154) rotate(${tilt}) scale(1 ${squash}) translate(${-88 + lean} -154)`}
        style={{
          transformOrigin: "88px 154px",
          animation: d > 0.15 ? `sway ${2.6 - d * 1.6}s ease-in-out infinite` : undefined,
        }}
      >
        {/* legs */}
        <Px x={7} y={16} w={2} h={3} fill={body} />
        <Px x={13} y={16} w={2} h={3} fill={body} />
        {/* torso */}
        <Px x={6} y={11} w={10} h={5} fill={body} />
        <Px x={7} y={10} w={8} h={1} fill={body} />
        {/* arms — droop with intoxication */}
        <Px x={4} y={11 + Math.round(d * 2)} w={2} h={3} fill={body} />
        <Px x={16} y={11 + Math.round(d * 3)} w={2} h={3} fill={body} />
        {/* head */}
        <Px x={6} y={3} w={10} h={7} fill={body} />
        <Px x={7} y={2} w={8} h={1} fill={body} />
        {/* antenna / cowlick */}
        <Px x={10} y={0} w={1} h={2} fill={d > 0.5 ? dim : body} />

        {/* face cut-outs, drawn in screen color */}
        {eyeStage === 0 && (
          <>
            <Px x={8} y={5} w={1} h={2} fill="var(--screen-deep)" />
            <Px x={13} y={5} w={1} h={2} fill="var(--screen-deep)" />
          </>
        )}
        {eyeStage === 1 && (
          <>
            <Px x={8} y={6} w={2} h={1} fill="var(--screen-deep)" />
            <Px x={12} y={5} w={1} h={2} fill="var(--screen-deep)" />
          </>
        )}
        {eyeStage === 2 && (
          <>
            <Px x={8} y={5} w={1} h={1} fill="var(--screen-deep)" />
            <Px x={9} y={6} w={1} h={1} fill="var(--screen-deep)" />
            <Px x={8} y={7} w={1} h={1} fill="var(--screen-deep)" />
            <Px x={12} y={5} w={1} h={1} fill="var(--screen-deep)" />
            <Px x={13} y={6} w={1} h={1} fill="var(--screen-deep)" />
            <Px x={12} y={7} w={1} h={1} fill="var(--screen-deep)" />
          </>
        )}

        {/* mouth */}
        {d < 0.28 ? (
          <Px x={10} y={8} w={2} h={1} fill="var(--screen-deep)" />
        ) : d < 0.62 ? (
          <>
            <Px x={9} y={8} w={1} h={1} fill="var(--screen-deep)" />
            <Px x={10} y={9} w={2} h={1} fill="var(--screen-deep)" />
          </>
        ) : (
          <Px x={9} y={8} w={4} h={2} fill="var(--screen-deep)" />
        )}

        {/* blush pixels at higher values */}
        {d > 0.45 && (
          <>
            <Px x={7} y={7} w={1} h={1} fill="var(--amber)" opacity={0.75} />
            <Px x={14} y={7} w={1} h={1} fill="var(--amber)" opacity={0.75} />
          </>
        )}
      </g>

      {/* ghost trail / duplicated frames as chaos increases */}
      {d > 0.7 && (
        <g opacity={(d - 0.7) * 1.2} transform="translate(6 2)">
          <Px x={6} y={3} w={10} h={7} fill={dim} />
          <Px x={6} y={11} w={10} h={5} fill={dim} />
        </g>
      )}

      {/* floating wobble marks */}
      {d > 0.35 &&
        [0, 1, 2].map((i) => (
          <g key={i} opacity={0.35 + d * 0.5}>
            <Px x={2 + i * 7} y={1 + i} w={1} h={1} fill={dim} />
          </g>
        ))}
    </svg>
  );
}
