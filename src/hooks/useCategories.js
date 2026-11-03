import { useCallback, useEffect, useMemo, useState } from 'react'
import * as cats from '../lib/categories'

// Central state for editable categories.
export function useCategories() {
  const [categories, setCategories] = useState([])

  const refresh = useCallback(() => {
    setCategories(cats.getAll())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories],
  )

  const addCategory = useCallback(
    (data) => {
      const rec = cats.add(data)
      refresh()
      return rec
    },
    [refresh],
  )

  const updateCategory = useCallback(
    (id, patch) => {
      cats.update(id, patch)
      refresh()
    },
    [refresh],
  )

  const removeCategory = useCallback(
    (id) => {
      cats.remove(id)
      refresh()
    },
    [refresh],
  )

  const resetCategories = useCallback(() => {
    cats.resetDefaults()
    refresh()
  }, [refresh])

  // Safe fallback lookup for any category id (including deleted ones).
  const lookup = useCallback(
    (id) => categoryMap[id] || { id, label: 'Unknown', icon: '❓', color: '#94a3b8' },
    [categoryMap],
  )

  return {
    categories,
    categoryMap,
    lookup,
    addCategory,
    updateCategory,
    removeCategory,
    resetCategories,
    refresh,
  }
}
