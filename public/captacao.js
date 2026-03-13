// Dados simulados de captação (em produção, viriam de uma API)
const captacaoData = {
  2022: {
    1: 45000, 2: 48000, 3: 52000, 4: 49000, 5: 51000, 6: 53000,
    7: 55000, 8: 54000, 9: 56000, 10: 58000, 11: 60000, 12: 62000
  },
  2023: {
    1: 65000, 2: 67000, 3: 70000, 4: 68000, 5: 72000, 6: 75000,
    7: 78000, 8: 76000, 9: 80000, 10: 82000, 11: 85000, 12: 88000
  },
  2024: {
    1: 90000, 2: 92000, 3: 95000, 4: 93000, 5: 97000, 6: 100000,
    7: 103000, 8: 105000, 9: 108000, 10: 110000, 11: 112000, 12: 115000
  }
};

// Elementos DOM
const viewType = document.getElementById('viewType');
const monthFilter = document.getElementById('monthFilter');
const yearFilter = document.getElementById('yearFilter');
const monthFilterGroup = document.getElementById('monthFilterGroup');
const btnApplyFilter = document.getElementById('btnApplyFilter');
const btnExport = document.getElementById('btnExport');

// Variáveis globais
let currentChart = null;
let currentView = 'monthly';
let selectedMonth = new Date().getMonth() + 1;
let selectedYear = new Date().getFullYear();

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  initializeFilters();
  updateView();
});

// Inicializar filtros
function initializeFilters() {
  // Preencher anos disponíveis
  const years = Object.keys(captacaoData).sort((a, b) => b - a);
  years.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    if (parseInt(year) === selectedYear) option.selected = true;
    yearFilter.appendChild(option);
  });

  // Selecionar mês atual
  monthFilter.value = selectedMonth;

  // Event listeners
  viewType.addEventListener('change', (e) => {
    currentView = e.target.value;
    monthFilterGroup.style.display = currentView === 'monthly' ? 'block' : 'none';
  });

  btnApplyFilter.addEventListener('click', () => {
    selectedMonth = parseInt(monthFilter.value);
    selectedYear = parseInt(yearFilter.value);
    updateView();
  });

  btnExport.addEventListener('click', exportToExcel);
}

// Atualizar visualização
function updateView() {
  if (currentView === 'monthly') {
    updateMonthlyView();
  } else {
    updateYearlyView();
  }
  updateHistoryTable();
}

// Visualização mensal
function updateMonthlyView() {
  const currentValue = captacaoData[selectedYear]?.[selectedMonth] || 0;
  const previousValue = captacaoData[selectedYear - 1]?.[selectedMonth] || 0;
  
  updateSummaryCards(currentValue, previousValue, 'monthly');
  createMonthlyChart();
  createMonthlyComparison();
  generateInsights('monthly', currentValue, previousValue);
}

// Visualização anual
function updateYearlyView() {
  const currentValue = calculateYearTotal(selectedYear);
  const previousValue = calculateYearTotal(selectedYear - 1);
  
  updateSummaryCards(currentValue, previousValue, 'yearly');
  createYearlyChart();
  createYearlyComparison();
  generateInsights('yearly', currentValue, previousValue);
}

// Calcular total anual
function calculateYearTotal(year) {
  if (!captacaoData[year]) return 0;
  return Object.values(captacaoData[year]).reduce((sum, val) => sum + val, 0);
}

// Atualizar cards de resumo
function updateSummaryCards(current, previous, type) {
  const monthNames = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  const currentPeriod = type === 'monthly' 
    ? `${monthNames[selectedMonth]} ${selectedYear}`
    : `Ano ${selectedYear}`;
  
  const previousPeriod = type === 'monthly'
    ? `${monthNames[selectedMonth]} ${selectedYear - 1}`
    : `Ano ${selectedYear - 1}`;
  
  document.getElementById('currentPeriod').textContent = currentPeriod;
  document.getElementById('currentValue').textContent = formatCurrency(current);
  
  document.getElementById('previousPeriod').textContent = previousPeriod;
  document.getElementById('previousValue').textContent = formatCurrency(previous);
  
  const variation = previous > 0 ? ((current - previous) / previous * 100) : 0;
  const variationElement = document.getElementById('variation');
  const statusElement = document.getElementById('status');
  
  variationElement.textContent = `${variation >= 0 ? '+' : ''}${variation.toFixed(1)}%`;
  
  if (variation > 0) {
    statusElement.textContent = '📈 Crescimento';
    statusElement.className = 'status positive';
  } else if (variation < 0) {
    statusElement.textContent = '📉 Queda';
    statusElement.className = 'status negative';
  } else {
    statusElement.textContent = '➡️ Estável';
    statusElement.className = 'status neutral';
  }
}

// Criar gráfico mensal
function createMonthlyChart() {
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  const currentYearData = [];
  const previousYearData = [];
  
  for (let i = 1; i <= 12; i++) {
    currentYearData.push(captacaoData[selectedYear]?.[i] || 0);
    previousYearData.push(captacaoData[selectedYear - 1]?.[i] || 0);
  }
  
  createChart(monthNames, currentYearData, previousYearData, 
              `${selectedYear}`, `${selectedYear - 1}`);
}

// Criar gráfico anual
function createYearlyChart() {
  const years = Object.keys(captacaoData).sort();
  const labels = years;
  const data = years.map(year => calculateYearTotal(parseInt(year)));
  
  createChart(labels, data, [], 'Total Anual', '');
}

// Criar gráfico
function createChart(labels, data1, data2, label1, label2) {
  const ctx = document.getElementById('captacaoChart').getContext('2d');
  
  if (currentChart) {
    currentChart.destroy();
  }
  
  const datasets = [{
    label: label1,
    data: data1,
    borderColor: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    tension: 0.4,
    fill: true
  }];
  
  if (data2.length > 0) {
    datasets.push({
      label: label2,
      data: data2,
      borderColor: '#f5576c',
      backgroundColor: 'rgba(245, 87, 108, 0.1)',
      tension: 0.4,
      fill: true
    });
  }
  
  currentChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'R$ ' + (value / 1000) + 'k';
            }
          }
        }
      }
    }
  });
}

// Criar comparação mensal
function createMonthlyComparison() {
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  const tbody = document.getElementById('comparisonTableBody');
  tbody.innerHTML = '';
  
  for (let i = 1; i <= 12; i++) {
    const current = captacaoData[selectedYear]?.[i] || 0;
    const previous = captacaoData[selectedYear - 1]?.[i] || 0;
    const diff = current - previous;
    const variation = previous > 0 ? ((diff / previous) * 100) : 0;
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${monthNames[i - 1]}</td>
      <td>${formatCurrency(previous)}</td>
      <td>${formatCurrency(current)}</td>
      <td class="${diff >= 0 ? 'positive' : 'negative'}">${formatCurrency(diff)}</td>
      <td class="${variation >= 0 ? 'positive' : 'negative'}">${variation >= 0 ? '+' : ''}${variation.toFixed(1)}%</td>
    `;
    tbody.appendChild(row);
  }
}

// Criar comparação anual
function createYearlyComparison() {
  const years = Object.keys(captacaoData).sort();
  const tbody = document.getElementById('comparisonTableBody');
  tbody.innerHTML = '';
  
  for (let i = 1; i < years.length; i++) {
    const currentYear = parseInt(years[i]);
    const previousYear = parseInt(years[i - 1]);
    const current = calculateYearTotal(currentYear);
    const previous = calculateYearTotal(previousYear);
    const diff = current - previous;
    const variation = previous > 0 ? ((diff / previous) * 100) : 0;
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${currentYear}</td>
      <td>${formatCurrency(previous)}</td>
      <td>${formatCurrency(current)}</td>
      <td class="${diff >= 0 ? 'positive' : 'negative'}">${formatCurrency(diff)}</td>
      <td class="${variation >= 0 ? 'positive' : 'negative'}">${variation >= 0 ? '+' : ''}${variation.toFixed(1)}%</td>
    `;
    tbody.appendChild(row);
  }
}

// Gerar insights
function generateInsights(type, current, previous) {
  const container = document.getElementById('insightsContainer');
  container.innerHTML = '';
  
  const diff = current - previous;
  const variation = previous > 0 ? ((diff / previous) * 100) : 0;
  
  // Insight 1: Tendência
  const insight1 = document.createElement('div');
  insight1.className = 'insight-card';
  insight1.innerHTML = `
    <h3><span class="insight-icon">${variation >= 0 ? '📈' : '📉'}</span>Tendência</h3>
    <p>A captação ${type === 'monthly' ? 'mensal' : 'anual'} apresentou ${variation >= 0 ? 'crescimento' : 'queda'} de 
    <strong>${Math.abs(variation).toFixed(1)}%</strong> em relação ao período anterior, 
    representando ${variation >= 0 ? 'um aumento' : 'uma redução'} de <strong>${formatCurrency(Math.abs(diff))}</strong>.</p>
  `;
  container.appendChild(insight1);
  
  // Insight 2: Performance
  const insight2 = document.createElement('div');
  insight2.className = 'insight-card';
  let performance = '';
  if (variation >= 10) {
    performance = 'excelente, superando as expectativas';
  } else if (variation >= 5) {
    performance = 'boa, mantendo crescimento consistente';
  } else if (variation >= 0) {
    performance = 'estável, com leve crescimento';
  } else if (variation >= -5) {
    performance = 'em atenção, com leve queda';
  } else {
    performance = 'preocupante, necessitando ações corretivas';
  }
  
  insight2.innerHTML = `
    <h3><span class="insight-icon">🎯</span>Performance</h3>
    <p>A performance da captação está <strong>${performance}</strong>. 
    ${variation >= 0 ? 'Continue investindo nas estratégias atuais.' : 'Recomenda-se revisar as estratégias de captação.'}</p>
  `;
  container.appendChild(insight2);
  
  // Insight 3: Projeção
  const insight3 = document.createElement('div');
  insight3.className = 'insight-card';
  const projection = current * (1 + (variation / 100));
  insight3.innerHTML = `
    <h3><span class="insight-icon">🔮</span>Projeção</h3>
    <p>Mantendo a tendência atual, a projeção para o próximo período é de aproximadamente 
    <strong>${formatCurrency(projection)}</strong>, representando ${variation >= 0 ? 'um crescimento' : 'uma redução'} 
    potencial de <strong>${Math.abs(variation).toFixed(1)}%</strong>.</p>
  `;
  container.appendChild(insight3);
}

// Atualizar tabela de histórico
function updateHistoryTable() {
  const tbody = document.getElementById('historyTableBody');
  tbody.innerHTML = '';
  
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  const years = Object.keys(captacaoData).sort((a, b) => b - a);
  
  years.forEach(year => {
    for (let month = 12; month >= 1; month--) {
      const value = captacaoData[year]?.[month];
      if (value) {
        const previousValue = captacaoData[year - 1]?.[month] || 0;
        const variation = previousValue > 0 ? (((value - previousValue) / previousValue) * 100) : 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${monthNames[month - 1]}/${year}</td>
          <td>${formatCurrency(value)}</td>
          <td class="${variation >= 0 ? 'positive' : 'negative'}">${variation >= 0 ? '+' : ''}${variation.toFixed(1)}%</td>
        `;
        tbody.appendChild(row);
      }
    }
  });
}

// Exportar para Excel
function exportToExcel() {
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  const data = [['Mês/Ano', 'Valor Captado', 'Variação %']];
  
  const years = Object.keys(captacaoData).sort((a, b) => b - a);
  
  years.forEach(year => {
    for (let month = 12; month >= 1; month--) {
      const value = captacaoData[year]?.[month];
      if (value) {
        const previousValue = captacaoData[year - 1]?.[month] || 0;
        const variation = previousValue > 0 ? (((value - previousValue) / previousValue) * 100) : 0;
        
        data.push([
          `${monthNames[month - 1]}/${year}`,
          value,
          `${variation >= 0 ? '+' : ''}${variation.toFixed(1)}%`
        ]);
      }
    }
  });
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Histórico de Captação');
  XLSX.writeFile(wb, 'historico_captacao.xlsx');
}

// Formatar moeda
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}
