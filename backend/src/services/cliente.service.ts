import { z } from 'zod'
import db from '../config/db'

export const ClienteUpdateSchema = z.object({
  rg: z.string().optional(),
  cpf: z.string().optional(),
  nome: z.string().optional(),
  endereco: z.string().optional(),
  profissao: z.string().optional(),
})

export const RendimentoSchema = z.object({
  entidadeEmpregadora: z.string().min(1),
  valor: z.number().positive(),
})

export async function listar() {
  const { rows } = await db.query(
    `SELECT c.*, u.email,
            json_agg(r.*) FILTER (WHERE r.id IS NOT NULL) AS rendimentos
     FROM cliente c
     JOIN usuario u ON u.id = c.usuario_id
     LEFT JOIN rendimento r ON r.cliente_id = c.id
     GROUP BY c.id, u.email
     ORDER BY c.nome`,
  )
  return rows
}

export async function buscarPorId(id: string) {
  const { rows } = await db.query(
    `SELECT c.*, u.email,
            json_agg(r.*) FILTER (WHERE r.id IS NOT NULL) AS rendimentos
     FROM cliente c
     JOIN usuario u ON u.id = c.usuario_id
     LEFT JOIN rendimento r ON r.cliente_id = c.id
     WHERE c.id = $1
     GROUP BY c.id, u.email`,
    [id],
  )
  if (!rows[0]) erro('Cliente não encontrado', 404)
  return rows[0]
}

export async function buscarPorUsuarioId(usuarioId: string) {
  const { rows } = await db.query(
    `SELECT c.*,
            json_agg(r.*) FILTER (WHERE r.id IS NOT NULL) AS rendimentos
     FROM cliente c
     LEFT JOIN rendimento r ON r.cliente_id = c.id
     WHERE c.usuario_id = $1
     GROUP BY c.id`,
    [usuarioId],
  )
  return rows[0] ?? null
}

export async function garantirClienteDoUsuario(clienteId: string, usuarioId: string) {
  const { rows } = await db.query(
    'SELECT id FROM cliente WHERE id = $1 AND usuario_id = $2',
    [clienteId, usuarioId],
  )
  if (!rows[0]) erro('Acesso negado ao cliente informado', 403)
}

export async function atualizar(id: string, data: z.infer<typeof ClienteUpdateSchema>) {
  const sets: string[] = []
  const vals: unknown[] = []
  let i = 1
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) { sets.push(`${toSnake(k)} = $${i++}`); vals.push(v) }
  }
  if (sets.length === 0) return buscarPorId(id)
  vals.push(id)
  const { rows } = await db.query(
    `UPDATE cliente SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
    vals,
  )
  if (!rows[0]) erro('Cliente não encontrado', 404)
  return rows[0]
}

export async function deletar(id: string) {
  await db.query('DELETE FROM cliente WHERE id = $1', [id])
}

export async function adicionarRendimento(clienteId: string, data: z.infer<typeof RendimentoSchema>) {
  const { rowCount } = await db.query('SELECT id FROM rendimento WHERE cliente_id = $1', [clienteId])
  if ((rowCount ?? 0) >= 3) erro('Máximo de 3 rendimentos por cliente', 400)

  const { rows } = await db.query(
    `INSERT INTO rendimento (cliente_id, entidade_empregadora, valor) VALUES ($1,$2,$3) RETURNING *`,
    [clienteId, data.entidadeEmpregadora, data.valor],
  )
  return rows[0]
}

export async function removerRendimento(rendimentoId: string, clienteId: string) {
  await db.query('DELETE FROM rendimento WHERE id = $1 AND cliente_id = $2', [rendimentoId, clienteId])
}

function toSnake(s: string) {
  return s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
}

function erro(msg: string, status: number): never {
  const e = new Error(msg) as Error & { status: number }
  e.status = status
  throw e
}
