import { Link, useNavigate } from 'react-router-dom'
import { Car, LogOut, Menu, X, User, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isAgente = user?.tipo === 'EMPRESA' || user?.tipo === 'BANCO'

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-brand-black/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Car className="w-7 h-7 text-brand-amber group-hover:scale-110 transition-transform" />
          <span className="font-display text-2xl tracking-widest text-brand-offwhite">
            DRIVE<span className="text-brand-amber">NOW</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/catalogo" className="text-white/70 hover:text-brand-amber transition-colors text-sm font-medium">
            Catálogo
          </Link>

          {isAuthenticated && !isAgente && (
            <Link to="/meus-pedidos" className="text-white/70 hover:text-brand-amber transition-colors text-sm font-medium">
              Meus Pedidos
            </Link>
          )}

          {isAuthenticated && isAgente && (
            <Link to="/painel-agente" className="text-white/70 hover:text-brand-amber transition-colors text-sm font-medium flex items-center gap-1">
              <LayoutDashboard className="w-4 h-4" />
              Painel
            </Link>
          )}

          {isAuthenticated && isAgente && (
            <Link to="/cadastrar-carro" className="text-white/70 hover:text-brand-amber transition-colors text-sm font-medium">
              Cadastrar Carro
            </Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-white/40 text-sm flex items-center gap-1">
                <User className="w-4 h-4" />
                {user?.email}
              </span>
              <button onClick={handleLogout} className="btn-outline flex items-center gap-2 py-2 px-4 text-sm">
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="btn-ghost py-2 px-4 text-sm">Entrar</Link>
              <Link to="/register" className="btn-primary py-2 px-4 text-sm">Cadastrar</Link>
            </div>
          )}
        </nav>

        {/* Mobile toggle */}
        <button className="md:hidden text-white/70" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-brand-graphite border-t border-white/5 px-4 py-4 flex flex-col gap-4">
          <Link to="/catalogo" className="text-white/70 hover:text-brand-amber" onClick={() => setOpen(false)}>Catálogo</Link>
          {isAuthenticated && !isAgente && (
            <Link to="/meus-pedidos" className="text-white/70 hover:text-brand-amber" onClick={() => setOpen(false)}>Meus Pedidos</Link>
          )}
          {isAuthenticated && isAgente && (
            <Link to="/painel-agente" className="text-white/70 hover:text-brand-amber" onClick={() => setOpen(false)}>Painel</Link>
          )}
          {isAuthenticated && isAgente && (
            <Link to="/cadastrar-carro" className="text-white/70 hover:text-brand-amber" onClick={() => setOpen(false)}>Cadastrar Carro</Link>
          )}
          {isAuthenticated ? (
            <button onClick={() => { handleLogout(); setOpen(false) }} className="btn-outline text-left">Sair</button>
          ) : (
            <>
              <Link to="/login" className="btn-ghost" onClick={() => setOpen(false)}>Entrar</Link>
              <Link to="/register" className="btn-primary text-center" onClick={() => setOpen(false)}>Cadastrar</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
