import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { FavoritesProvider } from './context/FavoritesContext'
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('No se encontró el elemento #root en index.html')
}

createRoot(rootElement).render(
  <StrictMode>
    <HashRouter>
      <FavoritesProvider>
        <App />
      </FavoritesProvider>
    </HashRouter>
  </StrictMode>,
)
