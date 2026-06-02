import { useState, useEffect } from "react"
import { getNoteHistory, deleteNote } from "../api.js"

export default function NoteDetail({ note, onEdit, onBack, onDeleted }) {
    const [history, setHistory] = useState([])

    useEffect(() => {
        getNoteHistory(note.id).then(setHistory)
    }, [note.id])

    async function handleDelete() {
        if (confirm("Удалить заметку?")) {
            await deleteNote(note.id)
            onDeleted()
        }
    }

    return (
        <div>
            <button onClick={onBack}>← Назад</button>

            <h2>{note.title}</h2>
            <p>{note.time_starting}</p>
            {note.time_ending && <p>до {note.time_ending}</p>}
            {note.content && <p>{note.content}</p>}
            {note.tags && <p>Теги: {note.tags}</p>}

            <button onClick={onEdit}>Редактировать</button>
            <button onClick={handleDelete}>Удалить</button>

            {history.length > 0 && (
                <div>
                    <h3>История изменений</h3>
                    {history.map(change => (
                        <div key={change.id}>
                            <p>{change.updated_at}</p>
                            <p>Изменено: {change.changed_fields.join(", ")}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
