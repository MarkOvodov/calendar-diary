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
    # загружаем заметки с тегами
    notes_result = await db.execute(select(Note))
    notes = notes_result.scalars().all()

    # загружаем все изменения
    changes_result = await db.execute(select(Change))
    changes = changes_result.scalars().all()

    # собираем единый список
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

    for change in changes:
        changed_fields = [
            field for field, value in {
                "title": change.new_title,
                "content": change.new_content,
                "time_starting": change.new_time_starting,
                "time_ending": change.new_time_ending,
            }.items()
            if value is not None
        ]
        feed.append(HistoryChange(
            time=change.updated_at,
            note_id=change.note_id,
            new_title=change.new_title,
            new_content=change.new_content,
            new_time_starting=change.new_time_starting,
            new_time_ending=change.new_time_ending,
            changed_fields=changed_fields,
        ))

    # сортируем по времени от новых к старым
    feed.sort(key=lambda x: x.time, reverse=True)

    return feed