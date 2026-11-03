import { useEffect, useState } from 'react'
import { COLOR_PALETTE, ICON_CHOICES } from '../constants'

// Bottom-sheet to add or edit a category.
export default function CategoryEditor({ initial, onSave, onClose }) {
  const editing = Boolean(initial)
  const [label, setLabel] = useState(initial?.label || '')
  const [icon, setIcon] = useState(initial?.icon || '📦')
  const [color, setColor] = useState(initial?.color || COLOR_PALETTE[0])
  const [error, setError] = useState('')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  function submit(e) {
    e.preventDefault()
    if (!label.trim()) {
      setError('Give the category a name')
      return
    }
    onSave({ label, icon, color })
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-head">
          <h2>{editing ? 'Edit category' : 'New category'}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="form">
          <div className="cat-preview">
            <div className="cat-preview-icon" style={{ background: `${color}1f`, color }}>
              {icon}
            </div>
            <div className="cat-preview-text">
              <span className="cat-preview-name">{label || 'Category name'}</span>
              <span className="cat-preview-sub" style={{ color }}>
                {color}
              </span>
            </div>
          </div>

          <label className="field">
            <span>Name</span>
            <input
              type="text"
              placeholder="e.g. Subscriptions"
              value={label}
              autoFocus={!editing}
              maxLength={24}
              onChange={(e) => {
                setLabel(e.target.value)
                setError('')
              }}
            />
          </label>

          <div className="field">
            <span>Icon</span>
            <div className="icon-picker">
              {ICON_CHOICES.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  className={`icon-opt ${icon === ic ? 'icon-opt-active' : ''}`}
                  onClick={() => setIcon(ic)}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span>Color</span>
            <div className="color-picker">
              {COLOR_PALETTE.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`color-opt ${color === c ? 'color-opt-active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn-primary btn-lg">
            {editing ? 'Save changes' : 'Add category'}
          </button>
        </form>
      </div>
    </div>
  )
}
