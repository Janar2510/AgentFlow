import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'

// Import stores and providers
import { useThemeStore } from '@/stores/themeStore'

// Lazy load pages for better performance
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const WorkflowDesigner = lazy(() => import('@/pages/WorkflowDesigner'))
const Agents = lazy(() => import('@/pages/Agents'))
const Workflows = lazy(() => import('@/pages/Workflows'))
const Analytics = lazy(() => import('@/pages/Analytics'))
const Settings = lazy(() => import('@/pages/Settings'))
const Login = lazy(() => import('@/pages/Login'))

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex-center">
    <div className="loading-spinner"></div>
  </div>
)

function App() {
  const { theme } = useThemeStore()

  // Apply theme to document element
  document.documentElement.className = theme

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes - TODO: Add auth guard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/workflows/:id" element={<WorkflowDesigner />} />
          <Route path="/workflows/new" element={<WorkflowDesigner />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App