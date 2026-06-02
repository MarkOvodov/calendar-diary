from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    model_config = {"env_file": ".env"}

settings = Settings()

engine = create_async_engine(
    settings.database_url,
    echo=True,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    expire_on_commit = False,
)

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
