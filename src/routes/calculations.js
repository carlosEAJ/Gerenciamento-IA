const express = require('express');
const db = require('../config/database');
const { auth, checkPlano } = require('../middleware/auth');

const router = express.Router();

// Limites por plano
const LIMITES_PLANO = {
  Free: 10,     // 10 cálculos/mês
  Pro: 40,      // 40 cálculos/mês
  Enterprise: -1 // ilimitado
};

// Tabelas de Impostos (Futuramente virão de uma entidade no banco de dados)
const TABELA_INSS_2024 = [
  { limite: 1412.00, aliquota: 0.075, deducao: 0 },
  { limite: 2666.68, aliquota: 0.09, deducao: 21.18 },
  { limite: 4000.03, aliquota: 0.12, deducao: 101.18 },
  { limite: Infinity, aliquota: 0.14, deducao: 181.18 }
];

const TABELA_IRRF_2024 = [
  { limite: 2112.00, aliquota: 0, deducao: 0 },
  { limite: 2826.65, aliquota: 0.075, deducao: 158.40 },
  { limite: 3751.05, aliquota: 0.15, deducao: 370.40 },
  { limite: 4664.68, aliquota: 0.225, deducao: 651.73 },
  { limite: Infinity, aliquota: 0.275, deducao: 884.96 }
];

// Função de cálculo (mantida do projeto original)
function calcularFerias(salarioBase, diasSolicitados) {
  const valorFerias = (salarioBase / 30) * diasSolicitados;
  const adicionalTerco = valorFerias / 3;
  const valorBruto = valorFerias + adicionalTerco;
  
  // Cálculo INSS Dinâmico (usando parcela a deduzir)
  const faixaINSS = TABELA_INSS_2024.find(f => valorBruto <= f.limite);
  let inss = (valorBruto * faixaINSS.aliquota) - faixaINSS.deducao;
  inss = Math.max(0, Math.min(inss, 908.85)); // Limita ao teto e previne negativos
  
  // Cálculo IRRF Dinâmico
  const baseIRRF = valorBruto - inss;
  const faixaIRRF = TABELA_IRRF_2024.find(f => baseIRRF <= f.limite);
  let irrf = Math.max((baseIRRF * faixaIRRF.aliquota) - faixaIRRF.deducao, 0);
  
  const liquido = valorBruto - inss - irrf;
  
  return {
    valorFerias: parseFloat(valorFerias.toFixed(2)),
    adicionalTerco: parseFloat(adicionalTerco.toFixed(2)),
    valorBruto: parseFloat(valorBruto.toFixed(2)),
    inss: parseFloat(inss.toFixed(2)),
    irrf: parseFloat(irrf.toFixed(2)),
    liquido: parseFloat(liquido.toFixed(2))
  };
}

// Calcular férias para um funcionário
router.post('/', auth, async (req, res) => {
  const { usuarioId, empresaId, planoAtivo } = req.user;
  const { funcionarioId, dataInicioFerias, dataFimFerias, observacoes } = req.body;
  const diasSolicitados = req.body.diasSolicitados || req.body.diasFerias;
  const salarioBruto = req.body.salarioBruto;

  if (!diasSolicitados || diasSolicitados < 1 || diasSolicitados > 30 || (!funcionarioId && !salarioBruto)) {
    return res.status(400).json({ erro: 'Dados inválidos. Informe funcionarioId ou salarioBruto, e os dias solicitados.' });
  }

  // Verificar limite do plano
  const mesAtual = new Date().toISOString().slice(0, 7);
  
  try {
    const countResult = await db.query(
      `SELECT COUNT(*) as count FROM historico_ferias 
       WHERE empresa_id = $1 AND TO_CHAR(created_at, 'YYYY-MM') = $2`,
      [empresaId, mesAtual]
    );

    const count = parseInt(countResult.rows[0].count);
    const limite = LIMITES_PLANO[planoAtivo] || LIMITES_PLANO.Free;
    
    if (limite !== -1 && count >= limite) {
      return res.status(403).json({ 
        erro: 'Limite mensal de cálculos atingido',
        planoAtual: planoAtivo,
        limite: limite,
        usado: count,
        mensagem: 'Faça um upgrade de plano para continuar utilizando ou aguarde o próximo mês.'
      });
    }

    let salarioBaseCalculo = parseFloat(salarioBruto);
    let funcData = null;

    if (funcionarioId) {
      const funcResult = await db.query(
        'SELECT * FROM funcionarios WHERE id = $1 AND empresa_id = $2 AND ativo = true',
        [funcionarioId, empresaId]
      );
      funcData = funcResult.rows[0];
      if (!funcData) return res.status(404).json({ erro: 'Funcionário não encontrado ou inativo' });
      salarioBaseCalculo = parseFloat(funcData.salario_base);
    }

    // Realizar cálculo
    const calculo = calcularFerias(salarioBaseCalculo, diasSolicitados);

    // Salvar no histórico
    const insertResult = await db.query(
      `INSERT INTO historico_ferias (
        funcionario_id, empresa_id, usuario_solicitante_id, dias_solicitados,
        salario_base_momento, valor_ferias, adicional_terco, valor_bruto,
        inss, irrf, liquido, data_inicio_ferias, data_fim_ferias, observacoes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
      [
        funcionarioId || null, empresaId, usuarioId, diasSolicitados,
        salarioBaseCalculo, calculo.valorFerias, calculo.adicionalTerco,
        calculo.valorBruto, calculo.inss, calculo.irrf, calculo.liquido,
        dataInicioFerias || null, dataFimFerias || null, observacoes || null
      ]
    );

    res.json({
      calculoId: insertResult.rows[0].id,
      funcionario: funcData ? {
        id: funcData.id,
        nome: funcData.nome,
        cpf: funcData.cpf,
        salarioBase: funcData.salario_base
      } : null,
      diasSolicitados,
      ...calculo,
      uso: {
        plano: planoAtivo,
        calculosUsados: count + 1,
        limite: limite === -1 ? 'ilimitado' : limite
      }
    });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao salvar cálculo' });
  }
});

// Histórico de cálculos da empresa
router.get('/historico', auth, async (req, res) => {
  const { empresaId } = req.user;
  const { funcionarioId, status, limite = 50 } = req.query;

  let query = `
    SELECT 
      h.*,
      f.nome as funcionario_nome,
      f.cpf as funcionario_cpf,
      u.nome as usuario_nome
    FROM historico_ferias h
    LEFT JOIN funcionarios f ON h.funcionario_id = f.id
    JOIN usuarios u ON h.usuario_solicitante_id = u.id
  WHERE h.empresa_id = $1
  `;
  
  const params = [empresaId];
  let paramIdx = 2;

  if (funcionarioId) {
    query += ` AND h.funcionario_id = $${paramIdx++}`;
    params.push(funcionarioId);
  }

  if (status) {
    query += ` AND h.status = $${paramIdx++}`;
    params.push(status);
  }

  query += ` ORDER BY h.created_at DESC LIMIT $${paramIdx}`;
  params.push(parseInt(limite));

  try {
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao buscar histórico' });
  }
});

// Buscar cálculo específico
router.get('/:id', auth, async (req, res) => {
  const { empresaId } = req.user;
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT 
        h.*,
        f.nome as funcionario_nome,
        f.cpf as funcionario_cpf,
        u.nome as usuario_nome
      FROM historico_ferias h
      LEFT JOIN funcionarios f ON h.funcionario_id = f.id
      JOIN usuarios u ON h.usuario_solicitante_id = u.id
      WHERE h.id = $1 AND h.empresa_id = $2`,
      [id, empresaId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Cálculo não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao buscar cálculo' });
  }
});

// Atualizar status do cálculo (apenas Admin e RH)
router.patch('/:id/status', auth, async (req, res) => {
  const { empresaId, perfil } = req.user;
  const { id } = req.params;
  const { status } = req.body;

  if (!['Admin', 'RH'].includes(perfil)) {
    return res.status(403).json({ erro: 'Apenas Admin e RH podem alterar status' });
  }

  const statusValidos = ['Calculado', 'Aprovado', 'Pago', 'Cancelado'];
  if (!statusValidos.includes(status)) {
    return res.status(400).json({ erro: 'Status inválido', statusValidos });
  }

  try {
    const result = await db.query(
      'UPDATE historico_ferias SET status = $1 WHERE id = $2 AND empresa_id = $3',
      [status, id, empresaId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Cálculo não encontrado' });
    }
    res.json({ mensagem: 'Status atualizado com sucesso', novoStatus: status });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao atualizar status' });
  }
});

module.exports = router;
