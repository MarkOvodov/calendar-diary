import { useState } from "react"
import WeekView from "./components/WeekView.jsx"
import NoteDetail from "./components/NoteDetail.jsx"
import NoteForm from "./components/NoteForm.jsx"
import NoteEditForm from "./components/NoteEditForm.jsx"
import TagList from "./components/TagList.jsx"
import HistoryFeed from "./components/HistoryFeed.jsx"
import "./index.css"

const THEMES = [
  { key: "theme-light", bg: "#FFFFFF", accent: "#5F5E5A" },
  { key: "theme-dark",  bg: "#444441", accent: "#B4B2A9" },
  { key: "theme-blue",  bg: "#0C447C", accent: "#85B7EB" },
]

export default function App() {
  const [page, setPage] = useState("week")
  const [selectedNote, setSelectedNote] = useState(null)
  const [theme, setTheme] = useState(0)

  function openNote(note) {
    setSelectedNote(note)
    setPage("note")
  }

  function goWeek() {
    setPage("week")
    setSelectedNote(null)
  }

  return (
    <div className={THEMES[theme].key} style={{ minHeight: "100vh", background: "var(--tb)" }}>
      <nav className="nav">
        <button className={`nav-btn${page === "week" ? " active" : ""}`} onClick={() => setPage("week")}>Неделя</button>
        <button className={`nav-btn${page === "tags" ? " active" : ""}`} onClick={() => setPage("tags")}>Теги</button>
        <button className={`nav-btn${page === "history" ? " active" : ""}`} onClick={() => setPage("history")}>История</button>
        <button className="nav-create" onClick={() => setPage("create")}>+ Создать</button>
        <div className="theme-switcher">
          {THEMES.map((t, i) => (
            <div
              key={t.key}
              className={`theme-dot${theme === i ? " active" : ""}`}
              style={{ background: t.bg, border: `2px solid ${theme === i ? t.accent : "transparent"}` }}
              onClick={() => setTheme(i)}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.accent }} />
            </div>
          ))}
        </div>
      </nav>

      {page === "week" && <WeekView onSelectNote={openNote} />}
      {page === "note" && selectedNote && (
        <NoteDetail
          note={selectedNote}
          onEdit={() => setPage("edit")}
          onBack={goWeek}
          onDeleted={goWeek}
        />
      )}
      {page === "edit" && selectedNote && (
        <NoteEditForm note={selectedNote} onDone={goWeek} />
      )}
      {page === "create" && <NoteForm onDone={goWeek} />}
      {page === "tags" && <TagList />}
      {page === "history" && <HistoryFeed />}
    </div>
  )
}
