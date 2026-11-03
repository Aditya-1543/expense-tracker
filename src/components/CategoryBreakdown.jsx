import { formatMoney } from '../lib/format'
import DonutChart from './DonutChart'

// Donut + ranked list showing spend per category for the active month.
export default function CategoryBreakdown({ byCategory, total, lookup }) {
  if (byCategory.length === 0) return null

  return (
    <section className="panel">
      <div className="panel-head">
        <h3 className="panel-title">Where it's going</h3>
        <span className="pill-muted">{byCategory.length} categories</span>
      </div>

      <DonutChart data={byCategory} total={total} lookup={lookup} />

      <div className="breakdown">
        {byCategory.map(({ category, amount }) => {
          const cat = lookup(category)
          const pct = total > 0 ? Math.round((amount / total) * 100) : 0
          return (
            <div className="bd-row" key={category}>
              <div className="bd-head">
                <span className="bd-name">
                  <span className="bd-dot" style={{ background: cat.color }} />
                  <span className="bd-icon">{cat.icon}</span>
                  {cat.label}
                </span>
                <span className="bd-amount">{formatMoney(amount)}</span>
              </div>
              <div className="bd-track">
                <div
                  className="bd-fill"
                  style={{ width: `${pct}%`, background: cat.color }}
                />
              </div>
              <span className="bd-pct">{pct}%</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
