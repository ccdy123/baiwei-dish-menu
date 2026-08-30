import { useMenu } from '../context/MenuContext.jsx'

export default function SearchBar() {
  const { search, setSearch, total, filtered, clearFilters } = useMenu()
  return (
    <div className="search-bar">
      <div className="search-input">
        <span className="si-ico">🔍</span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索菜名、食材，如：红烧肉、番茄、鸡丁…"
          aria-label="搜索菜品"
        />
        {search && <button className="si-clear" onClick={() => setSearch('')} aria-label="清除搜索">✕</button>}
      </div>
      <div className="search-info">
        共 {total} 道菜 · 当前 {filtered.length} 道
      </div>
    </div>
  )
}
