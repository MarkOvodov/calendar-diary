const BASE_URL = "http://localhost:8000"

// ── Заметки ───────────────────────────────────────────────────────────────────

export async function getNotes(week, tag, onlyEvents) {
    const params = new URLSearchParams()
    if (week) params.append("week", week)
    if (tag) params.append("tag", tag)
    if (onlyEvents !== undefined) params.append("only_events", onlyEvents)
    const res = await fetch(`${BASE_URL}/notes?${params}`)
    return res.json()
}

export async function getNote(id) {
    const res = await fetch(`${BASE_URL}/notes/${id}`)
    return res.json()
}

export async function getNoteHistory(id) {
    const res = await fetch(`${BASE_URL}/notes/${id}/history`)
    return res.json()
}

export async function createNote(data) {
    const res = await fetch(`${BASE_URL}/notes`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
    })
    return res.json()
}

export async function updateNote(id, data) {
    const res = await fetch(`${BASE_URL}/notes/${id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
    })
    return res.json()
}

export async function deleteNote(id) {
    await fetch(`${BASE_URL}/notes/${id}`, {method: "DELETE"})
}

// ── Теги ──────────────────────────────────────────────────────────────────────

export async function getTags() {
    const res = await fetch(`${BASE_URL}/tags`)
    return res.json()
}

export async function createTag(data) {
    const res = await fetch(`${BASE_URL}/tags`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
    })
    return res.json()
}

export async function deleteTag(id) {
    await fetch(`${BASE_URL}/tags/${id}`, {method: "DELETE"})
}

// ── История ───────────────────────────────────────────────────────────────────

export async function getHistory() {
    const res = await fetch(`${BASE_URL}/history`)
    return res.json()
}
