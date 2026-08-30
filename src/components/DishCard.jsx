import { Link } from 'react-router-dom'
import { useMenu } from '../context/MenuContext.jsx'
import { labelOf } from '../data/taxonomy.js'
import LazyImage from './LazyImage.jsx'

export default function DishCard({ dish }) {
  const { isFavorite, toggleFavorite, addToCart, cartQty } = useMenu()
  const fav = isFavorite(dish.id)
  const qty = cartQty(dish.id)

  return (
    <article className="dish-card">
      <Link to={`/dish/${dish.id}`} className="dish-thumb">
        <LazyImage dish={dish} alt={dish.name} />
        <span className={`dish-badge fav ${fav ? 'on' : ''}`} onClick={(e) => {
          e.preventDefault(); e.stopPropagation(); toggleFavorite(dish.id)
        }} title={fav ? '取消收藏' : '收藏'}>{fav ? '❤️' : '🤍'}</span>
        <span className="dish-badge diff">{labelOf('difficulty', dish.difficulty)}</span>
      </Link>
      <div className="dish-body">
        <Link to={`/dish/${dish.id}`} className="dish-name" title={dish.name}>{dish.name}</Link>
        <div className="dish-meta">
          <span>⏱ {dish.time}分</span>
          <span>🔥 {dish.calories}千卡</span>
          <span className="dish-rate">★ {dish.rating?.toFixed(1)}</span>
        </div>
        <div className="dish-tags">
          <span className="tag">{labelOf('cuisine', dish.cuisine)}</span>
          <span className="tag">{labelOf('method', dish.method)}</span>
          {(dish.taste || []).slice(0, 2).map((t) => (
            <span className="tag" key={t}>{labelOf('taste', t)}</span>
          ))}
        </div>
        <div className="dish-actions">
          <button
            className={`btn-add ${qty > 0 ? 'has' : ''}`}
            onClick={() => addToCart(dish.id)}
          >
            {qty > 0 ? `已点 ${qty} 份 ＋` : '加入点菜单'}
          </button>
        </div>
      </div>
    </article>
  )
}
