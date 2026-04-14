import { Router } from 'express'
import { authenticate, requireRole } from '../middlewares/auth'
import * as PedidoController from '../controllers/pedido.controller'

const router = Router()

router.use(authenticate)

// Cliente
router.post('/', requireRole('CLIENTE'), PedidoController.criar)
router.get('/meus', requireRole('CLIENTE'), PedidoController.meusPedidos)
router.patch('/:id/cancelar', requireRole('CLIENTE'), PedidoController.cancelar)

// Agentes (empresa e banco veem todos)
router.get('/', requireRole('EMPRESA', 'BANCO'), PedidoController.listarTodos)
router.patch('/:id/avaliar', requireRole('EMPRESA', 'BANCO'), PedidoController.avaliar)

// Banco: criar contrato de crédito
router.post('/contratos', requireRole('BANCO'), PedidoController.criarContrato)

// Detalhe
router.get('/:id', PedidoController.buscarPorId)

export default router
