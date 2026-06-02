export default function TagFilter({ tags, selectedTag, onSelectTag }) {
    return (
        <div>
            <button
                onClick={() => onSelectTag(null)}
                style={{fontWeight: selectedTag === null ? "bold" : "normal"}}
            >
                Все
            </button>
            {tags.map(tag => (
                <button
                    key={tag.id}
                    onClick={() => onSelectTag(tag.tag_title)}
                    style={{fontWeight: selectedTag === tag.tag_title ? "bold" : "normal"}}
                >
                    {tag.tag_title}
                </button>
            ))}
        </div>
    )
}
