const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

app.post('/calcular-ferias', (req, res) => {
  const { salarioBruto, diasFerias } = req.body;

  if (!salarioBruto || !diasFerias || diasFerias < 1 || diasFerias > 30) {
    return res.status(400).json({ erro: 'Dados inválidos' });
  }

  const salario = parseFloat(salarioBruto);
  
  // Cálculo proporcional de férias
  const valorFerias = (salario / 30) * diasFerias;
  
  // Adicional de 1/3 constitucional
  const adicionalTerco = valorFerias / 3;
  
  // Total bruto
  const totalBruto = valorFerias + adicionalTerco;
  
  // Cálculo de INSS (tabela 2024)
  let inss = 0;
  if (totalBruto <= 1412.00) {
    inss = totalBruto * 0.075;
  } else if (totalBruto <= 2666.68) {
    inss = 1412.00 * 0.075 + (totalBruto - 1412.00) * 0.09;
  } else if (totalBruto <= 4000.03) {
    inss = 1412.00 * 0.075 + (2666.68 - 1412.00) * 0.09 + (totalBruto - 2666.68) * 0.12;
  } else {
    inss = 1412.00 * 0.075 + (2666.68 - 1412.00) * 0.09 + (4000.03 - 2666.68) * 0.12 + (totalBruto - 4000.03) * 0.14;
  }
  inss = Math.min(inss, 908.85); // Teto do INSS
  
  // Base de cálculo do IRRF
  const baseIRRF = totalBruto - inss;
  
  // Cálculo de IRRF (tabela 2024)
  let irrf = 0;
  if (baseIRRF <= 2112.00) {
    irrf = 0;
  } else if (baseIRRF <= 2826.65) {
    irrf = baseIRRF * 0.075 - 158.40;
  } else if (baseIRRF <= 3751.05) {
    irrf = baseIRRF * 0.15 - 370.40;
  } else if (baseIRRF <= 4664.68) {
    irrf = baseIRRF * 0.225 - 651.73;
  } else {
    irrf = baseIRRF * 0.275 - 884.96;
  }
  irrf = Math.max(irrf, 0);
  
  // Valor líquido
  const totalLiquido = totalBruto - inss - irrf;
  
  res.json({
    salarioBruto: salario.toFixed(2),
    diasFerias,
    valorFerias: valorFerias.toFixed(2),
    adicionalTerco: adicionalTerco.toFixed(2),
    totalBruto: totalBruto.toFixed(2),
    inss: inss.toFixed(2),
    irrf: irrf.toFixed(2),
    totalLiquido: totalLiquido.toFixed(2),
    explicacao: {
      valorFerias: `Salário (R$ ${salario.toFixed(2)}) ÷ 30 dias × ${diasFerias} dias = R$ ${valorFerias.toFixed(2)}`,
      adicionalTerco: `Adicional de 1/3 constitucional: R$ ${valorFerias.toFixed(2)} ÷ 3 = R$ ${adicionalTerco.toFixed(2)}`,
      totalBruto: `Valor de férias + Adicional 1/3 = R$ ${totalBruto.toFixed(2)}`,
      inss: `INSS calculado sobre o total bruto (alíquota progressiva) = R$ ${inss.toFixed(2)}`,
      irrf: `IRRF calculado sobre (Total Bruto - INSS) com alíquota progressiva = R$ ${irrf.toFixed(2)}`,
      totalLiquido: `Valor líquido a receber = R$ ${totalLiquido.toFixed(2)}`
    }
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
