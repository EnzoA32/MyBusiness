"use client";

export default function Donut({ segments, centerValue, centerLabel, size = 110 }) {
  const r = size * 0.42;
  const cx = size / 2;
  const cy = size / 2;
  const sw = size * 0.13;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#eef0ee" strokeWidth={sw} />
      {segments.map((s, i) => {
        const len = (s.value / 100) * circ;
        const el = (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={sw}
            strokeDasharray={`${len} ${circ - len}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
        offset += len;
        return el;
      })}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontFamily="var(--font-geist-sans)"
        fontWeight="800"
        fontSize={size * 0.17}
        fill="var(--ink)"
      >
        {centerValue}
      </text>
      <text
        x={cx}
        y={cy + size * 0.14}
        textAnchor="middle"
        fontFamily="var(--font-geist-sans)"
        fontSize={size * 0.08}
        fill="var(--text-faint)"
      >
        {centerLabel}
      </text>
    </svg>
  );
}
