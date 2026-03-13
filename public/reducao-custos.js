// Elementos DOM
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const formTexto = document.getElementById('formTexto');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const btnEnviarPlanilha = document.getElementById('btnEnviarPlanilha');
const btnRemoveFile = document.getElementById('btnRemoveFile');
const downloadTemplate = document.getElementById('downloadTemplate');
const successSection = document.getElementById('successSection');
const successDetails = document.getElementById('successDetails');
const btnNovaSugestao = document.getElementById('btnNovaSugestao');
const inputSection = document.querySelector('.input-section');

// Troca de abas
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const tabName = button.dataset.tab;
    
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    button.classList.add('active');
    document.getElementById(tabName).classList.add('active');
  });
});

// Envio de sugestão por texto
formTexto.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const dados = {
    nome: document.getElementById('nomeFunc').value,
    setor: document.getElementById('setor').value,
    categoria: document.getElementById('categoria').value,
    itemAtual: document.getElementById('itemAtual').value,
    custoAtual: document.getElementById('custoAtual').value || 'Não informado',
    sugestao: document.getElementById('sugestao').value,
    economiaPrevista: document.getElementById('economiaPrev').value || 'Não informado',
    justificativa: document.getElementById('justificativa').value
  };
  
  mostrarSucesso(dados, 'texto');
});

// Upload de arquivo
uploadArea.addEventListener('click', () => {
  fileInput.click();
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  
  const file = e.dataTransfer.files[0];
  if (file) {
    handleFile(file);
  }
});

// Seleção de arquivo
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    handleFile(file);
  }
});

// Processar arquivo
function handleFile(file) {
  const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                      'application/vnd.ms-excel', 
                      'text/csv'];
  
  if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/)) {
    alert('Formato de arquivo inválido. Use .xlsx, .xls ou .csv');
    return;
  }
  
  fileName.textContent = file.name;
  uploadArea.style.display = 'none';
  fileInfo.style.display = 'block';
}

// Remover arquivo
btnRemoveFile.addEventListener('click', () => {
  fileInput.value = '';
  uploadArea.style.display = 'block';
  fileInfo.style.display = 'none';
});

// Enviar planilha
btnEnviarPlanilha.addEventListener('click', () => {
  const nome = document.getElementById('nomeFuncPlan').value;
  const setor = document.getElementById('setorPlan').value;
  const file = fileInput.files[0];
  
  if (!nome || !setor) {
    alert('Por favor, preencha seu nome e setor');
    return;
  }
  
  if (!file) {
    alert('Nenhum arquivo selecionado');
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      
      if (jsonData.length === 0) {
        alert('A planilha está vazia');
        return;
      }
      
      // Validar formato
      const parsedItems = jsonData.map(row => {
        const produto = row.produto || row.Produto || row.PRODUTO;
        const preco = parseFloat(row.preco || row.Preco || row.PRECO || row.preço || row.Preço);
        const sugestao = row.sugestao || row.Sugestao || row.SUGESTAO || '';
        
        if (!produto || isNaN(preco)) {
          return null;
        }
        
        return { produto, preco, sugestao };
      }).filter(item => item !== null);
      
      if (parsedItems.length === 0) {
        alert('Nenhum dado válido encontrado. Verifique se as colunas são "produto" e "preco"');
        return;
      }
      
      const dados = {
        nome: nome,
        setor: setor,
        arquivo: file.name,
        totalItens: parsedItems.length,
        itens: parsedItems
      };
      
      mostrarSucesso(dados, 'planilha');
      
    } catch (error) {
      alert('Erro ao processar arquivo: ' + error.message);
    }
  };
  
  reader.readAsArrayBuffer(file);
});

// Download do template
downloadTemplate.addEventListener('click', (e) => {
  e.preventDefault();
  
  const template = [
    ['produto', 'preco', 'sugestao'],
    ['Papel A4', 500.00, 'Digitalizar processos'],
    ['Energia Elétrica', 3500.00, 'Instalar painéis solares'],
    ['Serviço de Limpeza', 2000.00, 'Renegociar contrato'],
    ['Internet', 800.00, 'Comparar fornecedores'],
    ['Telefonia', 600.00, 'Migrar para VoIP']
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(template);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sugestões');
  XLSX.writeFile(wb, 'template_sugestoes_reducao_custos.xlsx');
});

// Mostrar mensagem de sucesso
function mostrarSucesso(dados, tipo) {
  let detalhesHTML = '';
  
  if (tipo === 'texto') {
    detalhesHTML = `
      <p><strong>Nome:</strong> ${dados.nome}</p>
      <p><strong>Setor:</strong> ${dados.setor}</p>
      <p><strong>Categoria:</strong> ${dados.categoria}</p>
      <p><strong>Item/Processo:</strong> ${dados.itemAtual}</p>
      <p><strong>Custo Atual:</strong> ${dados.custoAtual === 'Não informado' ? dados.custoAtual : 'R$ ' + dados.custoAtual}</p>
      <p><strong>Economia Prevista:</strong> ${dados.economiaPrevista === 'Não informado' ? dados.economiaPrevista : 'R$ ' + dados.economiaPrevista}</p>
    `;
  } else {
    const totalCusto = dados.itens.reduce((sum, item) => sum + item.preco, 0);
    detalhesHTML = `
      <p><strong>Nome:</strong> ${dados.nome}</p>
      <p><strong>Setor:</strong> ${dados.setor}</p>
      <p><strong>Arquivo:</strong> ${dados.arquivo}</p>
      <p><strong>Total de Itens:</strong> ${dados.totalItens}</p>
      <p><strong>Custo Total Identificado:</strong> R$ ${totalCusto.toFixed(2)}</p>
    `;
  }
  
  successDetails.innerHTML = detalhesHTML;
  inputSection.style.display = 'none';
  successSection.style.display = 'block';
  successSection.scrollIntoView({ behavior: 'smooth' });
  
  // Simular envio ao servidor (aqui você integraria com backend real)
  console.log('Sugestão enviada:', dados);
}

// Nova sugestão
btnNovaSugestao.addEventListener('click', () => {
  // Limpar formulários
  formTexto.reset();
  document.getElementById('nomeFuncPlan').value = '';
  document.getElementById('setorPlan').value = '';
  fileInput.value = '';
  uploadArea.style.display = 'block';
  fileInfo.style.display = 'none';
  
  // Mostrar seção de input novamente
  successSection.style.display = 'none';
  inputSection.style.display = 'block';
  inputSection.scrollIntoView({ behavior: 'smooth' });
});
