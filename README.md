# DriveNow — Sistema de Aluguel de Carros

> Projeto LAB02 — Laboratório de Desenvolvimento de Software  
> PUC Minas · 4º Período · Prof. João Paulo Carneiro Aramuni · 20 pontos

---

## Sobre o Projeto

Sistema web completo para gestão de aluguéis de automóveis, permitindo que clientes solicitem, acompanhem e cancelem pedidos de aluguel, enquanto agentes (empresas e bancos) analisam e aprovam essas solicitações. Bancos podem também emitir contratos de crédito vinculados aos aluguéis aprovados.

---

## Arquitetura

O sistema é **totalmente containerizado** com Docker Compose, composto por **três serviços**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose                           │
│                                                             │
│  ┌──────────────┐    HTTP     ┌──────────────────────────┐  │
│  │   frontend   │ ──────────► │        backend           │  │
│  │  Nginx :80   │             │  Node.js/Express :3001   │  │
│  │  (React SPA) │ ◄────────── │  Prisma ORM              │  │
│  └──────────────┘    JSON     └────────────┬─────────────┘  │
│       ▲                                    │ TCP            │
│       │ :5173                              ▼                │
│  [ Navegador ]               ┌─────────────────────────┐    │
│                              │           db            │    │
│                              │  PostgreSQL 16 :5432    │    │
│                              │  Volume: pgdata         │    │
│                              └─────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**Fluxo de uma requisição:**
1. Usuário acessa `http://localhost:5173` → Nginx serve o bundle React.
2. React faz chamadas REST para `http://localhost:3001` com JWT no header.
3. Express valida o token, executa a lógica de negócio via Service.
4. Prisma ORM traduz para SQL e consulta o PostgreSQL.
5. Resposta JSON volta ao React e atualiza a interface.

---

## Tecnologias

| Camada | Tecnologia | Versão | Motivo |
|--------|-----------|--------|--------|
| Frontend | React | 18 | SPA reativa e componentizada |
| Frontend | TypeScript | 5 | Tipagem estática, segurança |
| Frontend | Vite | 5 | Build ultrarrápido |
| Frontend | Tailwind CSS | 3 | Estilização utilitária |
| Frontend | Framer Motion | 11 | Micro-animações fluidas |
| Frontend | TanStack Query | 5 | Cache e estado do servidor |
| Frontend | React Hook Form | 7 | Formulários performáticos |
| Frontend | Axios | 1.7 | Cliente HTTP |
| Frontend | lucide-react | latest | Ícones SVG |
| Backend | Node.js | 20 | Runtime JS no servidor |
| Backend | TypeScript | 5 | Tipagem no backend |
| Backend | Express | 4 | Framework HTTP minimalista |
| Backend | Prisma ORM | 5 | ORM type-safe com migrations |
| Backend | bcryptjs | 2 | Hash de senhas |
| Backend | JSON Web Token | 9 | Autenticação stateless |
| Backend | Zod | 3 | Validação de schemas |
| Banco | PostgreSQL | 16 | Banco relacional robusto |
| Infra | Docker + Compose | latest | Containerização completa |
| Infra | Nginx | alpine | Servidor estático para SPA |
| Fontes | Bebas Neue + Inter | — | Tipografia automotiva premium |

---

## Estrutura de Pastas

```
LAB02-projeto-software/
│
├── backend/                      # API REST Node.js
│   ├── prisma/
│   │   ├── schema.prisma         # Modelos e relacionamentos
│   │   └── seed.ts               # Dados iniciais (usuários + carros)
│   ├── src/
│   │   ├── config/prisma.ts      # Singleton do PrismaClient
│   │   ├── controllers/          # Handlers HTTP (auth, cliente, automovel, pedido)
│   │   ├── middlewares/          # auth.ts (JWT) · errorHandler.ts
│   │   ├── routes/               # Definição das rotas Express
│   │   ├── services/             # Regras de negócio e acesso ao banco
│   │   └── server.ts             # Entry point Express
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                     # SPA React
│   ├── src/
│   │   ├── components/           # Navbar · CarCard · StatusBadge · ProtectedRoute
│   │   ├── contexts/             # AuthContext (JWT + user state)
│   │   ├── pages/                # Home · Login · Register · Catalogo · DetalheCarro
│   │   │                         # MeusPedidos · PainelAgente
│   │   ├── services/api.ts       # Axios instance + tipos TypeScript
│   │   ├── styles/globals.css    # Tailwind + componentes custom
│   │   ├── App.tsx               # Rotas React Router
│   │   └── main.tsx              # Entry point React
│   ├── Dockerfile                # Multi-stage: Vite build → Nginx
│   ├── nginx.conf                # Config SPA fallback
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   └── index.html                # Fontes Google + meta tags
│
├── docs/
│   ├── uml/
│   │   ├── casos-de-uso.puml     # Diagrama de Casos de Uso
│   │   ├── classes.puml          # Diagrama de Classes
│   │   ├── pacotes.puml          # Diagrama de Pacotes (Visão Lógica)
│   │   ├── componentes.puml      # Diagrama de Componentes
│   │   └── implantacao.puml      # Diagrama de Implantação
│   └── historias-usuario.md      # US01–US09 com critérios de aceitação
│
├── docker-compose.yml            # Orquestração: db + backend + frontend
├── .env.example                  # Variáveis de ambiente (modelo)
├── .gitignore
└── README.md
```

---

## Como Rodar Localmente

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (inclui Docker Compose)
- [Git](https://git-scm.com/)

### Passo a passo

```bash
# 1. Clonar o repositório
git clone <url-do-repo>
cd LAB02-projeto-software

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env se quiser alterar JWT_SECRET ou credenciais do banco

# 3. Subir todos os serviços
docker compose up --build

# 4. (Opcional) Popular banco com dados de exemplo
docker compose exec backend npm run seed
```

### URLs de acesso

| Serviço | URL |
|---------|-----|
| Frontend (React) | http://localhost:5173 |
| Backend (API REST) | http://localhost:3001 |
| Health check | http://localhost:3001/health |
| PostgreSQL | localhost:5432 |

### Contas de teste (após rodar seed)

| Tipo | Email | Senha |
|------|-------|-------|
| Cliente | cliente@exemplo.com | 123456 |
| Empresa | empresa@exemplo.com | 123456 |
| Banco | banco@exemplo.com | 123456 |

### Parar os serviços

```bash
docker compose down          # para e remove containers
docker compose down -v       # também remove o volume do banco
```

---

## Desenvolvimento sem Docker

Caso prefira rodar sem containers:

### Backend

```bash
cd backend
npm install

# Configure .env com DATABASE_URL apontando para seu Postgres local:
# DATABASE_URL=postgresql://usuario:senha@localhost:5432/rental

npx prisma migrate dev --name init
npm run seed      # opcional
npm run dev       # http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
# Configure VITE_API_URL no .env local (ou crie frontend/.env.local)
npm run dev       # http://localhost:5173
```

---

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `POSTGRES_USER` | Usuário do PostgreSQL | `rental` |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL | `rental` |
| `POSTGRES_DB` | Nome do banco | `rental` |
| `DATABASE_URL` | URL de conexão Prisma | `postgresql://rental:rental@db:5432/rental` |
| `JWT_SECRET` | Chave secreta do JWT | *(obrigatório trocar em prod)* |
| `JWT_EXPIRES_IN` | Expiração do token | `7d` |
| `PORT` | Porta do backend | `3001` |
| `VITE_API_URL` | URL da API (buildtime do Vite) | `http://localhost:3001` |

---

## Endpoints da API

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Cadastrar usuário (CLIENTE/EMPRESA/BANCO) |
| POST | `/auth/login` | Login · retorna JWT |

### Clientes
| Método | Rota | Acesso |
|--------|------|--------|
| GET | `/clientes` | Autenticado |
| GET | `/clientes/me` | CLIENTE |
| GET | `/clientes/:id` | Autenticado |
| PUT | `/clientes/:id` | CLIENTE |
| DELETE | `/clientes/:id` | CLIENTE |
| POST | `/clientes/:id/rendimentos` | CLIENTE |
| DELETE | `/clientes/:id/rendimentos/:rid` | CLIENTE |

### Automóveis
| Método | Rota | Acesso |
|--------|------|--------|
| GET | `/automoveis` | Público |
| GET | `/automoveis/:id` | Público |
| POST | `/automoveis` | EMPRESA / BANCO |
| PUT | `/automoveis/:id` | EMPRESA / BANCO |
| DELETE | `/automoveis/:id` | EMPRESA / BANCO |

### Pedidos
| Método | Rota | Acesso |
|--------|------|--------|
| POST | `/pedidos` | CLIENTE |
| GET | `/pedidos/meus` | CLIENTE |
| PATCH | `/pedidos/:id/cancelar` | CLIENTE |
| GET | `/pedidos` | EMPRESA / BANCO |
| PATCH | `/pedidos/:id/avaliar` | EMPRESA / BANCO |
| POST | `/pedidos/contratos` | BANCO |
| GET | `/pedidos/:id` | Autenticado |

---

## Documentação do Projeto

Todos os artefatos de modelagem estão em [`docs/`](./docs/).

| Arquivo | Descrição |
|---------|-----------|
| [`docs/uml/casos-de-uso.puml`](./docs/uml/casos-de-uso.puml) | Atores (Cliente, Empresa, Banco) e seus casos de uso |
| [`docs/uml/classes.puml`](./docs/uml/classes.puml) | Diagrama de Classes com entidades, atributos e relacionamentos |
| [`docs/uml/pacotes.puml`](./docs/uml/pacotes.puml) | Visão lógica dos pacotes Frontend e Backend |
| [`docs/uml/componentes.puml`](./docs/uml/componentes.puml) | Componentes de software e interfaces entre eles |
| [`docs/uml/implantacao.puml`](./docs/uml/implantacao.puml) | Containers Docker e comunicação entre nós |
| [`docs/historias-usuario.md`](./docs/historias-usuario.md) | US01–US09 com critérios de aceitação detalhados |

> Para renderizar os diagramas `.puml`: instale a extensão **PlantUML** no VS Code (requer Java + Graphviz) ou acesse [plantuml.com/plantuml](http://www.plantuml.com/plantuml/uml/).

---

## Sprints / Entregas

### Sprint 01 — Modelagem
- [x] Diagrama de Casos de Uso (`docs/uml/casos-de-uso.puml`)
- [x] Histórias de Usuário (`docs/historias-usuario.md`)
- [x] Diagrama de Classes (`docs/uml/classes.puml`)
- [x] Diagrama de Pacotes — Visão Lógica (`docs/uml/pacotes.puml`)

### Sprint 02 — CRUD de Cliente + Componentes
- [x] Diagrama de Componentes (`docs/uml/componentes.puml`)
- [x] CRUD de Cliente no backend (`/clientes`)
- [x] Telas de Login, Cadastro e perfil no frontend
- [ ] Revisão dos diagramas conforme feedback em aula

### Sprint 03 — Protótipo Completo
- [x] Diagrama de Implantação (`docs/uml/implantacao.puml`)
- [x] Fluxo completo: criar e visualizar pedido de aluguel
- [x] Painel do agente com avaliação e contrato de crédito
- [ ] Revisão final dos diagramas

---

## Equipe

| Membro | RA |
|--------|----|
| Mateus Ferrão da Costa | — |

---

## Licença

Projeto acadêmico — PUC Minas · 2025. Uso restrito ao contexto educacional.
