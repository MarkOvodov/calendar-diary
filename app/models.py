from datetime import datetime
from typing import Optional, List

from sqlalchemy import Integer, Text, TIMESTAMP, ForeignKey, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship, DeclarativeBase
from sqlalchemy.ext.asyncio import AsyncAttrs


class Base(AsyncAttrs, DeclarativeBase):
    pass


# ── diary.note_tags ───────────────────────────────────────────────────────────

class NoteTag(Base):
    __tablename__ = "note_tags"
    __table_args__ = {"schema": "diary"}

    note_id: Mapped[int] = mapped_column(
        ForeignKey("diary.notes.id", ondelete="CASCADE"),
        primary_key=True,
    )
    tag_id: Mapped[int] = mapped_column(
        ForeignKey("diary.tags.id", ondelete="CASCADE"),
        primary_key=True,
    )


# ── diary.notes ───────────────────────────────────────────────────────────────

class Note(Base):
    __tablename__ = "notes"
    __table_args__ = {"schema": "diary"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    content: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now())
    time_starting: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)
    time_ending: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP)

    tags: Mapped[List["Tag"]] = relationship(
        secondary="diary.note_tags",
        back_populates="notes",
        lazy="selectin",
    )


# ── diary.tags ────────────────────────────────────────────────────────────────

class Tag(Base):
    __tablename__ = "tags"
    __table_args__ = (
        UniqueConstraint("tag_title"),
        {"schema": "diary"},
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tag_title: Mapped[str] = mapped_column(Text, nullable=False)

    notes: Mapped[List["Note"]] = relationship(
        secondary="diary.note_tags",
        back_populates="tags",
    )


# ── diary.changes ─────────────────────────────────────────────────────────────

class Change(Base):
    __tablename__ = "changes"
    __table_args__ = {"schema": "diary"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    note_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("diary.notes.id", ondelete="SET NULL")
    )
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now())
    new_title: Mapped[Optional[str]] = mapped_column(Text)
    new_content: Mapped[Optional[str]] = mapped_column(Text)
    new_time_starting: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP)
    new_time_ending: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP)


# ── diary.actual_notes (VIEW, только чтение) ──────────────────────────────────

class ActualNote(Base):
    __tablename__ = "actual_notes"
    __table_args__ = {"schema": "diary"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP)
    title: Mapped[str] = mapped_column(Text)
    content: Mapped[Optional[str]] = mapped_column(Text)
    time_starting: Mapped[datetime] = mapped_column(TIMESTAMP)
    time_ending: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP)
    tags: Mapped[Optional[str]] = mapped_column(Text)