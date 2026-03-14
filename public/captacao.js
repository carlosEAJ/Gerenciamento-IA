document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DO DASHBOARD ---
    let captacaoChartInstance = null;

    // Função para inicializar ou atualizar o gráfico com o Chart.js
    const renderChart = (labels, dataAtual, dataAnterior) => {
        const ctx = document.getElementById('captacaoChart');
        if (!ctx) return;

        if (captacaoChartInstance) {
            captacaoChartInstance.destroy();
        }

        captacaoChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Captação Atual (R$)',
                        data: dataAtual,
                        backgroundColor: 'rgba(65, 105, 225, 0.7)', // Royal Blue
                        borderColor: 'rgba(65, 105, 225, 1)',
                        borderWidth: 1,
                        borderRadius: 4
                    },
                    {
                        label: 'Captação Anterior (R$)',
                        data: dataAnterior,
                        backgroundColor: 'rgba(200, 200, 200, 0.5)',
                        borderColor: 'rgba(200, 200, 200, 1)',
                        borderWidth: 1,
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    };

    // Preenche o filtro dinâmico de anos
    const populateYearFilter = () => {
        const yearSelect = document.getElementById('yearFilter');
        if (!yearSelect) return;
        const currentYear = new Date().getFullYear();
        for (let i = 0; i < 5; i++) {
            const option = document.createElement('option');
            option.value = currentYear - i;
            option.textContent = currentYear - i;
            yearSelect.appendChild(option);
        }
    };

    // Função principal de atualização de interface
    const updateDashboard = (amostraImportada = null) => {
        // Dados simulados para o gráfico principal
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
        const valoresAtuais = [45000, 52000, 48000, 61000, 59000, 75000];
        const valoresAnteriores = [40000, 42000, 45000, 50000, 55000, 60000];
        
        renderChart(meses, valoresAtuais, valoresAnteriores);

        // Atualiza Cards de Resumo
        document.getElementById('currentValue').textContent = 'R$ 75.000,00';
        document.getElementById('previousValue').textContent = 'R$ 60.000,00';
        const variationEl = document.getElementById('variation');
        if (variationEl) {
            variationEl.textContent = '+25%';
            variationEl.style.color = 'green';
        }
        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.textContent = 'Crescimento Acelerado';

        // Atualiza Tabela de Histórico
        const historyBody = document.getElementById('historyTableBody');
        if (historyBody) {
            historyBody.innerHTML = '';
            // Se recebeu dados novos da API de Upload, popula a tabela com eles
            if (amostraImportada && amostraImportada.length > 0) {
                amostraImportada.forEach((linha, index) => {
                    const tr = document.createElement('tr');
                    const chaves = Object.keys(linha);
                    const mes = chaves.length > 0 ? linha[chaves[0]] : `Linha ${index + 1}`;
                    const valor = chaves.length > 1 ? linha[chaves[1]] : 'N/A';
                    
                    tr.innerHTML = `
                        <td>${mes}</td>
                        <td>${valor}</td>
                        <td style="color: blue;">Importado via Planilha</td>
                    `;
                    historyBody.appendChild(tr);
                });
            } else {
                // Histórico Inicial Padrão
                historyBody.innerHTML = `
                    <tr><td>Jun/2024</td><td>R$ 75.000,00</td><td style="color:green">+25%</td></tr>
                    <tr><td>Mai/2024</td><td>R$ 59.000,00</td><td style="color:green">+18%</td></tr>
                    <tr><td>Abr/2024</td><td>R$ 61.000,00</td><td style="color:green">+22%</td></tr>
                `;
            }
        }
    };

    // Eventos dos Filtros e Botões Gerais
    const btnApplyFilter = document.getElementById('btnApplyFilter');
    if (btnApplyFilter) {
        btnApplyFilter.addEventListener('click', () => {
            updateDashboard(); // Recarrega gráficos/dados ao aplicar filtros
        });
    }

    const btnExport = document.getElementById('btnExport');
    if (btnExport) {
        btnExport.addEventListener('click', () => {
            alert('Iniciando download do relatório consolidado...');
        });
    }

    // Inicializa a tela carregando componentes e o gráfico
    populateYearFilter();
    updateDashboard();

    // --- NOVA LÓGICA DE INTEGRAÇÃO ---
    
    // Função auxiliar para obter o token JWT do localStorage
    const getToken = () => {
        // Ajuste 'jwt_token' se o nome da chave for diferente no seu login.js
        return localStorage.getItem('jwt_token'); 
    };

    // Elementos do DOM para as novas funcionalidades
    const btnSaveDbConnection = document.getElementById('btnSaveDbConnection');
    const dbConnectionStringInput = document.getElementById('dbConnectionString');
    const dbFeedback = document.getElementById('dbFeedback');

    const btnUploadFile = document.getElementById('btnUploadFile');
    const dataFileInput = document.getElementById('dataFile');
    const uploadFeedback = document.getElementById('uploadFeedback');

    // Event Listener para salvar a string de conexão do banco de dados
    if (btnSaveDbConnection) {
        btnSaveDbConnection.addEventListener('click', async () => {
            const connectionString = dbConnectionStringInput.value;
            const token = getToken();

            if (!connectionString) {
                dbFeedback.textContent = 'Por favor, insira a string de conexão.';
                dbFeedback.className = 'feedback error';
                return;
            }
            if (!token) {
                dbFeedback.textContent = 'Erro de autenticação. Faça login novamente.';
                dbFeedback.className = 'feedback error';
                return;
            }

            dbFeedback.textContent = 'Salvando...';
            dbFeedback.className = 'feedback info';

            try {
                const response = await fetch('/api/integrations/db', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ connectionString })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.erro || 'Falha ao salvar conexão.');
                }

                dbFeedback.textContent = data.mensagem || 'Conexão salva com sucesso!';
                dbFeedback.className = 'feedback success';

            } catch (error) {
                dbFeedback.textContent = error.message;
                dbFeedback.className = 'feedback error';
            }
        });
    }

    // Event Listener para fazer o upload de um arquivo
    if (btnUploadFile) {
        btnUploadFile.addEventListener('click', async () => {
            const file = dataFileInput.files[0];
            const token = getToken();

            if (!file) {
                uploadFeedback.textContent = 'Por favor, selecione um arquivo.';
                uploadFeedback.className = 'feedback error';
                return;
            }
            if (!token) {
                uploadFeedback.textContent = 'Erro de autenticação. Faça login novamente.';
                uploadFeedback.className = 'feedback error';
                return;
            }

            const formData = new FormData();
            formData.append('dataFile', file);

            uploadFeedback.textContent = 'Enviando arquivo...';
            uploadFeedback.className = 'feedback info';

            try {
                const response = await fetch('/api/integrations/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.erro || 'Falha ao enviar arquivo.');
                }

                uploadFeedback.textContent = data.mensagem || 'Arquivo enviado com sucesso!';
                uploadFeedback.className = 'feedback success';
                dataFileInput.value = ''; // Limpa o input do arquivo

                // Se a API retornou a amostra de dados extraídos da planilha, atualizamos a tabela na interface!
                if (data.amostra) {
                    updateDashboard(data.amostra);
                }

            } catch (error) {
                uploadFeedback.textContent = error.message;
                uploadFeedback.className = 'feedback error';
            }
        });
    }
});