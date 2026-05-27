import { z } from 'zod'
import db from '../config/db'
import type { TokenPayload } from '../middlewares/auth'

const AutomovelBaseSchema = z.object({
  matricula: z.string().min(1),
  ano: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  marca: z.string().min(1),
  modelo: z.string().min(1),
  placa: z.string().min(1),
  fotoUrl: z.string().url().optional(),
  disponivel: z.boolean().optional().default(true),
})

export const AutomovelCreateSchema = AutomovelBaseSchema
export const AutomovelUpdateSchema = AutomovelBaseSchema.partial()

export async function listar(somenteDisponiveis = false) {
  const where = somenteDisponiveis ? 'WHERE disponivel = TRUE' : ''
  const { rows } = await db.query(
    `SELECT * FROM automovel ${where} ORDER BY marca`,
  )
  return rows
}

export async function buscarPorId(id: string) {
  const { rows } = await db.query('SELECT * FROM automovel WHERE id = $1', [id])
  if (!rows[0]) erro('Automóvel não encontrado', 404)
  return rows[0]
}

export async function criar(user: TokenPayload, data: z.infer<typeof AutomovelCreateSchema>) {
  const proprietario = await buscarPerfilProprietario(user)

  const { rows } = await db.query(
    `INSERT INTO automovel
       (matricula, ano, marca, modelo, placa, foto_url, disponivel,
        proprietario_tipo, proprietario_cliente_id, proprietario_empresa_id, proprietario_banco_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [
      data.matricula, data.ano, data.marca, data.modelo, data.placa,
      data.fotoUrl ?? null, data.disponivel ?? true,
      user.tipo,
      null,
      user.tipo === 'EMPRESA' ? proprietario.id : null,
      user.tipo === 'BANCO' ? proprietario.id : null,
    ],
  )
  return rows[0]
}

export async function atualizar(
  id: string,
  user: TokenPayload,
  data: z.infer<typeof AutomovelUpdateSchema>,
) {
  await garantirProprietarioDoAutomovel(id, user)

  const map: Record<string, string> = {
    matricula: 'matricula', ano: 'ano', marca: 'marca', modelo: 'modelo',
    placa: 'placa', fotoUrl: 'foto_url', disponivel: 'disponivel',
  }
  const sets: string[] = []
  const vals: unknown[] = []
  let i = 1
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined && map[k]) { sets.push(`${map[k]} = $${i++}`); vals.push(v) }
  }
  if (sets.length === 0) return buscarPorId(id)
  vals.push(id)
  const { rows } = await db.query(
    `UPDATE automovel SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
    vals,
  )
  if (!rows[0]) erro('Automóvel não encontrado', 404)
  return rows[0]
}

export async function deletar(id: string, user: TokenPayload) {
  await garantirProprietarioDoAutomovel(id, user)

  const { rowCount } = await db.query('DELETE FROM automovel WHERE id = $1', [id])
  if (!rowCount) erro('Automóvel não encontrado', 404)
}

async function buscarPerfilProprietario(user: TokenPayload) {
  if (user.tipo === 'CLIENTE') erro('Clientes não podem gerenciar automóveis', 403)

  const tabela = user.tipo === 'EMPRESA' ? 'empresa' : 'banco'
  const { rows } = await db.query<{ id: string }>(
    `SELECT id FROM ${tabela} WHERE usuario_id = $1`,
    [user.id],
  )

  if (!rows[0]) erro(`Perfil de ${user.tipo.toLowerCase()} não encontrado`, 404)
  return rows[0]
}

async function garantirProprietarioDoAutomovel(id: string, user: TokenPayload) {
  const proprietario = await buscarPerfilProprietario(user)
  const { rows } = await db.query<{
    proprietario_tipo: string
    proprietario_empresa_id: string | null
    proprietario_banco_id: string | null
  }>(
    `SELECT proprietario_tipo, proprietario_empresa_id, proprietario_banco_id
     FROM automovel
     WHERE id = $1`,
    [id],
  )

  const automovel = rows[0]
  if (!automovel) erro('Automóvel não encontrado', 404)

  const pertenceAoUsuario =
    (user.tipo === 'EMPRESA' && automovel.proprietario_empresa_id === proprietario.id)
    || (user.tipo === 'BANCO' && automovel.proprietario_banco_id === proprietario.id)

  if (automovel.proprietario_tipo !== user.tipo || !pertenceAoUsuario) {
    erro('Acesso negado ao automóvel informado', 403)
  }
}

function erro(msg: string, status: number): never {
  const e = new Error(msg) as Error & { status: number }
  e.status = status
  throw e
}
