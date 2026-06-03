import { useState, useEffect } from "react"
import { getNotes, getTags } from "../api.js"
import TagFilter from "./TagFilter.jsx"
import {
  PX_PER_MIN_ACTIVE, PX_PER_MIN_EMPTY, MIN_SEGMENT_HEIGHT,
  GRID_PADDING_Y, GRID_LINE_VERTICAL, GRID_LINE_HOUR, GRID_LINE_NOTE,
  GRID_LINE_HOUR_OPACITY, GRID_LINE_NOTE_OPACITY,
  NOTE_MARGIN_X, NOTE_MARGIN_TOP, NOTE_PADDING, NOTE_BORDER_RADIUS,
  NOTE_BORDER_LEFT, EVENT_BORDER_LEFT, NOTE_MIN_HEIGHT,
  NOTE_CONTENT_MIN_HEIGHT, NOTE_FONT_TITLE, NOTE_FONT_TAGS,
  NOTE_FONT_CONTENT, TIME_COLUMN_WIDTH, PAGE_PADDING,
} from "../constants.js"

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
const PX_ACTIVE = PX_PER_MIN_ACTIVE
const PX_EMPTY  = PX_PER_MIN_EMPTY
const MIN_SEG_H = MIN_SEGMENT_HEIGHT

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
        <div style={{ display: "grid", gridTemplateColumns: `${TIME_COLUMN_WIDTH}px repeat(7, 1fr)`, borderBottom: "0.5px solid var(--tb2)" }}>
          <div style={{ background: "var(--ts)" }} />
          {DAYS.map(d => (
            <div key={d} style={{ padding: "8px 4px", fontSize: 12, fontWeight: 500, color: "var(--tm)", background: "var(--ts)", borderLeft: "0.5px solid var(--tb2)", textAlign: "center" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Сетка */}
        <div style={{ display: "grid", gridTemplateColumns: `${TIME_COLUMN_WIDTH}px repeat(7, 1fr)` }}>

          {/* Шкала времени */}
          <div style={{ position: "relative", height: totalH + GRID_PADDING_Y * 2, paddingTop: GRID_PADDING_Y, paddingBottom: GRID_PADDING_Y, background: "var(--ts)", borderRight: `${GRID_LINE_VERTICAL} solid var(--tb2)` }}>
            {labels.map(m => (
              <div key={m} style={{ position: "absolute", top: toY(m, segs) + GRID_PADDING_Y, right: 6, fontSize: NOTE_FONT_CONTENT, color: "var(--tm)", transform: "translateY(-50%)", whiteSpace: "nowrap", lineHeight: 1 }}>
                {fmtMin(m)}
              </div>
            ))}
          </div>

          {/* Столбцы дней */}
          {Array.from({ length: 7 }, (_, d) => (
            <div key={d} style={{ position: "relative", height: totalH + GRID_PADDING_Y * 2, paddingTop: GRID_PADDING_Y, paddingBottom: GRID_PADDING_Y, borderLeft: `${GRID_LINE_VERTICAL} solid var(--tb2)` }}>
              {/* Линии сетки: часы жирнее, границы заметок тоньше */}
              {labels.map(m => {
                const isHour = m % 60 === 0
                return (
                  <div key={m} style={{
                    position: "absolute",
                    top: toY(m, segs) + GRID_PADDING_Y,
                    left: 0, right: 0,
                    height: isHour ? GRID_LINE_HOUR : GRID_LINE_NOTE,
                    background: "var(--tb2)",
                    opacity: isHour ? GRID_LINE_HOUR_OPACITY : GRID_LINE_NOTE_OPACITY,
                  }} />
                )
              })}

              {/* Заметки */}
              {byDay[d].map(note => {
                const sm    = toMin(note.time_starting)
                const em    = note.time_ending ? toMin(note.time_ending) : null
                const top   = toY(sm, segs) + GRID_PADDING_Y
                const bot   = em ? toY(em, segs) + GRID_PADDING_Y : top + 40
                const h     = Math.max(bot - top - 4, NOTE_MIN_HEIGHT)
                const isEv  = !!note.time_ending

                return (
                  <div
                    key={note.id}
                    onClick={() => onSelectNote(note)}
                    style={{
                      position: "absolute",
                      top: top + NOTE_MARGIN_TOP,
                      left: NOTE_MARGIN_X,
                      right: NOTE_MARGIN_X,
                      height: h,
                      background: "var(--ts)",
                      border: `0.5px solid ${isEv ? "var(--ta)" : "var(--tb2)"}`,
                      borderLeft: `${isEv ? EVENT_BORDER_LEFT : NOTE_BORDER_LEFT}px solid var(--ta)`,
                      borderRadius: NOTE_BORDER_RADIUS,
                      padding: NOTE_PADDING,
                      cursor: "pointer",
                      overflow: "hidden",
                      boxSizing: "border-box",
                    }}
                  >
                    <div style={{ fontSize: NOTE_FONT_TITLE, fontWeight: 500, color: "var(--tt)", lineHeight: 1.3 }}>{note.title}</div>
                    {note.tags && <div style={{ fontSize: NOTE_FONT_TAGS, color: "var(--tm)" }}>{note.tags}</div>}
                    {note.content && h > NOTE_CONTENT_MIN_HEIGHT && (
                      <div style={{ fontSize: NOTE_FONT_CONTENT, color: "var(--tm)", lineHeight: 1.4, marginTop: 2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: Math.floor((h - 38) / 14), WebkitBoxOrient: "vertical" }}>
                        {note.content}
                      </div>
                    )}
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
