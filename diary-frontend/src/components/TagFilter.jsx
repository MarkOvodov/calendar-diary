export default function TagFilter({ tags, selectedTag, onSelectTag }) {
  return (
    <div className="tag-filter">
      <button className={`filter-btn${selectedTag === null ? " active" : ""}`} onClick={() => onSelectTag(null)}>
        Все
      </button>
      {tags.map(tag => (
        <button
          key={tag.id}
          className={`filter-btn${selectedTag === tag.tag_title ? " active" : ""}`}
          onClick={() => onSelectTag(tag.tag_title)}
        >
          {tag.tag_title}
        </button>
      ))}
    </div>
  )
}
