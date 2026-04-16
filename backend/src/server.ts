import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import clienteRoutes from './routes/cliente.routes'
import automovelRoutes from './routes/automovel.routes'
import pedidoRoutes from './routes/pedido.routes'
import { errorHandler } from './middlewares/errorHandler'
import { initDatabase } from './config/initDb'

const app = express()

app.use(cors({ origin: '*', credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ── Health check ──────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }))

// ── Rotas ─────────────────────────────────────────────────────
app.use('/auth', authRoutes)
app.use('/clientes', clienteRoutes)
app.use('/automoveis', automovelRoutes)
app.use('/pedidos', pedidoRoutes)

// ── Tratamento de erros ───────────────────────────────────────
app.use(errorHandler)

const PORT = Number(process.env.PORT ?? 3001)

async function bootstrap() {
  await initDatabase()

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚗 Servidor rodando em http://0.0.0.0:${PORT}`)
  })
}

bootstrap().catch((err) => {
  console.error('Erro ao iniciar aplicação:', err)
  process.exit(1)
})

export default app
