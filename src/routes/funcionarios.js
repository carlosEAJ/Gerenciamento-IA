const express = require('express');
const db = require('../config/database');
const { auth, checkPerfil, checkTrialValido } = require('../middleware/auth');

const router = express.Router();

// Listar funcionários da empresa
router.get('/', auth, checkTrialValido, (req, res) => {
  const { empresaId } = req.user;

  db.all(
    `SELECT id, nome, cpf, salario_base, data_admissao, ativo, created_at 
     FROM funcionarios 
     WHERE empresa_id = ? 
     ORDER BY nome ASC`,
    [empresaId],
    (err, funcionarios) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao buscar funcionários' });
      }
      res.json(funcionarios);
    }
  );
});

// Buscar funcionário específico
router.get('/:id', auth, checkTrialValido, (req, res) => {
  const { empresaId } = req.user;
  const { id } = req.params;

  db.get(
    'SELECT * FROM funcionarios WHERE id = ? AND empresa_id = ?',
    [id, empresaId],
    (err, funcionario) => {
      if (err || !funcionario) {
        return res.status(404).json({ erro: 'Funcionário não encontrado' });
      }
      res.json(funcionario);
    }
  );
});

// Cadastrar novo funcionário (apenas Admin e RH)
router.post('/', auth, checkTrialValido, checkPerfil('Admin', 'RH'), (req, res) => {
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

  db.run(
    'INSERT INTO funcionarios (empresa_id, nome, cpf, salario_base, data_admissao) VALUES (?, ?, ?, ?, ?)',
    [empresaId, nome, cpfLimpo, salarioBase, dataAdmissao],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ erro: 'CPF já cadastrado nesta empresa' });
        }
        return res.status(500).json({ erro: 'Erro ao cadastrar funcionário' });
      }

      res.status(201).json({
        mensagem: 'Funcionário cadastrado com sucesso',
        funcionarioId: this.lastID
      });
    }
  );
});

// Atualizar funcionário (apenas Admin e RH)
router.put('/:id', auth, checkTrialValido, checkPerfil('Admin', 'RH'), (req, res) => {
  const { empresaId } = req.user;
  const { id } = req.params;
  const { nome, salarioBase, ativo } = req.body;

  const updates = [];
  const values = [];

  if (nome !== undefined) {
    updates.push('nome = ?');
    values.push(nome);
  }
  if (salarioBase !== undefined) {
    if (salarioBase <= 0) {
      return res.status(400).json({ erro: 'Salário deve ser maior que zero' });
    }
    updates.push('salario_base = ?');
    values.push(salarioBase);
  }
  if (ativo !== undefined) {
    updates.push('ativo = ?');
    values.push(ativo ? 1 : 0);
  }

  if (updates.length === 0) {
    return res.status(400).json({ erro: 'Nenhum campo para atualizar' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id, empresaId);

  db.run(
    `UPDATE funcionarios SET ${updates.join(', ')} WHERE id = ? AND empresa_id = ?`,
    values,
    function(err) {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao atualizar funcionário' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ erro: 'Funcionário não encontrado' });
      }
      res.json({ mensagem: 'Funcionário atualizado com sucesso' });
    }
  );
});

// Desativar funcionário (soft delete - apenas Admin)
router.delete('/:id', auth, checkTrialValido, checkPerfil('Admin'), (req, res) => {
  const { empresaId } = req.user;
  const { id } = req.params;

  db.run(
    'UPDATE funcionarios SET ativo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND empresa_id = ?',
    [id, empresaId],
    function(err) {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao desativar funcionário' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ erro: 'Funcionário não encontrado' });
      }
      res.json({ mensagem: 'Funcionário desativado com sucesso' });
    }
  );
});

module.exports = router;
