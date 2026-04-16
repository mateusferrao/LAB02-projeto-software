import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const pgErr = err as { code?: string; constraint?: string }
  if (pgErr?.code === '23505') {
    if (pgErr.constraint === 'automovel_matricula_key') {
      res.status(409).json({ error: 'Já existe um veículo cadastrado com esta matrícula.' })
      return
    }

    if (pgErr.constraint === 'automovel_placa_key') {
      res.status(409).json({ error: 'Já existe um veículo cadastrado com esta placa.' })
      return
    }

    res.status(409).json({ error: 'Registro duplicado. Verifique os dados informados.' })
    return
  }

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
