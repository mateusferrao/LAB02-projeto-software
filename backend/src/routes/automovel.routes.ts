import { Router } from 'express'
import { authenticate, requireRole } from '../middlewares/auth'
import * as AutomovelController from '../controllers/automovel.controller'

const router = Router()

// Listar / detalhar são públicos (sem auth)
router.get('/', AutomovelController.listar)
router.get('/:id', AutomovelController.buscarPorId)

// Criar / editar / deletar apenas agentes (empresa ou banco)
router.post('/', authenticate, requireRole('EMPRESA', 'BANCO'), AutomovelController.criar)
router.put('/:id', authenticate, requireRole('EMPRESA', 'BANCO'), AutomovelController.atualizar)
router.delete('/:id', authenticate, requireRole('EMPRESA', 'BANCO'), AutomovelController.deletar)

export default router
