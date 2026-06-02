from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import notes, tags, history

app = FastAPI()

# ── CORS ──────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,  # type: ignore
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Роутеры ───────────────────────────────────────────────────────────────────

app.include_router(notes.router)
app.include_router(tags.router)
app.include_router(history.router)