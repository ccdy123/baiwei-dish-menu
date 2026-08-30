import { Link } from 'react-router-dom'
import { useMenu } from '../context/MenuContext.jsx'

export default function Header() {
  const { online, syncing, sync, lastSync, cartCount } = useMenu()

  const fmt = (ts) => {
    if (!ts) return '尚未同步'
    const d = new Date(ts)
    return `已同步 ${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="brand">
          <span className="brand-emoji">🥘</span>
          <span className="brand-text">家味点菜<small>在线家常菜谱</small></span>
        </Link>
        <nav className="top-nav">
          <Link to="/" end>首页</Link>
          <Link to="/catalog">菜谱</Link>
          <Link to="/favorites">收藏</Link>
          <Link to="/cart">点菜单{cartCount > 0 && <em className="nav-badge">{cartCount}</em>}</Link>
          <Link to="/sync">数据中心</Link>
        </nav>
        <button
          className={`sync-btn ${syncing ? 'spin' : ''} ${online ? '' : 'offline'}`}
          onClick={() => sync()}
          title={fmt(lastSync)}
        >
          <span className="sb-ico">{syncing ? '🔄' : '☁️'}</span>
          <span className="sb-txt">{syncing ? '同步中' : online ? '同步' : '离线'}</span>
          <i className={`sb-dot ${online ? 'on' : 'off'}`} />
        </button>
      </div>
    </header>
  )
}
