// localStorage 轻封装：用于收藏、购物车、自定义菜、设置等小体量用户数据。
// 索引库（IndexedDB）专门缓存菜品目录，二者分工。

const PREFIX = 'hcm:'

export function lsGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function lsSet(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function lsRemove(key) {
  try { localStorage.removeItem(PREFIX + key) } catch {}
}

// 用户数据便捷读写
export const USER = {
  getFavorites: () => lsGet('favorites', []),
  setFavorites: (v) => lsSet('favorites', v),
  getCart: () => lsGet('cart', []),
  setCart: (v) => lsSet('cart', v),
  getCustomDishes: () => lsGet('customDishes', []),
  setCustomDishes: (v) => lsSet('customDishes', v),
  getSettings: () => lsGet('settings', {}),
  setSettings: (v) => lsSet('settings', v)
}

export const META = {
  getLastSync: () => lsGet('lastSyncAt', null),
  setLastSync: (v) => lsSet('lastSyncAt', v),
  getVersion: () => lsGet('catalogVersion', 0),
  setVersion: (v) => lsSet('catalogVersion', v)
}
