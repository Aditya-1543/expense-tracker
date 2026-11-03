// Data retention policy for Paisa Tracker.
//
// Rule: keep only the most recent 6 months of expenses (the current calendar
// month plus the previous 5). Anything in an older month is pruned.
//
// "Month" is derived from each expense's local "YYYY-MM-DD" date string via
// monthKey(), so this stays consistent with the IST-only date handling used
// everywhere else. The cutoff is computed from the real current date, NOT from
// whatever month the user is viewing.
//
// This lives in its own file so the policy is easy to find and tune: change
// MONTHS_TO_KEEP and nothing else needs to move.

import { monthKey } from './format'

export const MONTHS_TO_KEEP = 6

// The oldest "YYYY-MM" month we are allowed to keep, relative to `from`
// (defaults to today). With MONTHS_TO_KEEP = 6 and today in Nov 2026, this
// returns "2026-06" (Jun), so Jun–Nov are kept and May and earlier are pruned.
export function cutoffMonthKey(from = new Date()) {
  const d = new Date(from.getFullYear(), from.getMonth() - (MONTHS_TO_KEEP - 1), 1)
  return monthKey(d)
}

// Given a list of expenses, return only those within the retention window.
// Pure function — does not touch storage. Comparing "YYYY-MM" strings works
// because that format is lexicographically ordered.
export function pruneExpenses(expenses, from = new Date()) {
  const cutoff = cutoffMonthKey(from)
  return expenses.filter((e) => monthKey(e.date) >= cutoff)
}

// How many of the given expenses would be removed (for logging / messaging).
export function countPrunable(expenses, from = new Date()) {
  const cutoff = cutoffMonthKey(from)
  return expenses.reduce((n, e) => (monthKey(e.date) < cutoff ? n + 1 : n), 0)
}
