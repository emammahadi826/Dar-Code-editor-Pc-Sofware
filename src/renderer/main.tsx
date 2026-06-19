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

// Splash video chroma key + watermark
let splashTimer: number | undefined
let animFrameId: number | null = null

function hideSplash() {
  if (dotsEl) dotsEl.textContent = ''
  splash?.classList.add('fade-out')
  if (animFrameId != null) cancelAnimationFrame(animFrameId)
  setTimeout(() => splash?.classList.add('hidden'), 300)
}

const canvas = document.getElementById('splash-canvas') as HTMLCanvasElement
const ctx = canvas?.getContext('2d')

if (canvas && ctx) {
  const video = document.createElement('video')
  video.src = '/video.mp4?t=' + Date.now()
  video.loop = false
  video.muted = true
  video.playsInline = true

  let frameSkip = 0

  function processFrame() {
    animFrameId = requestAnimationFrame(processFrame)
    if (video.paused || video.ended) return
    frameSkip++
    if (frameSkip % 3 !== 0) return

    if (video.videoWidth && video.videoHeight) {
      const maxW = Math.min(window.innerWidth * 0.4, 450)
      const scale = maxW / video.videoWidth
      const w = Math.round(maxW)
      const h = Math.round(video.videoHeight * scale)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }

      ctx.drawImage(video, 0, 0, w, h)

      ctx.fillStyle = '#00ff00'
      const wmW = Math.round(w * 0.28)
      const wmH = Math.round(h * 0.09)
      ctx.fillRect(w - wmW, h - wmH, wmW, wmH)

      const imageData = ctx.getImageData(0, 0, w, h)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2]
        if (g > r + 20 && g > b + 20 && r < 120 && b < 120) {
          data[i + 3] = 0
        }
      }
      ctx.putImageData(imageData, 0, 0)
    }
  }

  video.addEventListener('loadedmetadata', () => {
    if (splashTimer != null) clearTimeout(splashTimer)
    splashTimer = window.setTimeout(hideSplash, video.duration * 1000 + 3000)
  })

  video.addEventListener('ended', hideSplash)
  video.addEventListener('play', () => {
    canvas.classList.add('visible')
    processFrame()
  })
  video.play().catch(() => {})
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

splashTimer = window.setTimeout(hideSplash, 2500)
