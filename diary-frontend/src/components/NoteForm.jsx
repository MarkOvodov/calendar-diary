import { useState, useEffect } from "react"
import { createNote, getTags } from "../api.js"

export default function NoteForm({ onDone }) {
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [timeStarting, setTimeStarting] = useState("")
    const [timeEnding, setTimeEnding] = useState("")
    const [tagIds, setTagIds] = useState([])
    const [availableTags, setAvailableTags] = useState([])
    const [error, setError] = useState(null)

    useEffect(() => {
        getTags().then(setAvailableTags)
    }, [])

    function toggleTag(id) {
        setTagIds(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        )
    }

    async function handleSubmit() {
        if (!title || !timeStarting) {
            setError("Заполни название и время начала")
            return
        }
        const data = {
            title,
            content: content || null,
            time_starting: timeStarting,
            time_ending: timeEnding || null,
            tag_ids: tagIds,
        }
        const res = await createNote(data)
        if (res.id) {
            onDone()
        } else {
            setError("Ошибка при создании")
        }
    }

    return (
        <div>
            <h2>Новая заметка</h2>

            {error && <p>{error}</p>}

            <div>
                <label>Название *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            <div>
                <label>Содержимое</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} />
            </div>

            <div>
                <label>Начало *</label>
                <input type="datetime-local" value={timeStarting} onChange={e => setTimeStarting(e.target.value)} />
            </div>

            <div>
                <label>Конец (для событий)</label>
                <input type="datetime-local" value={timeEnding} onChange={e => setTimeEnding(e.target.value)} />
            </div>

            <div>
                <label>Теги</label>
                {availableTags.map(tag => (
                    <label key={tag.id}>
                        <input
                            type="checkbox"
                            checked={tagIds.includes(tag.id)}
                            onChange={() => toggleTag(tag.id)}
                        />
                        {tag.tag_title}
                    </label>
                ))}
            </div>

            <button onClick={handleSubmit}>Создать</button>
            <button onClick={onDone}>Отмена</button>
        </div>
    )
}
