import { useState, useEffect } from "react"
import { getNotes, getTags } from "../api.js"
import NoteCard from "./NoteCard.jsx"
import TagFilter from "./TagFilter.jsx"

// вычислить ISO номер недели для даты
function getISOWeek(date) {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7)
    const week1 = new Date(d.getFullYear(), 0, 4)
    const weekNum = 1 + Math.round(
        ((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7
    )
    return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`
}

// сдвинуть неделю на delta недель вперёд или назад
function shiftWeek(weekStr, delta) {
    const [year, week] = weekStr.split("-W").map(Number)
    const date = new Date(year, 0, 1 + (week - 1) * 7)
    date.setDate(date.getDate() + delta * 7)
    return getISOWeek(date)
}

export default function WeekView({ onSelectNote }) {
    const [currentWeek, setCurrentWeek] = useState(getISOWeek(new Date()))
    const [notes, setNotes] = useState([])
    const [tags, setTags] = useState([])
    const [selectedTag, setSelectedTag] = useState(null)

    useEffect(() => {
        getTags().then(setTags)
    }, [])

    useEffect(() => {
        getNotes(currentWeek, selectedTag).then(setNotes)
    }, [currentWeek, selectedTag])

    return (
        <div>
            <div>
                <button onClick={() => setCurrentWeek(shiftWeek(currentWeek, -1))}>←</button>
                <span>{currentWeek}</span>
                <button onClick={() => setCurrentWeek(shiftWeek(currentWeek, 1))}>→</button>
            </div>

            <TagFilter
                tags={tags}
                selectedTag={selectedTag}
                onSelectTag={setSelectedTag}
            />

            <div>
                {notes.length === 0 && <p>Нет заметок за эту неделю</p>}
                {notes.map(note => (
                    <NoteCard
                        key={note.id}
                        note={note}
                        onClick={() => onSelectNote(note)}
                    />
                ))}
            </div>
        </div>
    )
}
