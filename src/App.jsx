import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { useMenu } from './context/MenuContext.jsx'
import Header from './components/Header.jsx'
import HomePage from './pages/HomePage.jsx'
import CatalogPage from './pages/CatalogPage.jsx'
import DishDetailPage from './pages/DishDetailPage.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'
import CartPage from './pages/CartPage.jsx'
import SyncPage from './pages/SyncPage.jsx'

function BottomNav() {
  const { cartCount, online } = useMenu()
  const item = ({ isActive }) => `bn-item ${isActive ? 'active' : ''}`
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={item} end>
        <span className="bn-ico">🏠</span><span>首页</span>
      </NavLink>
      <NavLink to="/catalog" className={item}>
        <span className="bn-ico">🍳</span><span>菜谱</span>
      </NavLink>
      <NavLink to="/favorites" className={item}>
        <span className="bn-ico">❤️</span><span>收藏</span>
      </NavLink>
      <NavLink to="/cart" className={item}>
        <span className="bn-ico">🛒</span><span>点菜</span>
        {cartCount > 0 && <em className="bn-badge">{cartCount}</em>}
      </NavLink>
      <NavLink to="/sync" className={item}>
        <span className="bn-ico">☁️</span><span>数据</span>
        <i className={`bn-dot ${online ? 'on' : 'off'}`} />
      </NavLink>
    </nav>
  )
}

export default function App() {
  const loc = useLocation()
  return (
    <div className="app">
      <Header />
      <main className={`main ${loc.pathname === '/' ? 'home' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/dish/:id" element={<DishDetailPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/sync" element={<SyncPage />} />
        </Routes>
      </main>
      <BottomNav />
      <footer className="footer">
        <p>家味点菜 · 在线家常菜谱应用 · 数据可离线缓存与跨设备同步</p>
        <p className="footer-sub">本应用菜谱数据来源于公开家常菜做法整理，图片部分为本地实拍 / AI 生成，仅供学习交流。</p>
      </footer>
    </div>
  )
}
