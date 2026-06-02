from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_db
from ..models import Tag
from ..schemas import TagCreate, TagOut

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=list[TagOut])
async def get_tags(db: AsyncSession = Depends(get_db)):
    """Все теги — для выпадающего списка при создании заметки."""
    result = await db.execute(select(Tag))
    return result.scalars().all()


@router.post("", response_model=TagOut, status_code=201)
async def create_tag(
    data: TagCreate,
    db: AsyncSession = Depends(get_db),
):
    """Создать новый тег."""
    tag = Tag(tag_title=data.tag_title)
    db.add(tag)
    await db.commit()
    await db.refresh(tag)
    return tag


@router.delete("/{tag_id}", status_code=204)
async def delete_tag(
    tag_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Удалить тег. Из заметок отвяжется автоматически."""
    result = await db.execute(select(Tag).where(Tag.id == tag_id))
    tag = result.scalar_one_or_none()
    if tag is None:
        raise HTTPException(status_code=404, detail="Тег не найден")

    await db.delete(tag)
    await db.commit()