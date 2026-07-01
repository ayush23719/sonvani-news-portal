import './auth/amplify'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Buffer } from 'buffer'
import process from 'process'

import App from './app/App'
import './index.css'

declare global {
  interface Window {
    global: typeof globalThis
    Buffer: typeof Buffer
    process: typeof process
  }
}

window.global = window
window.Buffer = Buffer
window.process = process

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
