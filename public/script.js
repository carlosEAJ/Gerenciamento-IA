document.getElementById('formFerias').addEventListener('submit', async (e) => {
  e.preventDefault();

  const salarioBruto = document.getElementById('salarioBruto').value;
  const diasFerias = document.getElementById('diasFerias').value;

  try {
    const response = await fetch('/calcular-ferias', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ salarioBruto, diasFerias: parseInt(diasFerias) })
    });

    if (!response.ok) {
      throw new Error('Erro ao calcular férias');
    }

    const data = await response.json();
    exibirResultado(data);
  } catch (error) {
    alert('Erro ao calcular férias. Verifique os dados e tente novamente.');
    console.error(error);
  }
});

function exibirResultado(data) {
  document.getElementById('resSalario').textContent = `R$ ${data.salarioBruto}`;
  document.getElementById('resDias').textContent = `${data.diasFerias} dias`;
  document.getElementById('resValorFerias').textContent = `R$ ${data.valorFerias}`;
  document.getElementById('resAdicional').textContent = `R$ ${data.adicionalTerco}`;
  document.getElementById('resTotalBruto').textContent = `R$ ${data.totalBruto}`;
  document.getElementById('resINSS').textContent = `R$ ${data.inss}`;
  document.getElementById('resIRRF').textContent = `R$ ${data.irrf}`;
  document.getElementById('resTotalLiquido').textContent = `R$ ${data.totalLiquido}`;

  const explicacaoDiv = document.getElementById('explicacaoDetalhada');
  explicacaoDiv.innerHTML = `
    <p><strong>1. Valor das Férias:</strong><br>${data.explicacao.valorFerias}</p>
    <p><strong>2. Adicional de 1/3:</strong><br>${data.explicacao.adicionalTerco}<br>
    <em>Conforme Art. 7º, XVII da Constituição Federal, todo trabalhador tem direito a férias acrescidas de 1/3 do salário.</em></p>
    <p><strong>3. Total Bruto:</strong><br>${data.explicacao.totalBruto}</p>
    <p><strong>4. Desconto INSS:</strong><br>${data.explicacao.inss}<br>
    <em>Calculado com alíquotas progressivas de 7,5% a 14% conforme faixas salariais.</em></p>
    <p><strong>5. Desconto IRRF:</strong><br>${data.explicacao.irrf}<br>
    <em>Imposto de Renda Retido na Fonte calculado sobre (Total Bruto - INSS) com alíquotas de 0% a 27,5%.</em></p>
    <p><strong>6. Valor Líquido:</strong><br>${data.explicacao.totalLiquido}<br>
    <em>Este é o valor que você receberá em sua conta após todos os descontos legais.</em></p>
  `;

  document.getElementById('resultSection').style.display = 'block';
  document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
}
