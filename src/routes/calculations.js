const express = require('express');
const db = require('../config/database');
const { auth, checkTrialValido, checkPlano } = require('../middleware/auth');

const router = express.Router();

// Limites por plano
const LIMITES_PLANO = {
  Trial: 5,      // 5 cálculos durante o trial
  Basico: 50,    // 50 cálculos/mês
  Premium: -1    // ilimitado
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
router.post('/', auth, checkTrialValido, async (req, res) => {
  const { usuarioId, empresaId, planoAtivo } = req.user;
  const { funcionarioId, diasSolicitados, dataInicioFerias, dataFimFerias, observacoes } = req.body;

  if (!funcionarioId || !diasSolicitados || diasSolicitados < 1 || diasSolicitados > 30) {
    return res.status(400).json({ erro: 'Dados inválidos' });
  }

  // Verificar limite do plano
  const mesAtual = new Date().toISOString().slice(0, 7);
  
  db.get(
    `SELECT COUNT(*) as count FROM historico_ferias 
     WHERE empresa_id = ? AND strftime('%Y-%m', created_at) = ?`,
    [empresaId, mesAtual],
    (err, result) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao verificar limite' });
      }

      const limite = LIMITES_PLANO[planoAtivo] || LIMITES_PLANO.Trial;
      
      if (limite !== -1 && result.count >= limite) {
        return res.status(403).json({ 
          erro: 'Limite de cálculos atingido',
          planoAtual: planoAtivo,
          limite: limite,
          usado: result.count,
          mensagem: planoAtivo === 'Trial' ? 'Faça upgrade para continuar' : 'Limite mensal atingido'
        });
      }

      // Buscar dados do funcionário
      db.get(
        'SELECT * FROM funcionarios WHERE id = ? AND empresa_id = ? AND ativo = 1',
        [funcionarioId, empresaId],
        (err, funcionario) => {
          if (err || !funcionario) {
            return res.status(404).json({ erro: 'Funcionário não encontrado ou inativo' });
          }

          // Realizar cálculo
          const calculo = calcularFerias(funcionario.salario_base, diasSolicitados);

          // Salvar no histórico
          db.run(
            `INSERT INTO historico_ferias (
              funcionario_id, empresa_id, usuario_solicitante_id, dias_solicitados,
              salario_base_momento, valor_ferias, adicional_terco, valor_bruto,
              inss, irrf, liquido, data_inicio_ferias, data_fim_ferias, observacoes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              funcionarioId, empresaId, usuarioId, diasSolicitados,
              funcionario.salario_base, calculo.valorFerias, calculo.adicionalTerco,
              calculo.valorBruto, calculo.inss, calculo.irrf, calculo.liquido,
              dataInicioFerias || null, dataFimFerias || null, observacoes || null
            ],
            function(err) {
              if (err) {
                return res.status(500).json({ erro: 'Erro ao salvar cálculo' });
              }

              res.json({
                calculoId: this.lastID,
                funcionario: {
                  id: funcionario.id,
                  nome: funcionario.nome,
                  cpf: funcionario.cpf,
                  salarioBase: funcionario.salario_base
                },
                diasSolicitados,
                ...calculo,
                uso: {
                  plano: planoAtivo,
                  calculosUsados: result.count + 1,
                  limite: limite === -1 ? 'ilimitado' : limite
                }
              });
            }
          );
        }
      );
    }
  );
});

// Histórico de cálculos da empresa
router.get('/historico', auth, checkTrialValido, (req, res) => {
  const { empresaId } = req.user;
  const { funcionarioId, status, limite = 50 } = req.query;

  let query = `
    SELECT 
      h.*,
      f.nome as funcionario_nome,
      f.cpf as funcionario_cpf,
      u.nome as usuario_nome
    FROM historico_ferias h
    JOIN funcionarios f ON h.funcionario_id = f.id
    JOIN usuarios u ON h.usuario_solicitante_id = u.id
    WHERE h.empresa_id = ?
  `;
  
  const params = [empresaId];

  if (funcionarioId) {
    query += ' AND h.funcionario_id = ?';
    params.push(funcionarioId);
  }

  if (status) {
    query += ' AND h.status = ?';
    params.push(status);
  }

  query += ' ORDER BY h.created_at DESC LIMIT ?';
  params.push(parseInt(limite));

  db.all(query, params, (err, historico) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar histórico' });
    }
    res.json(historico);
  });
});

// Buscar cálculo específico
router.get('/:id', auth, checkTrialValido, (req, res) => {
  const { empresaId } = req.user;
  const { id } = req.params;

  db.get(
    `SELECT 
      h.*,
      f.nome as funcionario_nome,
      f.cpf as funcionario_cpf,
      u.nome as usuario_nome
    FROM historico_ferias h
    JOIN funcionarios f ON h.funcionario_id = f.id
    JOIN usuarios u ON h.usuario_solicitante_id = u.id
    WHERE h.id = ? AND h.empresa_id = ?`,
    [id, empresaId],
    (err, calculo) => {
      if (err || !calculo) {
        return res.status(404).json({ erro: 'Cálculo não encontrado' });
      }
      res.json(calculo);
    }
  );
});

// Atualizar status do cálculo (apenas Admin e RH)
router.patch('/:id/status', auth, checkTrialValido, (req, res) => {
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

  db.run(
    'UPDATE historico_ferias SET status = ? WHERE id = ? AND empresa_id = ?',
    [status, id, empresaId],
    function(err) {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao atualizar status' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ erro: 'Cálculo não encontrado' });
      }
      res.json({ mensagem: 'Status atualizado com sucesso', novoStatus: status });
    }
  );
});

module.exports = router;
