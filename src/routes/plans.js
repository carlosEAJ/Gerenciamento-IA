const express = require('express');
const db = require('../config/database');
const { auth, checkPerfil } = require('../middleware/auth');

const router = express.Router();

const PLANOS = {
  Free: { 
    nome: 'Free', 
    preco: 0, 
    calculos: 10, 
    recursos: ['10 cálculos/mês', 'Acesso básico', 'Suporte por email'] 
  },
  Pro: { 
    nome: 'Pro', 
    preco: 79.90, 
    calculos: 40, 
    recursos: ['40 cálculos/mês', 'Cadastro de funcionários', 'Histórico completo', 'Suporte prioritário'] 
  },
  Enterprise: { 
    nome: 'Enterprise', 
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

  if (plano === 'Free') {
    return res.status(400).json({ erro: 'Não é possível fazer downgrade para o plano Free' });
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
    const planoInfo = PLANOS[planoAtivo] || PLANOS.Free;

    res.json({
      plano: planoInfo,
      uso: {
        calculosUsados: count,
        limite: planoInfo.calculos === -1 ? 'ilimitado' : planoInfo.calculos,
        percentual: planoInfo.calculos === -1 ? 0 : ((count / planoInfo.calculos) * 100).toFixed(1),
        periodo: `Mês de ${new Date().toLocaleString('pt-BR', { month: 'long' })}`
      }
    });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao buscar status' });
  }
});

module.exports = router;
