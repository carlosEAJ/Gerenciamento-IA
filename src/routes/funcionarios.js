const express = require('express');
const db = require('../config/database');
const { auth, checkPerfil, checkTrialValido } = require('../middleware/auth');

const router = express.Router();

// Listar funcionários da empresa
router.get('/', auth, checkTrialValido, async (req, res) => {
  const { empresaId } = req.user;

  try {
    const result = await db.query(
      `SELECT id, nome, cpf, salario_base, data_admissao, ativo, created_at 
       FROM funcionarios 
       WHERE empresa_id = $1 
       ORDER BY nome ASC`,
      [empresaId]
    );
    res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao buscar funcionários' });
  }
});

// Buscar funcionário específico
router.get('/:id', auth, checkTrialValido, async (req, res) => {
  const { empresaId } = req.user;
  const { id } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM funcionarios WHERE id = $1 AND empresa_id = $2',
      [id, empresaId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Funcionário não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao buscar funcionário' });
  }
});

// Cadastrar novo funcionário (apenas Admin e RH)
router.post('/', auth, checkTrialValido, checkPerfil('Admin', 'RH'), async (req, res) => {
  const { empresaId } = req.user;
  const { nome, cpf, salarioBase, dataAdmissao } = req.body;

  if (!nome || !cpf || !salarioBase || !dataAdmissao) {
    return res.status(400).json({ erro: 'Dados incompletos' });
  }

  // Validar CPF (formato básico)
  const cpfLimpo = cpf.replace(/\D/g, '');
  if (cpfLimpo.length !== 11) {
    return res.status(400).json({ erro: 'CPF inválido' });
  }

  // Validar salário
  if (salarioBase <= 0) {
    return res.status(400).json({ erro: 'Salário deve ser maior que zero' });
  }

  try {
    const result = await db.query(
      'INSERT INTO funcionarios (empresa_id, nome, cpf, salario_base, data_admissao) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [empresaId, nome, cpfLimpo, salarioBase, dataAdmissao]
    );
    res.status(201).json({
      mensagem: 'Funcionário cadastrado com sucesso',
      funcionarioId: result.rows[0].id
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ erro: 'CPF já cadastrado nesta empresa' });
    }
    return res.status(500).json({ erro: 'Erro ao cadastrar funcionário' });
  }
});

// Atualizar funcionário (apenas Admin e RH)
router.put('/:id', auth, checkTrialValido, checkPerfil('Admin', 'RH'), async (req, res) => {
  const { empresaId } = req.user;
  const { id } = req.params;
  const { nome, salarioBase, ativo } = req.body;

  const updates = [];
  const values = [];

  if (nome !== undefined) {
    values.push(nome);
    updates.push(`nome = $${values.length}`);
  }
  if (salarioBase !== undefined) {
    if (salarioBase <= 0) {
      return res.status(400).json({ erro: 'Salário deve ser maior que zero' });
    }
    values.push(salarioBase);
    updates.push(`salario_base = $${values.length}`);
  }
  if (ativo !== undefined) {
    values.push(ativo ? true : false);
    updates.push(`ativo = $${values.length}`);
  }

  if (updates.length === 0) {
    return res.status(400).json({ erro: 'Nenhum campo para atualizar' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id, empresaId);
  const idIndex = values.length - 1;
  const empresaIdIndex = values.length;

  try {
    const result = await db.query(
      `UPDATE funcionarios SET ${updates.join(', ')} WHERE id = $${idIndex} AND empresa_id = $${empresaIdIndex}`,
      values
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Funcionário não encontrado' });
    }
    res.json({ mensagem: 'Funcionário atualizado com sucesso' });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao atualizar funcionário' });
  }
});

// Desativar funcionário (soft delete - apenas Admin)
router.delete('/:id', auth, checkTrialValido, checkPerfil('Admin'), async (req, res) => {
  const { empresaId } = req.user;
  const { id } = req.params;

  try {
    const result = await db.query(
      'UPDATE funcionarios SET ativo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND empresa_id = $2',
      [id, empresaId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Funcionário não encontrado' });
    }
    res.json({ mensagem: 'Funcionário desativado com sucesso' });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao desativar funcionário' });
  }
});

module.exports = router;
