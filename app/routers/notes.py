from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func, extract
from typing import Optional
from datetime import datetime, timedelta

from ..database import get_db
from ..models import Note, Tag, NoteTag, Change, ActualNote
from ..schemas import NoteCreate, NoteUpdate, NoteOut, ChangeOut

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("")
async def get_notes(
    month: Optional[str] = None,
    week: Optional[str] = None,
    only_events: Optional[bool] = None,
    tag: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Список заметок из actual_notes — с актуальными данными и тегами."""
    query = select(ActualNote)

    if month:
        year, month_num = month.split("-")
        query = query.where(extract("year", ActualNote.time_starting) == int(year))
        query = query.where(extract("month", ActualNote.time_starting) == int(month_num))

    if week:
        year, week_num = week.split("-W")
        week_start = datetime.strptime(f"{year}-W{week_num}-1", "%G-W%V-%u")
        week_end = week_start + timedelta(days=7)
        query = query.where(ActualNote.time_starting >= week_start)
        query = query.where(ActualNote.time_starting < week_end)

    if only_events is True:
        query = query.where(ActualNote.time_ending.isnot(None))
    if only_events is False:
        query = query.where(ActualNote.time_ending.is_(None))

    if tag:
        tag_subquery = (
            select(NoteTag.note_id)
            .join(Tag, Tag.id == NoteTag.tag_id)
            .where(Tag.tag_title == tag)
        )
        query = query.where(ActualNote.id.in_(tag_subquery))

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{note_id}")
async def get_note(
    note_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Одна заметка по id."""
    result = await db.execute(
        select(ActualNote).where(ActualNote.id == note_id)
    )
    note = result.scalar_one_or_none()
    if note is None:
        raise HTTPException(status_code=404, detail="Заметка не найдена")
    return note


@router.get("/{note_id}/history", response_model=list[ChangeOut])
async def get_note_history(
    note_id: int,
    db: AsyncSession = Depends(get_db),
):
    """История изменений заметки — от новых к старым."""
    result = await db.execute(
        select(Change)
        .where(Change.note_id == note_id)
        .order_by(Change.updated_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=NoteOut, status_code=201)
async def create_note(
    data: NoteCreate,
    db: AsyncSession = Depends(get_db),
):
    """Создать новую заметку и привязать теги."""
    note = Note(
        title=data.title,
        content=data.content,
        time_starting=data.time_starting,
        time_ending=data.time_ending,
    )
    db.add(note)
    await db.flush()

    for tag_id in data.tag_ids:
        db.add(NoteTag(note_id=note.id, tag_id=tag_id))

    await db.commit()
    await db.refresh(note)
    return note


@router.patch("/{note_id}", status_code=201)
async def update_note(
    note_id: int,
    data: NoteUpdate,
    db: AsyncSession = Depends(get_db),
):
    """
    Обновить заметку — пишет запись в diary.changes.
    Оригинальная заметка не меняется, actual_notes покажет актуальную версию.
    """
    result = await db.execute(select(Note).where(Note.id == note_id))
    note = result.scalar_one_or_none()
    if note is None:
        raise HTTPException(status_code=404, detail="Заметка не найдена")

    if data.tag_ids is not None:
        await db.execute(delete(NoteTag).where(NoteTag.note_id == note_id))
        for tag_id in data.tag_ids:
            db.add(NoteTag(note_id=note_id, tag_id=tag_id))

    change = None
    if any([data.new_title, data.new_content, data.new_time_starting, data.new_time_ending]):
        change = Change(
            note_id=note_id,
            new_title=data.new_title,
            new_content=data.new_content,
            new_time_starting=data.new_time_starting,
            new_time_ending=data.new_time_ending,
        )
        db.add(change)

    await db.commit()

    if change:
        await db.refresh(change)
        return change

    return {"detail": "Теги обновлены"}


@router.delete("/{note_id}", status_code=204)
async def delete_note(
    note_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Удалить заметку. Связанные теги и изменения удалятся автоматически."""
    result = await db.execute(select(Note).where(Note.id == note_id))
    note = result.scalar_one_or_none()
    if note is None:
        raise HTTPException(status_code=404, detail="Заметка не найдена")

    await db.delete(note)
    await db.commit()