import { Request, Response, NextFunction } from 'express'
import * as ClienteService from '../services/cliente.service'

export async function listar(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await ClienteService.listar())
  } catch (err) { next(err) }
}

export async function buscarPorId(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await ClienteService.buscarPorId(req.params.id))
  } catch (err) { next(err) }
}

export async function meuPerfil(req: Request, res: Response, next: NextFunction) {
  try {
    const cliente = await ClienteService.buscarPorUsuarioId(req.user!.id)
    res.json(cliente)
  } catch (err) { next(err) }
}

export async function atualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const data = ClienteService.ClienteUpdateSchema.parse(req.body)
    res.json(await ClienteService.atualizar(req.params.id, data))
  } catch (err) { next(err) }
}

export async function deletar(req: Request, res: Response, next: NextFunction) {
  try {
    await ClienteService.deletar(req.params.id)
    res.status(204).end()
  } catch (err) { next(err) }
}

export async function adicionarRendimento(req: Request, res: Response, next: NextFunction) {
  try {
    const data = ClienteService.RendimentoSchema.parse(req.body)
    res.status(201).json(await ClienteService.adicionarRendimento(req.params.id, data))
  } catch (err) { next(err) }
}

export async function removerRendimento(req: Request, res: Response, next: NextFunction) {
  try {
    await ClienteService.removerRendimento(req.params.rendimentoId, req.params.id)
    res.status(204).end()
  } catch (err) { next(err) }
}
