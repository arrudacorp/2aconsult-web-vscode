import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'  // ← Mudar de @/App.jsx para ./App
import './index.css'     // ← Mudar de @/index.css para ./index.css
import { setupBase44Interceptor } from './lib/base44-interceptor'

// Ativa o interceptor ANTES de renderizar
setupBase44Interceptor()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)