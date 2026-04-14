import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Dados inválidos', details: err.flatten() })
    return
  }

  if (err instanceof Error) {
    const status = (err as Error & { status?: number }).status ?? 500
    res.status(status).json({ error: err.message })
    return
  }

  res.status(500).json({ error: 'Erro interno do servidor' })
}
