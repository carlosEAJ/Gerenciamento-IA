const express = require('express');
const db = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Inicializa as novas colunas no Banco de Dados se não existirem
const initTable = async () => {
  try { await db.query('ALTER TABLE funcionarios ADD COLUMN documentacao TEXT').catch(() => {}); } catch (err) {}
  try { await db.query('ALTER TABLE funcionarios ADD COLUMN cargo VARCHAR(100)').catch(() => {}); } catch (err) {}
  try { await db.query('ALTER TABLE funcionarios ADD COLUMN setor VARCHAR(100)').catch(() => {}); } catch (err) {}
};
initTable();

// Cadastrar novo funcionário (com validação de Admin/RH)
router.post('/', auth, async (req, res) => {
  const { empresaId, perfil } = req.user;
  const { nome, cpf, cargo, setor, documentacao, salarioBase } = req.body;

  if (perfil !== 'Admin' && perfil !== 'RH') {
    return res.status(403).json({ erro: 'Acesso negado. Apenas Admin ou RH podem adicionar funcionários.' });
  }

  // Validação: Garante que os novos campos também sejam preenchidos
  if (!nome || !cpf || !cargo || !setor || !salarioBase) {
    return res.status(400).json({ erro: 'Nome, CPF, Cargo, Setor e Salário Base são obrigatórios.' });
  }

  try {
    const result = await db.query(
      'INSERT INTO funcionarios (empresa_id, nome, cpf, cargo, setor, salario_base, documentacao, ativo) VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING id',
      [empresaId, nome, cpf, cargo, setor, salarioBase, documentacao]
    );
    res.json({ mensagem: 'Funcionário cadastrado com sucesso!', id: result.rows[0].id });
  } catch (err) {
    if (err.code === '23505' || (err.message && err.message.includes('UNIQUE'))) {
      return res.status(400).json({ erro: 'CPF já cadastrado.' });
    }
    // Fallback de segurança caso a coluna documentacao falhe na criação:
    try {
      const resultFallback = await db.query(
        'INSERT INTO funcionarios (empresa_id, nome, cpf, salario_base, ativo) VALUES ($1, $2, $3, $4, true) RETURNING id',
        [empresaId, nome, cpf, salarioBase]
      );
      return res.json({ mensagem: 'Funcionário cadastrado (dados secundários ignorados na versão legado do DB).', id: resultFallback.rows[0].id });
    } catch(err2) {
      res.status(500).json({ erro: 'Erro ao cadastrar funcionário.' });
    }
  }
});

module.exports = router;