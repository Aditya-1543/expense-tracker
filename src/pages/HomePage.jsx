import { useMemo, useState } from 'react'
import { monthKey, todayInput, daysInMonth, prevMonthKey } from '../lib/format'
import MonthSummary from '../components/MonthSummary'
import QuickStats from '../components/QuickStats'
import CategoryBreakdown from '../components/CategoryBreakdown'
import FilterBar from '../components/FilterBar'
import ExpenseList from '../components/ExpenseList'

function thisMonthKey() {
  return monthKey(new Date())
}

// Home: monthly summary, quick stats, category breakdown, transaction list.
export default function HomePage({
  expenses,
  months,
  categories,
  lookup,
  activeMonth,
  onChangeMonth,
  onEdit,
  onDelete,
}) {
  const [query, setQuery] = useState('')
  const [catFilter, setCatFilter] = useState('all')

  const monthExpenses = useMemo(
    () => expenses.filter((e) => monthKey(e.date) === activeMonth),
    [expenses, activeMonth],
  )

  const total = useMemo(
    () => monthExpenses.reduce((s, e) => s + e.amount, 0),
    [monthExpenses],
  )

  const byCategory = useMemo(() => {
    const map = new Map()
    for (const e of monthExpenses) {
      map.set(e.category, (map.get(e.category) || 0) + e.amount)
    }
    return [...map.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [monthExpenses])

  const usedCategories = useMemo(
    () => new Set(monthExpenses.map((e) => e.category)),
    [monthExpenses],
  )

  const stats = useMemo(() => {
    const now = new Date()
    const isCurrentMonth = activeMonth === thisMonthKey()
    const divisor = isCurrentMonth ? now.getDate() : daysInMonth(activeMonth)
    const dailyAvg = divisor > 0 ? total / divisor : 0

    const today = todayInput()
    const todayTotal = monthExpenses
      .filter((e) => e.date === today)
      .reduce((s, e) => s + e.amount, 0)

    const prevKey = prevMonthKey(activeMonth)
    const prevTotal = expenses
      .filter((e) => monthKey(e.date) === prevKey)
      .reduce((s, e) => s + e.amount, 0)
    let deltaPct = null
    if (prevTotal > 0) deltaPct = Math.round(((total - prevTotal) / prevTotal) * 100)

    return { dailyAvg, todayTotal: isCurrentMonth ? todayTotal : 0, deltaPct }
  }, [activeMonth, total, monthExpenses, expenses])

  const visibleExpenses = useMemo(() => {
    const q = query.trim().toLowerCase()
    return monthExpenses.filter((e) => {
      if (catFilter !== 'all' && e.category !== catFilter) return false
      if (q && !(e.remarks || '').toLowerCase().includes(q)) return false
      return true
    })
  }, [monthExpenses, query, catFilter])

  return (
    <>
      <MonthSummary
        months={months}
        activeMonth={activeMonth}
        onChangeMonth={onChangeMonth}
        total={total}
        count={monthExpenses.length}
      />

      <QuickStats
        dailyAvg={stats.dailyAvg}
        todayTotal={stats.todayTotal}
        deltaPct={stats.deltaPct}
      />

      <CategoryBreakdown byCategory={byCategory} total={total} lookup={lookup} />

      {monthExpenses.length > 0 && (
        <FilterBar
          query={query}
          onQuery={setQuery}
          activeCat={catFilter}
          onCat={setCatFilter}
          usedCategories={usedCategories}
          categories={categories}
        />
      )}

      <ExpenseList
        expenses={visibleExpenses}
        totalCount={monthExpenses.length}
        lookup={lookup}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  )
}
