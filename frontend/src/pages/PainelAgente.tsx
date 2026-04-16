import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'
import api, { automovelFotoUrl, pedidoDataFim, pedidoDataInicio } from '../services/api'
import type { PedidoAluguel } from '../services/api'
import { StatusBadge } from '../components/StatusBadge'
import { useAuth } from '../contexts/AuthContext'
import { useForm } from 'react-hook-form'

const FALLBACK = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80'
function fmt(d?: string) {
  if (!d) return 'Data indisponível'
  const parsed = new Date(d)
  if (Number.isNaN(parsed.getTime())) return 'Data indisponível'
  return parsed.toLocaleDateString('pt-BR')
}

interface ContratoForm {
  valor: number
  parcelas: number
  taxaJuros: number
}

export function PainelAgente() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [contratoModal, setContratoModal] = useState<string | null>(null)
  const [obsModal, setObsModal] = useState<{ id: string; action: 'APROVADO' | 'REJEITADO' } | null>(null)
  const [obs, setObs] = useState('')

  const { data: pedidos = [], isLoading } = useQuery<PedidoAluguel[]>({
    queryKey: ['pedidos-agente'],
    queryFn: () => api.get('/pedidos').then((r) => r.data),
  })

  const avaliar = useMutation({
    mutationFn: ({ id, status, observacao }: { id: string; status: string; observacao?: string }) =>
      api.patch(`/pedidos/${id}/avaliar`, { status, observacao }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pedidos-agente'] }); setObsModal(null); setObs('') },
  })

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ContratoForm>()
  const criarContrato = useMutation({
    mutationFn: (data: ContratoForm & { pedidoId: string }) => api.post('/pedidos/contratos', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pedidos-agente'] }); setContratoModal(null); reset() },
  })

  const onContrato = async (data: ContratoForm) => {
    if (!contratoModal) return
    await criarContrato.mutateAsync({
      pedidoId: contratoModal,
      valor: Number(data.valor),
      parcelas: Number(data.parcelas),
      taxaJuros: Number(data.taxaJuros),
    })
  }

  const isBanco = user?.tipo === 'BANCO'

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="py-12 border-b border-white/5 mb-10">
          <p className="text-brand-amber text-sm uppercase tracking-widest mb-2">
            {isBanco ? 'Banco' : 'Empresa'} — painel
          </p>
          <h1 className="font-display text-6xl">PEDIDOS</h1>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Pendentes', count: pedidos.filter(p => p.status === 'PENDENTE').length, color: 'text-yellow-400' },
            { label: 'Aprovados', count: pedidos.filter(p => p.status === 'APROVADO').length, color: 'text-green-400' },
            { label: 'Executados', count: pedidos.filter(p => p.status === 'EXECUTADO').length, color: 'text-purple-400' },
          ].map(({ label, count, color }) => (
            <div key={label} className="card p-5 text-center">
              <p className={`font-display text-4xl ${color}`}>{count}</p>
              <p className="text-white/40 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="card h-32 animate-pulse bg-white/5" />)}
          </div>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-24 text-white/30">Nenhum pedido no sistema.</div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card p-5 flex gap-4"
              >
                <img
                  src={automovelFotoUrl(p.automovel) ?? FALLBACK}
                  alt={p.automovel?.modelo}
                  className="w-24 h-20 object-cover rounded-xl flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h3 className="font-display text-xl">{p.automovel?.marca} {p.automovel?.modelo}</h3>
                      <p className="text-white/40 text-sm">{p.cliente?.nome ?? 'Cliente'} · {p.automovel?.placa}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>

                  <div className="flex items-center gap-1 text-white/40 text-xs mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {fmt(pedidoDataInicio(p))} — {fmt(pedidoDataFim(p))}
                  </div>

                  {/* Ações */}
                  {['PENDENTE', 'EM_ANALISE'].includes(p.status) && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setObsModal({ id: p.id, action: 'APROVADO' })}
                        className="flex items-center gap-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg hover:bg-green-500/20 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Aprovar
                      </button>
                      <button
                        onClick={() => setObsModal({ id: p.id, action: 'REJEITADO' })}
                        className="flex items-center gap-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Rejeitar
                      </button>
                      <button
                        onClick={() => avaliar.mutate({ id: p.id, status: 'EM_ANALISE' })}
                        className="flex items-center gap-1 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5" /> Em análise
                      </button>
                    </div>
                  )}

                  {/* Banco: criar contrato de crédito */}
                  {isBanco && p.status === 'APROVADO' && !p.contrato && (
                    <button
                      onClick={() => setContratoModal(p.id)}
                      className="mt-3 text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-lg hover:bg-purple-500/20 transition-colors"
                    >
                      Criar Contrato de Crédito
                    </button>
                  )}

                  {p.contrato && (
                    <p className="text-xs text-purple-400 mt-2">
                      Contrato de crédito: {p.contrato.parcelas}x de R$ {(p.contrato.valor / p.contrato.parcelas).toFixed(2)} · {p.contrato.taxaJuros}% a.m.
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Avaliação */}
      {obsModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card p-6 w-full max-w-md">
            <h3 className="font-display text-2xl mb-4">
              {obsModal.action === 'APROVADO' ? 'Aprovar' : 'Rejeitar'} pedido
            </h3>
            <textarea
              className="input resize-none mb-4"
              rows={3}
              placeholder="Observação (opcional)..."
              value={obs}
              onChange={(e) => setObs(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={() => avaliar.mutate({ id: obsModal.id, status: obsModal.action, observacao: obs })}
                disabled={avaliar.isPending}
                className="btn-primary flex-1"
              >
                Confirmar
              </button>
              <button onClick={() => setObsModal(null)} className="btn-ghost flex-1">Cancelar</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Contrato de Crédito */}
      {contratoModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card p-6 w-full max-w-md">
            <h3 className="font-display text-2xl mb-4">Contrato de Crédito</h3>
            <form onSubmit={handleSubmit(onContrato)} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Valor total (R$)</label>
                <input type="number" step="0.01" className="input" {...register('valor', { required: true, min: 0 })} />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Parcelas</label>
                <input type="number" className="input" {...register('parcelas', { required: true, min: 1 })} />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Taxa de juros (% a.m.)</label>
                <input type="number" step="0.01" className="input" {...register('taxaJuros', { required: true, min: 0 })} />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">Criar</button>
                <button type="button" onClick={() => setContratoModal(null)} className="btn-ghost flex-1">Cancelar</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
