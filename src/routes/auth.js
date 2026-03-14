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
  
  // Calcular data fim do trial (7 dias)
  const dataInicioTrial = new Date();
  const dataFimTrial = new Date();
  dataFimTrial.setDate(dataFimTrial.getDate() + 7);

  try {
    const empresaResult = await db.query(
      'INSERT INTO empresas (razao_social, cnpj, email, plano_ativo, data_inicio_trial, data_fim_trial) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id', 
      [razaoSocial, cnpjLimpo, email, 'Trial', dataInicioTrial.toISOString(), dataFimTrial.toISOString()]
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
      plano: 'Trial',
      diasTrial: 7,
      dataFimTrial: dataFimTrial.toISOString()
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
      `SELECT u.*, e.razao_social, e.cnpj, e.plano_ativo, e.data_fim_trial 
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

    // Verificar se trial expirou
    let trialExpirado = false;
    if (usuario.plano_ativo === 'Trial') {
      const dataFimTrial = new Date(usuario.data_fim_trial);
      trialExpirado = new Date() > dataFimTrial;
    }

    const token = jwt.sign(
      { 
        usuarioId: usuario.id, 
        empresaId: usuario.empresa_id, 
        perfil: usuario.perfil,
        planoAtivo: usuario.plano_ativo,
        dataFimTrial: usuario.data_fim_trial
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
      },
      trialExpirado
    });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno no servidor' });
  }
});

module.exports = router;
