from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_db
from ..models import Note, Change
from ..schemas import HistoryNoteCreated, HistoryChange

router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=list[HistoryNoteCreated | HistoryChange])
async def get_history(db: AsyncSession = Depends(get_db)):
    """
    Единая лента активности — создания заметок и изменения,
    отсортированные от новых к старым.
    """
    notes_result = await db.execute(select(Note))
    notes = notes_result.scalars().all()

    changes_result = await db.execute(select(Change))
    changes = changes_result.scalars().all()

    # словарь оригинальных заметок для сравнения первого изменения
    notes_by_id = {note.id: note for note in notes}

    # сортируем изменения по времени — от старых к новым
    # чтобы правильно отслеживать предыдущее состояние
    sorted_changes = sorted(changes, key=lambda c: c.updated_at)

    # последнее известное состояние каждой заметки
    last_state: dict = {}

    feed: list[HistoryNoteCreated | HistoryChange] = []

    for note in notes:
        feed.append(HistoryNoteCreated(
            time=note.created_at,
            note_id=note.id,
            title=note.title,
            content=note.content,
            time_starting=note.time_starting,
            time_ending=note.time_ending,
            tags=[{"id": t.id, "tag_title": t.tag_title} for t in note.tags],
        ))

    for change in sorted_changes:
        note_id = change.note_id

        if note_id is None or note_id not in notes_by_id:
            # заметка удалена — сравнить не с чем
            changed_fields = []
        else:
            # берём предыдущее состояние: либо последнее изменение, либо оригинал
            if note_id in last_state:
                prev = last_state[note_id]
            else:
                orig = notes_by_id[note_id]
                prev = {
                    "title": orig.title,
                    "content": orig.content,
                    "time_starting": orig.time_starting,
                    "time_ending": orig.time_ending,
                }

            # сравниваем с предыдущим состоянием
            changed_fields = [
                field for field, (prev_val, new_val) in {
                    "title":         (prev["title"],         change.new_title),
                    "content":       (prev["content"],       change.new_content),
                    "time_starting": (prev["time_starting"], change.new_time_starting),
                    "time_ending":   (prev["time_ending"],   change.new_time_ending),
                }.items()
                if prev_val != new_val
            ]

        # обновляем последнее известное состояние
        if note_id is not None:
            last_state[note_id] = {
                "title":         change.new_title,
                "content":       change.new_content,
                "time_starting": change.new_time_starting,
                "time_ending":   change.new_time_ending,
            }

        feed.append(HistoryChange(
            time=change.updated_at,
            note_id=change.note_id,
            new_title=change.new_title,
            new_content=change.new_content,
            new_time_starting=change.new_time_starting,
            new_time_ending=change.new_time_ending,
            changed_fields=changed_fields,
        ))

    feed.sort(key=lambda x: x.time, reverse=True)

    return feed