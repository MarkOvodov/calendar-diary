import { useState } from "react"
import { createTag } from "../api.js"

export default function TagAutocomplete({ allTags, tagIds, onAdd, onRemove }) {
  const [query, setQuery]   = useState("")
  const [open, setOpen]     = useState(false)

  const activeTags = allTags.filter(t => tagIds.includes(t.id))
  const filtered   = allTags.filter(t =>
    t.tag_title.toLowerCase().includes(query.toLowerCase())
  )
  const showCreate = query.trim() && !allTags.some(t => t.tag_title.toLowerCase() === query.trim().toLowerCase())

  async function handleCreate() {
    const res = await createTag({ tag_title: query.trim() })
    if (res?.id) {
      onAdd(res.id)
      setQuery("")
      setOpen(false)
    }
  }

  function pick(id) {
    onAdd(id)
    setQuery("")
    setOpen(false)
  }

  return (
    <div>
      <div style={{ marginTop: 4 }}>
        {activeTags.map(t => (
          <span key={t.id} className="tag-pill clickable">
            {t.tag_title}
            <span className="rm" onClick={() => onRemove(t.id)}>✕</span>
          </span>
        ))}
        <button className="add-tag" onClick={() => setOpen(!open)}>+ тег</button>
      </div>

      {open && (
        <div onClick={e => e.stopPropagation()}>
          <input
            className="tag-search"
            placeholder="Поиск или новый тег..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Escape" && setOpen(false)}
            autoFocus
          />
          {(filtered.length > 0 || showCreate) && (
            <div className="tag-dropdown">
              {filtered.map(t => {
                const active = tagIds.includes(t.id)
                return (
                  <div key={t.id} className={`tag-option${active ? " disabled" : ""}`} onClick={() => !active && pick(t.id)}>
                    <span>{t.tag_title}</span>
                    <span className="tag-option-hint">{active ? "уже добавлен" : "+ добавить"}</span>
                  </div>
                )
              })}
              {showCreate && (
                <div className="tag-option" style={{ color: "var(--ta)", fontStyle: "italic" }} onClick={handleCreate}>
                  <span>создать «{query.trim()}»</span>
                  <span className="tag-option-hint">+ новый тег</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
