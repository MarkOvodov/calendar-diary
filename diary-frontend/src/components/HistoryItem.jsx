export default function HistoryItem({ item }) {
    const time = new Date(item.time).toLocaleString("ru-RU")

    if (item.type === "note_created") {
        return (
            <div>
                <p>{time}</p>
                <p>Создана заметка: <strong>{item.title}</strong></p>
                {item.tags.length > 0 && (
                    <p>Теги: {item.tags.map(t => t.tag_title).join(", ")}</p>
                )}
            </div>
        )
    }

    if (item.type === "change") {
        return (
            <div>
                <p>{time}</p>
                <p>Изменено в заметке #{item.note_id}: {item.changed_fields.join(", ")}</p>
            </div>
        )
    }

    return null
}
