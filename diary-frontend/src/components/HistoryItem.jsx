const FIELD_NAMES = {
  title: "заголовок",
  content: "содержимое",
  time_starting: "начало",
  time_ending: "конец",
}

function fmtDT(iso) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
  })
}

export default function HistoryItem({ item, isLast }) {
  return (
    <div className="hist-item">
      <div className="hist-line">
        <div className={`hist-dot${item.type === "change" ? " change" : ""}`} />
        {!isLast && <div className="hist-conn" />}
      </div>

      <div className={`hist-card ${item.type}`}>
        <div style={{ fontSize: 11, color: "var(--tm)", marginBottom: 4 }}>{fmtDT(item.time)}</div>

        {item.type === "note_created" && (
          <>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--tt)" }}>
              {item.title}
              <span className="badge">создана</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--tm)", marginBottom: 4 }}>
              {new Date(item.time_starting).toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
              {item.time_ending && ` – ${new Date(item.time_ending).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`}
            </div>
            {item.tags?.length > 0 && (
              <div>{item.tags.map(t => <span key={t.id} className="tag-pill">{t.tag_title}</span>)}</div>
            )}
          </>
        )}

        {item.type === "change" && (
          <>
            <div style={{ fontSize: 12, color: "var(--ta)", marginBottom: 6 }}>
              Заметка #{item.note_id}
            </div>
            <div className="changes-grid">
              {item.changed_fields?.map(f => {
                const fname = FIELD_NAMES[f] || f
                const oldVal = item[`new_${f}`] // В нашей схеме нет old - только new
                // Определяем "новое" поле по changed_fields
                return (
                  <div key={f} className="cg-added">+{fname}</div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
