const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { SECRET } = require('../middleware/auth');

const router = express.Router();

// Registro de empresa + usuário admin
router.post('/register', async (req, res) => {
  // Mapeia os dados aceitando possíveis variações de nome que o frontend pode estar enviando
  const razaoSocial = req.body.razaoSocial || req.body.razao_social || req.body.companyName;
  const cnpj = req.body.cnpj || req.body.documento;
  const email = req.body.email;
  const nome = req.body.nome || req.body.name || req.body.responsavel;
  const senha = req.body.senha || req.body.password;

  console.log('📥 Tentativa de registro. Dados recebidos do frontend:', req.body);

  if (!razaoSocial || !cnpj || !email || !nome || !senha) {
    return res.status(400).json({ erro: 'Dados incompletos. Verifique o terminal para ver o que faltou.' });
  }

  // Validar CNPJ (formato básico)
  const cnpjLimpo = cnpj.replace(/\D/g, '');
  if (cnpjLimpo.length !== 14) {
    return res.status(400).json({ erro: 'CNPJ inválido' });
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  try {
    const empresaResult = await db.query(
      'INSERT INTO empresas (razao_social, cnpj, email, plano_ativo) VALUES ($1, $2, $3, $4) RETURNING id', 
      [razaoSocial, cnpjLimpo, email, 'Free']
    );
    const empresaId = empresaResult.rows[0].id;

    const usuarioResult = await db.query(
      'INSERT INTO usuarios (empresa_id, nome, email, senha_hash, perfil) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [empresaId, nome, email, senhaHash, 'Admin']
    );

    res.json({ 
      mensagem: 'Empresa registrada com sucesso',
      empresaId,
      usuarioId: usuarioResult.rows[0].id,
      plano: 'Free'
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ erro: 'CNPJ ou email já cadastrado' });
    }
    return res.status(400).json({ erro: 'Erro ao criar conta' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const email = req.body.email;
  const senha = req.body.senha || req.body.password;

  try {
    const result = await db.query(
      `SELECT u.*, e.razao_social, e.cnpj, e.plano_ativo 
       FROM usuarios u 
       JOIN empresas e ON u.empresa_id = e.id 
       WHERE u.email = $1 AND u.ativo = true`, 
      [email]
    );
    
    const usuario = result.rows[0];
    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { 
        usuarioId: usuario.id, 
        empresaId: usuario.empresa_id, 
        perfil: usuario.perfil,
        planoAtivo: usuario.plano_ativo
      },
      SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        empresa: {
          id: usuario.empresa_id,
          razaoSocial: usuario.razao_social,
          cnpj: usuario.cnpj,
          planoAtivo: usuario.plano_ativo
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno no servidor' });
  }
});

module.exports = router;
