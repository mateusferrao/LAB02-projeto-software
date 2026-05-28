# Code Review — DriveNow Rental System

> **Revisor:** Felipe Giannetti  
> **Data:** 2026-05-27  
> **Branch:** `code-review-felipe-giannetti`  
> **Escopo:** Revisão arquitetural completa (backend Node/TypeScript + frontend React/TypeScript)

---

## Sumário Executivo

O projeto DriveNow demonstra boas fundações de engenharia: TypeScript ponta-a-ponta, separação em camadas Controller → Service → DB, validação com Zod e autenticação JWT. No entanto, existem **violações de SOLID**, **problemas de segurança críticos**, **code smells recorrentes**, **ausência de testes** e oportunidades claras de aplicação de **Design Patterns** que elevariam o nível do sistema.

---

## Comentários por Arquivo

---

### 1. `backend/src/server.ts:13` — CORS Wildcard: Vulnerabilidade de Segurança

#### Problema identificado

```typescript
app.use(cors({ origin: '*', credentials: true }))
```

`origin: '*'` com `credentials: true` é uma combinação **inválida e perigosa**. O CORS wildcard permite que qualquer domínio externo envie requisições autenticadas à API. Além disso, navegadores modernos bloqueiam credenciais com wildcard origin, tornando a configuração inconsistente.

#### Impacto

- **Segurança**: Expõe a API a ataques CSRF e consumo não-autorizado por terceiros.
- **Produção inviável**: Browsers bloqueam cookies/credenciais com `*` + `credentials: true`.

#### Sugestão de melhoria

Usar allowlist explícita de origens via variável de ambiente:

```typescript
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173').split(',')

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) callback(null, true)
    else callback(new Error('Origem não permitida pelo CORS'))
  },
  credentials: true,
}))
```

#### Benefícios

- Controle explícito por ambiente (dev/staging/prod).
- Elimina risco de CSRF cross-origin.
- Alinhamento com OWASP Top 10 (A01: Broken Access Control).

---

### 2. `backend/src/server.ts:14` — Body Parser sem Proteção contra DoS

#### Problema identificado

```typescript
app.use(express.json({ limit: '10mb' }))
```

O limite de 10MB para o body é excessivo para uma API REST de aluguel de carros. Endpoints como `/auth/login` ou `/pedidos` jamais precisarão de payloads maiores que alguns kilobytes. Um atacante pode enviar payloads grandes repetidamente para esgotar memória do servidor.

#### Impacto

- **Segurança / Disponibilidade**: Vetor de DoS via HTTP Flood com payloads grandes.
- **Performance**: Alocação desnecessária de memória para cada requisição.

#### Sugestão de melhoria

Reduzir para `100kb` (suficiente para todos os casos de uso do projeto) e adicionar rate limiting:

```typescript
import rateLimit from 'express-rate-limit'

app.use(express.json({ limit: '100kb' }))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)
```

#### Benefícios

- Mitiga DoS por volume de requisições (OWASP A05: Security Misconfiguration).
- Reduz footprint de memória por requisição.

---

### 3. `backend/src/server.ts` — Ausência de Rate Limiting na API

#### Problema identificado

Não existe nenhum middleware de rate limiting. Isso permite que bots realizem brute-force no endpoint `/auth/login` sem qualquer limitação, testando combinações de senha indefinidamente.

#### Impacto

- **Segurança**: Vulnerável a brute-force de credenciais (OWASP A07: Identification and Authentication Failures).
- **Disponibilidade**: Sem proteção contra flood de requisições.

#### Sugestão de melhoria

Aplicar rate limiting diferenciado por rota:

```typescript
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 })
app.use('/auth/login', authLimiter)
app.use('/auth/register', authLimiter)
```

#### Benefícios

- Proteção direta contra credential stuffing e brute-force.
- Baixo custo de implementação (`express-rate-limit` já é popular e mantido).

---

### 4. `backend/src/services/auth.service.ts:6-16` — Validação de CPF/CNPJ Ausente no Schema Zod

#### Problema identificado

```typescript
cpf: z.string().optional(),
cnpj: z.string().optional(),
```

CPF e CNPJ são aceitos como **qualquer string**. Não há validação de formato, dígitos verificadores ou máscara. Um CPF `"abc"` ou `"00000000000"` seria aceito silenciosamente e persistido no banco.

#### Impacto

- **Integridade de dados**: Banco acumula dados inválidos desde o primeiro cadastro.
- **Regras de negócio**: Impossível auditar ou consultar CPF/CNPJ futuramente.

#### Sugestão de melhoria

Implementar validação com `.refine()` do Zod:

```typescript
function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) return false
  // algoritmo dos dígitos verificadores
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i)
  const d1 = (sum * 10) % 11 % 10
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i)
  const d2 = (sum * 10) % 11 % 10
  return d1 === parseInt(cleaned[9]) && d2 === parseInt(cleaned[10])
}

cpf: z.string().refine(isValidCPF, { message: 'CPF inválido' }).optional(),
```

#### Benefícios

- Integridade referencial garantida na camada de aplicação antes de tocar o banco.
- Mensagens de erro claras para o usuário.

---

### 5. `backend/src/services/auth.service.ts:43-62` — Violação do Open/Closed Principle (OCP)

#### Problema identificado

```typescript
if (data.tipo === 'CLIENTE') {
  // INSERT cliente
} else if (data.tipo === 'EMPRESA') {
  // INSERT empresa
} else {
  // INSERT banco
}
```

Toda vez que um novo tipo de usuário for adicionado, esta função precisa ser **modificada**. Isso viola diretamente o OCP do SOLID: entidades devem estar abertas para extensão, fechadas para modificação.

#### Impacto

- **Manutenibilidade**: Crescimento linear de complexidade a cada novo tipo.
- **Testabilidade**: Testes unitários precisam cobrir todos os branches do mesmo método.
- **Acoplamento**: A função conhece os detalhes de implementação de cada perfil.

#### Sugestão de melhoria

Aplicar o padrão **Strategy** com um mapa de criadores de perfil:

```typescript
type ProfileCreator = (client: PoolClient, usuarioId: string, data: RegisterData) => Promise<Record<string, unknown>>

const profileCreators: Record<TipoUsuario, ProfileCreator> = {
  CLIENTE: async (client, userId, data) => {
    const { rows } = await client.query(
      `INSERT INTO cliente (usuario_id, rg, cpf, nome, endereco, profissao) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [userId, data.rg ?? '', data.cpf ?? '', data.nome ?? '', data.endereco ?? '', data.profissao ?? ''],
    )
    return rows[0]
  },
  EMPRESA: async (client, userId, data) => { /* ... */ },
  BANCO:   async (client, userId, data) => { /* ... */ },
}

// Na função register:
const perfil = await profileCreators[data.tipo](client, usuarioId, data)
```

#### Benefícios

- Adicionar `CORRETOR` ou `SEGURADORA` como novo tipo exige apenas adicionar uma entrada no mapa.
- Cada criador pode ser testado isoladamente.
- `register()` não precisa mais ser alterada.

---

### 6. `backend/src/services/auth.service.ts:98-103` — Uso de `as any` e Non-null Assertion no JWT

#### Problema identificado

```typescript
return jwt.sign({ id, email, tipo }, process.env.JWT_SECRET!, {
  expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as any,
})
```

Dois problemas: o `!` non-null assertion em `JWT_SECRET` dispara `JsonWebTokenError` em runtime se a variável estiver ausente; o `as any` silencia o sistema de tipos sem razão — `expiresIn` aceita `string` nativamente.

#### Impacto

- **Segurança**: Se `JWT_SECRET` não estiver definida, o servidor sobe com secret `undefined` e assina tokens inválidos silenciosamente.
- **Confiabilidade**: `as any` mascara incompatibilidades de tipo que o compilador detectaria.

#### Sugestão de melhoria

Validar variáveis de ambiente na inicialização com falha rápida:

```typescript
// src/config/env.ts
function requireEnv(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Variável de ambiente obrigatória ausente: ${key}`)
  return val
}

export const env = {
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  PORT: Number(process.env.PORT ?? 3001),
}

// auth.service.ts
import { env } from '../config/env'
return jwt.sign({ id, email, tipo }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN })
```

#### Benefícios

- Falha imediata na inicialização se variável crítica estiver ausente (Fail Fast).
- Elimina `as any` e non-null assertions desnecessários.
- Configuração centralizada e reutilizável.

---

### 7. `backend/src/services/` — Função `erro()` Duplicada em 4 Services (DRY Violation)

#### Problema identificado

A função auxiliar `erro()` é **copiada identicamente** em `auth.service.ts:105-109`, `pedido.service.ts:150-154`, `cliente.service.ts:97-101` e `automovel.service.ts:78-82`:

```typescript
function erro(msg: string, status: number): never {
  const e = new Error(msg) as Error & { status: number }
  e.status = status
  throw e
}
```

#### Impacto

- **Manutenibilidade**: Qualquer alteração (ex.: adicionar logging) exige mudança em 4 arquivos.
- **Inconsistência**: Risco de divergência entre cópias ao longo do tempo.

#### Sugestão de melhoria

Extrair para um módulo utilitário compartilhado:

```typescript
// src/utils/errors.ts
export class AppError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message)
    this.name = 'AppError'
  }
}

export function assertFound<T>(value: T | undefined, entity: string): asserts value is T {
  if (!value) throw new AppError(`${entity} não encontrado`, 404)
}
```

#### Benefícios

- Ponto único de manutenção para o mecanismo de erro de domínio.
- `AppError` é instanciável e testável.
- `assertFound` elimina padrão repetido `if (!rows[0]) erro(...)`.

---

### 8. `backend/src/middlewares/auth.ts:29` — JWT_SECRET Sem Validação de Inicialização

#### Problema identificado

```typescript
const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload
```

O operador `!` diz ao TypeScript para ignorar a possibilidade de `undefined`. Se `JWT_SECRET` não estiver no `.env`, `jwt.verify` recebe `undefined` como secret e lança `JsonWebTokenError`, mas o servidor já estava rodando em estado inválido há horas.

#### Impacto

- **Segurança**: Tokens podem ser verificados com secret `undefined` (biblioteca pode aceitar como vacuamente válidos dependendo da versão).
- **Observabilidade**: O erro aparece na primeira requisição autenticada, não na inicialização.

#### Sugestão de melhoria

Resolver via `env.ts` centralizado (ver comentário #6). O middleware passa a usar `env.JWT_SECRET` que é garantidamente não-nulo.

---

### 9. `backend/src/middlewares/errorHandler.ts:26-29` — Vazamento de Mensagens de Erro Internas

#### Problema identificado

```typescript
if (err instanceof Error) {
  const status = (err as Error & { status?: number }).status ?? 500
  res.status(status).json({ error: err.message })
}
```

`err.message` de erros internos (ex.: falha de conexão com banco, stack overflow, erro de dependência) é enviado diretamente ao cliente. Isso expõe detalhes de implementação interna.

#### Impacto

- **Segurança**: Stack traces, nomes de tabelas, queries SQL podem vazar ao cliente (OWASP A09: Security Logging and Monitoring Failures).
- **Experiência**: Mensagens técnicas confundem usuários finais.

#### Sugestão de melhoria

Diferenciar erros de domínio (seguros de expor) de erros inesperados (ocultar):

```typescript
import { AppError } from '../utils/errors'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // Erros de domínio: seguros para expor
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message })
    return
  }

  // Erros inesperados: logar internamente, não expor
  console.error('[INTERNAL ERROR]', err)
  res.status(500).json({ error: 'Erro interno do servidor' })
}
```

#### Benefícios

- Mensagens seguras em produção.
- Log estruturado para erros inesperados.
- Separação clara entre erros de negócio e erros de sistema.

---

### 10. `backend/src/controllers/pedido.controller.ts:7-9` — Controller Acessando o Banco Diretamente (SRP Violation)

#### Problema identificado

```typescript
import db from '../config/db'

export async function criar(req: Request, res: Response, next: NextFunction) {
  const { rows } = await db.query('SELECT id FROM cliente WHERE usuario_id = $1', [req.user!.id])
  // ...
}
```

O controller faz uma query direta ao banco para resolver `usuarioId → clienteId`. A mesma lógica ocorre em `meusPedidos`, `cancelar` e `criarContrato`. Controllers devem ser responsáveis apenas por orquestrar HTTP ↔ Service, nunca por acessar a camada de dados diretamente.

#### Impacto

- **SRP**: O controller acumula responsabilidades de resolução de identidade + HTTP handling.
- **Testabilidade**: Testes de controller precisam mockar o banco diretamente.
- **Duplicação**: A query `SELECT id FROM cliente WHERE usuario_id = $1` aparece 3 vezes no mesmo arquivo.

#### Sugestão de melhoria

Mover a resolução `usuarioId → clienteId` para o service ou para um helper de contexto:

```typescript
// cliente.service.ts (já existe buscarPorUsuarioId — usar!)
export async function buscarIdPorUsuarioId(usuarioId: string): Promise<string | null> {
  const { rows } = await db.query('SELECT id FROM cliente WHERE usuario_id = $1', [usuarioId])
  return rows[0]?.id ?? null
}

// pedido.controller.ts — sem import de db
export async function criar(req: Request, res: Response, next: NextFunction) {
  try {
    const clienteId = await ClienteService.buscarIdPorUsuarioId(req.user!.id)
    if (!clienteId) { res.status(404).json({ error: 'Perfil de cliente não encontrado' }); return }
    const data = PedidoService.CriarPedidoSchema.parse(req.body)
    res.status(201).json(await PedidoService.criar(clienteId, data))
  } catch (err) { next(err) }
}
```

#### Benefícios

- Controller sem import de `db` — camadas respeitadas.
- A query de resolução é testada uma única vez no service.
- Manutenção centralizada da lógica de identidade.

---

### 11. `backend/src/services/pedido.service.ts:55-68` — Ausência de Paginação em `listarTodos()`

#### Problema identificado

```typescript
export async function listarTodos() {
  const { rows } = await db.query(
    `SELECT p.*, row_to_json(a.*) AS automovel, row_to_json(c.*) AS cliente, ...
     FROM pedido_aluguel p
     JOIN automovel a ...
     JOIN cliente c ...
     ORDER BY p.criado_em DESC`,
  )
  return rows
}
```

Sem `LIMIT`/`OFFSET`, esta query retorna **todos os pedidos de todos os tempos** em uma única chamada. Em produção, com milhares de pedidos, isso causa timeout de banco, consumo excessivo de memória e lentidão no frontend.

#### Impacto

- **Performance**: Crescimento linear O(n) no tempo de resposta e uso de memória.
- **Escalabilidade**: Inviabiliza o sistema com volume real de dados.

#### Sugestão de melhoria

Implementar paginação via cursor ou offset:

```typescript
export async function listarTodos(page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize
  const [{ rows }, { rows: total }] = await Promise.all([
    db.query(`SELECT ... ORDER BY p.criado_em DESC LIMIT $1 OFFSET $2`, [pageSize, offset]),
    db.query(`SELECT COUNT(*) FROM pedido_aluguel`),
  ])
  return { data: rows, total: Number(total[0].count), page, pageSize }
}
```

#### Benefícios

- Resposta em tempo constante independente do volume de dados.
- Alinhamento com boas práticas REST (query params `?page=1&pageSize=20`).

---

### 12. `backend/src/services/pedido.service.ts:104-118` — Máquina de Estados Sem Validação de Transições

#### Problema identificado

```typescript
export async function avaliar(id: string, avaliadorId: string, data: z.infer<typeof AvaliarPedidoSchema>) {
  const { rows } = await db.query('SELECT id FROM pedido_aluguel WHERE id = $1', [id])
  if (!rows[0]) erro('Pedido não encontrado', 404)

  const { rows: updated } = await db.query(
    `UPDATE pedido_aluguel SET status = $1, avaliador_id = $2, ...`,
    [data.status, avaliadorId, ...]
  )
}
```

Qualquer agente pode mover um pedido `CANCELADO` ou `EXECUTADO` de volta para `APROVADO`. A função busca apenas o ID do pedido, mas não verifica o status atual antes de aplicar a transição.

#### Impacto

- **Integridade**: Transições inválidas corrompem o fluxo de negócio.
- **Segurança**: Uma empresa pode "reativar" um pedido já executado.

#### Sugestão de melhoria

Definir a máquina de estados explicitamente e validar antes de atualizar:

```typescript
const TRANSICOES_VALIDAS: Record<string, string[]> = {
  PENDENTE:    ['EM_ANALISE', 'APROVADO', 'REJEITADO'],
  EM_ANALISE:  ['APROVADO', 'REJEITADO'],
  APROVADO:    [],
  REJEITADO:   [],
  CANCELADO:   [],
  EXECUTADO:   [],
}

export async function avaliar(id: string, avaliadorId: string, data: AvaliarData) {
  const { rows } = await db.query('SELECT id, status FROM pedido_aluguel WHERE id = $1', [id])
  if (!rows[0]) erro('Pedido não encontrado', 404)

  const permitidos = TRANSICOES_VALIDAS[rows[0].status] ?? []
  if (!permitidos.includes(data.status)) {
    erro(`Transição inválida: ${rows[0].status} → ${data.status}`, 400)
  }
  // ... update
}
```

#### Benefícios

- Regras de negócio explícitas e documentadas no código.
- Impossível atingir estado inválido via API.
- Fácil extensão (adicionar novo status = nova entrada no mapa).

---

### 13. `backend/src/services/cliente.service.ts:58-71` — Construção Dinâmica de SQL: Code Smell e Risco Latente

#### Problema identificado

```typescript
export async function atualizar(id: string, data: ...) {
  const sets: string[] = []
  const vals: unknown[] = []
  let i = 1
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) { sets.push(`${toSnake(k)} = $${i++}`); vals.push(v) }
  }
  const { rows } = await db.query(
    `UPDATE cliente SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals,
  )
}
```

Embora os valores sejam parametrizados, o **nome das colunas** é interpolado via `toSnake(k)` onde `k` vem de `Object.entries(data)`. Se o schema Zod aceitar uma chave inesperada (ex.: após refactor), o nome de coluna será interpolado diretamente na query.

#### Impacto

- **Segurança**: Risco latente de injeção de nome de coluna se a validação do schema falhar ou for bypassada.
- **Fragilidade**: `toSnake()` pode gerar nome de coluna inexistente silenciosamente (erro de banco em runtime).

#### Sugestão de melhoria

Usar uma allowlist explícita de colunas permitidas:

```typescript
const ALLOWED_COLUMNS: Record<string, string> = {
  rg: 'rg', cpf: 'cpf', nome: 'nome', endereco: 'endereco', profissao: 'profissao',
}

export async function atualizar(id: string, data: ClienteUpdate) {
  const entries = Object.entries(data).filter(([k, v]) => v !== undefined && k in ALLOWED_COLUMNS)
  if (entries.length === 0) return buscarPorId(id)

  let i = 1
  const sets = entries.map(([k]) => `${ALLOWED_COLUMNS[k]} = $${i++}`)
  const vals = [...entries.map(([, v]) => v), id]

  const { rows } = await db.query(
    `UPDATE cliente SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals,
  )
  return rows[0]
}
```

#### Benefícios

- Somente colunas conhecidas e autorizadas podem ser atualizadas.
- Elimina dependência frágil de `toSnake()`.

---

### 14. `backend/src/services/automovel.service.ts:4-16` — Propriedade Polimórfica Sem Constraint de Integridade

#### Problema identificado

```typescript
export const AutomovelSchema = z.object({
  proprietarioTipo: z.enum(['CLIENTE', 'EMPRESA', 'BANCO']),
  proprietarioClienteId: z.string().uuid().optional(),
  proprietarioEmpresaId: z.string().uuid().optional(),
  proprietarioBancoId: z.string().uuid().optional(),
})
```

O schema Zod e o banco de dados aceitam um automóvel com `proprietarioTipo = 'CLIENTE'` mas nenhum `proprietarioClienteId` — ou pior, com todos os três IDs preenchidos simultaneamente. Não há constraint garantindo que exatamente um FK seja não-nulo.

#### Impacto

- **Integridade referencial**: Dados inconsistentes podem ser inseridos (proprietário sem FK).
- **Runtime**: Queries que dependem do FK do proprietário terão `NULL` inesperado.

#### Sugestão de melhoria

**No Zod** — discriminated union por tipo:

```typescript
const BaseSchema = z.object({ matricula: z.string().min(1), /* ... */ })

export const AutomovelSchema = z.discriminatedUnion('proprietarioTipo', [
  BaseSchema.extend({ proprietarioTipo: z.literal('CLIENTE'), proprietarioClienteId: z.string().uuid() }),
  BaseSchema.extend({ proprietarioTipo: z.literal('EMPRESA'), proprietarioEmpresaId: z.string().uuid() }),
  BaseSchema.extend({ proprietarioTipo: z.literal('BANCO'),   proprietarioBancoId: z.string().uuid() }),
])
```

**No banco** — CHECK constraint:

```sql
ALTER TABLE automovel ADD CONSTRAINT chk_proprietario_exclusivo CHECK (
  (proprietario_tipo = 'CLIENTE' AND proprietario_cliente_id IS NOT NULL AND proprietario_empresa_id IS NULL AND proprietario_banco_id IS NULL)
  OR
  (proprietario_tipo = 'EMPRESA' AND proprietario_empresa_id IS NOT NULL AND proprietario_cliente_id IS NULL AND proprietario_banco_id IS NULL)
  OR
  (proprietario_tipo = 'BANCO'   AND proprietario_banco_id IS NOT NULL AND proprietario_cliente_id IS NULL AND proprietario_empresa_id IS NULL)
);
```

#### Benefícios

- Integridade garantida em duas camadas (aplicação + banco).
- TypeScript narrowing automático pelo discriminated union.

---

### 15. `backend/src/config/initDb.ts` — Auto-Inicialização de Schema em Runtime: Anti-Pattern de Produção

#### Problema identificado

```typescript
export async function initDatabase() {
  const { rows } = await db.query(`SELECT to_regclass('public.usuario') AS existe`)
  if (rows[0]?.existe) return
  const schemaSql = await readFile(schemaPath, 'utf8')
  await db.query(schemaSql)
}
```

A inicialização do schema ocorre automaticamente ao iniciar o servidor, apenas verificando se a tabela `usuario` existe. Isso tem vários problemas: não gerencia **migrações incrementais** (apenas criação inicial), não é idempotente para alterações, e pode falhar silenciosamente em ambientes de produção.

#### Impacto

- **Produção**: Impossível adicionar colunas, índices ou novas tabelas sem reescrever o `schema.sql` inteiro e dropar o banco.
- **Dados**: Risco de perda de dados em reimplantações.

#### Sugestão de melhoria

Adotar o **Prisma Migrate** (o `schema.prisma` já existe no projeto mas não é utilizado):

```bash
# Gerar migration a partir do schema.prisma
npx prisma migrate dev --name init

# Em produção:
npx prisma migrate deploy
```

Remover `initDb.ts` e substituir pelo comando de migrate no entrypoint do Docker.

#### Benefícios

- Histórico completo de migrações com rollback.
- Compatível com CI/CD (migrate deploy como step separado).
- `schema.prisma` já presente — migração com baixo esforço.

---

### 16. `frontend/src/services/api.ts:86-95` — Interfaces com Dupla Nomenclatura (camelCase + snake_case)

#### Problema identificado

```typescript
export interface Automovel {
  fotoUrl?: string       // camelCase
  foto_url?: string      // snake_case
  proprietarioTipo: 'CLIENTE' | 'EMPRESA' | 'BANCO'
  proprietario_empresa_id?: string  // snake_case
}

export interface PedidoAluguel {
  dataInicio: string
  data_inicio?: string  // duplicata snake_case
}
```

A API retorna campos em `snake_case` (padrão PostgreSQL/Node.js), e o frontend tenta cobrir ambas as convenções duplicando os campos nas interfaces. Isso gera tipos inconsistentes, dificulta o autocomplete e força funções auxiliares como `automovelFotoUrl()` e `pedidoDataInicio()`.

#### Impacto

- **Manutenibilidade**: Toda nova propriedade precisa ser adicionada duas vezes.
- **Type Safety**: TypeScript não sabe qual campo usar, ambos são opcionais.
- **Acoplamento**: Frontend acoplado a detalhes de implementação do ORM/banco.

#### Sugestão de melhoria

Padronizar no backend com serialização camelCase antes de responder:

```typescript
// backend: middleware de transformação de resposta
import { camelCase } from 'camel-case'

function toCamelCase(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(toCamelCase)
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [camelCase(k), toCamelCase(v)])
    )
  }
  return obj
}

// Ou usar `pg-camelcase` / configurar `knex`/`prisma` para retornar camelCase
```

#### Benefícios

- Interfaces sem duplicatas.
- Funções auxiliares `automovelFotoUrl`/`pedidoDataInicio` eliminadas.
- Frontend desacoplado do naming do banco.

---

### 17. `frontend/src/contexts/AuthContext.tsx:43-48` — Token JWT Persistido em localStorage: Risco de XSS

#### Problema identificado

```typescript
const persist = (token: string, user: Usuario) => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}
```

`localStorage` é acessível por qualquer JavaScript da página. Se o aplicativo tiver uma vulnerabilidade XSS (mesmo pequena), o token JWT pode ser roubado por scripts maliciosos e reutilizado indefinidamente (o token tem 7 dias de validade).

#### Impacto

- **Segurança**: Tokens roubados via XSS são válidos por 7 dias (OWASP A02: Cryptographic Failures).
- **Sem revogação**: JWTs stateless não podem ser invalidados antes do vencimento.

#### Sugestão de melhoria

Armazenar o token em **HttpOnly Cookie** (inacessível via JavaScript):

```typescript
// Backend: retornar token como cookie
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
})

// Frontend: remover localStorage.setItem('token')
// Axios envia cookies automaticamente com { withCredentials: true }
```

#### Benefícios

- Token inacessível via JavaScript — elimina risco de XSS token theft.
- Compatível com CSRF protection via `sameSite: 'strict'`.

---

### 18. `frontend/src/pages/PainelAgente.tsx` e `frontend/src/pages/MeusPedidos.tsx` — Constante FALLBACK Duplicada

#### Problema identificado

```typescript
// PainelAgente.tsx:11
const FALLBACK = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80'

// MeusPedidos.tsx:8
const FALLBACK = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80'
```

A mesma URL hardcoded está em dois arquivos. Se a imagem for alterada ou o domínio mudar, é necessário lembrar de alterar em múltiplos lugares.

#### Impacto

- **Manutenibilidade**: Violação de DRY (Don't Repeat Yourself).
- **Fragilidade**: URL de terceiro (Unsplash) pode mudar ou ser bloqueada.

#### Sugestão de melhoria

Centralizar em um arquivo de constantes:

```typescript
// src/config/constants.ts
export const CAR_FALLBACK_IMAGE = '/images/car-placeholder.webp'
```

Idealmente, usar uma imagem local em vez de URL externa.

#### Benefícios

- Mudança em um único local.
- Sem dependência de CDN externo para funcionalidade de UI.

---

### 19. `frontend/src/pages/PainelAgente.tsx` — God Component: Violação de SRP no Frontend

#### Problema identificado

O componente `PainelAgente` acumula responsabilidades excessivas em um único arquivo de 224 linhas:
- Fetching de dados (query)
- Lógica de avaliação (mutation)
- Lógica de criação de contrato (mutation + formulário)
- Renderização da lista de pedidos
- Renderização do modal de avaliação
- Renderização do modal de contrato
- Cálculo de estatísticas

#### Impacto

- **SRP**: O componente tem múltiplas razões para mudar.
- **Testabilidade**: Impossível testar a lógica de contrato sem renderizar o painel inteiro.
- **Reutilização**: Modal de avaliação poderia ser reutilizado em outros contextos.

#### Sugestão de melhoria

Decomposição em componentes menores com responsabilidades únicas:

```
components/
  painel/
    PedidoCard.tsx          — renderização de um pedido
    AvaliacaoModal.tsx      — modal de aprovação/rejeição
    ContratoModal.tsx       — modal de criação de contrato
    EstatisticasBar.tsx     — chips de contagem
  
pages/
  PainelAgente.tsx          — orquestração apenas (~50 linhas)
```

#### Benefícios

- Cada componente tem uma única razão para mudar.
- Testável unitariamente com React Testing Library.
- `AvaliacaoModal` reutilizável em outros fluxos.

---

### 20. `frontend/src/pages/Catalogo.tsx:13-21` — Filtro Client-Side em Catálogo Completo

#### Problema identificado

```typescript
const { data: cars = [] } = useQuery<Automovel[]>({
  queryKey: ['automoveis'],
  queryFn: () => api.get('/automoveis').then((r) => r.data),
})

const filtered = cars.filter((c) => {
  const q = search.toLowerCase()
  return c.marca.toLowerCase().includes(q) || c.modelo.toLowerCase().includes(q)
})
```

O frontend carrega **toda a frota de veículos** e filtra localmente. Quando o catálogo crescer (centenas/milhares de veículos), isso cria latência de rede, excesso de memória no browser e re-renderizações desnecessárias a cada keystroke.

#### Impacto

- **Performance**: Transferência desnecessária de dados (payload cresce indefinidamente).
- **UX**: Re-renderização síncrona a cada caractere digitado.
- **Escalabilidade**: Incompatível com crescimento da frota.

#### Sugestão de melhoria

Mover filtro para o backend com debounce no frontend:

```typescript
// Backend: GET /automoveis?search=ford&disponivel=true&page=1
export async function listar(search?: string, somenteDisponiveis = false, page = 1) {
  const where: string[] = []
  const vals: unknown[] = []
  let i = 1
  if (search) { where.push(`(marca ILIKE $${i} OR modelo ILIKE $${i})`); vals.push(`%${search}%`); i++ }
  if (somenteDisponiveis) { where.push('disponivel = TRUE') }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''
  // ...
}

// Frontend: useDebounce + queryKey com parâmetros
const debouncedSearch = useDebounce(search, 300)
const { data } = useQuery({
  queryKey: ['automoveis', debouncedSearch, somenteDisponiveis, page],
  queryFn: () => api.get('/automoveis', { params: { search: debouncedSearch, disponivel: somenteDisponiveis } })
})
```

#### Benefícios

- Payload de rede reduzido drasticamente.
- Banco de dados usa índices para busca (muito mais rápido que filter JS).
- UX melhorada com debounce (sem re-render a cada tecla).

---

### 21. `frontend/src/App.tsx` — Ausência de Error Boundary Global

#### Problema identificado

Não existe nenhum `ErrorBoundary` na árvore de componentes. Se qualquer componente lançar um erro de renderização (ex.: tentativa de acessar propriedade de `undefined`), o React desmonta **toda a aplicação** exibindo uma tela em branco — sem mensagem útil ao usuário, sem logging do erro.

#### Impacto

- **UX**: Tela branca sem feedback ao usuário.
- **Observabilidade**: Erros de renderização passam despercebidos.

#### Sugestão de melhoria

```typescript
// src/components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
    // Integrar com Sentry/Datadog aqui
  }
  render() {
    if (this.state.hasError) return <ErrorPage />
    return this.props.children
  }
}

// App.tsx
<ErrorBoundary>
  <BrowserRouter>...</BrowserRouter>
</ErrorBoundary>
```

#### Benefícios

- Degradação elegante com página de erro amigável.
- Ponto central para integração com ferramentas de monitoramento (Sentry).

---

### 22. `backend/` — Ausência Total de Testes Automatizados

#### Problema identificado

Nenhum arquivo de teste foi encontrado no projeto (`.test.ts`, `.spec.ts`, `__tests__/`). Isso significa que qualquer refatoração ou nova funcionalidade pode introduzir regressões sem detecção automática.

#### Impacto

- **Qualidade**: Zero garantia de correctness em mudanças futuras.
- **CI/CD**: Impossível montar pipeline de entrega contínua confiável.
- **Documentação viva**: Testes documentam o comportamento esperado.

#### Sugestão de melhoria

Priorizar testes para as regras de negócio mais críticas:

```typescript
// tests/pedido.service.test.ts
describe('pedido.service.avaliar', () => {
  it('deve rejeitar transição CANCELADO → APROVADO', async () => {
    // Arrange: criar pedido CANCELADO no banco de teste
    // Act: chamar avaliar(..., { status: 'APROVADO' })
    // Assert: erro 400 com mensagem de transição inválida
  })

  it('deve permitir PENDENTE → EM_ANALISE', async () => { /* ... */ })
})
```

Stack sugerida: **Vitest** (compatível com TypeScript, rápido) + **supertest** para testes de integração.

#### Benefícios

- Confiança para refatorar (incluindo as melhorias sugeridas neste review).
- Documentação executável das regras de negócio.
- Requisito para deploy em produção real.

---

### 23. `backend/src/services/pedido.service.ts:24-38` — Race Condition na Verificação de Disponibilidade

#### Problema identificado

```typescript
export async function criar(clienteId: string, data: ...) {
  const { rows: autos } = await db.query('SELECT id, disponivel FROM automovel WHERE id = $1', [data.automovelId])
  if (!autos[0].disponivel) erro('Automóvel não está disponível', 409)

  // ← JANELA DE RACE CONDITION AQUI

  const { rows } = await db.query(`INSERT INTO pedido_aluguel ...`)
}
```

Entre a verificação de disponibilidade (`SELECT`) e a criação do pedido (`INSERT`), outro cliente pode criar um pedido para o mesmo veículo. Ambos passarão na verificação e o automóvel ficará com dois pedidos ativos simultaneamente (Time-of-Check to Time-of-Use — TOCTOU).

#### Impacto

- **Integridade**: Dois clientes podem alugar o mesmo carro ao mesmo tempo.
- **Negócio**: Conflito de reservas em cenário de alta concorrência.

#### Sugestão de melhoria

Usar `SELECT FOR UPDATE` para bloquear o registro durante a transação:

```typescript
const client = await db.connect()
try {
  await client.query('BEGIN')
  const { rows: autos } = await client.query(
    'SELECT id, disponivel FROM automovel WHERE id = $1 FOR UPDATE',
    [data.automovelId]
  )
  if (!autos[0]) erro('Automóvel não encontrado', 404)
  if (!autos[0].disponivel) erro('Automóvel não está disponível', 409)

  const { rows } = await client.query(`INSERT INTO pedido_aluguel ...`)
  await client.query('COMMIT')
  return buscarPorId(rows[0].id)
} catch (e) {
  await client.query('ROLLBACK')
  throw e
} finally {
  client.release()
}
```

#### Benefícios

- Atomicidade garantida — apenas um pedido aprovado por vez por veículo.
- Sem necessidade de lógica de retry no cliente.

---

## Resumo Geral

| # | Arquivo | Categoria | Severidade |
|---|---------|-----------|------------|
| 1 | `server.ts:13` | Segurança (CORS) | Alta |
| 2 | `server.ts:14` | Segurança (DoS) | Média |
| 3 | `server.ts` | Segurança (Rate Limit) | Alta |
| 4 | `auth.service.ts:6-16` | Validação (CPF/CNPJ) | Média |
| 5 | `auth.service.ts:43-62` | SOLID (OCP) / Strategy Pattern | Baixa |
| 6 | `auth.service.ts:98-103` | Segurança / TypeScript | Alta |
| 7 | `services/*.ts` | DRY / Manutenibilidade | Baixa |
| 8 | `middlewares/auth.ts:29` | Segurança | Alta |
| 9 | `errorHandler.ts:26-29` | Segurança (Info Leak) | Média |
| 10 | `pedido.controller.ts:7-9` | SOLID (SRP) / Arquitetura | Média |
| 11 | `pedido.service.ts:55-68` | Performance (Paginação) | Média |
| 12 | `pedido.service.ts:104-118` | Integridade (State Machine) | Média |
| 13 | `cliente.service.ts:58-71` | Segurança (SQL dinâmico) | Média |
| 14 | `automovel.service.ts:4-16` | Integridade (Discriminated Union) | Média |
| 15 | `initDb.ts` | Arquitetura (Migrations) | Média |
| 16 | `api.ts:86-95` | Manutenibilidade (Naming) | Baixa |
| 17 | `AuthContext.tsx:43-48` | Segurança (XSS/localStorage) | Alta |
| 18 | `PainelAgente.tsx` / `MeusPedidos.tsx` | DRY | Baixa |
| 19 | `PainelAgente.tsx` | SOLID (SRP) / Componentização | Baixa |
| 20 | `Catalogo.tsx:13-21` | Performance (Server-side Filter) | Média |
| 21 | `App.tsx` | Resiliência (Error Boundary) | Baixa |
| 22 | `backend/` | Qualidade (Testes) | Alta |
| 23 | `pedido.service.ts:24-38` | Concorrência (TOCTOU) | Alta |
