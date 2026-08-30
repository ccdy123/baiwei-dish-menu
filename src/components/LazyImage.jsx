import { useEffect, useRef, useState } from 'react'
import { resolveDishImage, fallbackDishImage } from '../lib/imageSrc.js'

// 懒加载图片：进入视口才加载；加载失败回退到带菜名的分类色块。
export default function LazyImage({ dish, alt, className = '', ...rest }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const [errored, setErrored] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) { setVisible(true); io.disconnect() }
      },
      { rootMargin: '200px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const src = errored ? fallbackDishImage(dish) : (visible ? resolveDishImage(dish) : '')

  return (
    <div ref={ref} className={`lazy-img ${className}`} {...rest}>
      {src ? (
        <img
          src={src}
          alt={alt || dish?.name}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={loaded ? 'loaded' : ''}
        />
      ) : (
        <span className="lazy-ph">🍽</span>
      )}
    </div>
  )
}
