const express = require('express');
const db = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Inicializa a nova tabela vinculada ao funcionário no Banco de Dados
const initTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS registro_pontos (
        id SERIAL PRIMARY KEY,
        funcionario_id INTEGER,
        empresa_id INTEGER,
        tipo VARCHAR(50),
        data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error('Erro ao inicializar tabela de pontos:', err);
  }
};
initTable();

// Registrar um novo ponto
router.post('/', auth, async (req, res) => {
  const { empresaId } = req.user;
  const { funcionarioId, tipo } = req.body;

  if (!funcionarioId || !tipo) {
    return res.status(400).json({ erro: 'Funcionário e tipo de registro são obrigatórios' });
  }

  try {
    // Verificar se o funcionário pertence à empresa
    const funcCheck = await db.query(
      'SELECT id FROM funcionarios WHERE id = $1 AND empresa_id = $2 AND ativo = true',
      [funcionarioId, empresaId]
    );

    if (funcCheck.rows.length === 0) {
      return res.status(404).json({ erro: 'Funcionário não encontrado ou inativo' });
    }

    const result = await db.query(
      'INSERT INTO registro_pontos (funcionario_id, empresa_id, tipo) VALUES ($1, $2, $3) RETURNING *',
      [funcionarioId, empresaId, tipo]
    );

    res.json({ mensagem: 'Ponto registrado com sucesso!', registro: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao registrar ponto' });
  }
});

// Histórico de pontos de um funcionário
router.get('/historico/:funcionarioId', auth, async (req, res) => {
  const { empresaId } = req.user;
  const { funcionarioId } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM registro_pontos WHERE funcionario_id = $1 AND empresa_id = $2 ORDER BY data_hora DESC LIMIT 50',
      [funcionarioId, empresaId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar histórico de pontos' });
  }
});

// Listar funcionários (para o dropdown do front-end)
router.get('/funcionarios', auth, async (req, res) => {
  const { empresaId } = req.user;
  try {
    const result = await db.query(
      'SELECT id, nome FROM funcionarios WHERE empresa_id = $1 AND ativo = true ORDER BY nome',
      [empresaId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar funcionários' });
  }
});

module.exports = router;