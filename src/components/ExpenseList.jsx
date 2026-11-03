import { PAYMENT_MAP } from '../constants'
import { formatMoney, formatDayHeader } from '../lib/format'

// Grouped list of expenses by day, with edit/delete.
export default function ExpenseList({ expenses, totalCount, lookup, onEdit, onDelete }) {
  if (totalCount === 0) {
    return (
      <div className="empty">
        <div className="empty-icon">💸</div>
        <p className="empty-title">No expenses yet this month</p>
        <p className="empty-sub">Tap the + button to add your first one.</p>
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon">🔍</div>
        <p className="empty-title">Nothing matches</p>
        <p className="empty-sub">Try a different search or filter.</p>
      </div>
    )
  }

  // Group by date (already sorted newest-first in the store).
  const groups = []
  let current = null
  for (const e of expenses) {
    if (!current || current.date !== e.date) {
      current = { date: e.date, items: [] }
      groups.push(current)
    }
    current.items.push(e)
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h3 className="panel-title">Transactions</h3>
        <span className="pill-muted">{expenses.length}</span>
      </div>
      <div className="tx-list">
        {groups.map((g) => {
          const dayTotal = g.items.reduce((s, e) => s + e.amount, 0)
          return (
            <div className="tx-day" key={g.date}>
              <div className="tx-day-head">
                <span>{formatDayHeader(g.date)}</span>
                <span className="tx-day-total">{formatMoney(dayTotal)}</span>
              </div>
              {g.items.map((e) => {
                const cat = lookup(e.category)
                const pay = PAYMENT_MAP[e.payment]
                return (
                  <div className="tx" key={e.id}>
                    <div className="tx-icon" style={{ background: `${cat.color}1a` }}>
                      <span>{cat.icon}</span>
                    </div>
                    <button className="tx-body" onClick={() => onEdit(e)}>
                      <div className="tx-line1">
                        <span className="tx-cat">{cat.label}</span>
                        <span className="tx-amount">{formatMoney(e.amount)}</span>
                      </div>
                      <div className="tx-line2">
                        <span className="tx-remarks">
                          {e.remarks || <em className="muted">No remarks</em>}
                        </span>
                        <span className="tx-pay">{pay?.label}</span>
                      </div>
                    </button>
                    <button
                      className="icon-btn sm tx-del"
                      onClick={() => onDelete(e)}
                      aria-label="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </section>
  )
}
