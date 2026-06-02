import { useState, useEffect } from "react"
import { updateNote, getTags } from "../api.js"

export default function NoteEditForm({ note, onDone }) {
    const [title, setTitle] = useState(note.title)
    const [content, setContent] = useState(note.content || "")
    const [timeStarting, setTimeStarting] = useState(note.time_starting.slice(0, 16))
    const [timeEnding, setTimeEnding] = useState(note.time_ending ? note.time_ending.slice(0, 16) : "")
    const [tagIds, setTagIds] = useState([])
    const [availableTags, setAvailableTags] = useState([])
    const [error, setError] = useState(null)

    useEffect(() => {
        getTags().then(tags => {
            setAvailableTags(tags)
            // отмечаем текущие теги заметки
            if (note.tags) {
                const currentTagTitles = note.tags.split(", ")
                const currentIds = tags
                    .filter(t => currentTagTitles.includes(t.tag_title))
                    .map(t => t.id)
                setTagIds(currentIds)
            }
        })
    }, [])

    function toggleTag(id) {
        setTagIds(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        )
    }

    async function handleSubmit() {
        const data = {}
        if (title !== note.title) data.new_title = title
        if (content !== (note.content || "")) data.new_content = content || null
        if (timeStarting !== note.time_starting.slice(0, 16)) data.new_time_starting = timeStarting
        if (timeEnding !== (note.time_ending ? note.time_ending.slice(0, 16) : "")) data.new_time_ending = timeEnding || null
        data.tag_ids = tagIds

        const res = await updateNote(note.id, data)
        if (res.detail === "Нет изменений") {
            setError("Нет изменений")
        } else {
            onDone()
        }
    }

    return (
        <div>
            <h2>Редактировать заметку</h2>

            {error && <p>{error}</p>}

            <div>
                <label>Название</label>
                <input value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            <div>
                <label>Содержимое</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} />
            </div>

            <div>
                <label>Начало</label>
                <input type="datetime-local" value={timeStarting} onChange={e => setTimeStarting(e.target.value)} />
            </div>

            <div>
                <label>Конец</label>
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

            <button onClick={handleSubmit}>Сохранить</button>
            <button onClick={onDone}>Отмена</button>
        </div>
    )
}
