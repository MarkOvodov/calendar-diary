import { useState, useEffect } from "react"
import { getTags, deleteTag } from "../api.js"
import TagForm from "./TagForm.jsx"

export default function TagList() {
    const [tags, setTags] = useState([])

    function loadTags() {
        getTags().then(setTags)
    }

    useEffect(() => {
        loadTags()
    }, [])

    async function handleDelete(id) {
        if (confirm("Удалить тег?")) {
            await deleteTag(id)
            loadTags()
        }
    }

    return (
        <div>
            <h2>Теги</h2>

            {tags.map(tag => (
                <div key={tag.id}>
                    <span>{tag.tag_title}</span>
                    <button onClick={() => handleDelete(tag.id)}>Удалить</button>
                </div>
            ))}

            <TagForm onCreated={loadTags} />
        </div>
    )
}
