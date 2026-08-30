import { useState, useRef } from 'react'
import { useMenu } from '../context/MenuContext.jsx'
import { exportBackup, importBackup } from '../lib/sync.js'
import { TAXONOMY } from '../data/taxonomy.js'

export default function SyncPage() {
  const {
    online, syncing, sync, lastSync, catalogVersion, allDishes,
    customDishes, addCustomDish, removeCustomDish, simulateRemoteUpdate
  } = useMenu()

  const [report, setReport] = useState(null)
  const [restoreMsg, setRestoreMsg] = useState('')
  const [form, setForm] = useState({
    name: '', cuisine: 'home', method: 'stir_fry', ingredient: 'meat',
    taste: 'salty', scene: 'dinner', difficulty: 'easy',
    time: 20, calories: 300, ingredients: '', desc: '', tips: ''
  })

  const fileRef = useRef()

  const doSync = async () => {
    const r = await sync()
    setReport(r)
  }

  const doExport = async () => {
    const data = await exportBackup()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `home-cooking-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const doImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const r = await importBackup(file)
      setRestoreMsg(`✅ 恢复成功：${r.dishes} 道菜，${r.favorites} 收藏，${r.cart} 购物车项`)
      await sync()
    } catch (err) {
      setRestoreMsg(`❌ 恢复失败：${err.message}`)
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const submitCustom = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    addCustomDish({
      name: form.name.trim(),
      cuisine: form.cuisine, method: form.method, ingredient: form.ingredient,
      taste: [form.taste], scene: [form.scene], difficulty: form.difficulty,
      time: Number(form.time) || 20, calories: Number(form.calories) || 0,
      ingredients: form.ingredients.split(/[，,、\s]+/).filter(Boolean),
      desc: form.desc || '自定义菜品', tips: form.tips || '按个人喜好烹饪即可',
      rating: 4.5
    })
    setForm((f) => ({ ...f, name: '', ingredients: '', desc: '', tips: '' }))
  }

  const doSimUpdate = async () => {
    await simulateRemoteUpdate({
      name: '新式时蔬小炒', cuisine: 'home', method: 'stir_fry', ingredient: 'vegetable',
      taste: ['salty','light'], scene: ['dinner'], difficulty: 'easy',
      time: 12, calories: 90, rating: 4.5,
      ingredients: ['时令蔬菜','蒜末','盐'],
      desc: '选用当季时蔬大火快炒，加蒜末提香，清淡爽脆、营养健康。',
      tips: '蔬菜含水不同，全程大火快炒保持脆嫩。'
    })
    setReport({ new: 1, updated: 0, unchanged: 0, version: (catalogVersion || 1) + 1, offline: false, total: allDishes.length + 1 })
  }

  return (
    <div className="page sync-page">
      <div className="page-head">
        <h1 className="page-title">☁️ 数据中心</h1>
        <p className="page-sub">数据同步 · 备份恢复 · 离线缓存 · 自定义菜品</p>
      </div>

      <section className="data-card">
        <h3>同步状态</h3>
        <div className="ds-grid">
          <div className="ds-item">
            <span className="ds-label">网络</span>
            <b className={online ? 'green' : 'red'}>{online ? '🟢 在线' : '🔴 离线'}</b>
          </div>
          <div className="ds-item">
            <span className="ds-label">目录版本</span>
            <b>v{catalogVersion ?? '—'}</b>
          </div>
          <div className="ds-item">
            <span className="ds-label">本地菜品</span>
            <b>{allDishes.length} 道</b>
          </div>
          <div className="ds-item">
            <span className="ds-label">上次同步</span>
            <b>{lastSync ? new Date(lastSync).toLocaleString('zh-CN') : '尚未同步'}</b>
          </div>
        </div>
        <div className="ds-actions">
          <button className="btn-primary" onClick={doSync} disabled={syncing || !online}>
            {syncing ? '同步中…' : '立即同步'}
          </button>
          <button className="btn-ghost" onClick={doSimUpdate} disabled={syncing}>模拟服务器推送新菜</button>
        </div>
        {report && (
          <div className={`sync-report ${report.offline ? 'off' : ''}`}>
            {report.offline
              ? `⚠ 断网模式：使用本地缓存 ${report.total} 道菜，恢复网络后可同步。`
              : `✅ 同步完成：新增 ${report.new} · 更新 ${report.updated} · 未变 ${report.unchanged} · 共 ${report.total} 道（v${report.version}）`}
          </div>
        )}
      </section>

      <section className="data-card">
        <h3>备份与恢复</h3>
        <p className="card-tip">导出包含菜品目录、收藏、购物车与自定义菜，可跨设备迁移或归档保存。</p>
        <div className="ds-actions">
          <button className="btn-primary" onClick={doExport}>⬇ 导出备份</button>
          <button className="btn-ghost" onClick={() => fileRef.current?.click()}>⬆ 恢复备份</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={doImport} />
        </div>
        {restoreMsg && <div className="sync-report">{restoreMsg}</div>}
      </section>

      <section className="data-card">
        <h3>自定义菜品</h3>
        <p className="card-tip">添加你的私家菜，保存后即可和其它菜品一样筛选、点菜、收藏。</p>
        <form className="custom-form" onSubmit={submitCustom}>
          <div className="cf-row">
            <input className="cf-full" placeholder="菜名 *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="cf-row">
            {TAXONOMY.map((dim) => (
              <label className="cf-field" key={dim.field}>
                <span>{dim.label}</span>
                <select value={form[dim.field]} onChange={(e) => setForm({ ...form, [dim.field]: e.target.value })}>
                  {dim.options.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                </select>
              </label>
            ))}
          </div>
          <div className="cf-row">
            <label className="cf-field"><span>时间(分)</span><input type="number" min="1" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></label>
            <label className="cf-field"><span>热量(千卡)</span><input type="number" min="0" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} /></label>
          </div>
          <div className="cf-row">
            <input className="cf-full" placeholder="主要食材，逗号分隔" value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} />
          </div>
          <div className="cf-row">
            <textarea className="cf-full" placeholder="做法说明" rows="2" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
          </div>
          <div className="cf-row">
            <textarea className="cf-full" placeholder="烹饪小贴士" rows="2" value={form.tips} onChange={(e) => setForm({ ...form, tips: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary">＋ 添加私家菜</button>
        </form>

        {customDishes.length > 0 && (
          <div className="custom-list">
            <h4>已添加 {customDishes.length} 道</h4>
            {customDishes.map((d) => (
              <div className="custom-row" key={d.id}>
                <span className="cr-name">{d.name}</span>
                <span className="cr-meta">{d.cuisine} · {d.time}分 · {d.calories}千卡</span>
                <button className="cr-del" onClick={() => removeCustomDish(d.id)}>删除</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
