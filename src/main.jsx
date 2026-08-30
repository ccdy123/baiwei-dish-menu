import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { MenuProvider } from './context/MenuContext.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <MenuProvider>
        <App />
      </MenuProvider>
    </HashRouter>
  </React.StrictMode>
)

// 注册 Service Worker：运行时缓存静态资源与图片，断网可继续浏览
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  })
}
