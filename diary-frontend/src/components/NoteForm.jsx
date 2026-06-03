import { useState, useEffect } from "react"
import { createNote, getTags } from "../api.js"
import TagAutocomplete from "./TagAutocomplete.jsx"

export default function NoteForm({ onDone }) {
  const [title, setTitle]     = useState("")
  const [content, setContent] = useState("")
  const [timeStart, setStart] = useState("")
  const [timeEnd, setEnd]     = useState("")
  const [tagIds, setTagIds]   = useState([])
  const [allTags, setAllTags] = useState([])
  const [error, setError]     = useState(null)

  useEffect(() => { getTags().then(setAllTags) }, [])

  function addTag(id) { setTagIds(p => p.includes(id) ? p : [...p, id]) }
  function removeTag(id) { setTagIds(p => p.filter(x => x !== id)) }

  async function handleCreate() {
    if (!title.trim()) { setError("Введи название"); return }
    if (!timeStart)    { setError("Укажи время начала"); return }
    const res = await createNote({
      title: title.trim(),
      content: content || null,
      time_starting: timeStart,
      time_ending: timeEnd || null,
      tag_ids: tagIds,
    })
    if (res?.id) onDone()
    else setError("Ошибка при создании")
  }

  return (
    <div className="page">
      <div className="detail-header">
        <button className="btn" onClick={onDone}>← Назад</button>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn danger" onClick={onDone}>Отмена</button>
          <button className="btn primary" onClick={handleCreate}>Создать</button>
        </div>
      </div>

      {error && <div style={{ color: "#993C1D", fontSize: 13, marginBottom: 12 }}>{error}</div>}

      <div className="card accent">

        <div className="field-wrap">
          <div className="field-label">Название *</div>
          <input className="field-input large" placeholder="Название заметки" value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <div className="field-wrap">
          <div className="field-label">Начало * — укажи дату и время</div>
          <input className="field-input" type="datetime-local" value={timeStart} onChange={e => setStart(e.target.value)} />
        </div>

        <div className="field-wrap">
          <div className="field-label">Конец <span style={{ fontWeight: 400 }}>— только для событий</span></div>
          <input className="field-input" type="datetime-local" value={timeEnd} onChange={e => setEnd(e.target.value)} />
        </div>

        <div className="field-wrap" style={{ cursor: "default" }}>
          <div className="field-label">Теги</div>
          <TagAutocomplete
            allTags={allTags}
            tagIds={tagIds}
            onAdd={id => { setAllTags(t => t); addTag(id) }}
            onRemove={removeTag}
          />
        </div>

        <div className="field-wrap" style={{ borderBottom: "none" }}>
          <div className="field-label">Содержимое</div>
          <textarea className="field-input" placeholder="Текст заметки..." value={content} onChange={e => setContent(e.target.value)} rows={4} />
        </div>

      </div>
    </div>
  )
}
