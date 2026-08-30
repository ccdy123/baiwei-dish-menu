import { useState } from 'react'
import { useMenu } from '../context/MenuContext.jsx'
import SearchBar from '../components/SearchBar.jsx'
import FilterPanel from '../components/FilterPanel.jsx'
import DishGrid from '../components/DishGrid.jsx'

export default function CatalogPage() {
  const { filtered, sort, setSort } = useMenu()
  const [showFilter, setShowFilter] = useState(false)

  return (
    <div className="catalog-page">
      <div className="catalog-toolbar">
        <button className="filter-toggle" onClick={() => setShowFilter((v) => !v)}>
          <span>🎛</span> 筛选
        </button>
        <SearchBar />
        <div className="sort">
          <label>排序</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="rating">评分高→低</option>
            <option value="calories">热量低→高</option>
            <option value="time">用时短→长</option>
            <option value="name">菜名</option>
          </select>
        </div>
      </div>

      <div className={`catalog-layout ${showFilter ? 'show-filter' : ''}`}>
        <FilterPanel onNavigate={() => setShowFilter(false)} />
        <div className="catalog-main">
          <DishGrid dishes={filtered} />
        </div>
      </div>

      {showFilter && <div className="filter-overlay" onClick={() => setShowFilter(false)} />}
    </div>
  )
}
