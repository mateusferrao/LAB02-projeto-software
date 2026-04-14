-- ============================================================
-- Seed — dados de exemplo
-- Senhas: todas são "123456" (bcrypt hash)
-- ============================================================

-- ── Usuários ──────────────────────────────────────────────────

INSERT INTO usuario (id, email, senha, tipo) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'cliente@exemplo.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh.y', 'CLIENTE'),
  ('a0000000-0000-0000-0000-000000000002', 'empresa@exemplo.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh.y', 'EMPRESA'),
  ('a0000000-0000-0000-0000-000000000003', 'banco@exemplo.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh.y', 'BANCO');

-- ── Cliente ───────────────────────────────────────────────────

INSERT INTO cliente (id, usuario_id, rg, cpf, nome, endereco, profissao) VALUES
  ('b0000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000001',
   '12.345.678-9', '123.456.789-00',
   'João Silva',
   'Rua das Flores, 123 — Belo Horizonte, MG',
   'Engenheiro de Software');

INSERT INTO rendimento (cliente_id, entidade_empregadora, valor) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'TechBH Ltda', 8500.00),
  ('b0000000-0000-0000-0000-000000000001', 'Freelance',   2000.00);

-- ── Empresa ───────────────────────────────────────────────────

INSERT INTO empresa (id, usuario_id, cnpj, nome, endereco) VALUES
  ('c0000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000002',
   '12.345.678/0001-90', 'MotorFlex Locações',
   'Av. Cristiano Machado, 500 — BH, MG');

-- ── Banco ─────────────────────────────────────────────────────

INSERT INTO banco (id, usuario_id, cnpj, nome, endereco) VALUES
  ('d0000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000003',
   '98.765.432/0001-10', 'Banco AutoCredit',
   'Rua da Bahia, 1000 — BH, MG');

-- ── Automóveis ────────────────────────────────────────────────

INSERT INTO automovel (matricula, ano, marca, modelo, placa, foto_url, disponivel, proprietario_tipo, proprietario_empresa_id) VALUES
  ('MAT-001', 2023, 'BMW',          'Serie 3',    'ABC-1234',
   'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
   TRUE, 'EMPRESA', 'c0000000-0000-0000-0000-000000000001'),
  ('MAT-002', 2022, 'Mercedes-Benz','C 200',      'DEF-5678',
   'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
   TRUE, 'EMPRESA', 'c0000000-0000-0000-0000-000000000001'),
  ('MAT-003', 2024, 'Porsche',      '911 Carrera','GHI-9012',
   'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80',
   TRUE, 'EMPRESA', 'c0000000-0000-0000-0000-000000000001'),
  ('MAT-004', 2023, 'Audi',         'A4',         'JKL-3456',
   'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
   TRUE, 'EMPRESA', 'c0000000-0000-0000-0000-000000000001'),
  ('MAT-005', 2022, 'Tesla',        'Model 3',    'MNO-7890',
   'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80',
   FALSE,'EMPRESA', 'c0000000-0000-0000-0000-000000000001'),
  ('MAT-006', 2023, 'Range Rover',  'Sport',      'PQR-1234',
   'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
   TRUE, 'EMPRESA', 'c0000000-0000-0000-0000-000000000001');
