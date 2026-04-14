import { z } from 'zod'
import db from '../config/db'

export const CriarPedidoSchema = z.object({
  automovelId: z.string().uuid(),
  dataInicio: z.string(),
  dataFim: z.string(),
  observacao: z.string().optional(),
})

export const AvaliarPedidoSchema = z.object({
  status: z.enum(['APROVADO', 'REJEITADO', 'EM_ANALISE']),
  observacao: z.string().optional(),
})

export const ContratoCreditoSchema = z.object({
  pedidoId: z.string().uuid(),
  bancoId: z.string().uuid(),
  valor: z.number().positive(),
  parcelas: z.number().int().positive(),
  taxaJuros: z.number().nonnegative(),
})

export async function criar(clienteId: string, data: z.infer<typeof CriarPedidoSchema>) {
  const { rows: autos } = await db.query(
    'SELECT id, disponivel FROM automovel WHERE id = $1', [data.automovelId],
  )
  if (!autos[0]) erro('Automóvel não encontrado', 404)
  if (!autos[0].disponivel) erro('Automóvel não está disponível', 409)

  const { rows } = await db.query(
    `INSERT INTO pedido_aluguel (cliente_id, automovel_id, data_inicio, data_fim, observacao)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [clienteId, data.automovelId, data.dataInicio, data.dataFim, data.observacao ?? null],
  )

  return buscarPorId(rows[0].id)
}

export async function listarDoCliente(clienteId: string) {
  const { rows } = await db.query(
    `SELECT p.*,
            row_to_json(a.*) AS automovel,
            row_to_json(cc.*) AS contrato
     FROM pedido_aluguel p
     JOIN automovel a ON a.id = p.automovel_id
     LEFT JOIN contrato_credito cc ON cc.pedido_id = p.id
     WHERE p.cliente_id = $1
     ORDER BY p.criado_em DESC`,
    [clienteId],
  )
  return rows
}

export async function listarTodos() {
  const { rows } = await db.query(
    `SELECT p.*,
            row_to_json(a.*) AS automovel,
            row_to_json(c.*) AS cliente,
            row_to_json(cc.*) AS contrato
     FROM pedido_aluguel p
     JOIN automovel a ON a.id = p.automovel_id
     JOIN cliente   c ON c.id = p.cliente_id
     LEFT JOIN contrato_credito cc ON cc.pedido_id = p.id
     ORDER BY p.criado_em DESC`,
  )
  return rows
}

export async function buscarPorId(id: string) {
  const { rows } = await db.query(
    `SELECT p.*,
            row_to_json(a.*) AS automovel,
            row_to_json(c.*) AS cliente,
            row_to_json(cc.*) AS contrato
     FROM pedido_aluguel p
     JOIN automovel a ON a.id = p.automovel_id
     JOIN cliente   c ON c.id = p.cliente_id
     LEFT JOIN contrato_credito cc ON cc.pedido_id = p.id
     WHERE p.id = $1`,
    [id],
  )
  if (!rows[0]) erro('Pedido não encontrado', 404)
  return rows[0]
}

export async function cancelar(id: string, clienteId: string) {
  const { rows } = await db.query(
    'SELECT id, cliente_id, status FROM pedido_aluguel WHERE id = $1', [id],
  )
  if (!rows[0]) erro('Pedido não encontrado', 404)
  if (rows[0].cliente_id !== clienteId) erro('Acesso negado', 403)
  if (!['PENDENTE', 'EM_ANALISE'].includes(rows[0].status)) {
    erro('Pedido não pode ser cancelado neste status', 400)
  }

  const { rows: updated } = await db.query(
    `UPDATE pedido_aluguel SET status = 'CANCELADO' WHERE id = $1 RETURNING *`,
    [id],
  )
  return updated[0]
}

export async function avaliar(
  id: string,
  avaliadorId: string,
  data: z.infer<typeof AvaliarPedidoSchema>,
) {
  const { rows } = await db.query('SELECT id FROM pedido_aluguel WHERE id = $1', [id])
  if (!rows[0]) erro('Pedido não encontrado', 404)

  const { rows: updated } = await db.query(
    `UPDATE pedido_aluguel
     SET status = $1, avaliador_id = $2, observacao = COALESCE($3, observacao)
     WHERE id = $4 RETURNING *`,
    [data.status, avaliadorId, data.observacao ?? null, id],
  )
  return buscarPorId(updated[0].id)
}

export async function criarContratoCredito(data: z.infer<typeof ContratoCreditoSchema>) {
  const { rows } = await db.query(
    'SELECT id, status FROM pedido_aluguel WHERE id = $1', [data.pedidoId],
  )
  if (!rows[0]) erro('Pedido não encontrado', 404)
  if (rows[0].status !== 'APROVADO') erro('Pedido precisa estar APROVADO', 400)

  const db2 = await db.connect()
  try {
    await db2.query('BEGIN')
    const { rows: cc } = await db2.query(
      `INSERT INTO contrato_credito (pedido_id, banco_id, valor, parcelas, taxa_juros)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [data.pedidoId, data.bancoId, data.valor, data.parcelas, data.taxaJuros],
    )
    await db2.query(
      `UPDATE pedido_aluguel SET status = 'EXECUTADO' WHERE id = $1`,
      [data.pedidoId],
    )
    await db2.query('COMMIT')
    return cc[0]
  } catch (e) {
    await db2.query('ROLLBACK')
    throw e
  } finally {
    db2.release()
  }
}

function erro(msg: string, status: number): never {
  const e = new Error(msg) as Error & { status: number }
  e.status = status
  throw e
}
