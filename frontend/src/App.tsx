import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { Navbar } from './components/Navbar'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Catalogo } from './pages/Catalogo'
import { DetalheCarro } from './pages/DetalheCarro'
import { MeusPedidos } from './pages/MeusPedidos'
import { PainelAgente } from './pages/PainelAgente'
import { CadastroCarro } from './pages/CadastroCarro'
import { EditarCarro } from './pages/EditarCarro'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/catalogo/:id" element={<DetalheCarro />} />

            <Route
              path="/meus-pedidos"
              element={
                <ProtectedRoute roles={['CLIENTE']}>
                  <MeusPedidos />
                </ProtectedRoute>
              }
            />

            <Route
              path="/painel-agente"
              element={
                <ProtectedRoute roles={['EMPRESA', 'BANCO']}>
                  <PainelAgente />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cadastrar-carro"
              element={
                <ProtectedRoute roles={['EMPRESA', 'BANCO']}>
                  <CadastroCarro />
                </ProtectedRoute>
              }
            />

            <Route
              path="/editar-carro/:id"
              element={
                <ProtectedRoute roles={['EMPRESA', 'BANCO']}>
                  <EditarCarro />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
