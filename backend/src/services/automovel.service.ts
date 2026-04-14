import { z } from 'zod'
import db from '../config/db'

export const AutomovelSchema = z.object({
  matricula: z.string().min(1),
  ano: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  marca: z.string().min(1),
  modelo: z.string().min(1),
  placa: z.string().min(1),
  fotoUrl: z.string().url().optional(),
  disponivel: z.boolean().optional().default(true),
  proprietarioTipo: z.enum(['CLIENTE', 'EMPRESA', 'BANCO']),
  proprietarioClienteId: z.string().uuid().optional(),
  proprietarioEmpresaId: z.string().uuid().optional(),
  proprietarioBancoId: z.string().uuid().optional(),
})

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

export async function criar(data: z.infer<typeof AutomovelSchema>) {
  const { rows } = await db.query(
    `INSERT INTO automovel
       (matricula, ano, marca, modelo, placa, foto_url, disponivel,
        proprietario_tipo, proprietario_cliente_id, proprietario_empresa_id, proprietario_banco_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [
      data.matricula, data.ano, data.marca, data.modelo, data.placa,
      data.fotoUrl ?? null, data.disponivel ?? true,
      data.proprietarioTipo,
      data.proprietarioClienteId ?? null,
      data.proprietarioEmpresaId ?? null,
      data.proprietarioBancoId ?? null,
    ],
  )
  return rows[0]
}

export async function atualizar(id: string, data: Partial<z.infer<typeof AutomovelSchema>>) {
  const map: Record<string, string> = {
    matricula: 'matricula', ano: 'ano', marca: 'marca', modelo: 'modelo',
    placa: 'placa', fotoUrl: 'foto_url', disponivel: 'disponivel',
    proprietarioTipo: 'proprietario_tipo',
    proprietarioClienteId: 'proprietario_cliente_id',
    proprietarioEmpresaId: 'proprietario_empresa_id',
    proprietarioBancoId:   'proprietario_banco_id',
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
  return rows[0]
}

export async function deletar(id: string) {
  await db.query('DELETE FROM automovel WHERE id = $1', [id])
}

function erro(msg: string, status: number): never {
  const e = new Error(msg) as Error & { status: number }
  e.status = status
  throw e
}
