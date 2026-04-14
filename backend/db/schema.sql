-- ============================================================
-- Sistema de Aluguel de Carros — Schema SQL
-- PostgreSQL 16
-- ============================================================

-- Extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Enums ─────────────────────────────────────────────────────

CREATE TYPE tipo_usuario AS ENUM ('CLIENTE', 'EMPRESA', 'BANCO');
CREATE TYPE tipo_proprietario AS ENUM ('CLIENTE', 'EMPRESA', 'BANCO');
CREATE TYPE status_pedido AS ENUM (
  'PENDENTE', 'EM_ANALISE', 'APROVADO', 'REJEITADO', 'CANCELADO', 'EXECUTADO'
);

-- ── Usuário base (auth) ───────────────────────────────────────

CREATE TABLE usuario (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(255) NOT NULL UNIQUE,
  senha      VARCHAR(255) NOT NULL,
  tipo       tipo_usuario NOT NULL,
  criado_em  TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ── Cliente (pessoa física) ───────────────────────────────────

CREATE TABLE cliente (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  UUID         NOT NULL UNIQUE REFERENCES usuario(id) ON DELETE CASCADE,
  rg          VARCHAR(20)  NOT NULL,
  cpf         VARCHAR(20)  NOT NULL UNIQUE,
  nome        VARCHAR(255) NOT NULL,
  endereco    TEXT         NOT NULL,
  profissao   VARCHAR(100) NOT NULL
);

-- ── Rendimento (max 3 por cliente) ───────────────────────────

CREATE TABLE rendimento (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id            UUID         NOT NULL REFERENCES cliente(id) ON DELETE CASCADE,
  entidade_empregadora  VARCHAR(255) NOT NULL,
  valor                 NUMERIC(12,2) NOT NULL
);

-- ── Empresa (agente) ─────────────────────────────────────────

CREATE TABLE empresa (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  UUID         NOT NULL UNIQUE REFERENCES usuario(id) ON DELETE CASCADE,
  cnpj        VARCHAR(20)  NOT NULL UNIQUE,
  nome        VARCHAR(255) NOT NULL,
  endereco    TEXT         NOT NULL
);

-- ── Banco (agente) ────────────────────────────────────────────

CREATE TABLE banco (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  UUID         NOT NULL UNIQUE REFERENCES usuario(id) ON DELETE CASCADE,
  cnpj        VARCHAR(20)  NOT NULL UNIQUE,
  nome        VARCHAR(255) NOT NULL,
  endereco    TEXT         NOT NULL
);

-- ── Automóvel ─────────────────────────────────────────────────

CREATE TABLE automovel (
  id                      UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula               VARCHAR(50)      NOT NULL UNIQUE,
  ano                     SMALLINT         NOT NULL,
  marca                   VARCHAR(100)     NOT NULL,
  modelo                  VARCHAR(100)     NOT NULL,
  placa                   VARCHAR(20)      NOT NULL UNIQUE,
  foto_url                TEXT,
  disponivel              BOOLEAN          NOT NULL DEFAULT TRUE,
  proprietario_tipo       tipo_proprietario NOT NULL,
  proprietario_cliente_id UUID             REFERENCES cliente(id),
  proprietario_empresa_id UUID             REFERENCES empresa(id),
  proprietario_banco_id   UUID             REFERENCES banco(id)
);

-- ── Pedido de Aluguel ─────────────────────────────────────────

CREATE TABLE pedido_aluguel (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id    UUID         NOT NULL REFERENCES cliente(id),
  automovel_id  UUID         NOT NULL REFERENCES automovel(id),
  data_inicio   DATE         NOT NULL,
  data_fim      DATE         NOT NULL,
  status        status_pedido NOT NULL DEFAULT 'PENDENTE',
  observacao    TEXT,
  avaliador_id  UUID         REFERENCES usuario(id),
  criado_em     TIMESTAMP    NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Trigger para atualizar atualizado_em automaticamente
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pedido_atualizado_em
BEFORE UPDATE ON pedido_aluguel
FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

-- ── Contrato de Crédito ───────────────────────────────────────

CREATE TABLE contrato_credito (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id  UUID         NOT NULL UNIQUE REFERENCES pedido_aluguel(id),
  banco_id   UUID         NOT NULL REFERENCES banco(id),
  valor      NUMERIC(12,2) NOT NULL,
  parcelas   SMALLINT     NOT NULL,
  taxa_juros NUMERIC(5,2) NOT NULL,
  criado_em  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── Índices ───────────────────────────────────────────────────

CREATE INDEX idx_cliente_usuario_id  ON cliente(usuario_id);
CREATE INDEX idx_empresa_usuario_id  ON empresa(usuario_id);
CREATE INDEX idx_banco_usuario_id    ON banco(usuario_id);
CREATE INDEX idx_rendimento_cliente  ON rendimento(cliente_id);
CREATE INDEX idx_pedido_cliente      ON pedido_aluguel(cliente_id);
CREATE INDEX idx_pedido_automovel    ON pedido_aluguel(automovel_id);
CREATE INDEX idx_pedido_status       ON pedido_aluguel(status);
