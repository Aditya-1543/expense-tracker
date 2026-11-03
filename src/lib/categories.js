// Category data layer. Categories are user-editable and stored in localStorage,
// seeded from DEFAULT_CATEGORIES on first run.
//
// Like store.js, this isolates persistence so Stage 2 (Supabase) only needs to
// re-implement these functions, not the UI.

import { DEFAULT_CATEGORIES } from '../constants'

const KEY = 'paisa-tracker/categories/v1'

function seedIfEmpty() {
  const raw = localStorage.getItem(KEY)
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(DEFAULT_CATEGORIES))
  }
}

function read() {
  seedIfEmpty()
  try {
    const data = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(data) && data.length ? data : [...DEFAULT_CATEGORIES]
  } catch {
    return [...DEFAULT_CATEGORIES]
  }
}

function write(list) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

function slugify(label) {
  return (
    label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `cat-${Date.now()}`
  )
}

export function getAll() {
  return read()
}

export function getMap() {
  return Object.fromEntries(read().map((c) => [c.id, c]))
}

export function add({ label, icon, color }) {
  const list = read()
  let id = slugify(label)
  // ensure unique id
  if (list.some((c) => c.id === id)) {
    id = `${id}-${Math.random().toString(16).slice(2, 6)}`
  }
  const record = { id, label: label.trim(), icon: icon || '📦', color: color || '#64748b' }
  list.push(record)
  write(list)
  return record
}

export function update(id, patch) {
  const list = read()
  const idx = list.findIndex((c) => c.id === id)
  if (idx === -1) return null
  list[idx] = {
    ...list[idx],
    ...patch,
    label: patch.label !== undefined ? patch.label.trim() : list[idx].label,
  }
  write(list)
  return list[idx]
}

export function remove(id) {
  write(read().filter((c) => c.id !== id))
}

export function resetDefaults() {
  write([...DEFAULT_CATEGORIES])
}
