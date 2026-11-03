import { formatMoneyCompact } from '../lib/format'

// Three small stat tiles: daily average, today's spend, vs last month.
export default function QuickStats({ dailyAvg, todayTotal, deltaPct }) {
  const hasDelta = deltaPct !== null && Number.isFinite(deltaPct)
  const up = hasDelta && deltaPct > 0
  const down = hasDelta && deltaPct < 0

  return (
    <div className="stats-row">
      <div className="stat-tile">
        <span className="stat-label">Daily avg</span>
        <span className="stat-value">{formatMoneyCompact(dailyAvg)}</span>
      </div>
      <div className="stat-tile">
        <span className="stat-label">Spent today</span>
        <span className="stat-value">{formatMoneyCompact(todayTotal)}</span>
      </div>
      <div className="stat-tile">
        <span className="stat-label">vs last month</span>
        {hasDelta ? (
          <span className={`stat-value ${up ? 'up' : down ? 'down' : ''}`}>
            {up ? '▲' : down ? '▼' : ''} {Math.abs(deltaPct)}%
          </span>
        ) : (
          <span className="stat-value muted-val">—</span>
        )}
      </div>
    </div>
  )
}
