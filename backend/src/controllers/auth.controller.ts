import { Request, Response, NextFunction } from 'express'
import * as AuthService from '../services/auth.service'

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = AuthService.RegisterSchema.parse(req.body)
    const result = await AuthService.register(data)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = AuthService.LoginSchema.parse(req.body)
    const result = await AuthService.login(data)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
