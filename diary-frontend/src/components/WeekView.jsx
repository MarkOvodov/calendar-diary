import { useState, useEffect } from "react"
import { getNotes, getTags } from "../api.js"
import TagFilter from "./TagFilter.jsx"

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
const PX_ACTIVE = 2.5   // px per minute когда есть заметки
const PX_EMPTY  = 1.5   // px per minute для пустых промежутков
const MIN_SEG_H = 10    // минимальная высота сегмента

function getISOWeek(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7)
  const w1 = new Date(d.getFullYear(), 0, 4)
  const n = 1 + Math.round(((d - w1) / 86400000 - 3 + (w1.getDay() + 6) % 7) / 7)
  return `${d.getFullYear()}-W${String(n).padStart(2, "0")}`
}

function shiftWeek(weekStr, delta) {
  const [year, week] = weekStr.split("-W").map(Number)
  const date = new Date(year, 0, 1 + (week - 1) * 7)
  date.setDate(date.getDate() + delta * 7)
  return getISOWeek(date)
}

function getWeekStart(weekStr) {
  const [year, week] = weekStr.split("-W").map(Number)
  const date = new Date(year, 0, 1 + (week - 1) * 7)
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7))
  return date
}

function weekLabel(weekStr) {
  const mon = getWeekStart(weekStr)
  const sun = new Date(mon)
  sun.setDate(sun.getDate() + 6)
  const f = d => d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" }).replace(" г.", "")
  return `${f(mon)} – ${f(sun)}`
}

function toMin(iso) {
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes()
}

function fmtMin(m) {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`
}

// Строит шкалу: для каждого сегмента [startMin, endMin] вычисляет Y-координату
function buildScale(keyMins, ranges) {
  if (keyMins.length < 2) return { segs: [], totalH: 200 }
  let y = 0
  const segs = []
  for (let i = 0; i < keyMins.length - 1; i++) {
    const s = keyMins[i], e = keyMins[i + 1]
    const dur = e - s
    const active = ranges.some(([rs, re]) => rs < e && re > s)
    const h = Math.max(active ? dur * PX_ACTIVE : dur * PX_EMPTY, MIN_SEG_H)
    segs.push({ s, e, y0: y, h })
    y += h
  }
  return { segs, totalH: y }
}

// Переводит минуты в пиксели по шкале
function toY(m, segs) {
  for (const seg of segs) {
    if (m >= seg.s && m <= seg.e) {
      const t = (m - seg.s) / Math.max(seg.e - seg.s, 1)
      return seg.y0 + t * seg.h
    }
  }
  const last = segs[segs.length - 1]
  return last ? last.y0 + last.h : 0
}

export default function WeekView({ onSelectNote }) {
  const [week, setWeek]           = useState(getISOWeek(new Date()))
  const [notes, setNotes]         = useState([])
  const [tags, setTags]           = useState([])
  const [selectedTag, setSelectedTag] = useState(null)

  useEffect(() => { getTags().then(setTags) }, [])
  useEffect(() => { getNotes(week, selectedTag).then(setNotes) }, [week, selectedTag])

  const weekStart = getWeekStart(week)

  const byDay = { 0:[], 1:[], 2:[], 3:[], 4:[], 5:[], 6:[] }
  notes.forEach(n => {
    const diff = Math.floor((new Date(n.time_starting) - weekStart) / 86400000)
    byDay[Math.max(0, Math.min(6, diff))].push(n)
  })

  // Диапазоны заметок в минутах
  const ranges = notes.map(n => [
    toMin(n.time_starting),
    n.time_ending ? toMin(n.time_ending) : toMin(n.time_starting) + 30
  ])

  // Ключевые минуты: круглые часы + границы заметок
  let minM = Infinity, maxM = 0
  notes.forEach(n => {
    const sm = toMin(n.time_starting)
    const em = n.time_ending ? toMin(n.time_ending) : sm + 30
    minM = Math.min(minM, sm); maxM = Math.max(maxM, em)
  })
  if (notes.length === 0) { minM = 9 * 60; maxM = 18 * 60 }

  const keySet = new Set()
  for (let h = Math.floor(minM / 60); h <= Math.ceil(maxM / 60); h++) keySet.add(h * 60)
  notes.forEach(n => {
    keySet.add(toMin(n.time_starting))
    if (n.time_ending) keySet.add(toMin(n.time_ending))
  })
  const keyMins = [...keySet].sort((a, b) => a - b)

  const { segs, totalH } = buildScale(keyMins, ranges)

  // Метки времени: только круглые часы и границы заметок
  const noteMins = new Set()
  notes.forEach(n => {
    noteMins.add(toMin(n.time_starting))
    if (n.time_ending) noteMins.add(toMin(n.time_ending))
  })
  const labels = keyMins.filter(m => m % 60 === 0 || noteMins.has(m))

  return (
    <div className="page">
      <div className="week-header">
        <button className="btn" onClick={() => setWeek(shiftWeek(week, -1))}>←</button>
        <span className="week-label">{weekLabel(week)}</span>
        <button className="btn" onClick={() => setWeek(shiftWeek(week, 1))}>→</button>
      </div>

      <TagFilter tags={tags} selectedTag={selectedTag} onSelectTag={setSelectedTag} />

      <div className="week-wrap" style={{ overflowX: "auto" }}>
        {/* Заголовок */}
        <div style={{ display: "grid", gridTemplateColumns: "52px repeat(7, 1fr)", borderBottom: "0.5px solid var(--tb2)" }}>
          <div style={{ background: "var(--ts)" }} />
          {DAYS.map(d => (
            <div key={d} style={{ padding: "8px 4px", fontSize: 12, fontWeight: 500, color: "var(--tm)", background: "var(--ts)", borderLeft: "0.5px solid var(--tb2)", textAlign: "center" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Сетка */}
        <div style={{ display: "grid", gridTemplateColumns: "52px repeat(7, 1fr)" }}>

          {/* Шкала времени */}
          <div style={{ position: "relative", height: totalH, background: "var(--ts)", borderRight: "0.5px solid var(--tb2)" }}>
            {labels.map(m => (
              <div key={m} style={{ position: "absolute", top: toY(m, segs), right: 6, fontSize: 10, color: "var(--tm)", transform: "translateY(-50%)", whiteSpace: "nowrap", lineHeight: 1 }}>
                {fmtMin(m)}
              </div>
            ))}
          </div>

          {/* Столбцы дней */}
          {Array.from({ length: 7 }, (_, d) => (
            <div key={d} style={{ position: "relative", height: totalH, borderLeft: "0.5px solid var(--tb2)" }}>
              {/* Линии сетки */}
              {labels.map(m => (
                <div key={m} style={{ position: "absolute", top: toY(m, segs), left: 0, right: 0, height: "0.5px", background: "var(--tb2)" }} />
              ))}

              {/* Заметки */}
              {byDay[d].map(note => {
                const sm    = toMin(note.time_starting)
                const em    = note.time_ending ? toMin(note.time_ending) : null
                const top   = toY(sm, segs)
                const bot   = em ? toY(em, segs) : top + 40
                const isEv  = !!note.time_ending

                return (
                  <div
                    key={note.id}
                    onClick={() => onSelectNote(note)}
                    style={{
                      position: "absolute",
                      top: top + 2,
                      left: 3,
                      right: 3,
                      height: Math.max(bot - top - 4, 22),
                      background: "var(--ts)",
                      border: `0.5px solid ${isEv ? "var(--ta)" : "var(--tb2)"}`,
                      borderLeft: `${isEv ? 3 : 2}px solid var(--ta)`,
                      borderRadius: 4,
                      padding: "3px 5px",
                      cursor: "pointer",
                      overflow: "hidden",
                      boxSizing: "border-box",
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 500, color: "var(--tt)", lineHeight: 1.3 }}>{note.title}</div>
                    {note.tags && <div style={{ fontSize: 9, color: "var(--tm)" }}>{note.tags}</div>}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
