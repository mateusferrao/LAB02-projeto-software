import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export type TipoUsuario = 'CLIENTE' | 'EMPRESA' | 'BANCO'

export interface TokenPayload {
  id: string
  email: string
  tipo: TipoUsuario
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido' })
    return
  }

  const token = auth.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}

export function requireRole(...roles: TipoUsuario[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado' })
      return
    }
    if (!roles.includes(req.user.tipo)) {
      res.status(403).json({ error: 'Acesso negado para este perfil' })
      return
    }
    next()
  }
}
