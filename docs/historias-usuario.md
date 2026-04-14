# Histórias de Usuário — Sistema de Aluguel de Carros

## US01 — Cadastro de Cliente

**Como** um usuário não cadastrado,  
**quero** criar uma conta informando meus dados pessoais (nome, CPF, RG, endereço, profissão, e-mail e senha),  
**para que** eu possa acessar o sistema e solicitar aluguéis.

**Critérios de Aceitação:**
- CPF deve ser único no sistema.
- E-mail deve ser único no sistema.
- Senha mínima de 6 caracteres.
- Até 3 rendimentos podem ser cadastrados (entidade empregadora + valor).

---

## US02 — Login

**Como** um usuário cadastrado (cliente, empresa ou banco),  
**quero** fazer login com e-mail e senha,  
**para que** eu acesse minha área personalizada no sistema.

**Critérios de Aceitação:**
- JWT válido retornado ao logar com sucesso.
- Mensagem de erro genérica em caso de credenciais inválidas.
- Redirecionamento automático após login.

---

## US03 — Visualizar Catálogo de Automóveis

**Como** qualquer visitante,  
**quero** ver a lista de automóveis disponíveis com foto, marca, modelo, ano e placa,  
**para que** eu possa escolher o veículo desejado.

**Critérios de Aceitação:**
- Página acessível sem login.
- Filtro por nome/modelo e toggle de "somente disponíveis".
- Cada card leva à página de detalhe.

---

## US04 — Solicitar Aluguel

**Como** cliente logado,  
**quero** selecionar um automóvel e enviar um pedido de aluguel com data de início e data de fim,  
**para que** eu possa reservar o veículo para o período desejado.

**Critérios de Aceitação:**
- Apenas automóveis disponíveis podem ser solicitados.
- Pedido criado com status `PENDENTE`.
- Cliente recebe confirmação na tela.

---

## US05 — Consultar Meus Pedidos

**Como** cliente logado,  
**quero** ver a lista de todos os meus pedidos de aluguel com seu status atual,  
**para que** eu acompanhe o andamento das minhas solicitações.

**Critérios de Aceitação:**
- Status exibido com badge colorido.
- Pedidos ordenados por data de criação (mais recente primeiro).

---

## US06 — Cancelar Pedido

**Como** cliente logado,  
**quero** cancelar um pedido com status `PENDENTE` ou `EM_ANALISE`,  
**para que** eu desista de um aluguel que não quero mais.

**Critérios de Aceitação:**
- Pedidos já aprovados, rejeitados, cancelados ou executados não podem ser cancelados.
- Status alterado para `CANCELADO` imediatamente.

---

## US07 — Avaliar Pedido (Agente)

**Como** agente (empresa ou banco) logado,  
**quero** visualizar todos os pedidos e alterá-los para `EM_ANALISE`, `APROVADO` ou `REJEITADO`, com possibilidade de adicionar observação,  
**para que** eu execute a análise financeira e autorize ou negue o aluguel.

**Critérios de Aceitação:**
- Apenas agentes (empresa ou banco) têm acesso ao painel.
- Ação de avaliação registra o ID do avaliador.
- Painel exibe estatísticas rápidas (pendentes, aprovados, executados).

---

## US08 — Criar Contrato de Crédito (Banco)

**Como** banco agente logado,  
**quero** criar um contrato de crédito para um pedido `APROVADO`, informando valor, número de parcelas e taxa de juros,  
**para que** o aluguel seja financiado pelo banco e o pedido seja marcado como `EXECUTADO`.

**Critérios de Aceitação:**
- Somente usuários do tipo `BANCO` podem criar contratos de crédito.
- O pedido deve estar com status `APROVADO`.
- Após criação do contrato, status do pedido muda para `EXECUTADO`.

---

## US09 — Gerenciar Rendimentos

**Como** cliente logado,  
**quero** adicionar e remover minhas fontes de renda (entidade empregadora e valor),  
**para que** meu perfil financeiro esteja completo para análise pelos agentes.

**Critérios de Aceitação:**
- Máximo de 3 rendimentos por cliente.
- Tentativa de adicionar 4º rendimento retorna erro 400.
