import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import favicon from './assets/icon-32.png'

const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
if (link) {
  link.href = favicon
} else {
  const el = document.createElement('link')
  el.rel = 'icon'
  el.type = 'image/png'
  el.href = favicon
  document.head.appendChild(el)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
