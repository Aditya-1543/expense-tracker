// Search box + horizontally scrollable category filter chips.
export default function FilterBar({ query, onQuery, activeCat, onCat, usedCategories, categories }) {
  const cats = categories.filter((c) => usedCategories.has(c.id))

  return (
    <div className="filterbar">
      <div className="search">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search remarks..."
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
        {query && (
          <button className="search-clear" onClick={() => onQuery('')} aria-label="Clear">
            ✕
          </button>
        )}
      </div>

      {cats.length > 0 && (
        <div className="filter-chips">
          <button
            className={`fchip ${activeCat === 'all' ? 'fchip-active' : ''}`}
            onClick={() => onCat('all')}
          >
            All
          </button>
          {cats.map((c) => (
            <button
              key={c.id}
              className={`fchip ${activeCat === c.id ? 'fchip-active' : ''}`}
              style={activeCat === c.id ? { background: c.color, borderColor: c.color } : undefined}
              onClick={() => onCat(c.id)}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
