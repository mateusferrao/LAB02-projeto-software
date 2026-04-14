import { PrismaClient, TipoUsuario, TipoProprietario } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // ── Limpeza ───────────────────────────────────────────────
  await prisma.contratoCredito.deleteMany()
  await prisma.pedidoAluguel.deleteMany()
  await prisma.automovel.deleteMany()
  await prisma.rendimento.deleteMany()
  await prisma.cliente.deleteMany()
  await prisma.empresa.deleteMany()
  await prisma.banco.deleteMany()
  await prisma.usuario.deleteMany()

  const hashSenha = (s: string) => bcrypt.hashSync(s, 10)

  // ── Usuário Cliente ───────────────────────────────────────
  const usuarioCliente = await prisma.usuario.create({
    data: {
      email: 'cliente@exemplo.com',
      senha: hashSenha('123456'),
      tipo: TipoUsuario.CLIENTE,
      cliente: {
        create: {
          rg: '12.345.678-9',
          cpf: '123.456.789-00',
          nome: 'João Silva',
          endereco: 'Rua das Flores, 123 — Belo Horizonte, MG',
          profissao: 'Engenheiro de Software',
          rendimentos: {
            create: [
              { entidadeEmpregadora: 'TechBH Ltda', valor: 8500 },
              { entidadeEmpregadora: 'Freelance', valor: 2000 },
            ],
          },
        },
      },
    },
  })

  // ── Usuário Empresa (agente) ──────────────────────────────
  const usuarioEmpresa = await prisma.usuario.create({
    data: {
      email: 'empresa@exemplo.com',
      senha: hashSenha('123456'),
      tipo: TipoUsuario.EMPRESA,
      empresa: {
        create: {
          cnpj: '12.345.678/0001-90',
          nome: 'MotorFlex Locações',
          endereco: 'Av. Cristiano Machado, 500 — BH, MG',
        },
      },
    },
  })

  // ── Usuário Banco (agente) ────────────────────────────────
  const usuarioBanco = await prisma.usuario.create({
    data: {
      email: 'banco@exemplo.com',
      senha: hashSenha('123456'),
      tipo: TipoUsuario.BANCO,
      banco: {
        create: {
          cnpj: '98.765.432/0001-10',
          nome: 'Banco AutoCredit',
          endereco: 'Rua da Bahia, 1000 — BH, MG',
        },
      },
    },
  })

  // ── Automóveis (gerenciados pela empresa) ─────────────────
  const empresa = await prisma.empresa.findFirst({ where: { usuarioId: usuarioEmpresa.id } })
  if (!empresa) throw new Error('Empresa não encontrada')

  const automoveis = await Promise.all([
    prisma.automovel.create({
      data: {
        matricula: 'MAT-001',
        ano: 2023,
        marca: 'BMW',
        modelo: 'Serie 3',
        placa: 'ABC-1234',
        fotoUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
        disponivel: true,
        proprietarioTipo: TipoProprietario.EMPRESA,
        proprietarioEmpresaId: empresa.id,
      },
    }),
    prisma.automovel.create({
      data: {
        matricula: 'MAT-002',
        ano: 2022,
        marca: 'Mercedes-Benz',
        modelo: 'C 200',
        placa: 'DEF-5678',
        fotoUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
        disponivel: true,
        proprietarioTipo: TipoProprietario.EMPRESA,
        proprietarioEmpresaId: empresa.id,
      },
    }),
    prisma.automovel.create({
      data: {
        matricula: 'MAT-003',
        ano: 2024,
        marca: 'Porsche',
        modelo: '911 Carrera',
        placa: 'GHI-9012',
        fotoUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80',
        disponivel: true,
        proprietarioTipo: TipoProprietario.EMPRESA,
        proprietarioEmpresaId: empresa.id,
      },
    }),
    prisma.automovel.create({
      data: {
        matricula: 'MAT-004',
        ano: 2023,
        marca: 'Audi',
        modelo: 'A4',
        placa: 'JKL-3456',
        fotoUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
        disponivel: true,
        proprietarioTipo: TipoProprietario.EMPRESA,
        proprietarioEmpresaId: empresa.id,
      },
    }),
    prisma.automovel.create({
      data: {
        matricula: 'MAT-005',
        ano: 2022,
        marca: 'Tesla',
        modelo: 'Model 3',
        placa: 'MNO-7890',
        fotoUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80',
        disponivel: false,
        proprietarioTipo: TipoProprietario.EMPRESA,
        proprietarioEmpresaId: empresa.id,
      },
    }),
    prisma.automovel.create({
      data: {
        matricula: 'MAT-006',
        ano: 2023,
        marca: 'Range Rover',
        modelo: 'Sport',
        placa: 'PQR-1234',
        fotoUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
        disponivel: true,
        proprietarioTipo: TipoProprietario.EMPRESA,
        proprietarioEmpresaId: empresa.id,
      },
    }),
  ])

  console.log(`✅ Seed concluído!`)
  console.log(`   👤 Cliente:  cliente@exemplo.com / 123456`)
  console.log(`   🏢 Empresa:  empresa@exemplo.com / 123456`)
  console.log(`   🏦 Banco:    banco@exemplo.com   / 123456`)
  console.log(`   🚗 ${automoveis.length} automóveis criados`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
