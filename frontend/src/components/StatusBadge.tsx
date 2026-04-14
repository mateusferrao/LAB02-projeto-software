import type { StatusPedido } from '../services/api'

const labels: Record<StatusPedido, string> = {
  PENDENTE: 'Pendente',
  EM_ANALISE: 'Em Análise',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
  CANCELADO: 'Cancelado',
  EXECUTADO: 'Executado',
}

interface Props {
  status: StatusPedido
  className?: string
}

export function StatusBadge({ status, className = '' }: Props) {
  const base = 'inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border'
  const variant = `badge-${status.toLowerCase()}`
  return (
    <span className={`${base} ${variant} ${className}`}>
      {labels[status]}
    </span>
  )
}
