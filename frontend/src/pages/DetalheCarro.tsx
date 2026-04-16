import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Calendar, Hash, Car, ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import api from '../services/api'
import { automovelFotoUrl, type Automovel } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const FALLBACK = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80'

interface PedidoForm {
  dataInicio: string
  dataFim: string
  observacao?: string
}

export function DetalheCarro() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const { data: car, isLoading } = useQuery<Automovel>({
    queryKey: ['automovel', id],
    queryFn: () => api.get(`/automoveis/${id}`).then((r) => r.data),
    enabled: !!id,
  })

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<PedidoForm>()

  const onSolicit = async (data: PedidoForm) => {
    try {
      setError('')
      await api.post('/pedidos', {
        automovelId: id,
        dataInicio: new Date(data.dataInicio).toISOString(),
        dataFim: new Date(data.dataFim).toISOString(),
        observacao: data.observacao,
      })
      setSuccess(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? 'Erro ao criar pedido.')
    }
  }

  if (isLoading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-brand-amber border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!car) return (
    <div className="min-h-screen pt-20 flex items-center justify-center text-white/30">
      Veículo não encontrado
    </div>
  )

  const hoje = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <Link to="/catalogo" className="inline-flex items-center gap-2 text-white/40 hover:text-brand-amber mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao catálogo
        </Link>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Imagem */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl overflow-hidden h-80 lg:h-auto"
          >
            <img
              src={automovelFotoUrl(car) ?? FALLBACK}
              alt={`${car.marca} ${car.modelo}`}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK }}
            />
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <p className="text-brand-amber text-sm uppercase tracking-widest mb-1">{car.marca}</p>
            <h1 className="font-display text-6xl mb-2">{car.modelo}</h1>
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border mb-6 ${
              car.disponivel
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}>
              {car.disponivel ? 'Disponível' : 'Indisponível'}
            </span>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { icon: Calendar, label: 'Ano', val: car.ano },
                { icon: Hash, label: 'Placa', val: car.placa },
                { icon: Car, label: 'Matrícula', val: car.matricula },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="card p-4 text-center">
                  <Icon className="w-5 h-5 text-brand-amber mx-auto mb-1" />
                  <p className="text-white/40 text-xs">{label}</p>
                  <p className="font-semibold text-sm">{val}</p>
                </div>
              ))}
            </div>

            {/* Formulário de pedido */}
            {car.disponivel && (
              <>
                {!isAuthenticated ? (
                  <div className="card p-6 text-center">
                    <p className="text-white/50 mb-4">Faça login para solicitar este veículo</p>
                    <Link to="/login" className="btn-primary">Entrar</Link>
                  </div>
                ) : user?.tipo !== 'CLIENTE' ? (
                  <div className="card p-6 text-center text-white/40">
                    Somente clientes podem solicitar aluguéis.
                  </div>
                ) : success ? (
                  <div className="card p-6 text-center">
                    <p className="text-green-400 text-lg font-semibold mb-2">Pedido criado!</p>
                    <p className="text-white/40 text-sm mb-4">Seu pedido está sendo analisado.</p>
                    <button onClick={() => navigate('/meus-pedidos')} className="btn-primary">
                      Ver meus pedidos
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSolicit)} className="card p-6 space-y-4">
                    <h3 className="font-display text-2xl">SOLICITAR ALUGUEL</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-1.5">Data início *</label>
                        <input type="date" min={hoje} className="input" {...register('dataInicio', { required: true })} />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1.5">Data fim *</label>
                        <input type="date" min={hoje} className="input" {...register('dataFim', { required: true })} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-white/60 mb-1.5">Observação</label>
                      <textarea className="input resize-none" rows={3} placeholder="Observações opcionais..."
                        {...register('observacao')} />
                    </div>

                    {error && (
                      <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-4 py-2">{error}</p>
                    )}

                    <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                      {isSubmitting ? 'Enviando...' : 'Enviar Pedido'}
                    </button>
                  </form>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
