import { z } from 'zod'
import db from '../config/db'
import type { TokenPayload } from '../middlewares/auth'

export const CriarPedidoSchema = z.object({
  automovelId: z.string().uuid(),
  dataInicio: z.string().datetime(),
  dataFim: z.string().datetime(),
  observacao: z.string().optional(),
}).refine((data) => new Date(data.dataFim) >= new Date(data.dataInicio), {
  message: 'Data final deve ser maior ou igual à data inicial',
  path: ['dataFim'],
}).refine((data) => inicioDoDia(new Date(data.dataInicio)) >= inicioDoDia(new Date()), {
  message: 'Data inicial não pode estar no passado',
  path: ['dataInicio'],
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
  const client = await db.connect()
  try {
    await client.query('BEGIN')

    const { rows: autos } = await client.query(
      'SELECT id, disponivel FROM automovel WHERE id = $1 FOR UPDATE',
      [data.automovelId],
    )
    if (!autos[0]) erro('Automóvel não encontrado', 404)
    if (!autos[0].disponivel) erro('Automóvel não está disponível', 409)

    const { rows } = await client.query(
      `INSERT INTO pedido_aluguel (cliente_id, automovel_id, data_inicio, data_fim, observacao)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [clienteId, data.automovelId, data.dataInicio, data.dataFim, data.observacao ?? null],
    )

    await client.query('UPDATE automovel SET disponivel = FALSE WHERE id = $1', [data.automovelId])
    await client.query('COMMIT')

    return buscarPorId(rows[0].id)
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
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
  const client = await db.connect()
  try {
    await client.query('BEGIN')

    const { rows } = await client.query(
      `SELECT id, cliente_id, automovel_id, status
       FROM pedido_aluguel
       WHERE id = $1
       FOR UPDATE`,
      [id],
    )
    if (!rows[0]) erro('Pedido não encontrado', 404)
    if (rows[0].cliente_id !== clienteId) erro('Acesso negado', 403)
    if (!['PENDENTE', 'EM_ANALISE'].includes(rows[0].status)) {
      erro('Pedido não pode ser cancelado neste status', 400)
    }

    const { rows: updated } = await client.query(
      `UPDATE pedido_aluguel SET status = 'CANCELADO' WHERE id = $1 RETURNING *`,
      [id],
    )
    await client.query('UPDATE automovel SET disponivel = TRUE WHERE id = $1', [rows[0].automovel_id])
    await client.query('COMMIT')
    return updated[0]
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

export async function avaliar(
  id: string,
  avaliador: TokenPayload,
  data: z.infer<typeof AvaliarPedidoSchema>,
) {
  const client = await db.connect()
  try {
    await client.query('BEGIN')

    const { rows } = await client.query(
      `SELECT p.id, p.status, p.automovel_id,
              a.proprietario_tipo, a.proprietario_empresa_id, a.proprietario_banco_id
       FROM pedido_aluguel p
       JOIN automovel a ON a.id = p.automovel_id
       WHERE p.id = $1
       FOR UPDATE OF p`,
      [id],
    )
    const pedido = rows[0]
    if (!pedido) erro('Pedido não encontrado', 404)
    if (!['PENDENTE', 'EM_ANALISE'].includes(pedido.status)) {
      erro('Pedido não pode ser avaliado neste status', 400)
    }

    await garantirAvaliadorDoAutomovel(avaliador, pedido)

    const { rows: updated } = await client.query(
      `UPDATE pedido_aluguel
       SET status = $1, avaliador_id = $2, observacao = COALESCE($3, observacao)
       WHERE id = $4 RETURNING *`,
      [data.status, avaliador.id, data.observacao ?? null, id],
    )

    if (data.status === 'REJEITADO') {
      await client.query('UPDATE automovel SET disponivel = TRUE WHERE id = $1', [pedido.automovel_id])
    }

    await client.query('COMMIT')
    return buscarPorId(updated[0].id)
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
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

function inicioDoDia(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

async function garantirAvaliadorDoAutomovel(
  avaliador: TokenPayload,
  automovel: {
    proprietario_tipo: string
    proprietario_empresa_id: string | null
    proprietario_banco_id: string | null
  },
) {
  if (!['EMPRESA', 'BANCO'].includes(avaliador.tipo)) {
    erro('Acesso negado para avaliação de pedido', 403)
  }

  const tabela = avaliador.tipo === 'EMPRESA' ? 'empresa' : 'banco'
  const { rows } = await db.query<{ id: string }>(
    `SELECT id FROM ${tabela} WHERE usuario_id = $1`,
    [avaliador.id],
  )
  if (!rows[0]) erro(`Perfil de ${avaliador.tipo.toLowerCase()} não encontrado`, 404)

  const pertenceAoAvaliador =
    (avaliador.tipo === 'EMPRESA' && automovel.proprietario_empresa_id === rows[0].id)
    || (avaliador.tipo === 'BANCO' && automovel.proprietario_banco_id === rows[0].id)

  if (automovel.proprietario_tipo !== avaliador.tipo || !pertenceAoAvaliador) {
    erro('Acesso negado ao pedido informado', 403)
  }
}
