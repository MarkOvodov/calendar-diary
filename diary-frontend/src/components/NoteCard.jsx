export default function NoteCard({ note, onClick }) {
    return (
        <div onClick={onClick} style={{cursor: "pointer"}}>
            <h3>{note.title}</h3>
            <p>{note.time_starting}</p>
            {note.time_ending && <p>до {note.time_ending}</p>}
            {note.tags && <p>{note.tags}</p>}
        </div>
    )
}
