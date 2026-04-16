import { readFile } from 'node:fs/promises'
import path from 'node:path'
import db from './db'

export async function initDatabase() {
  const { rows } = await db.query<{ existe: string | null }>(
    `SELECT to_regclass('public.usuario') AS existe`,
  )

  if (rows[0]?.existe) {
    return
  }

  const schemaPath = path.resolve(__dirname, '../../db/schema.sql')
  const schemaSql = await readFile(schemaPath, 'utf8')

  await db.query(schemaSql)
  console.log('✅ Schema do banco aplicado automaticamente')
}
