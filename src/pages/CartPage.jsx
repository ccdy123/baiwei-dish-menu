import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMenu } from '../context/MenuContext.jsx'
import LazyImage from '../components/LazyImage.jsx'

export default function CartPage() {
  const { cart, allDishes, setCartQty, removeFromCart, clearCart } = useMenu()
  const [ordered, setOrdered] = useState(false)

  const items = cart
    .map((c) => ({ ...c, dish: allDishes.find((d) => d.id === c.id) }))
    .filter((c) => c.dish)

  const totalCal = items.reduce((s, c) => s + (c.dish.calories || 0) * c.qty, 0)
  const totalTime = items.reduce((s, c) => s + (c.dish.time || 0) * c.qty, 0)
  const kinds = items.length

  const submitOrder = () => {
    const list = JSON.parse(localStorage.getItem('hcm:orders') || '[]')
    list.push({ id: Date.now(), at: new Date().toISOString(), items: items.map((c) => ({ id: c.id, name: c.dish.name, qty: c.qty })) })
    localStorage.setItem('hcm:orders', JSON.stringify(list))
    setOrdered(true)
    clearCart()
  }

  if (ordered) {
    return (
      <div className="empty-state big">
        <span>🎉</span>
        <h2>下单成功！</h2>
        <p>已加入今日菜单，祝您下厨愉快～</p>
        <div className="center-link">
          <Link to="/catalog" className="btn-primary">继续点菜</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page cart-page">
      <div className="page-head">
        <h1 className="page-title">🛒 点菜单</h1>
        <p className="page-sub">把想做的菜加进来，一键生成今日菜单</p>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <span>🍽</span>
          <p>点菜单还是空的</p>
          <Link to="/catalog" className="btn-primary">去点菜 →</Link>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {items.map((c) => (
              <div className="cart-item" key={c.id}>
                <Link to={`/dish/${c.id}`} className="cart-thumb"><LazyImage dish={c.dish} alt={c.dish.name} /></Link>
                <div className="cart-info">
                  <Link to={`/dish/${c.id}`} className="cart-name">{c.dish.name}</Link>
                  <div className="cart-meta">
                    <span>🔥 {c.dish.calories}千卡</span><span>⏱ {c.dish.time}分</span>
                  </div>
                </div>
                <div className="cart-ctrl">
                  <button onClick={() => setCartQty(c.id, c.qty - 1)}>－</button>
                  <span>{c.qty}</span>
                  <button onClick={() => setCartQty(c.id, c.qty + 1)}>＋</button>
                </div>
                <button className="cart-del" onClick={() => removeFromCart(c.id)} title="移除">✕</button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="cs-row">
              <span>菜品数</span><b>{kinds} 种</b>
            </div>
            <div className="cs-row">
              <span>合计热量</span><b>{totalCal} 千卡</b>
            </div>
            <div className="cs-row">
              <span>预计用时</span><b>约 {totalTime} 分钟</b>
            </div>
            <div className="cs-actions">
              <button className="btn-ghost" onClick={clearCart}>清空</button>
              <button className="btn-primary big" onClick={submitOrder}>确认下单</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
