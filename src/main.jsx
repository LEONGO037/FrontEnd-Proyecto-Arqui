import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { injectTheme } from './theme.js'
import './index.css'
import App from './App.jsx'

// Inject global form-control overrides before first render.
// Ensures white bg + dark text on all inputs/selects regardless of OS colour scheme.
injectTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
