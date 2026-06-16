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

const splash = document.getElementById('splash')
const msgEl = document.getElementById('splash-msg')
const dotsEl = document.getElementById('splash-dots')

const messages = ['Loading workspace', 'Preparing editor', 'Starting']
let msgIdx = 0
let dotCount = 1

if (dotsEl) {
  setInterval(() => {
    dotCount = dotCount >= 3 ? 1 : dotCount + 1
    dotsEl.textContent = '.'.repeat(dotCount)
  }, 500)
}

if (msgEl) {
  setInterval(() => {
    msgIdx = (msgIdx + 1) % messages.length
    msgEl.textContent = messages[msgIdx]
  }, 800)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

setTimeout(() => {
  if (dotsEl) dotsEl.textContent = ''
  splash?.classList.add('fade-out')
  setTimeout(() => splash?.classList.add('hidden'), 300)
}, 2500)
