import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { TipoUsuario } from '../services/api'

interface Props {
  children: React.ReactNode
  roles?: TipoUsuario[]
}

export function ProtectedRoute({ children, roles }: Props) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && user && !roles.includes(user.tipo)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
