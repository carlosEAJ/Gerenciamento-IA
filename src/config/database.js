const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../../data/saas.db'));

db.serialize(() => {
  // 1. EMPRESAS - O Cliente do SaaS
  db.run(`CREATE TABLE IF NOT EXISTS empresas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    razao_social TEXT NOT NULL,
    cnpj TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    plano_ativo TEXT DEFAULT 'Trial' CHECK(plano_ativo IN ('Trial', 'Basico', 'Premium')),
    data_inicio_trial DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_fim_trial DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 2. USUÁRIOS - Quem acessa o sistema
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    perfil TEXT DEFAULT 'Colaborador' CHECK(perfil IN ('Admin', 'RH', 'Colaborador')),
    ativo BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
  )`);

  // 3. FUNCIONÁRIOS - A Base de Cálculo
  db.run(`CREATE TABLE IF NOT EXISTS funcionarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    cpf TEXT NOT NULL,
    salario_base REAL NOT NULL,
    data_admissao DATE NOT NULL,
    ativo BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    UNIQUE(empresa_id, cpf)
  )`);

  // 4. HISTÓRICO DE FÉRIAS - O Registro Fixo
  db.run(`CREATE TABLE IF NOT EXISTS historico_ferias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    funcionario_id INTEGER NOT NULL,
    empresa_id INTEGER NOT NULL,
    usuario_solicitante_id INTEGER NOT NULL,
    dias_solicitados INTEGER NOT NULL CHECK(dias_solicitados >= 1 AND dias_solicitados <= 30),
    salario_base_momento REAL NOT NULL,
    valor_ferias REAL NOT NULL,
    adicional_terco REAL NOT NULL,
    valor_bruto REAL NOT NULL,
    inss REAL NOT NULL,
    irrf REAL NOT NULL,
    liquido REAL NOT NULL,
    data_inicio_ferias DATE,
    data_fim_ferias DATE,
    status TEXT DEFAULT 'Calculado' CHECK(status IN ('Calculado', 'Aprovado', 'Pago', 'Cancelado')),
    observacoes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id) ON DELETE CASCADE,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_solicitante_id) REFERENCES usuarios(id)
  )`);

  // Índices para performance
  db.run(`CREATE INDEX IF NOT EXISTS idx_usuarios_empresa ON usuarios(empresa_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_funcionarios_empresa ON funcionarios(empresa_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_historico_funcionario ON historico_ferias(funcionario_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_historico_empresa ON historico_ferias(empresa_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_historico_data ON historico_ferias(created_at)`);
});

module.exports = db;
