import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
})

// Injetar token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirecionar para login em 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export default api

// ── Tipos ─────────────────────────────────────────────────────

export type TipoUsuario = 'CLIENTE' | 'EMPRESA' | 'BANCO'
export type StatusPedido =
  | 'PENDENTE'
  | 'EM_ANALISE'
  | 'APROVADO'
  | 'REJEITADO'
  | 'CANCELADO'
  | 'EXECUTADO'

export interface Usuario {
  id: string
  email: string
  tipo: TipoUsuario
  cliente?: Cliente
  empresa?: Empresa
  banco?: Banco
}

export interface Cliente {
  id: string
  rg: string
  cpf: string
  nome: string
  endereco: string
  profissao: string
  rendimentos: Rendimento[]
}

export interface Rendimento {
  id: string
  entidadeEmpregadora: string
  valor: number
}

export interface Empresa {
  id: string
  cnpj: string
  nome: string
  endereco: string
}

export interface Banco {
  id: string
  cnpj: string
  nome: string
  endereco: string
}

export interface Automovel {
  id: string
  matricula: string
  ano: number
  marca: string
  modelo: string
  placa: string
  fotoUrl?: string
  disponivel: boolean
  proprietarioTipo: 'CLIENTE' | 'EMPRESA' | 'BANCO'
}

export interface PedidoAluguel {
  id: string
  clienteId: string
  automovelId: string
  dataInicio: string
  dataFim: string
  status: StatusPedido
  observacao?: string
  criadoEm: string
  atualizadoEm: string
  automovel?: Automovel
  cliente?: Cliente
  contrato?: ContratoCredito
}

export interface ContratoCredito {
  id: string
  pedidoId: string
  bancoId: string
  valor: number
  parcelas: number
  taxaJuros: number
  criadoEm: string
}
