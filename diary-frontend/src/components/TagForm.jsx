import { useState } from "react"
import { createTag } from "../api.js"

export default function TagForm({ onCreated }) {
    const [tagTitle, setTagTitle] = useState("")
    const [error, setError] = useState(null)

    async function handleSubmit() {
        if (!tagTitle.trim()) {
            setError("Введи название тега")
            return
        }
        const res = await createTag({tag_title: tagTitle.trim()})
        if (res.id) {
            setTagTitle("")
            setError(null)
            onCreated()
        } else {
            setError("Ошибка при создании")
        }
    }

    return (
        <div>
            <input
                value={tagTitle}
                onChange={e => setTagTitle(e.target.value)}
                placeholder="Новый тег"
            />
            <button onClick={handleSubmit}>Добавить</button>
            {error && <p>{error}</p>}
        </div>
    )
}
