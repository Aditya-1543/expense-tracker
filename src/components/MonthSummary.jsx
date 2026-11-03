import { formatMoney, monthLabel } from '../lib/format'

// Top card: month picker + total spent + count.
export default function MonthSummary({ months, activeMonth, onChangeMonth, total, count }) {
  return (
    <div className="summary-card">
      <div className="summary-top">
        <span className="summary-label">Total spent</span>
        {months.length > 0 && (
          <select
            className="month-select"
            value={activeMonth}
            onChange={(e) => onChangeMonth(e.target.value)}
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="summary-amount">{formatMoney(total)}</div>
      <div className="summary-sub">
        {count} {count === 1 ? 'expense' : 'expenses'} this month
      </div>
    </div>
  )
}
