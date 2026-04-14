import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import db from '../config/db'

export const RegisterSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(6),
  tipo: z.enum(['CLIENTE', 'EMPRESA', 'BANCO']),
  rg: z.string().optional(),
  cpf: z.string().optional(),
  nome: z.string().optional(),
  endereco: z.string().optional(),
  profissao: z.string().optional(),
  cnpj: z.string().optional(),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  senha: z.string(),
})

type RegisterData = z.infer<typeof RegisterSchema>

export async function register(data: RegisterData) {
  const exists = await db.query('SELECT id FROM usuario WHERE email = $1', [data.email])
  if (exists.rowCount && exists.rowCount > 0) erro('Email já cadastrado', 409)

  const senhaHash = await bcrypt.hash(data.senha, 10)

  const client = await db.connect()
  try {
    await client.query('BEGIN')

    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO usuario (email, senha, tipo) VALUES ($1, $2, $3) RETURNING id`,
      [data.email, senhaHash, data.tipo],
    )
    const usuarioId = rows[0].id

    let perfil: Record<string, unknown> = {}

    if (data.tipo === 'CLIENTE') {
      const { rows: cr } = await client.query(
        `INSERT INTO cliente (usuario_id, rg, cpf, nome, endereco, profissao)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [usuarioId, data.rg ?? '', data.cpf ?? '', data.nome ?? '', data.endereco ?? '', data.profissao ?? ''],
      )
      perfil = cr[0]
    } else if (data.tipo === 'EMPRESA') {
      const { rows: er } = await client.query(
        `INSERT INTO empresa (usuario_id, cnpj, nome, endereco) VALUES ($1,$2,$3,$4) RETURNING *`,
        [usuarioId, data.cnpj ?? '', data.nome ?? '', data.endereco ?? ''],
      )
      perfil = er[0]
    } else {
      const { rows: br } = await client.query(
        `INSERT INTO banco (usuario_id, cnpj, nome, endereco) VALUES ($1,$2,$3,$4) RETURNING *`,
        [usuarioId, data.cnpj ?? '', data.nome ?? '', data.endereco ?? ''],
      )
      perfil = br[0]
    }

    await client.query('COMMIT')

    const token = gerarToken(usuarioId, data.email, data.tipo)
    return { token, usuario: { id: usuarioId, email: data.email, tipo: data.tipo, perfil } }
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

export async function login(data: z.infer<typeof LoginSchema>) {
  const { rows } = await db.query(
    `SELECT u.id, u.email, u.tipo, u.senha,
            c.id AS cliente_id, e.id AS empresa_id, b.id AS banco_id
     FROM usuario u
     LEFT JOIN cliente c ON c.usuario_id = u.id
     LEFT JOIN empresa e ON e.usuario_id = u.id
     LEFT JOIN banco   b ON b.usuario_id = u.id
     WHERE u.email = $1`,
    [data.email],
  )

  const usuario = rows[0]
  if (!usuario || !(await bcrypt.compare(data.senha, usuario.senha))) {
    erro('Credenciais inválidas', 401)
  }

  const token = gerarToken(usuario.id, usuario.email, usuario.tipo)
  const { senha: _, ...rest } = usuario
  return { token, usuario: rest }
}

function gerarToken(id: string, email: string, tipo: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign({ id, email, tipo }, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as any,
  })
}

function erro(msg: string, status: number): never {
  const e = new Error(msg) as Error & { status: number }
  e.status = status
  throw e
}
