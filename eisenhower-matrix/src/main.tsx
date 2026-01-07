import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { TaskProvider } from './contexts/TaskContext.tsx'
import { UIProvider } from './contexts/UIContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <TaskProvider>
        <UIProvider>
          <App />
        </UIProvider>
      </TaskProvider>
    </AuthProvider>
  </StrictMode>,
)
