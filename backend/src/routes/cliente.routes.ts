import { Router } from 'express'
import { authenticate, requireRole } from '../middlewares/auth'
import * as ClienteController from '../controllers/cliente.controller'

const router = Router()

router.use(authenticate)

// Perfil do próprio cliente logado
router.get('/me', requireRole('CLIENTE'), ClienteController.meuPerfil)

// Consulta geral restrita a agentes; cliente comum usa /me
router.get('/', requireRole('EMPRESA', 'BANCO'), ClienteController.listar)
router.get('/:id', requireRole('EMPRESA', 'BANCO'), ClienteController.buscarPorId)
router.put('/:id', requireRole('CLIENTE'), ClienteController.atualizar)
router.delete('/:id', requireRole('CLIENTE'), ClienteController.deletar)

// Rendimentos
router.post('/:id/rendimentos', requireRole('CLIENTE'), ClienteController.adicionarRendimento)
router.delete('/:id/rendimentos/:rendimentoId', requireRole('CLIENTE'), ClienteController.removerRendimento)

export default router
