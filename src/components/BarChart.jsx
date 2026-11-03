import { useState } from 'react'
import { formatMoney } from '../lib/format'

// Interactive bar chart. Tap/click a bar to reveal its exact value.
// `bars` = [{ key, label, value, sublabel?, highlight? }].
export default function BarChart({ bars, color = 'var(--primary)', emptyText = 'No data' }) {
  const [active, setActive] = useState(null)
  const max = Math.max(1, ...bars.map((b) => b.value))
  const hasData = bars.some((b) => b.value > 0)

  if (!hasData) {
    return <div className="chart-empty">{emptyText}</div>
  }

  return (
    <div className="barchart">
      {bars.map((b, i) => {
        const h = Math.round((b.value / max) * 100)
        const isActive = active === i
        return (
          <button
            type="button"
            className={`bar-col ${isActive ? 'bar-col-active' : ''}`}
            key={b.key}
            onClick={() => setActive(isActive ? null : i)}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
          >
            <div className={`bar-value ${isActive ? 'show' : ''}`}>
              {b.value > 0 ? formatMoney(b.value) : '—'}
            </div>
            <div className="bar-track">
              <div
                className={`bar-fill ${b.highlight ? 'bar-highlight' : ''} ${isActive ? 'bar-fill-active' : ''}`}
                style={{ height: `${b.value > 0 ? Math.max(h, 4) : 0}%`, background: color }}
              />
            </div>
            <div className="bar-label">{b.label}</div>
          </button>
        )
      })}
    </div>
  )
}
