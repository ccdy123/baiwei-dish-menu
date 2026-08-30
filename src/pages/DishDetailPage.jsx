import { useParams, Link, useNavigate } from 'react-router-dom'
import { useMenu } from '../context/MenuContext.jsx'
import { labelOf } from '../data/taxonomy.js'
import LazyImage from '../components/LazyImage.jsx'
import DishGrid from '../components/DishGrid.jsx'

export default function DishDetailPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { getDishById, allDishes, isFavorite, toggleFavorite, addToCart, cartQty } = useMenu()
  const dish = getDishById(id)

  if (!dish) {
    return (
      <div className="empty-state">
        <span>🍽</span>
        <p>没有找到这道菜</p>
        <Link to="/catalog" className="btn-primary">返回菜谱</Link>
      </div>
    )
  }

  const related = allDishes.filter((d) => d.id !== dish.id && d.cuisine === dish.cuisine).slice(0, 6)
  const qty = cartQty(dish.id)

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => nav(-1)}>← 返回</button>
      <div className="detail-top">
        <div className="detail-img">
          <LazyImage dish={dish} alt={dish.name} />
        </div>
        <div className="detail-info">
          <h1>{dish.name}</h1>
          <div className="detail-tags">
            <span className="tag lg">{labelOf('cuisine', dish.cuisine)}</span>
            <span className="tag lg">{labelOf('method', dish.method)}</span>
            <span className="tag lg">{labelOf('ingredient', dish.ingredient)}</span>
            <span className="tag lg">{labelOf('difficulty', dish.difficulty)}</span>
            {(dish.taste || []).map((t) => <span className="tag lg accent" key={t}>{labelOf('taste', t)}</span>)}
            {(dish.scene || []).map((s) => <span className="tag lg" key={s}>{labelOf('scene', s)}</span>)}
          </div>

          <div className="detail-stats">
            <div className="stat"><b>{dish.time}</b><span>分钟</span></div>
            <div className="stat"><b>{dish.calories}</b><span>千卡/份</span></div>
            <div className="stat"><b>★ {dish.rating?.toFixed(1)}</b><span>评分</span></div>
          </div>

          <div className="detail-nutrition">
            <h4>营养特点</h4>
            <p>{dish.nutrition}</p>
          </div>

          <div className="detail-ingredients">
            <h4>主要食材</h4>
            <div className="ing-chips">
              {(dish.ingredients || []).map((i) => <span className="ing" key={i}>{i}</span>)}
            </div>
          </div>

          <div className="detail-buy">
            <div className="qty">
              <button onClick={() => addToCart(dish.id, -1)} disabled={qty <= 0}>－</button>
              <span>{qty}</span>
              <button onClick={() => addToCart(dish.id, 1)}>＋</button>
            </div>
            <button className="btn-primary big" onClick={() => addToCart(dish.id, 1)}>
              {qty > 0 ? `再点一份（已 ${qty}）` : '加入点菜单'}
            </button>
            <button className={`btn-ghost fav ${isFavorite(dish.id) ? 'on' : ''}`} onClick={() => toggleFavorite(dish.id)}>
              {isFavorite(dish.id) ? '❤️ 已收藏' : '🤍 收藏'}
            </button>
          </div>
        </div>
      </div>

      <section className="detail-cook">
        <h3>🍳 做法详解</h3>
        <p className="cook-desc">{dish.desc}</p>
        <h3>💡 烹饪小贴士</h3>
        <p className="cook-tips">{dish.tips}</p>
      </section>

      {related.length > 0 && (
        <section className="detail-related">
          <div className="sec-head">
            <h2 className="sec-title">同菜系推荐</h2>
            <Link to="/catalog" className="sec-more">更多 →</Link>
          </div>
          <DishGrid dishes={related} />
        </section>
      )}
    </div>
  )
}
