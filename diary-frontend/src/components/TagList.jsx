import { useState, useEffect } from "react"
import { getTags, deleteTag, createTag } from "../api.js"

export default function TagList() {
  const [tags, setTags] = useState([])
  const [newTag, setNewTag] = useState("")
  const [error, setError] = useState(null)

  function load() { getTags().then(setTags) }
  useEffect(() => { load() }, [])

  async function handleCreate() {
    if (!newTag.trim()) return
    const res = await createTag({ tag_title: newTag.trim() })
    if (res?.id) { setNewTag(""); setError(null); load() }
    else { setError("Ошибка или тег уже существует") }
  }

  async function handleDelete(id) {
    if (window.confirm("Удалить тег?")) {
      await deleteTag(id)
      load()
    }
  }

  return (
    <div className="page">
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Теги</h2>

      <div className="card" style={{ marginBottom: 16 }}>
        {tags.length === 0 && <div style={{ color: "var(--tm)", fontSize: 13 }}>Нет тегов</div>}
        {tags.map(tag => (
          <div key={tag.id} className="tag-row">
            <span className="tag-pill">{tag.tag_title}</span>
            <button className="btn danger" onClick={() => handleDelete(tag.id)}>Удалить</button>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="field-label" style={{ marginBottom: 8 }}>Новый тег</div>
        {error && <div style={{ color: "#993C1D", fontSize: 12, marginBottom: 8 }}>{error}</div>}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="field-input"
            placeholder="Название тега"
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreate()}
            style={{ borderBottom: "1px solid var(--ta)" }}
          />
          <button className="btn primary" onClick={handleCreate}>Добавить</button>
        </div>
      </div>
    </div>
  )
}
