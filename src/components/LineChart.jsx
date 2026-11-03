import { useMemo, useRef, useState } from 'react'
import { formatMoney } from '../lib/format'

// Interactive SVG area/line chart.
// `points` = [{ key, label, value, sublabel? }] in order (left -> right).
// Hover (mouse) or drag (touch) to see the exact value in a tooltip.
export default function LineChart({ points, color = '#5b4bf0', emptyText = 'No data' }) {
  const svgRef = useRef(null)
  const [active, setActive] = useState(null) // index of highlighted point

  const W = 320
  const H = 170
  const padX = 10
  const padTop = 16
  const padBottom = 26

  const hasData = points.some((p) => p.value > 0)
  const max = Math.max(1, ...points.map((p) => p.value))

  const geo = useMemo(() => {
    const n = points.length
    const innerW = W - padX * 2
    const innerH = H - padTop - padBottom
    const stepX = n > 1 ? innerW / (n - 1) : 0
    const xy = points.map((p, i) => {
      const x = padX + stepX * i
      const y = padTop + innerH - (p.value / max) * innerH
      return { x, y, ...p }
    })
    return { xy, innerH, stepX }
  }, [points, max])

  if (!hasData) {
    return <div className="chart-empty">{emptyText}</div>
  }

  const linePath = geo.xy.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${geo.xy[geo.xy.length - 1].x} ${padTop + geo.innerH} L ${geo.xy[0].x} ${padTop + geo.innerH} Z`

  function pointerToIndex(clientX) {
    const svg = svgRef.current
    if (!svg) return null
    const rect = svg.getBoundingClientRect()
    const rel = ((clientX - rect.left) / rect.width) * W
    // nearest point
    let best = 0
    let bestDist = Infinity
    geo.xy.forEach((p, i) => {
      const d = Math.abs(p.x - rel)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    return best
  }

  function handleMove(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const idx = pointerToIndex(clientX)
    if (idx !== null) setActive(idx)
  }

  function handleLeave() {
    setActive(null)
  }

  const activePt = active !== null ? geo.xy[active] : null
  // tooltip position (clamped so it stays in view)
  const tipX = activePt ? Math.min(Math.max(activePt.x, 44), W - 44) : 0

  // x-axis labels (show a subset to avoid crowding)
  const labelEvery = points.length > 16 ? 5 : points.length > 8 ? 2 : 1

  return (
    <div className="linechart">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="lc-svg"
        preserveAspectRatio="none"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onTouchStart={handleMove}
        onTouchMove={handleMove}
        onTouchEnd={handleLeave}
      >
        <defs>
          <linearGradient id="lc-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* baseline */}
        <line
          x1={padX}
          y1={padTop + geo.innerH}
          x2={W - padX}
          y2={padTop + geo.innerH}
          stroke="var(--border)"
          strokeWidth="1"
        />

        {/* area + line */}
        <path d={areaPath} fill="url(#lc-area)" />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="lc-line"
        />

        {/* dots */}
        {geo.xy.map((p, i) => (
          <circle
            key={p.key}
            cx={p.x}
            cy={p.y}
            r={active === i ? 4.5 : p.value > 0 ? 2.2 : 0}
            fill={active === i ? '#fff' : color}
            stroke={color}
            strokeWidth={active === i ? 2.5 : 0}
          />
        ))}

        {/* active guide line */}
        {activePt && (
          <line
            x1={activePt.x}
            y1={padTop}
            x2={activePt.x}
            y2={padTop + geo.innerH}
            stroke={color}
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.5"
          />
        )}

        {/* x labels */}
        {geo.xy.map((p, i) =>
          i % labelEvery === 0 ? (
            <text
              key={`l-${p.key}`}
              x={p.x}
              y={H - 8}
              textAnchor="middle"
              className="lc-xlabel"
            >
              {p.label}
            </text>
          ) : null,
        )}
      </svg>

      {/* Tooltip (HTML overlay, positioned by percentage) */}
      {activePt && (
        <div
          className="lc-tooltip"
          style={{ left: `${(tipX / W) * 100}%` }}
        >
          <span className="lc-tip-val">{formatMoney(activePt.value)}</span>
          <span className="lc-tip-label">{activePt.sublabel || activePt.label}</span>
        </div>
      )}
    </div>
  )
}
