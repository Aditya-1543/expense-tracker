// INR + date formatting helpers.
//
// This app is used in India (IST) only. Expense dates are stored as plain
// "YYYY-MM-DD" strings representing a LOCAL calendar day.
//
// Rule we follow everywhere: NEVER pass a date-only string to `new Date(...)`.
// The JS Date constructor parses "YYYY-MM-DD" as UTC midnight, which shifts the
// calendar day in any timezone behind UTC and caused the "3 Oct shown under
// November" bug. Instead we split the parts and build a LOCAL Date.

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

const inrCompact = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function formatMoney(amount) {
  return inr.format(Number(amount) || 0)
}

export function formatMoneyCompact(amount) {
  return inrCompact.format(Number(amount) || 0)
}

// Parse a "YYYY-MM-DD" (or "YYYY-MM") string into a LOCAL Date at midnight.
// Accepts a Date too (returned as-is).
export function parseLocalDate(value) {
  if (value instanceof Date) return value
  const [y, m, d] = String(value).split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export function formatDate(iso) {
  return parseLocalDate(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDayHeader(iso) {
  const d = parseLocalDate(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  if (sameDay(d, today)) return 'Today'
  if (sameDay(d, yesterday)) return 'Yesterday'
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

// Returns "YYYY-MM" for a given value.
// For "YYYY-MM-DD" strings we slice directly (no reparsing) so the calendar
// day/month is taken exactly as stored. For a Date, we read local parts.
export function monthKey(value) {
  if (typeof value === 'string') {
    return value.slice(0, 7)
  }
  const d = value instanceof Date ? value : new Date(value)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function monthLabel(key) {
  const [year, month] = key.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })
}

// Short month name ("Nov") for a "YYYY-MM" key.
export function monthShort(key) {
  const [year, month] = key.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-IN', { month: 'short' })
}

// Today's date as "YYYY-MM-DD" in local (IST) time, for date inputs.
export function todayInput() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

// Number of days in a given "YYYY-MM" month.
export function daysInMonth(key) {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

// Day-of-month number from a "YYYY-MM-DD" string.
export function dayOfMonth(iso) {
  return Number(String(iso).slice(8, 10))
}

// Previous month key relative to a "YYYY-MM".
export function prevMonthKey(key) {
  const [y, m] = key.split('-').map(Number)
  return monthKey(new Date(y, m - 2, 1))
}

// Full readable date, e.g. "Mon, 3 Nov 2026".
export function formatFullDate(iso) {
  return parseLocalDate(iso).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
