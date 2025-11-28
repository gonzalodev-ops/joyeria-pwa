import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { CatalogView } from './components/CatalogView.tsx'
import { ToastProvider } from './contexts/ToastContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/catalog/:id" element={<CatalogView />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </StrictMode>,
)
