const express = require('express');
const db = require('../config/database');
const { auth, checkPerfil } = require('../middleware/auth');

const router = express.Router();

const PLANOS = {
  Trial: { 
    nome: 'Trial', 
    preco: 0, 
    calculos: 5, 
    duracao: '7 dias',
    recursos: ['5 cálculos durante o trial', 'Acesso básico', 'Suporte por email'] 
  },
  Basico: { 
    nome: 'Básico', 
    preco: 79.90, 
    calculos: 50, 
    recursos: ['50 cálculos/mês', 'Cadastro de funcionários', 'Histórico completo', 'Suporte prioritário'] 
  },
  Premium: { 
    nome: 'Premium', 
    preco: 199.90, 
    calculos: -1, 
    recursos: ['Cálculos ilimitados', 'Multi-usuários', 'Módulo de rescisão', 'Módulo de holerites', 'API dedicada', 'Suporte 24/7', 'Customizações'] 
  }
};

// Listar planos disponíveis
router.get('/', (req, res) => {
  res.json(PLANOS);
});

// Upgrade de plano (apenas Admin)
router.post('/upgrade', auth, checkPerfil('Admin'), async (req, res) => {
  const { plano } = req.body;
  const { empresaId } = req.user;

  if (!PLANOS[plano]) {
    return res.status(400).json({ erro: 'Plano inválido', planosDisponiveis: Object.keys(PLANOS) });
  }

  if (plano === 'Trial') {
    return res.status(400).json({ erro: 'Não é possível voltar para o plano Trial' });
  }

  try {
    await db.query(
      'UPDATE empresas SET plano_ativo = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', 
      [plano, empresaId]
    );
    res.json({ 
      mensagem: 'Plano atualizado com sucesso',
      novoPlano: PLANOS[plano],
      observacao: 'Em produção, integrar com gateway de pagamento'
    });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao atualizar plano' });
  }
});

// Status da assinatura
router.get('/status', auth, async (req, res) => {
  const { empresaId, planoAtivo } = req.user;
  const mesAtual = new Date().toISOString().slice(0, 7);

  try {
    const countResult = await db.query(
      `SELECT COUNT(*) as count FROM historico_ferias 
       WHERE empresa_id = $1 AND TO_CHAR(created_at, 'YYYY-MM') = $2`,
      [empresaId, mesAtual]
    );
    
    const count = parseInt(countResult.rows[0].count);
    const planoInfo = PLANOS[planoAtivo] || PLANOS.Trial;
    
    const empresaResult = await db.query(
      'SELECT data_inicio_trial, data_fim_trial FROM empresas WHERE id = $1',
      [empresaId]
    );
    const empresa = empresaResult.rows[0];

    let infoTrial = null;
    if (planoAtivo === 'Trial') {
      const dataFim = new Date(empresa.data_fim_trial);
      const agora = new Date();
      const diasRestantes = Math.ceil((dataFim - agora) / (1000 * 60 * 60 * 24));
      
      infoTrial = {
        dataInicio: empresa.data_inicio_trial,
        dataFim: empresa.data_fim_trial,
        diasRestantes: Math.max(0, diasRestantes),
        expirado: diasRestantes <= 0
      };
    }

    res.json({
      plano: planoInfo,
      uso: {
        calculosUsados: count,
        limite: planoInfo.calculos === -1 ? 'ilimitado' : planoInfo.calculos,
        percentual: planoInfo.calculos === -1 ? 0 : ((count / planoInfo.calculos) * 100).toFixed(1)
      },
      trial: infoTrial
    });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao buscar status' });
  }
});

module.exports = router;
