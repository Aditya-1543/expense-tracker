// Data layer for Paisa Tracker.
//
// Stage 1: everything lives in the browser (localStorage).
// Stage 2: this same interface can be re-implemented against Supabase
// without touching any UI component. Keep the exported function
// signatures stable (getAll / add / update / remove) when you swap.

import { pruneExpenses } from './retention'

const KEY = 'paisa-tracker/expenses/v1'

// Local (IST) "YYYY-MM-DD". Avoids toISOString(), which is UTC and can land on
// the wrong calendar day near midnight.
function localToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

// Enforce the 6-month retention policy: drop expenses older than the window
// and persist the result. Returns the number of expenses removed. Safe to call
// often (on load and after each add) — it only writes when something changed.
export function enforceRetention() {
  const list = read()
  const kept = pruneExpenses(list)
  const removed = list.length - kept.length
  if (removed > 0) write(kept)
  return removed
}

function write(list) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

function newId() {
  if (crypto?.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

// An expense:
// { id, amount(Number), category(id), payment(id), date('YYYY-MM-DD'),
//   remarks(String), createdAt(ISO) }

export function getAll() {
  return read().sort((a, b) => {
    // newest date first, then newest created first
    if (a.date !== b.date) return a.date < b.date ? 1 : -1
    return a.createdAt < b.createdAt ? 1 : -1
  })
}

export function add(expense) {
  const list = read()
  const record = {
    id: newId(),
    amount: Number(expense.amount) || 0,
    category: expense.category,
    payment: expense.payment,
    date: expense.date,
    remarks: (expense.remarks || '').trim(),
    createdAt: new Date().toISOString(),
  }
  list.push(record)
  write(list)
  enforceRetention()
  return record
}

export function update(id, patch) {
  const list = read()
  const idx = list.findIndex((e) => e.id === id)
  if (idx === -1) return null
  list[idx] = {
    ...list[idx],
    ...patch,
    amount: patch.amount !== undefined ? Number(patch.amount) || 0 : list[idx].amount,
    remarks: patch.remarks !== undefined ? (patch.remarks || '').trim() : list[idx].remarks,
  }
  write(list)
  return list[idx]
}

export function remove(id) {
  write(read().filter((e) => e.id !== id))
}

// How many expenses use a given category id.
export function countByCategory(categoryId) {
  return read().filter((e) => e.category === categoryId).length
}

// Reassign every expense from one category to another (used when deleting).
export function reassignCategory(fromId, toId) {
  const list = read()
  let changed = 0
  for (const e of list) {
    if (e.category === fromId) {
      e.category = toId
      changed++
    }
  }
  if (changed) write(list)
  return changed
}

// Remove ALL expenses (used by Settings "clear data").
export function clearAll() {
  write([])
}

// Export / import for manual backup (useful before cloud sync exists).
export function exportJSON() {
  return JSON.stringify(read(), null, 2)
}

export function exportCSV() {
  const list = getAll()
  const header = ['Date', 'Amount', 'Category', 'Payment', 'Remarks']
  const rows = list.map((e) => [
    e.date,
    e.amount,
    e.category,
    e.payment,
    `"${(e.remarks || '').replace(/"/g, '""')}"`,
  ])
  return [header, ...rows].map((r) => r.join(',')).join('\n')
}

// Restore from a previously exported JSON backup.
// Merges by id (existing ids are kept, new ids appended).
export function importJSON(json) {
  let incoming
  try {
    incoming = JSON.parse(json)
  } catch {
    throw new Error('That file is not valid JSON.')
  }
  if (!Array.isArray(incoming)) {
    throw new Error('That backup file is not in the expected format.')
  }
  const existing = read()
  const seen = new Set(existing.map((e) => e.id))
  let added = 0
  for (const e of incoming) {
    if (!e || typeof e !== 'object') continue
    const id = e.id || newId()
    if (seen.has(id)) continue
    existing.push({
      id,
      amount: Number(e.amount) || 0,
      category: e.category || 'other',
      payment: e.payment || 'upi',
      date: e.date || localToday(),
      remarks: (e.remarks || '').trim(),
      createdAt: e.createdAt || new Date().toISOString(),
    })
    seen.add(id)
    added++
  }
  write(existing)
  enforceRetention()
  return added
}
