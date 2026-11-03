import { useCallback, useEffect, useMemo, useState } from 'react'
import * as store from '../lib/store'
import { monthKey } from '../lib/format'

// Central state for all expenses + derived summaries.
export function useExpenses() {
  const [expenses, setExpenses] = useState([])

  const refresh = useCallback(() => {
    setExpenses(store.getAll())
  }, [])

  // On mount: enforce the 6-month retention policy once, then load.
  useEffect(() => {
    store.enforceRetention()
    refresh()
  }, [refresh])

  const addExpense = useCallback(
    (data) => {
      store.add(data)
      refresh()
    },
    [refresh],
  )

  const updateExpense = useCallback(
    (id, patch) => {
      store.update(id, patch)
      refresh()
    },
    [refresh],
  )

  const removeExpense = useCallback(
    (id) => {
      store.remove(id)
      refresh()
    },
    [refresh],
  )

  // All month keys that have data, newest first.
  const months = useMemo(() => {
    const set = new Set(expenses.map((e) => monthKey(e.date)))
    return [...set].sort().reverse()
  }, [expenses])

  return {
    expenses,
    months,
    addExpense,
    updateExpense,
    removeExpense,
    refresh,
  }
}
