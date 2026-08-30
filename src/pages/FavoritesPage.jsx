import { Link } from 'react-router-dom'
import { useMenu } from '../context/MenuContext.jsx'
import DishGrid from '../components/DishGrid.jsx'

export default function FavoritesPage() {
  const { allDishes, favorites } = useMenu()
  const favDishes = allDishes.filter((d) => favorites.includes(d.id))

  return (
    <div className="page">
      <div className="page-head">
        <h1 className="page-title">❤️ 我的收藏</h1>
        <p className="page-sub">收藏的菜品保存在本地，断网也能查看</p>
      </div>
      <DishGrid dishes={favDishes} emptyText="还没有收藏任何菜品，去逛逛吧～" />
      {favDishes.length === 0 && (
        <div className="center-link"><Link to="/catalog" className="btn-primary">去发现美味 →</Link></div>
      )}
    </div>
  )
}
