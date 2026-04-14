import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Calendar, Car, XCircle } from 'lucide-react'
import api from '../services/api'
import type { PedidoAluguel } from '../services/api'
import { StatusBadge } from '../components/StatusBadge'

const FALLBACK = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80'

function fmt(d: string) {
  return new Date(d).toLocaleDateString('pt-BR')
}

export function MeusPedidos() {
  const qc = useQueryClient()

  const { data: pedidos = [], isLoading } = useQuery<PedidoAluguel[]>({
    queryKey: ['meus-pedidos'],
    queryFn: () => api.get('/pedidos/meus').then((r) => r.data),
  })

  const cancelar = useMutation({
    mutationFn: (id: string) => api.patch(`/pedidos/${id}/cancelar`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meus-pedidos'] }),
  })

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="py-12 border-b border-white/5 mb-10">
          <p className="text-brand-amber text-sm uppercase tracking-widest mb-2">Histórico</p>
          <h1 className="font-display text-6xl">MEUS PEDIDOS</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="card h-32 animate-pulse bg-white/5" />)}
          </div>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-24 text-white/30">
            <Car className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-xl">Nenhum pedido encontrado</p>
            <a href="/catalogo" className="btn-primary inline-block mt-6">Ver catálogo</a>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="card flex gap-4 p-5"
              >
                {/* Thumb */}
                <img
                  src={p.automovel?.fotoUrl ?? FALLBACK}
                  alt={p.automovel?.modelo}
                  className="w-24 h-20 object-cover rounded-xl flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-display text-xl leading-tight">
                      {p.automovel?.marca} {p.automovel?.modelo}
                    </h3>
                    <StatusBadge status={p.status} />
                  </div>

                  <div className="flex items-center gap-4 text-white/40 text-sm mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {fmt(p.dataInicio)} — {fmt(p.dataFim)}
                    </span>
                  </div>

                  {p.observacao && (
                    <p className="text-white/30 text-xs mt-1 truncate">{p.observacao}</p>
                  )}
                </div>

                {/* Cancelar */}
                {['PENDENTE', 'EM_ANALISE'].includes(p.status) && (
                  <button
                    onClick={() => cancelar.mutate(p.id)}
                    disabled={cancelar.isPending}
                    className="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors"
                    title="Cancelar pedido"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
