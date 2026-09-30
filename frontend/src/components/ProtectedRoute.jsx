import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-[var(--text-muted)]">
        Loading…
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return children
}