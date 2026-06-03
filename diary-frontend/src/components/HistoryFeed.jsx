import { useState, useEffect } from "react"
import { getHistory } from "../api.js"
import HistoryItem from "./HistoryItem.jsx"

function dayLabel(iso) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return "Сегодня"
  if (d.toDateString() === yesterday.toDateString()) return "Вчера"
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
}

export default function HistoryFeed() {
  const [items, setItems] = useState([])

  useEffect(() => { getHistory().then(setItems) }, [])

  let lastLabel = null

  return (
    <div className="page">
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>История</h2>

      {items.length === 0 && (
        <div style={{ color: "var(--tm)", fontSize: 13 }}>История пуста</div>
      )}

      {items.map((item, i) => {
        const label = dayLabel(item.time)
        const showLabel = label !== lastLabel
        lastLabel = label
        return (
          <div key={i}>
            {showLabel && <div className="day-label">{label}</div>}
            <HistoryItem item={item} isLast={i === items.length - 1} />
          </div>
        )
      })}
    </div>
  )
}
