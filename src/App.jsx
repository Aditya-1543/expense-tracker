import { useMemo, useState } from 'react'
import { useExpenses } from './hooks/useExpenses'
import { useCategories } from './hooks/useCategories'
import { monthKey } from './lib/format'
import HomePage from './pages/HomePage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import ExpenseForm from './components/ExpenseForm'
import ConfirmDialog from './components/ConfirmDialog'
import BottomNav from './components/BottomNav'

function thisMonthKey() {
  return monthKey(new Date())
}

export default function App() {
  const {
    expenses,
    months,
    addExpense,
    updateExpense,
    removeExpense,
    refresh: refreshExpenses,
  } = useExpenses()

  const {
    categories,
    lookup,
    addCategory,
    updateCategory,
    removeCategory,
    resetCategories,
  } = useCategories()

  const [page, setPage] = useState('home')
  const [activeMonth, setActiveMonth] = useState(thisMonthKey())
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [toast, setToast] = useState('')

  // Month options: everything with data + current + active.
  const monthOptions = useMemo(() => {
    const set = new Set(months)
    set.add(thisMonthKey())
    if (activeMonth) set.add(activeMonth)
    return [...set].sort().reverse()
  }, [months, activeMonth])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }

  function openAdd() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(expense) {
    setEditing(expense)
    setFormOpen(true)
  }

  function handleSave(data) {
    if (editing) {
      updateExpense(editing.id, data)
    } else {
      addExpense(data)
      setActiveMonth(monthKey(data.date))
      setPage('home')
    }
    setFormOpen(false)
    setEditing(null)
  }

  function confirmDelete() {
    if (pendingDelete) {
      removeExpense(pendingDelete.id)
      setPendingDelete(null)
      showToast('Expense deleted')
    }
  }

  const headerSub =
    page === 'home' ? 'Know where your money goes' : page === 'analytics' ? 'Your spending, visualized' : 'Make it yours'

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">₹</span>
          <div>
            <h1>Paisa Tracker</h1>
            <p className="tagline">{headerSub}</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        {page === 'home' && (
          <HomePage
            expenses={expenses}
            months={monthOptions}
            categories={categories}
            lookup={lookup}
            activeMonth={activeMonth}
            onChangeMonth={setActiveMonth}
            onEdit={openEdit}
            onDelete={setPendingDelete}
          />
        )}

        {page === 'analytics' && (
          <AnalyticsPage
            expenses={expenses}
            months={monthOptions}
            categories={categories}
            lookup={lookup}
            activeMonth={activeMonth}
            onChangeMonth={setActiveMonth}
          />
        )}

        {page === 'settings' && (
          <SettingsPage
            categories={categories}
            expenses={expenses}
            addCategory={addCategory}
            updateCategory={updateCategory}
            removeCategory={removeCategory}
            resetCategories={resetCategories}
            onDataChanged={refreshExpenses}
            showToast={showToast}
          />
        )}
      </main>

      {page === 'home' && (
        <button className="fab" onClick={openAdd} aria-label="Add expense">
          <span className="fab-plus">+</span>
        </button>
      )}

      <BottomNav active={page} onChange={setPage} />

      {formOpen && (
        <ExpenseForm
          initial={editing}
          categories={categories}
          onSave={handleSave}
          onClose={() => {
            setFormOpen(false)
            setEditing(null)
          }}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this expense?"
          message="This can't be undone."
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
