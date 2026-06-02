from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, model_validator


# ── Теги ──────────────────────────────────────────────────────────────────────

class TagCreate(BaseModel):
    tag_title: str


class TagOut(BaseModel):
    id: int
    tag_title: str

    model_config = {"from_attributes": True}


# ── Заметки — создание ────────────────────────────────────────────────────────

class NoteCreate(BaseModel):
    title: str
    content: Optional[str] = None
    time_starting: datetime
    time_ending: Optional[datetime] = None
    tag_ids: List[int] = []

    @model_validator(mode="after")
    def check_time_order(self) -> "NoteCreate":
        if self.time_ending and self.time_starting >= self.time_ending:
            raise ValueError("time_ending должно быть позже time_starting")
        return self


# ── Заметки — обновление (пишет в diary.changes) ─────────────────────────────

class NoteUpdate(BaseModel):
    new_title: Optional[str] = None
    new_content: Optional[str] = None
    new_time_starting: Optional[datetime] = None
    new_time_ending: Optional[datetime] = None
    tag_ids: Optional[List[int]] = None

    @model_validator(mode="after")
    def check_has_changes(self) -> "NoteUpdate":
        fields = [
            self.new_title,
            self.new_content,
            self.new_time_starting,
            self.new_time_ending,
            self.tag_ids,
        ]
        if not any(f is not None for f in fields):
            raise ValueError("необходимо изменить хотя бы одно поле")
        if self.new_time_ending and self.new_time_starting:
            if self.new_time_starting >= self.new_time_ending:
                raise ValueError("new_time_ending должно быть позже new_time_starting")
        return self


# ── Заметки — ответ API ───────────────────────────────────────────────────────

class NoteOut(BaseModel):
    id: int
    title: str
    content: Optional[str]
    created_at: datetime
    time_starting: datetime
    time_ending: Optional[datetime]
    tags: List[TagOut] = []

    model_config = {"from_attributes": True}


# ── История изменений — ответ API ─────────────────────────────────────────────

class ChangeOut(BaseModel):
    id: int
    note_id: Optional[int]
    updated_at: datetime
    new_title: Optional[str]
    new_content: Optional[str]
    new_time_starting: Optional[datetime]
    new_time_ending: Optional[datetime]

    model_config = {"from_attributes": True}


# ── Единая лента истории ──────────────────────────────────────────────────────

class HistoryNoteCreated(BaseModel):
    """Элемент ленты — создание заметки."""
    type: str = "note_created"
    time: datetime
    note_id: int
    title: str
    content: Optional[str]
    time_starting: datetime
    time_ending: Optional[datetime]
    tags: List[TagOut] = []


class HistoryChange(BaseModel):
    """Элемент ленты — изменение заметки."""
    type: str = "change"
    time: datetime
    note_id: Optional[int]
    new_title: Optional[str]
    new_content: Optional[str]
    new_time_starting: Optional[datetime]
    new_time_ending: Optional[datetime]
    changed_fields: List[str]