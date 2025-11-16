import { createRoot } from 'react-dom/client'
import './styles/index.css'
import './styles/variables.css'
import './styles/auth.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <App />
)
