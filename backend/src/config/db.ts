import { Pool } from 'pg'

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

db.on('error', (err) => {
  console.error('Erro inesperado no pool PostgreSQL:', err)
})

export default db
