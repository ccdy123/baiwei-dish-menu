// 数据同步服务
// - 本地内置 CORE_DISHES 作为离线基线（断网即可浏览）
// - 远程「服务器」用 EXTENDED_DISHES 模拟，提供版本号 + 每条记录的 rev
// - 客户端按版本号决定是否拉取，按 rev 做增量合并，结果写入 IndexedDB 缓存
// - 用户数据（收藏/购物车/自定义菜/设置）走 localStorage；备份/恢复可整体导出导入

import { CORE_DISHES } from '../data/dishes.js'
import { EXTENDED_DISHES } from '../data/dishes_extended.js'
import { cacheDishes, getCachedDishes } from './db.js'
import { META, USER } from './storage.js'

// 模拟远程服务器：EXTENDED_DISHES + rev + updatedAt
const remoteCatalog = EXTENDED_DISHES.map((d, i) => ({
  ...d,
  rev: 1,
  updatedAt: Date.now() - (EXTENDED_DISHES.length - i) * 1000
}))
let remoteVersion = 1

export function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

function delay(ms) { return new Promise((r) => setTimeout(r, ms)) }

export async function fetchRemoteVersion() {
  await delay(150 + Math.random() * 200)
  return remoteVersion
}

export async function fetchRemoteCatalog() {
  await delay(300 + Math.random() * 400)
  return remoteCatalog.map((d) => ({ ...d }))
}

/**
 * 增量同步：合并远程变更到本地缓存
 */
export async function syncDishes() {
  if (!isOnline()) {
    // 断网降级：返回本地缓存
    const cached = await getCachedDishes()
    return {
      new: 0, updated: 0, unchanged: cached.length,
      total: cached.length, version: META.getVersion(), offline: true, merged: cached
    }
  }

  const lastVersion = META.getVersion()
  const remoteVer = await fetchRemoteVersion()
  const remote = await fetchRemoteCatalog()

  // 以本地缓存为基线（首次同步时缓存为空，用内置 CORE 补齐）
  const localAll = await getCachedDishes()
  const baseline = localAll.length ? localAll : CORE_DISHES.slice()
  const baseMap = new Map(baseline.map((d) => [d.id, { ...d }]))

  let newCount = 0, updated = 0, unchanged = 0
  const mergedSet = new Map()

  // 合并远程记录（增量：按 rev 比较）
  for (const r of remote) {
    const ex = baseMap.get(r.id)
    if (!ex) { mergedSet.set(r.id, r); newCount++ }
    else if ((r.rev || 0) > (ex.rev || 0)) { mergedSet.set(r.id, r); updated++ }
    else { mergedSet.set(r.id, ex); unchanged++ }
  }
  // 补齐本地基线中未被远程覆盖的记录
  for (const d of baseline) if (!mergedSet.has(d.id)) mergedSet.set(d.id, d)

  const merged = Array.from(mergedSet.values())
  await cacheDishes(merged)
  META.setVersion(remoteVer)
  META.setLastSync(Date.now())

  return {
    new: newCount, updated, unchanged,
    total: merged.length, version: remoteVer, offline: false, merged,
    skipped: lastVersion === remoteVer // 版本未变可视为可跳过
  }
}

/**
 * 模拟服务器实时推送一条新菜（演示增量更新能力）
 */
export async function pushRemoteUpdate(dish) {
  remoteVersion += 1
  const rec = {
    ...dish,
    id: dish.id || Date.now(),
    rev: (dish.rev || 1) + 1,
    updatedAt: Date.now()
  }
  remoteCatalog.push(rec)
  return rec
}

// —— 备份 / 恢复（整体导出导入 JSON） ——
export async function exportBackup() {
  const dishes = await getCachedDishes()
  return {
    app: 'home-cooking-menu',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      dishes,
      favorites: USER.getFavorites(),
      cart: USER.getCart(),
      customDishes: USER.getCustomDishes(),
      settings: USER.getSettings(),
      meta: { catalogVersion: META.getVersion(), lastSyncAt: META.getLastSync() }
    }
  }
}

export async function importBackup(file) {
  const text = await (file.text ? file.text() : file)
  const obj = JSON.parse(text)
  if (!obj || !obj.data || !Array.isArray(obj.data.dishes)) throw new Error('备份文件格式不正确')
  const { dishes, favorites, cart, customDishes, settings, meta } = obj.data
  await cacheDishes(dishes)
  if (Array.isArray(favorites)) USER.setFavorites(favorites)
  if (Array.isArray(cart)) USER.setCart(cart)
  if (Array.isArray(customDishes)) USER.setCustomDishes(customDishes)
  if (settings) USER.setSettings(settings)
  if (meta) {
    if (typeof meta.catalogVersion === 'number') META.setVersion(meta.catalogVersion)
    if (meta.lastSyncAt) META.setLastSync(meta.lastSyncAt)
  }
  return {
    dishes: dishes.length, favorites: favorites?.length || 0,
    cart: cart?.length || 0, customDishes: customDishes?.length || 0
  }
}

export function getLastSyncAt() { return META.getLastSync() }
export function getCatalogVersion() { return META.getVersion() }
