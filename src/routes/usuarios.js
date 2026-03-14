const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Middleware para verificar se o usuário é Admin
const checkAdmin = (req, res, next) => {
  if (req.user.perfil !== 'Admin') {
    return res.status(403).json({ erro: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
  }
  next();
};

// Rota para criar um novo usuário dentro da empresa
router.post('/', auth, checkAdmin, async (req, res) => {
  const { empresaId } = req.user;
  const { nome, email, password, perfil } = req.body;

  if (!nome || !email || !password || !perfil) {
    return res.status(400).json({ erro: 'Nome, email, senha e perfil são obrigatórios.' });
  }

  const perfisValidos = ['Admin', 'RH', 'Financeiro', 'Colaborador'];
  if (!perfisValidos.includes(perfil)) {
    return res.status(400).json({ erro: 'Perfil inválido. Use Admin, RH, Financeiro ou Colaborador.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.query(
      'INSERT INTO usuarios (empresa_id, nome, email, password_hash, perfil) VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, email, perfil',
      [empresaId, nome, email, passwordHash, perfil]
    );

    res.status(201).json({ mensagem: 'Usuário criado com sucesso!', usuario: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') { // unique_violation
      return res.status(400).json({ erro: 'Email já cadastrado para outro usuário.' });
    }
    res.status(500).json({ erro: 'Erro interno ao criar usuário.' });
  }
});

// Rota para listar todos os usuários da empresa
router.get('/', auth, checkAdmin, async (req, res) => {
  const { empresaId } = req.user;
  try {
    const result = await db.query(
      'SELECT id, nome, email, perfil, data_criacao FROM usuarios WHERE empresa_id = $1 AND ativo = true',
      [empresaId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar usuários.' });
  }
});

// Rota para desativar um usuário
router.delete('/:id', auth, checkAdmin, async (req, res) => {
    const { empresaId, id: adminId } = req.user;
    const { id: usuarioIdParaDeletar } = req.params;

    if (adminId === parseInt(usuarioIdParaDeletar, 10)) {
        return res.status(400).json({ erro: 'Você não pode desativar a própria conta de administrador.' });
    }

    try {
        const result = await db.query(
            'UPDATE usuarios SET ativo = false WHERE id = $1 AND empresa_id = $2 RETURNING id',
            [usuarioIdParaDeletar, empresaId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ erro: 'Usuário não encontrado ou não pertence à sua empresa.' });
        }
        res.json({ mensagem: 'Usuário desativado com sucesso.' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao desativar usuário.' });
    }
});

module.exports = router;