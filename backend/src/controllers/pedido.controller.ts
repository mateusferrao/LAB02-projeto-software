import { Request, Response, NextFunction } from 'express'
import * as PedidoService from '../services/pedido.service'
import db from '../config/db'

export async function criar(req: Request, res: Response, next: NextFunction) {
  try {
    const { rows } = await db.query(
      'SELECT id FROM cliente WHERE usuario_id = $1', [req.user!.id],
    )
    if (!rows[0]) { res.status(404).json({ error: 'Perfil de cliente não encontrado' }); return }

    const data = PedidoService.CriarPedidoSchema.parse(req.body)
    res.status(201).json(await PedidoService.criar(rows[0].id, data))
  } catch (err) { next(err) }
}

export async function meusPedidos(req: Request, res: Response, next: NextFunction) {
  try {
    const { rows } = await db.query(
      'SELECT id FROM cliente WHERE usuario_id = $1', [req.user!.id],
    )
    if (!rows[0]) { res.json([]); return }
    res.json(await PedidoService.listarDoCliente(rows[0].id))
  } catch (err) { next(err) }
}

export async function listarTodos(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await PedidoService.listarTodos())
  } catch (err) { next(err) }
}

export async function buscarPorId(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await PedidoService.buscarPorId(req.params.id))
  } catch (err) { next(err) }
}

export async function cancelar(req: Request, res: Response, next: NextFunction) {
  try {
    const { rows } = await db.query(
      'SELECT id FROM cliente WHERE usuario_id = $1', [req.user!.id],
    )
    if (!rows[0]) { res.status(404).json({ error: 'Perfil de cliente não encontrado' }); return }
    res.json(await PedidoService.cancelar(req.params.id, rows[0].id))
  } catch (err) { next(err) }
}

export async function avaliar(req: Request, res: Response, next: NextFunction) {
  try {
    const data = PedidoService.AvaliarPedidoSchema.parse(req.body)
    res.json(await PedidoService.avaliar(req.params.id, req.user!, data))
  } catch (err) { next(err) }
}

export async function criarContrato(req: Request, res: Response, next: NextFunction) {
  try {
    const { rows } = await db.query(
      'SELECT id FROM banco WHERE usuario_id = $1', [req.user!.id],
    )
    if (!rows[0]) { res.status(404).json({ error: 'Perfil de banco não encontrado' }); return }

    const data = PedidoService.ContratoCreditoSchema.parse({ ...req.body, bancoId: rows[0].id })
    res.status(201).json(await PedidoService.criarContratoCredito(data))
  } catch (err) { next(err) }
}
