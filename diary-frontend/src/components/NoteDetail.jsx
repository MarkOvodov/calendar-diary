import { useState, useEffect } from "react"
import { getNoteHistory, deleteNote } from "../api.js"

function fmtDT(iso) {
  if (!iso) return null
  const d = new Date(iso)
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) +
    ", " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
}

const FIELD_NAMES = { title: "заголовок", content: "содержимое", time_starting: "начало", time_ending: "конец" }

export default function NoteDetail({ note, onEdit, onBack, onDeleted }) {
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(true)

  useEffect(() => {
    getNoteHistory(note.id).then(setHistory)
  }, [note.id])

  async function handleDelete() {
    if (window.confirm("Удалить заметку?")) {
      await deleteNote(note.id)
      onDeleted()
    }
  }

  const isEvent = !!note.time_ending

  return (
    <div className="page">
      <div className="detail-header">
        <button className="btn" onClick={onBack}>← Назад</button>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn" onClick={onEdit}>Редактировать</button>
          <button className="btn danger" onClick={handleDelete}>Удалить</button>
        </div>
      </div>

      <div className="card accent" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 500, color: "var(--tt)", marginBottom: 6 }}>{note.title}</div>

        {isEvent ? (
          <div style={{ fontSize: 13, color: "var(--tm)", marginBottom: 8 }}>
            {fmtDT(note.time_starting)} – {fmtDT(note.time_ending)}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "var(--tm)", marginBottom: 8 }}>{fmtDT(note.time_starting)}</div>
        )}

        {note.tags && (
          <div style={{ marginBottom: 8 }}>
            {note.tags.split(", ").map(t => (
              <span key={t} className="tag-pill">{t}</span>
            ))}
          </div>
        )}

        {note.content && (
          <div style={{ fontSize: 14, color: "var(--tt)", lineHeight: 1.6, borderTop: "0.5px solid var(--tb2)", paddingTop: 12 }}>
            {note.content}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>История изменений</span>
            <button className="btn" onClick={() => setShowHistory(!showHistory)}>
              {showHistory ? "Скрыть" : "Показать"}
            </button>
          </div>
          {showHistory && history.map(change => (
            <div key={change.id} style={{ padding: "8px 0", borderTop: "0.5px solid var(--tb2)" }}>
              <div style={{ fontSize: 11, color: "var(--tm)", marginBottom: 4 }}>
                {fmtDT(change.updated_at)}
              </div>
              <div className="changes-grid">
                {change.changed_fields?.map(f => {
                  const isNew = change[`new_${f}`] !== null && !change[`new_${f === "title" ? "title_old" : ""}`]
                  return (
                    <div key={f} className="cg-added">
                      {FIELD_NAMES[f] || f}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
