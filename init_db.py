import psycopg
import os
from dotenv import load_dotenv

load_dotenv()

SQL_FILE = "diary.sql"


def get_urls():
    """Возвращает два URL: для создания БД и для работы внутри неё."""
    url = os.getenv("DATABASE_URL").replace("postgresql+psycopg://", "postgresql://")
    system_url = url.rsplit("/", 1)[0] + "/postgres"
    return system_url, url


def create_database(system_url: str, url: str):
    """Создаёт базу данных если она ещё не существует."""
    db_name = url.rsplit("/", 1)[1]

    with psycopg.connect(system_url, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (db_name,))
            exists = cur.fetchone()

            if not exists:
                cur.execute(f'CREATE DATABASE "{db_name}"')
                print(f"База данных '{db_name}' создана")
            else:
                print(f"База данных '{db_name}' уже существует")


def init_schema(url: str):
    """Запускает diary.sql внутри базы данных."""
    with open(SQL_FILE, "r", encoding="utf-8") as f:
        sql = f.read()

    statements = [s.strip() for s in sql.split(";") if s.strip()]

    with psycopg.connect(url, autocommit=True) as conn:
        with conn.cursor() as cur:
            for statement in statements:
                try:
                    cur.execute(statement)
                except Exception as e:
                    print(f"Предупреждение: {e}")

    print("Схема инициализирована")


if __name__ == "__main__":
    db_system_url, db_url = get_urls()
    create_database(db_system_url, db_url)
    init_schema(db_url)
    print("Готово")