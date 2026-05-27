import { Request, Response, NextFunction } from 'express'
import * as AutomovelService from '../services/automovel.service'

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const soDisp = req.query.disponivel === 'true'
    res.json(await AutomovelService.listar(soDisp))
  } catch (err) { next(err) }
}

export async function buscarPorId(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await AutomovelService.buscarPorId(req.params.id))
  } catch (err) { next(err) }
}

export async function criar(req: Request, res: Response, next: NextFunction) {
  try {
    const data = AutomovelService.AutomovelCreateSchema.parse(req.body)
    res.status(201).json(await AutomovelService.criar(req.user!, data))
  } catch (err) { next(err) }
}

export async function atualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const data = AutomovelService.AutomovelUpdateSchema.parse(req.body)
    res.json(await AutomovelService.atualizar(req.params.id, req.user!, data))
  } catch (err) { next(err) }
}

export async function deletar(req: Request, res: Response, next: NextFunction) {
  try {
    await AutomovelService.deletar(req.params.id, req.user!)
    res.status(204).end()
  } catch (err) { next(err) }
}
