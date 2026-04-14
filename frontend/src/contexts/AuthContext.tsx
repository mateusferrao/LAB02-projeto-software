import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import api, { type Usuario } from '../services/api'

interface AuthContextValue {
  user: Usuario | null
  token: string | null
  login: (email: string, senha: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

interface RegisterData {
  email: string
  senha: string
  tipo: 'CLIENTE' | 'EMPRESA' | 'BANCO'
  nome?: string
  rg?: string
  cpf?: string
  endereco?: string
  profissao?: string
  cnpj?: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadFromStorage(): { user: Usuario | null; token: string | null } {
  try {
    const token = localStorage.getItem('token')
    const raw = localStorage.getItem('user')
    const user = raw ? (JSON.parse(raw) as Usuario) : null
    return { token, user }
  } catch {
    return { user: null, token: null }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = loadFromStorage()
  const [user, setUser] = useState<Usuario | null>(initial.user)
  const [token, setToken] = useState<string | null>(initial.token)

  const persist = (token: string, user: Usuario) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  const login = useCallback(async (email: string, senha: string) => {
    const { data } = await api.post<{ token: string; usuario: Usuario }>('/auth/login', { email, senha })
    persist(data.token, data.usuario)
  }, [])

  const register = useCallback(async (registerData: RegisterData) => {
    const { data } = await api.post<{ token: string; usuario: Usuario }>('/auth/register', registerData)
    persist(data.token, data.usuario)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
