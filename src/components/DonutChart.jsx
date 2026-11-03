import { formatMoneyCompact } from '../lib/format'

// SVG donut chart of category spend. `data` is [{ category, amount }] sorted desc.
// `lookup(id)` resolves a category record.
export default function DonutChart({ data, total, lookup }) {
  const size = 160
  const stroke = 22
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  const center = size / 2

  let offset = 0
  const segments = data.map(({ category, amount }) => {
    const cat = lookup(category)
    const fraction = total > 0 ? amount / total : 0
    const len = fraction * circ
    const seg = {
      key: category,
      color: cat.color,
      dash: `${len} ${circ - len}`,
      rotation: (offset / circ) * 360,
    }
    offset += len
    return seg
  })

  const topCat = data[0] ? lookup(data[0].category) : null

  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={stroke}
        />
        {segments.map((s) => (
          <circle
            key={s.key}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={s.dash}
            strokeLinecap="round"
            transform={`rotate(${s.rotation - 90} ${center} ${center})`}
            className="donut-seg"
          />
        ))}
      </svg>
      <div className="donut-center">
        <span className="donut-top-label">Total</span>
        <span className="donut-total">{formatMoneyCompact(total)}</span>
        {topCat && <span className="donut-hint">Top: {topCat.icon} {topCat.label}</span>}
      </div>
    </div>
  )
}
