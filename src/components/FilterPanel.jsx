import { useMenu } from '../context/MenuContext.jsx'
import { TAXONOMY } from '../data/taxonomy.js'

export default function FilterPanel({ onNavigate }) {
  const { filters, toggleFilter, clearFilters, filtered } = useMenu()

  const activeCount = Object.values(filters).reduce((s, arr) => s + (arr?.length || 0), 0)

  return (
    <aside className="filter-panel">
      <div className="fp-head">
        <h3>智能筛选</h3>
        {activeCount > 0 && (
          <button className="fp-clear" onClick={clearFilters}>清除({activeCount})</button>
        )}
      </div>
      <p className="fp-tip">支持多维度组合筛选，点击即可叠加/取消</p>

      {TAXONOMY.map((dim) => {
        const active = filters[dim.field] || []
        return (
          <section className="fp-group" key={dim.field}>
            <h4>{dim.label}{active.length > 0 && <em>已选 {active.length}</em>}</h4>
            <div className="fp-chips">
              {dim.options.map((opt) => {
                const on = active.includes(opt.key)
                return (
                  <button
                    key={opt.key}
                    className={`chip ${on ? 'on' : ''}`}
                    onClick={() => toggleFilter(dim.field, opt.key)}
                  >
                    <span className="chip-emoji">{opt.emoji}</span>
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}

      <div className="fp-foot">
        <span>匹配 {filtered.length} 道菜</span>
        {onNavigate && <button className="fp-go" onClick={onNavigate}>查看结果 →</button>}
      </div>
    </aside>
  )
}
