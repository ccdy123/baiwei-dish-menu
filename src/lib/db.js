// 轻量 IndexedDB 封装：用于本地缓存菜品目录、收藏、购物车等，支持断网离线访问。

const DB_NAME = 'home-cooking-db'
const DB_VERSION = 1
const STORES = {
  DISHES: 'dishes',       // 菜品目录缓存（keyPath: id）
  META: 'meta',           // 元数据（同步时间戳、版本等）
  USER: 'user'            // 用户数据：收藏/购物车/自定义菜（keyPath: key）
}

let dbPromise = null

function openDB() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB 不可用'))
      return
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORES.DISHES)) {
        db.createObjectStore(STORES.DISHES, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORES.META)) {
        db.createObjectStore(STORES.META, { keyPath: 'key' })
      }
      if (!db.objectStoreNames.contains(STORES.USER)) {
        db.createObjectStore(STORES.USER, { keyPath: 'key' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

function tx(store, mode, db) {
  return db.transaction(store, mode).objectStore(store)
}

function reqToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// —— 菜品目录缓存 ——
export async function cacheDishes(dishes) {
  const db = await openDB()
  const store = tx(STORES.DISHES, 'readwrite', db)
  store.clear()
  for (const d of dishes) store.put(d)
  await reqToPromise(store.transaction)
}

export async function getCachedDishes() {
  try {
    const db = await openDB()
    const store = tx(STORES.DISHES, 'readonly', db)
    return await reqToPromise(store.getAll())
  } catch {
    return []
  }
}

// —— 元数据 ——
export async function setMeta(key, value) {
  const db = await openDB()
  const store = tx(STORES.META, 'readwrite', db)
  await reqToPromise(store.put({ key, value }))
}

export async function getMeta(key) {
  try {
    const db = await openDB()
    const store = tx(STORES.META, 'readonly', db)
    const r = await reqToPromise(store.get(key))
    return r ? r.value : null
  } catch {
    return null
  }
}

// —— 用户数据（收藏/购物车/自定义菜/设置） ——
export async function setUser(key, value) {
  const db = await openDB()
  const store = tx(STORES.USER, 'readwrite', db)
  await reqToPromise(store.put({ key, value }))
}

export async function getUser(key) {
  try {
    const db = await openDB()
    const store = tx(STORES.USER, 'readonly', db)
    const r = await reqToPromise(store.get(key))
    return r ? r.value : null
  } catch {
    return null
  }
}

export async function clearAll() {
  const db = await openDB()
  for (const s of [STORES.DISHES, STORES.META, STORES.USER]) {
    tx(s, 'readwrite', db).clear()
  }
}

export const DB_STORES = STORES
