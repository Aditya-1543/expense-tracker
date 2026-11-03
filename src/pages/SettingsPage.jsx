import { useState } from 'react'
import * as store from '../lib/store'
import CategoryEditor from '../components/CategoryEditor'
import ConfirmDialog from '../components/ConfirmDialog'

// Settings: manage categories, data tools, app info.
export default function SettingsPage({
  categories,
  expenses,
  addCategory,
  updateCategory,
  removeCategory,
  resetCategories,
  onDataChanged,
  showToast,
}) {
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState(null)

  function openAdd() {
    setEditing(null)
    setEditorOpen(true)
  }

  function openEdit(cat) {
    setEditing(cat)
    setEditorOpen(true)
  }

  function handleSave(data) {
    if (editing) {
      updateCategory(editing.id, data)
      showToast('Category updated')
    } else {
      addCategory(data)
      showToast('Category added')
    }
    setEditorOpen(false)
    setEditing(null)
  }

  function requestDelete(cat) {
    if (categories.length <= 1) {
      showToast('Keep at least one category')
      return
    }
    const inUse = store.countByCategory(cat.id)
    setConfirm({
      cat,
      inUse,
      title: `Delete "${cat.label}"?`,
      message:
        inUse > 0
          ? `${inUse} expense${inUse === 1 ? '' : 's'} use this category. They'll be moved to "Other" (or the first remaining category).`
          : "This can't be undone.",
    })
  }

  function confirmDelete() {
    const { cat } = confirm
    const fallback = categories.find((c) => c.id === 'other' && c.id !== cat.id) ||
      categories.find((c) => c.id !== cat.id)
    if (fallback) store.reassignCategory(cat.id, fallback.id)
    removeCategory(cat.id)
    onDataChanged()
    setConfirm(null)
    showToast('Category deleted')
  }

  function exportBackup() {
    const json = store.exportJSON()
    download(json, 'application/json', `paisa-tracker-backup-${today()}.json`)
    showToast('Backup downloaded')
  }

  function exportCsv() {
    const csv = store.exportCSV()
    download(csv, 'text/csv', `paisa-tracker-${today()}.csv`)
    showToast('CSV downloaded')
  }

  function importBackup(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const added = store.importJSON(String(reader.result))
        onDataChanged()
        showToast(added > 0 ? `Imported ${added} expense${added === 1 ? '' : 's'}` : 'Nothing new to import')
      } catch (err) {
        showToast(err.message || 'Import failed')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function confirmClearAll() {
    setConfirm({
      clearAll: true,
      title: 'Delete all expenses?',
      message: `This permanently removes all ${expenses.length} expenses. Export a backup first if unsure.`,
    })
  }

  function doClearAll() {
    store.clearAll()
    onDataChanged()
    setConfirm(null)
    showToast('All expenses cleared')
  }

  function confirmReset() {
    setConfirm({
      resetCats: true,
      title: 'Reset categories?',
      message: 'Restores the default category list. Your expenses are not affected.',
      confirmLabel: 'Reset',
    })
  }

  return (
    <>
      <div className="page-head">
        <h2 className="page-title">Settings</h2>
      </div>

      {/* Categories */}
      <section className="panel">
        <div className="panel-head">
          <h3 className="panel-title">Categories</h3>
          <button className="btn-chip" onClick={openAdd}>
            + Add
          </button>
        </div>
        <div className="cat-list">
          {categories.map((c) => {
            const count = store.countByCategory(c.id)
            return (
              <div className="cat-item" key={c.id}>
                <div className="cat-badge" style={{ background: `${c.color}1f`, color: c.color }}>
                  {c.icon}
                </div>
                <div className="cat-info">
                  <span className="cat-name">{c.label}</span>
                  <span className="cat-meta">
                    {count} expense{count === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="cat-actions">
                  <button className="icon-btn sm" onClick={() => openEdit(c)} aria-label="Edit">
                    ✏️
                  </button>
                  <button className="icon-btn sm" onClick={() => requestDelete(c)} aria-label="Delete">
                    🗑️
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        <button className="btn-link" onClick={confirmReset}>
          Reset to default categories
        </button>
      </section>

      {/* Data */}
      <section className="panel">
        <div className="panel-head">
          <h3 className="panel-title">Your data</h3>
          <span className="pill-muted">{expenses.length} expenses</span>
        </div>
        <p className="settings-note">
          Your data is stored on this device. Back it up regularly, or wait for cloud sync.
        </p>
        <div className="settings-actions">
          <button className="list-action" onClick={exportBackup}>
            <span className="la-icon">⬇️</span>
            <span className="la-text">
              <span className="la-title">Export backup (JSON)</span>
              <span className="la-sub">Full backup you can re-import</span>
            </span>
          </button>
          <label className="list-action">
            <span className="la-icon">⬆️</span>
            <span className="la-text">
              <span className="la-title">Import backup</span>
              <span className="la-sub">Restore from a JSON backup</span>
            </span>
            <input type="file" accept="application/json,.json" onChange={importBackup} hidden />
          </label>
          <button className="list-action" onClick={exportCsv}>
            <span className="la-icon">📄</span>
            <span className="la-text">
              <span className="la-title">Export CSV</span>
              <span className="la-sub">Open in Excel / Sheets</span>
            </span>
          </button>
          <button className="list-action danger" onClick={confirmClearAll}>
            <span className="la-icon">🗑️</span>
            <span className="la-text">
              <span className="la-title">Clear all expenses</span>
              <span className="la-sub">Permanently delete everything</span>
            </span>
          </button>
        </div>
      </section>

      {/* About */}
      <section className="panel about">
        <div className="about-brand">
          <span className="brand-mark sm">₹</span>
          <div>
            <span className="about-name">Paisa Tracker</span>
            <span className="about-ver">Version 0.2 · Local mode</span>
          </div>
        </div>
        <p className="about-note">
          Cloud sync across phones is coming next. Until then your data lives on this device —
          use Export to move it.
        </p>
      </section>

      {editorOpen && (
        <CategoryEditor
          initial={editing}
          onSave={handleSave}
          onClose={() => {
            setEditorOpen(false)
            setEditing(null)
          }}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel || 'Delete'}
          onConfirm={
            confirm.clearAll ? doClearAll : confirm.resetCats ? handleReset : confirmDelete
          }
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  )

  function handleReset() {
    resetCategories()
    onDataChanged()
    setConfirm(null)
    showToast('Categories reset')
  }
}

function download(content, type, filename) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}
