import { useState } from "react"
import WeekView from "./components/WeekView.jsx"
import NoteDetail from "./components/NoteDetail.jsx"
import NoteForm from "./components/NoteForm.jsx"
import NoteEditForm from "./components/NoteEditForm.jsx"
import TagList from "./components/TagList.jsx"
import HistoryFeed from "./components/HistoryFeed.jsx"

export default function App() {
    const [page, setPage] = useState("week")
    const [selectedNote, setSelectedNote] = useState(null)

    return (
        <div>
            <nav>
                <button onClick={() => setPage("week")}>Неделя</button>
                <button onClick={() => setPage("tags")}>Теги</button>
                <button onClick={() => setPage("history")}>История</button>
                <button onClick={() => setPage("create")}>Создать</button>
            </nav>

            {page === "week" && (
                <WeekView onSelectNote={(note) => {
                    setSelectedNote(note)
                    setPage("note")
                }}/>
            )}

            {page === "note" && selectedNote && (
                <NoteDetail
                    note={selectedNote}
                    onEdit={() => setPage("edit")}
                    onBack={() => setPage("week")}
                    onDeleted={() => setPage("week")}
                />
            )}

            {page === "edit" && selectedNote && (
                <NoteEditForm
                    note={selectedNote}
                    onDone={() => setPage("week")}
                />
            )}

            {page === "create" && (
                <NoteForm onDone={() => setPage("week")} />
            )}

            {page === "tags" && <TagList />}

            {page === "history" && <HistoryFeed />}
        </div>
    )
}