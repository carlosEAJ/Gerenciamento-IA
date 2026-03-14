const { Pool } = require('pg');

const DB_NAME = 'saas_ferias';
const CONNECTION_STRING = process.env.DATABASE_URL || `postgresql://postgres:postgres@localhost:5432/${DB_NAME}`;

// Cria a URL de admin isolando apenas os dados de acesso e apontando para o banco 'postgres'
const adminUrl = new URL(CONNECTION_STRING);
adminUrl.pathname = '/postgres';

// Conecta ao banco padrão 'postgres' para criar o banco se necessário
const ensureDatabase = async () => {
  const adminPool = new Pool({
    connectionString: adminUrl.toString(),
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  try {
    const res = await adminPool.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [DB_NAME]);
    if (res.rowCount === 0) {
      await adminPool.query(`CREATE DATABASE ${DB_NAME}`);
      console.log(`Banco de dados '${DB_NAME}' criado com sucesso.`);
    }
  } finally {
    await adminPool.end();
  }
};

const db = new Pool({
  connectionString: CONNECTION_STRING,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const initDB = async () => {
  try {
    await ensureDatabase();
    // 1. EMPRESAS - O Cliente do SaaS
    await db.query(`CREATE TABLE IF NOT EXISTS empresas (
      id SERIAL PRIMARY KEY,
      razao_social VARCHAR(255) NOT NULL,
      cnpj VARCHAR(14) UNIQUE NOT NULL,
      email VARCHAR(255) NOT NULL,
      plano_ativo VARCHAR(50) DEFAULT 'Trial' CHECK(plano_ativo IN ('Trial', 'Basico', 'Premium')),
      data_inicio_trial TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      data_fim_trial TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // 2. USUÁRIOS - Quem acessa o sistema
    await db.query(`CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
      nome VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      senha_hash VARCHAR(255) NOT NULL,
      perfil VARCHAR(50) DEFAULT 'Colaborador' CHECK(perfil IN ('Admin', 'RH', 'Colaborador')),
      ativo BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // 3. FUNCIONÁRIOS - A Base de Cálculo
    await db.query(`CREATE TABLE IF NOT EXISTS funcionarios (
      id SERIAL PRIMARY KEY,
      empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
      nome VARCHAR(255) NOT NULL,
      cpf VARCHAR(11) NOT NULL,
      salario_base NUMERIC(10, 2) NOT NULL,
      data_admissao DATE NOT NULL,
      ativo BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(empresa_id, cpf)
    )`);

    // 4. HISTÓRICO DE FÉRIAS - O Registro Fixo
    await db.query(`CREATE TABLE IF NOT EXISTS historico_ferias (
      id SERIAL PRIMARY KEY,
      funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
      empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
      usuario_solicitante_id INTEGER NOT NULL REFERENCES usuarios(id),
      dias_solicitados INTEGER NOT NULL CHECK(dias_solicitados >= 1 AND dias_solicitados <= 30),
      salario_base_momento NUMERIC(10, 2) NOT NULL,
      valor_ferias NUMERIC(10, 2) NOT NULL,
      adicional_terco NUMERIC(10, 2) NOT NULL,
      valor_bruto NUMERIC(10, 2) NOT NULL,
      inss NUMERIC(10, 2) NOT NULL,
      irrf NUMERIC(10, 2) NOT NULL,
      liquido NUMERIC(10, 2) NOT NULL,
      data_inicio_ferias DATE,
      data_fim_ferias DATE,
      status VARCHAR(50) DEFAULT 'Calculado' CHECK(status IN ('Calculado', 'Aprovado', 'Pago', 'Cancelado')),
      observacoes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Índices para performance
    await db.query(`CREATE INDEX IF NOT EXISTS idx_usuarios_empresa ON usuarios(empresa_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_funcionarios_empresa ON funcionarios(empresa_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_historico_funcionario ON historico_ferias(funcionario_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_historico_empresa ON historico_ferias(empresa_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_historico_data ON historico_ferias(created_at)`);
    
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
  }
};

initDB();

module.exports = db;
