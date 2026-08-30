import DishCard from './DishCard.jsx'

export default function DishGrid({ dishes, emptyText = '没有符合条件的菜品，试试调整筛选条件～' }) {
  if (!dishes || dishes.length === 0) {
    return <div className="empty-state"><span>🥘</span><p>{emptyText}</p></div>
  }
  return (
    <div className="dish-grid">
      {dishes.map((d) => <DishCard key={d.id} dish={d} />)}
    </div>
  )
}
