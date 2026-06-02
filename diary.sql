CREATE SCHEMA IF NOT EXISTS diary;
SET search_path TO diary;


CREATE TABLE IF NOT EXISTS diary.notes (
    id                  INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title               TEXT NOT NULL,
    content             TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT now(),
    time_starting       TIMESTAMP NOT NULL,
    time_ending         TIMESTAMP,
    CONSTRAINT time_order CHECK (time_ending IS NULL OR time_starting < time_ending)
);

CREATE TABLE IF NOT EXISTS diary.tags (
    id                  INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    tag_title           TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS diary.note_tags (
    note_id             INTEGER REFERENCES diary.notes(id) ON DELETE CASCADE,
    tag_id              INTEGER REFERENCES diary.tags(id)  ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);

CREATE TABLE IF NOT EXISTS diary.changes (
    id                  INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    note_id             INTEGER REFERENCES diary.notes(id) ON DELETE SET NULL,
    updated_at          TIMESTAMP NOT NULL DEFAULT now(),
    new_title           TEXT,
    new_content         TEXT,
    new_time_starting   TIMESTAMP,
    new_time_ending     TIMESTAMP,
    CONSTRAINT change_time_order CHECK (new_time_ending IS NULL OR new_time_starting < new_time_ending)
);


CREATE OR REPLACE VIEW actual_notes AS
WITH last_change AS (
    SELECT DISTINCT ON (note_id)
        note_id,
        new_title,
        new_content,
        new_time_starting,
        new_time_ending
    FROM changes
    ORDER BY note_id, updated_at DESC
),
all_tags AS (
    SELECT
        n.id,
        string_agg(t.tag_title, ', ') AS tags
    FROM notes n
    JOIN note_tags nt on n.id = nt.note_id
    JOIN tags t on t.id = nt.tag_id
    GROUP BY n.id
)
SELECT
    n.id,
    n.created_at,
    coalesce(last_change.new_title, n.title)                   AS title,
    coalesce(last_change.new_content, n.content)               AS content,
    coalesce(last_change.new_time_starting, n.time_starting)   AS time_starting,
    coalesce(last_change.new_time_ending, n.time_ending)       AS time_ending,
    all_tags.tags
FROM notes n
LEFT JOIN last_change ON last_change.note_id = n.id
LEFT JOIN all_tags ON all_tags.id = n.id
ORDER BY n.time_starting DESC;


CREATE INDEX IF NOT EXISTS idx_notes_time_starting ON notes(time_starting);
CREATE INDEX IF NOT EXISTS idx_note_tags_note_id ON note_tags(note_id);
CREATE INDEX IF NOT EXISTS idx_changes_note_id ON changes(note_id);