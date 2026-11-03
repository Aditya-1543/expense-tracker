import { useMemo, useState } from 'react'
import {
  monthKey,
  monthLabel,
  monthShort,
  daysInMonth,
  dayOfMonth,
  formatMoney,
  formatMoneyCompact,
  formatFullDate,
  todayInput,
} from '../lib/format'
import { PAYMENT_MAP } from '../constants'
import BarChart from '../components/BarChart'
import LineChart from '../components/LineChart'

// Analytics: daywise chart (category filter), monthly trend, insights, day search.
export default function AnalyticsPage({ expenses, months, categories, lookup, activeMonth, onChangeMonth }) {
  const [dayCatFilter, setDayCatFilter] = useState('all')
  const [searchDay, setSearchDay] = useState('')

  const monthExpenses = useMemo(
    () => expenses.filter((e) => monthKey(e.date) === activeMonth),
    [expenses, activeMonth],
  )

  const total = useMemo(() => monthExpenses.reduce((s, e) => s + e.amount, 0), [monthExpenses])

  // Categories used this month (for the day-chart filter).
  const usedCategories = useMemo(() => {
    const ids = new Set(monthExpenses.map((e) => e.category))
    return categories.filter((c) => ids.has(c.id))
  }, [monthExpenses, categories])

  // Daywise points for the active month, optionally filtered by category.
  const dayPoints = useMemo(() => {
    const n = daysInMonth(activeMonth)
    const totals = new Array(n + 1).fill(0)
    for (const e of monthExpenses) {
      if (dayCatFilter !== 'all' && e.category !== dayCatFilter) continue
      totals[dayOfMonth(e.date)] += e.amount
    }
    const monthName = monthShort(activeMonth)
    return Array.from({ length: n }, (_, i) => {
      const day = i + 1
      return {
        key: day,
        label: String(day),
        sublabel: `${day} ${monthName}`,
        value: totals[day],
      }
    })
  }, [monthExpenses, activeMonth, dayCatFilter])

  // Month-wise trend: last up to 6 months (including empty ones).
  const monthBars = useMemo(() => {
    const now = new Date()
    const base = activeMonth.split('-').map(Number)
    const anchor = new Date(base[0], base[1] - 1, 1)
    const totalsByMonth = new Map()
    for (const e of expenses) {
      const k = monthKey(e.date)
      totalsByMonth.set(k, (totalsByMonth.get(k) || 0) + e.amount)
    }
    const bars = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1)
      const k = monthKey(d)
      bars.push({
        key: k,
        label: d.toLocaleDateString('en-IN', { month: 'short' }),
        sublabel: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        value: totalsByMonth.get(k) || 0,
        highlight: k === activeMonth,
      })
    }
    return bars
  }, [expenses, activeMonth])

  // Insights for the active month.
  const insights = useMemo(() => {
    if (monthExpenses.length === 0) return null
    const n = daysInMonth(activeMonth)
    const isCurrent = activeMonth === monthKey(new Date())
    const divisor = isCurrent ? new Date().getDate() : n

    // biggest single expense
    const biggest = monthExpenses.reduce((a, b) => (b.amount > a.amount ? b : a))

    // busiest day (highest total)
    const dayTotals = new Map()
    for (const e of monthExpenses) dayTotals.set(e.date, (dayTotals.get(e.date) || 0) + e.amount)
    let topDay = null
    for (const [date, amt] of dayTotals) {
      if (!topDay || amt > topDay.amount) topDay = { date, amount: amt }
    }

    // top category
    const catTotals = new Map()
    for (const e of monthExpenses) catTotals.set(e.category, (catTotals.get(e.category) || 0) + e.amount)
    let topCat = null
    for (const [id, amt] of catTotals) {
      if (!topCat || amt > topCat.amount) topCat = { id, amount: amt }
    }

    // payment split
    const payTotals = new Map()
    for (const e of monthExpenses) payTotals.set(e.payment, (payTotals.get(e.payment) || 0) + e.amount)
    const paySplit = [...payTotals.entries()]
      .map(([id, amount]) => ({ id, amount }))
      .sort((a, b) => b.amount - a.amount)

    return {
      dailyAvg: divisor > 0 ? total / divisor : 0,
      perExpenseAvg: total / monthExpenses.length,
      biggest,
      topDay,
      topCat,
      paySplit,
      activeDays: dayTotals.size,
    }
  }, [monthExpenses, activeMonth, total])

  // Day search results.
  const dayResults = useMemo(() => {
    if (!searchDay) return null
    const items = expenses
      .filter((e) => e.date === searchDay)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    const sum = items.reduce((s, e) => s + e.amount, 0)
    return { items, sum }
  }, [expenses, searchDay])

  const dayChartColor = dayCatFilter === 'all' ? '#5b4bf0' : lookup(dayCatFilter).color

  return (
    <>
      <div className="page-head">
        <h2 className="page-title">Analytics</h2>
        {months.length > 0 && (
          <select
            className="month-select dark"
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

      {/* Daywise chart */}
      <section className="panel">
        <div className="panel-head">
          <h3 className="panel-title">Daily spend</h3>
          <span className="pill-muted">{monthLabel(activeMonth)}</span>
        </div>

        <div className="filter-chips chart-filter">
          <button
            className={`fchip ${dayCatFilter === 'all' ? 'fchip-active' : ''}`}
            onClick={() => setDayCatFilter('all')}
          >
            All
          </button>
          {usedCategories.map((c) => (
            <button
              key={c.id}
              className={`fchip ${dayCatFilter === c.id ? 'fchip-active' : ''}`}
              style={dayCatFilter === c.id ? { background: c.color, borderColor: c.color } : undefined}
              onClick={() => setDayCatFilter(c.id)}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        <LineChart points={dayPoints} color={dayChartColor} emptyText="No spending this month yet" />
        <p className="chart-hint">Tap or hover the graph to see each day's total</p>
      </section>

      {/* Monthly trend */}
      <section className="panel">
        <div className="panel-head">
          <h3 className="panel-title">Monthly trend</h3>
          <span className="pill-muted">Last 6 months</span>
        </div>
        <BarChart bars={monthBars} color="var(--primary-2)" emptyText="No data yet" />
      </section>

      {/* Insights */}
      {insights && (
        <section className="panel">
          <div className="panel-head">
            <h3 className="panel-title">Insights</h3>
          </div>
          <div className="insight-grid">
            <div className="insight">
              <span className="insight-label">Avg / day</span>
              <span className="insight-value">{formatMoneyCompact(insights.dailyAvg)}</span>
            </div>
            <div className="insight">
              <span className="insight-label">Avg / expense</span>
              <span className="insight-value">{formatMoneyCompact(insights.perExpenseAvg)}</span>
            </div>
            <div className="insight">
              <span className="insight-label">Active days</span>
              <span className="insight-value">{insights.activeDays}</span>
            </div>
            <div className="insight">
              <span className="insight-label">Top category</span>
              <span className="insight-value small">
                {lookup(insights.topCat.id).icon} {lookup(insights.topCat.id).label}
              </span>
            </div>
          </div>

          <div className="insight-rows">
            <div className="insight-row">
              <span className="ir-label">💥 Biggest expense</span>
              <span className="ir-value">
                {formatMoney(insights.biggest.amount)}
                <span className="ir-sub">
                  {lookup(insights.biggest.category).label}
                  {insights.biggest.remarks ? ` · ${insights.biggest.remarks}` : ''}
                </span>
              </span>
            </div>
            {insights.topDay && (
              <div className="insight-row">
                <span className="ir-label">📅 Highest-spend day</span>
                <span className="ir-value">
                  {formatMoney(insights.topDay.amount)}
                  <span className="ir-sub">{formatFullDate(insights.topDay.date)}</span>
                </span>
              </div>
            )}
          </div>

          <div className="pay-split">
            <span className="ps-title">Payment methods</span>
            {insights.paySplit.map((p) => {
              const pct = total > 0 ? Math.round((p.amount / total) * 100) : 0
              return (
                <div className="ps-row" key={p.id}>
                  <span className="ps-name">{PAYMENT_MAP[p.id]?.label || p.id}</span>
                  <div className="ps-track">
                    <div className="ps-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="ps-amt">{formatMoneyCompact(p.amount)}</span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Day search */}
      <section className="panel">
        <div className="panel-head">
          <h3 className="panel-title">Find a day</h3>
        </div>
        <input
          type="date"
          className="day-search-input"
          value={searchDay}
          max={todayInput()}
          onChange={(e) => setSearchDay(e.target.value)}
        />
        {dayResults && (
          <div className="day-results">
            <div className="day-results-head">
              <span>{formatFullDate(searchDay)}</span>
              <span className="day-results-total">{formatMoney(dayResults.sum)}</span>
            </div>
            {dayResults.items.length === 0 ? (
              <p className="day-empty">No expenses on this day.</p>
            ) : (
              dayResults.items.map((e) => {
                const cat = lookup(e.category)
                return (
                  <div className="tx" key={e.id}>
                    <div className="tx-icon" style={{ background: `${cat.color}1a` }}>
                      <span>{cat.icon}</span>
                    </div>
                    <div className="tx-body">
                      <div className="tx-line1">
                        <span className="tx-cat">{cat.label}</span>
                        <span className="tx-amount">{formatMoney(e.amount)}</span>
                      </div>
                      <div className="tx-line2">
                        <span className="tx-remarks">
                          {e.remarks || <em className="muted">No remarks</em>}
                        </span>
                        <span className="tx-pay">{PAYMENT_MAP[e.payment]?.label}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </section>
    </>
  )
}
