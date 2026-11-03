import { useEffect, useState } from 'react'
import { PAYMENT_METHODS, DEFAULT_PAYMENT } from '../constants'
import { todayInput } from '../lib/format'

// Modal form to add or edit an expense.
export default function ExpenseForm({ initial, categories, onSave, onClose }) {
  const editing = Boolean(initial)
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount) : '')
  const [category, setCategory] = useState(initial?.category || categories[0]?.id || 'other')
  const [payment, setPayment] = useState(initial?.payment || DEFAULT_PAYMENT)
  const [date, setDate] = useState(initial?.date || todayInput())
  const [remarks, setRemarks] = useState(initial?.remarks || '')
  const [error, setError] = useState('')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  function submit(e) {
    e.preventDefault()
    const value = Number(amount)
    if (!value || value <= 0) {
      setError('Enter an amount greater than 0')
      return
    }
    onSave({ amount: value, category, payment, date, remarks })
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-head">
          <h2>{editing ? 'Edit expense' : 'Add expense'}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="form">
          <label className="field amount-field">
            <span>Amount</span>
            <div className="amount-input">
              <span className="rupee">₹</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                autoFocus={!editing}
                placeholder="0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setError('')
                }}
              />
            </div>
          </label>

          <div className="field">
            <span>Category</span>
            <div className="chip-grid">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  className={`chip ${category === c.id ? 'chip-active' : ''}`}
                  style={category === c.id ? { borderColor: c.color, color: c.color } : undefined}
                  onClick={() => setCategory(c.id)}
                >
                  <span className="chip-icon">{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span>Payment method</span>
            <div className="seg">
              {PAYMENT_METHODS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  className={`seg-btn ${payment === p.id ? 'seg-active' : ''}`}
                  onClick={() => setPayment(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <label className="field">
            <span>Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>

          <label className="field">
            <span>Remarks</span>
            <input
              type="text"
              placeholder="What was this for? e.g. Lunch with team"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              maxLength={140}
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn-primary btn-lg">
            {editing ? 'Save changes' : 'Add expense'}
          </button>
        </form>
      </div>
    </div>
  )
}
