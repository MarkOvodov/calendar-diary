import { useState, useEffect } from "react"
import { updateNote, getTags } from "../api.js"
import TagAutocomplete from "./TagAutocomplete.jsx"

function toLocal(iso) { return iso ? iso.slice(0, 16) : "" }

function fmtDT(val) {
  if (!val) return "не указано"
  return new Date(val).toLocaleString("ru-RU", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function NoteEditForm({ note, onDone }) {
  const [title, setTitle]       = useState(note.title)
  const [content, setContent]   = useState(note.content || "")
  const [timeStart, setStart]   = useState(toLocal(note.time_starting))
  const [timeEnd, setEnd]       = useState(toLocal(note.time_ending))
  const [tagIds, setTagIds]     = useState([])
  const [allTags, setAllTags]   = useState([])
  const [active, setActive]     = useState(null)
  const [error, setError]       = useState(null)

  useEffect(() => {
    getTags().then(tags => {
      setAllTags(tags)
      if (note.tags) {
        const titles = note.tags.split(", ")
        setTagIds(tags.filter(t => titles.includes(t.tag_title)).map(t => t.id))
      }
    })
  }, [])

  function toggle(name) { setActive(active === name ? null : name) }
  function addTag(id) { setTagIds(p => p.includes(id) ? p : [...p, id]) }
  function removeTag(id) { setTagIds(p => p.filter(x => x !== id)) }

  async function handleSave() {
    const data = {}
    if (title !== note.title) data.new_title = title
    if (content !== (note.content || "")) data.new_content = content || null
    if (timeStart !== toLocal(note.time_starting)) data.new_time_starting = timeStart
    if (timeEnd !== toLocal(note.time_ending)) data.new_time_ending = timeEnd || null
    data.tag_ids = tagIds

    const res = await updateNote(note.id, data)
    if (res?.detail === "Нет изменений") setError("Нет изменений для сохранения")
    else onDone()
  }

  return (
    <div className="page">
      <div className="detail-header">
        <button className="btn" onClick={onDone}>← Назад</button>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn danger" onClick={onDone}>Отмена</button>
          <button className="btn primary" onClick={handleSave}>Сохранить</button>
        </div>
      </div>

      {error && <div style={{ color: "#993C1D", fontSize: 13, marginBottom: 12 }}>{error}</div>}

      <div className="card accent">

        <div className="field-wrap" onClick={() => toggle("title")}>
          <div className="field-label">Название</div>
          {active === "title"
            ? <input className="field-input large" value={title} onChange={e => setTitle(e.target.value)} onClick={e => e.stopPropagation()} autoFocus />
            : <div className="field-value large">{title}</div>}
          <span className="edit-hint">нажмите чтобы изменить</span>
        </div>

        <div className="field-wrap" onClick={() => toggle("start")}>
          <div className="field-label">Начало</div>
          {active === "start"
            ? <input className="field-input" type="datetime-local" value={timeStart} onChange={e => setStart(e.target.value)} onClick={e => e.stopPropagation()} autoFocus />
            : <div className="field-value">{fmtDT(timeStart)}</div>}
          <span className="edit-hint">нажмите чтобы изменить</span>
        </div>

        <div className="field-wrap" onClick={() => toggle("end")}>
          <div className="field-label">Конец <span style={{ fontWeight: 400 }}>— только для событий</span></div>
          {active === "end"
            ? <input className="field-input" type="datetime-local" value={timeEnd} onChange={e => setEnd(e.target.value)} onClick={e => e.stopPropagation()} autoFocus />
            : <div className={`field-value${timeEnd ? "" : " muted"}`}>{timeEnd ? fmtDT(timeEnd) : "не указано"}</div>}
          <span className="edit-hint">нажмите чтобы {timeEnd ? "изменить" : "добавить"}</span>
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

        <div className="field-wrap" style={{ borderBottom: "none" }} onClick={() => toggle("content")}>
          <div className="field-label">Содержимое</div>
          {active === "content"
            ? <textarea className="field-input" value={content} onChange={e => setContent(e.target.value)} onClick={e => e.stopPropagation()} autoFocus rows={4} />
            : <div className={`field-value${content ? "" : " muted"}`} style={{ lineHeight: 1.6 }}>{content || "нажмите чтобы добавить"}</div>}
          <span className="edit-hint">нажмите чтобы изменить</span>
        </div>

      </div>
    </div>
  )
}
