// ─────────────────────────────────────────────
// Настройки внешнего вида — редактируй здесь
// ─────────────────────────────────────────────

// ── Сетка времени (WeekView) ──────────────────

// Высота одной минуты в пикселях когда в этом диапазоне есть заметки
export const PX_PER_MIN_ACTIVE = 2.5

// Высота одной минуты в пикселях для пустых промежутков (сжатие)
export const PX_PER_MIN_EMPTY = 0.2

// Минимальная высота любого сегмента сетки в пикселях
export const MIN_SEGMENT_HEIGHT = 10

// Отступ сверху и снизу внутри сетки (чтобы метки времени не вылезали)
export const GRID_PADDING_Y = 12

// ── Линии сетки ───────────────────────────────

// Толщина вертикальных линий между столбцами
export const GRID_LINE_VERTICAL = "0.5px"

// Толщина горизонтальных линий — круглые часы
export const GRID_LINE_HOUR = "1px"

// Толщина горизонтальных линий — границы заметок
export const GRID_LINE_NOTE = "0.5px"

// Прозрачность линий — круглые часы (0–1)
export const GRID_LINE_HOUR_OPACITY = 0.8

// Прозрачность линий — границы заметок (0–1)
export const GRID_LINE_NOTE_OPACITY = 0.4

// ── Блоки заметок в сетке ────────────────────

// Отступ блока заметки от краёв ячейки (слева и справа)
export const NOTE_MARGIN_X = 3

// Отступ блока заметки от верха ячейки
export const NOTE_MARGIN_TOP = 2

// Внутренний отступ блока заметки
export const NOTE_PADDING = "3px 5px"

// Скругление углов блока заметки
export const NOTE_BORDER_RADIUS = 4

// Толщина левой акцентной полосы у обычной заметки
export const NOTE_BORDER_LEFT = 2

// Толщина левой акцентной полосы у события (с диапазоном времени)
export const EVENT_BORDER_LEFT = 3

// Минимальная высота блока заметки в пикселях
export const NOTE_MIN_HEIGHT = 22

// При какой высоте блока показывать содержимое (px)
export const NOTE_CONTENT_MIN_HEIGHT = 52

// ── Шрифты внутри блоков заметок ─────────────

export const NOTE_FONT_TITLE   = 11  // заголовок
export const NOTE_FONT_TAGS    = 9   // теги
export const NOTE_FONT_CONTENT = 10  // содержимое

// ── Общий макет ───────────────────────────────

// Ширина колонки времени (шкала слева)
export const TIME_COLUMN_WIDTH = 52

// Внутренний отступ страницы
export const PAGE_PADDING = 20
