import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useMenu } from '../context/MenuContext.jsx'
import { CUISINES, INGREDIENTS, SCENES } from '../data/taxonomy.js'
import DishGrid from '../components/DishGrid.jsx'

export default function HomePage() {
  const { allDishes, toggleFilter } = useMenu()

  const featured = useMemo(
    () => [...allDishes].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 12),
    [allDishes]
  )

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <span className="hero-tag">🥢 家常菜 · 点菜神器</span>
          <h1>千道家常菜，<br />一「点」即得</h1>
          <p>多级分类 · 智能筛选 · 离线可用 · 跨设备同步。<br />从八大菜系到三餐场景，找到今日要做的那道菜。</p>
          <div className="hero-cta">
            <Link to="/catalog" className="btn-primary">开始点菜 →</Link>
            <Link to="/sync" className="btn-ghost">数据中心</Link>
          </div>
          <div className="hero-stats">
            <span><b>{allDishes.length}</b> 道菜</span>
            <span><b>8</b> 大菜系</span>
            <span><b>6</b> 维筛选</span>
            <span><b>离线</b> 可用</span>
          </div>
        </div>
      </section>

      <section className="quick">
        <h2 className="sec-title">按菜系</h2>
        <div className="quick-grid cuisine">
          {CUISINES.slice(0, 8).map((c) => (
            <Link to="/catalog" key={c.key} className="quick-card" onClick={() => toggleFilter('cuisine', c.key)}>
              <span className="qc-emoji">{c.emoji}</span>
              <span className="qc-label">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="quick">
        <h2 className="sec-title">按食/场景</h2>
        <div className="quick-grid scene">
          {INGREDIENTS.map((c) => (
            <Link to="/catalog" key={c.key} className="quick-card sm" onClick={() => toggleFilter('ingredient', c.key)}>
              <span className="qc-emoji">{c.emoji}</span>
              <span className="qc-label">{c.label}</span>
            </Link>
          )).concat(SCENES.map((c) => (
            <Link to="/catalog" key={c.key} className="quick-card sm" onClick={() => toggleFilter('scene', c.key)}>
              <span className="qc-emoji">{c.emoji}</span>
              <span className="qc-label">{c.label}</span>
            </Link>
          )))}
        </div>
      </section>

      <section className="featured">
        <div className="sec-head">
          <h2 className="sec-title">高分推荐</h2>
          <Link to="/catalog" className="sec-more">查看全部 →</Link>
        </div>
        <DishGrid dishes={featured} />
      </section>
    </div>
  )
}
