import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {registerSW} from 'virtual:pwa-register'
import { LanguageProvider } from './context/LanguageContext'

registerSW({
  immediate: true,
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>,
)
