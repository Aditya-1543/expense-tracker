// Default seed data. Categories are editable at runtime (see lib/categories.js);
// these are only used to seed storage on first run.

export const DEFAULT_CATEGORIES = [
  { id: 'food', label: 'Food', icon: '🍽️', color: '#ef4444' },
  { id: 'groceries', label: 'Groceries', icon: '🛒', color: '#f97316' },
  { id: 'travel', label: 'Travel', icon: '🚗', color: '#0ea5e9' },
  { id: 'pooja', label: 'Pooja', icon: '🪔', color: '#eab308' },
  { id: 'bills', label: 'Bills', icon: '🧾', color: '#8b5cf6' },
  { id: 'rent', label: 'Rent', icon: '🏠', color: '#ec4899' },
  { id: 'utilities', label: 'Utilities', icon: '💡', color: '#14b8a6' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#6366f1' },
  { id: 'health', label: 'Health', icon: '💊', color: '#22c55e' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#d946ef' },
  { id: 'education', label: 'Education', icon: '📚', color: '#3b82f6' },
  { id: 'other', label: 'Other', icon: '📦', color: '#64748b' },
]

export const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI' },
  { id: 'cash', label: 'Cash' },
  { id: 'card', label: 'Card' },
  { id: 'bank', label: 'Bank Transfer' },
]

export const PAYMENT_MAP = Object.fromEntries(PAYMENT_METHODS.map((p) => [p.id, p]))

export const DEFAULT_PAYMENT = 'upi'

// A palette users can pick from when creating categories.
export const COLOR_PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#64748b', '#78716c',
]

// Common emoji users can pick as category icons.
export const ICON_CHOICES = [
  '🍽️', '🛒', '🚗', '🪔', '🧾', '🏠', '💡', '🎬', '💊', '🛍️', '📚', '📦',
  '☕', '🍔', '🍕', '🥦', '⛽', '🚕', '✈️', '🏥', '💳', '📱', '🎁', '👕',
  '🐾', '🎮', '💰', '🏋️', '✂️', '🧹', '🔧', '📺', '🎵', '🌐', '💧', '🔥',
]
