import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { CORE_DISHES } from '../data/dishes.js'
import { EXTENDED_DISHES } from '../data/dishes_extended.js'
import { USER } from '../lib/storage.js'
import { getCachedDishes } from '../lib/db.js'
import { syncDishes as runSync, pushRemoteUpdate, isOnline } from '../lib/sync.js'

const MenuContext = createContext(null)
export const useMenu = () => useContext(MenuContext)

// 合并去重：按 id 后者覆盖前者
function mergeById(...arrays) {
  const map = new Map()
  for (const arr of arrays) for (const d of arr || []) map.set(d.id, { ...d })
  return Array.from(map.values())
}

const EMPTY_FILTERS = {
  cuisine: [], method: [], ingredient: [], taste: [], scene: [], difficulty: []
}

export function MenuProvider({ children }) {
  const [dishes, setDishes] = useState(() => mergeById(CORE_DISHES, EXTENDED_DISHES))
  const [favorites, setFavorites] = useState(() => USER.getFavorites())
  const [cart, setCart] = useState(() => USER.getCart())
  const [customDishes, setCustomDishes] = useState(() => USER.getCustomDishes())
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('rating')
  const [online, setOnline] = useState(isOnline())
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(null)
  const [catalogVersion, setCatalogVersion] = useState(null)

  // 持久化用户数据
  useEffect(() => { USER.setFavorites(favorites) }, [favorites])
  useEffect(() => { USER.setCart(cart) }, [cart])
  useEffect(() => { USER.setCustomDishes(customDishes) }, [customDishes])

  // 监听网络状态
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  // 启动时尝试用 IndexedDB 缓存覆盖（断网也能用远程已同步的数据）
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const cached = await getCachedDishes()
        if (!cancelled && cached.length) {
          setDishes(mergeById(CORE_DISHES, cached, customDishes))
        }
      } catch { /* 忽略，使用内置基线 */ }
    })()
    return () => { cancelled = true }
  }, [customDishes])

  const allDishes = useMemo(
    () => mergeById(dishes, customDishes),
    [dishes, customDishes]
  )

  // —— 过滤 + 搜索 + 排序 ——
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = allDishes.filter((d) => {
      if (filters.cuisine.length && !filters.cuisine.includes(d.cuisine)) return false
      if (filters.method.length && !filters.method.includes(d.method)) return false
      if (filters.ingredient.length && !filters.ingredient.includes(d.ingredient)) return false
      if (filters.taste.length && !filters.taste.some((t) => (d.taste || []).includes(t))) return false
      if (filters.scene.length && !filters.scene.some((s) => (d.scene || []).includes(s))) return false
      if (filters.difficulty.length && !filters.difficulty.includes(d.difficulty)) return false
      if (q) {
        const hay = `${d.name} ${d.desc} ${(d.ingredients || []).join(' ')}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    const sorters = {
      rating: (a, b) => (b.rating || 0) - (a.rating || 0),
      calories: (a, b) => (a.calories || 0) - (b.calories || 0),
      time: (a, b) => (a.time || 0) - (b.time || 0),
      name: (a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN')
    }
    list = list.slice().sort(sorters[sort] || sorters.rating)
    return list
  }, [allDishes, filters, search, sort])

  // —— 过滤操作 ——
  const toggleFilter = useCallback((dim, key) => {
    setFilters((f) => {
      const arr = f[dim] || []
      const has = arr.includes(key)
      return { ...f, [dim]: has ? arr.filter((k) => k !== key) : [...arr, key] }
    })
  }, [])
  const clearFilters = useCallback(() => setFilters(EMPTY_FILTERS), [])

  // —— 收藏 ——
  const isFavorite = useCallback((id) => favorites.includes(id), [favorites])
  const toggleFavorite = useCallback((id) => {
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))
  }, [])

  // —— 购物车（点菜） ——
  const cartCount = useMemo(() => cart.reduce((s, c) => s + c.qty, 0), [cart])
  const cartQty = useCallback((id) => cart.find((c) => c.id === id)?.qty || 0, [cart])
  const addToCart = useCallback((id, qty = 1) => {
    setCart((c) => {
      const ex = c.find((x) => x.id === id)
      if (ex) return c.map((x) => (x.id === id ? { ...x, qty: x.qty + qty } : x))
      return [...c, { id, qty }]
    })
  }, [])
  const setCartQty = useCallback((id, qty) => {
    setCart((c) => {
      if (qty <= 0) return c.filter((x) => x.id !== id)
      const ex = c.find((x) => x.id === id)
      if (ex) return c.map((x) => (x.id === id ? { ...x, qty } : x))
      return [...c, { id, qty }]
    })
  }, [])
  const removeFromCart = useCallback((id) => setCart((c) => c.filter((x) => x.id !== id)), [])
  const clearCart = useCallback(() => setCart([]), [])

  // —— 自定义菜品 ——
  const addCustomDish = useCallback((dish) => {
    const rec = { id: Date.now(), img: '', rating: 4.5, ...dish }
    setCustomDishes((c) => [...c, rec])
    return rec
  }, [])
  const removeCustomDish = useCallback((id) => setCustomDishes((c) => c.filter((d) => d.id !== id)), [customDishes])

  // —— 同步 ——
  const sync = useCallback(async () => {
    setSyncing(true)
    try {
      const res = await runSync()
      if (res.merged) setDishes(mergeById(CORE_DISHES, res.merged, customDishes))
      setLastSync(Date.now())
      setCatalogVersion(res.version)
      return res
    } finally {
      setSyncing(false)
    }
  }, [customDishes])

  // 模拟服务器实时推送新菜（演示增量更新）
  const simulateRemoteUpdate = useCallback(async (dish) => {
    const rec = await pushRemoteUpdate(dish)
    await sync()
    return rec
  }, [sync])

  const value = {
    allDishes, filtered, total: allDishes.length,
    filters, toggleFilter, clearFilters, search, setSearch, sort, setSort,
    favorites, isFavorite, toggleFavorite,
    cart, cartCount, cartQty, addToCart, setCartQty, removeFromCart, clearCart,
    customDishes, addCustomDish, removeCustomDish,
    online, syncing, sync, simulateRemoteUpdate, lastSync, catalogVersion,
    getDishById: (id) => allDishes.find((d) => d.id === Number(id))
  }

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}
