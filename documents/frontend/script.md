# ⚙️ Documentação do JavaScript Frontend

## Visão Geral

Os scripts frontend gerenciam a interação do usuário e a comunicação com a API do servidor. Com a migração para a arquitetura SaaS, o frontend também é responsável por armazenar e enviar tokens JWT nas requisições protegidas.

## Estrutura do Código

### 1. Event Listener Principal

```javascript
document.getElementById('formFerias').addEventListener('submit', async (e) => {
  e.preventDefault();
  // Lógica de processamento
});
```

**Componentes:**

| Elemento | Descrição |
|----------|-----------|
| getElementById('formFerias') | Seleciona o formulário pelo ID |
| addEventListener('submit') | Escuta o evento de envio |
| async | Função assíncrona para usar await |
| e.preventDefault() | Impede reload da página |

**Fluxo:**
1. Usuário clica em "Calcular Férias"
2. Evento submit é disparado
3. preventDefault() cancela comportamento padrão
4. Função assíncrona processa a requisição

## Captura de Dados do Formulário

```javascript
const salarioBruto = document.getElementById('salarioBruto').value;
const diasFerias = document.getElementById('diasFerias').value;
```

**Método:**
- Acessa elementos pelo ID
- Extrai valores com `.value`
- Armazena em constantes

**Dados Capturados:**
- **salarioBruto**: String com valor monetário
- **diasFerias**: String com número de dias

## Requisição HTTP ao Servidor

### Comunicação com API (SaaS)

```javascript
const token = localStorage.getItem('token'); // Recupera o JWT salvo no login
const response = await fetch('/api/calculations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // Token de segurança
  },
  body: JSON.stringify({ funcionarioId, diasSolicitados })
});
```

### Detalhamento dos Parâmetros

#### URL
```javascript
'/calcular-ferias'
```
- Endpoint relativo
- Aponta para o servidor Express na mesma origem

#### Method
```javascript
method: 'POST'
```
- Método HTTP POST
- Envia dados no body da requisição

#### Headers
```javascript
headers: {
  'Content-Type': 'application/json'
}
```
- Informa ao servidor que o body é JSON
- Necessário para o middleware express.json() processar

#### Body
```javascript
body: JSON.stringify({ 
  salarioBruto, 
  diasFerias: parseInt(diasFerias) 
})
```

**Transformações:**
- **JSON.stringify()**: Converte objeto JavaScript em string JSON
- **parseInt(diasFerias)**: Converte string em número inteiro

**Estrutura do JSON enviado:**
```json
{
  "salarioBruto": "3000.00",
  "diasFerias": 30
}
```

## Tratamento de Resposta

### Verificação de Status

```javascript
if (!response.ok) {
  throw new Error('Erro ao calcular férias');
}
```

**Lógica:**
- `response.ok`: true se status 200-299
- Lança erro se resposta não for bem-sucedida
- Erro capturado pelo bloco catch

### Parsing da Resposta

```javascript
const data = await response.json();
```

- **await**: Aguarda conversão assíncrona
- **response.json()**: Converte resposta JSON em objeto JavaScript
- **data**: Objeto com todos os valores calculados

### Estrutura do Objeto data

```javascript
{
  salarioBruto: "3000.00",
  diasFerias: 30,
  valorFerias: "3000.00",
  adicionalTerco: "1000.00",
  totalBruto: "4000.00",
  inss: "466.96",
  irrf: "263.23",
  totalLiquido: "3269.81",
  explicacao: {
    valorFerias: "...",
    adicionalTerco: "...",
    totalBruto: "...",
    inss: "...",
    irrf: "...",
    totalLiquido: "..."
  }
}
```

## Exibição de Resultados

### Chamada da Função

```javascript
exibirResultado(data);
```

- Recebe objeto data como parâmetro
- Atualiza interface com os valores

### Função exibirResultado

```javascript
function exibirResultado(data) {
  // Atualização dos elementos
}
```

#### Atualização de Valores Simples

```javascript
document.getElementById('resSalario').textContent = `R$ ${data.salarioBruto}`;
document.getElementById('resDias').textContent = `${data.diasFerias} dias`;
document.getElementById('resValorFerias').textContent = `R$ ${data.valorFerias}`;
document.getElementById('resAdicional').textContent = `R$ ${data.adicionalTerco}`;
document.getElementById('resTotalBruto').textContent = `R$ ${data.totalBruto}`;
document.getElementById('resINSS').textContent = `R$ ${data.inss}`;
document.getElementById('resIRRF').textContent = `R$ ${data.irrf}`;
document.getElementById('resTotalLiquido').textContent = `R$ ${data.totalLiquido}`;
```

**Padrão:**
1. Seleciona elemento pelo ID
2. Define textContent com template string
3. Formata com prefixo "R$" ou sufixo "dias"

**Mapeamento ID → Dado:**

| ID do Elemento | Propriedade do data | Formato |
|----------------|---------------------|---------|
| resSalario | salarioBruto | R$ X.XX |
| resDias | diasFerias | X dias |
| resValorFerias | valorFerias | R$ X.XX |
| resAdicional | adicionalTerco | R$ X.XX |
| resTotalBruto | totalBruto | R$ X.XX |
| resINSS | inss | R$ X.XX |
| resIRRF | irrf | R$ X.XX |
| resTotalLiquido | totalLiquido | R$ X.XX |

#### Construção da Explicação Detalhada

```javascript
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
```

**Estrutura:**
- **innerHTML**: Permite inserir HTML formatado
- **Template string**: Usa backticks para múltiplas linhas
- **Interpolação**: ${} para inserir valores dinâmicos

**Elementos HTML gerados:**
- `<p>`: Parágrafos para cada explicação
- `<strong>`: Títulos em negrito
- `<br>`: Quebras de linha
- `<em>`: Textos explicativos em itálico

**Conteúdo:**
1. Fórmula de cada cálculo (do servidor)
2. Contexto legal adicional (hardcoded)
3. Explicações sobre alíquotas e descontos

#### Exibição da Seção de Resultados

```javascript
document.getElementById('resultSection').style.display = 'block';
```

**Função:**
- Torna visível a seção inicialmente oculta
- Muda CSS display de 'none' para 'block'

#### Scroll Suave até Resultados

```javascript
document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
```

**Comportamento:**
- Rola a página até a seção de resultados
- **behavior: 'smooth'**: Animação suave
- Melhora UX ao mostrar automaticamente os resultados

## Tratamento de Erros

### Bloco Try-Catch

```javascript
try {
  // Requisição e processamento
} catch (error) {
  alert('Erro ao calcular férias. Verifique os dados e tente novamente.');
  console.error(error);
}
```

### Tipos de Erros Capturados

1. **Erro de Rede**: Servidor offline ou sem conexão
2. **Erro HTTP**: Status 400, 500, etc.
3. **Erro de Parsing**: JSON inválido
4. **Erro de Validação**: Dados rejeitados pelo servidor

### Feedback ao Usuário

```javascript
alert('Erro ao calcular férias. Verifique os dados e tente novamente.');
```

- **alert()**: Exibe mensagem modal
- Mensagem genérica e amigável
- Não expõe detalhes técnicos

### Log de Erro

```javascript
console.error(error);
```

- Registra erro no console do navegador
- Útil para debugging
- Não visível para usuário final

## Fluxo Completo de Execução

```
1. Usuário preenche formulário
   ↓
2. Clica em "Calcular Férias"
   ↓
3. Event listener captura submit
   ↓
4. preventDefault() cancela reload
   ↓
5. Captura valores dos inputs
   ↓
6. Cria objeto JSON
   ↓
7. Envia POST para /calcular-ferias
   ↓
8. Aguarda resposta do servidor
   ↓
9. Verifica se response.ok
   ↓
10. Converte resposta para JSON
    ↓
11. Chama exibirResultado(data)
    ↓
12. Atualiza 8 elementos com valores
    ↓
13. Constrói HTML da explicação
    ↓
14. Exibe seção de resultados
    ↓
15. Scroll suave até resultados
```

## Métodos e APIs Utilizadas

### DOM APIs

| Método | Uso | Descrição |
|--------|-----|-----------|
| getElementById() | Seleção | Busca elemento por ID |
| addEventListener() | Eventos | Registra listener de evento |
| .value | Leitura | Obtém valor de input |
| .textContent | Escrita | Define texto de elemento |
| .innerHTML | Escrita | Define HTML interno |
| .style.display | CSS | Modifica propriedade CSS |
| scrollIntoView() | Navegação | Rola até elemento |

### Fetch API

```javascript
fetch(url, options)
```

- **Assíncrona**: Retorna Promise
- **Moderna**: Substitui XMLHttpRequest
- **Flexível**: Suporta diversos métodos HTTP

### Async/Await

```javascript
async function() {
  const result = await promise;
}
```

- **async**: Marca função como assíncrona
- **await**: Pausa execução até Promise resolver
- **Sintaxe limpa**: Mais legível que .then()

## Boas Práticas Implementadas

1. **Prevenção de Reload**: preventDefault()
2. **Tratamento de Erros**: try-catch
3. **Feedback ao Usuário**: alert() e scroll
4. **Código Assíncrono**: async/await
5. **Separação de Responsabilidades**: função exibirResultado()
6. **Template Strings**: Código mais legível
7. **Conversão de Tipos**: parseInt() para garantir número

## Possíveis Melhorias

- [ ] Adicionar loading spinner durante requisição
- [ ] Implementar debounce no submit
- [ ] Validação adicional no frontend
- [ ] Mensagens de erro mais específicas
- [ ] Animações na exibição de resultados
- [ ] Salvar histórico no localStorage
- [ ] Adicionar botão para limpar resultados
- [ ] Implementar toast notifications ao invés de alert()

## Dependências

- **Nenhuma biblioteca externa**
- Usa apenas APIs nativas do navegador
- Compatível com navegadores modernos (ES6+)

## Compatibilidade

### Recursos ES6+ Utilizados

- Arrow functions: `() => {}`
- Template strings: `` `${var}` ``
- Const/Let: Escopo de bloco
- Async/Await: Promises síncronas
- Destructuring: `const { x } = obj`

### Navegadores Suportados

- Chrome 55+
- Firefox 52+
- Safari 11+
- Edge 15+

### Fallback para Navegadores Antigos

Para suportar navegadores mais antigos, seria necessário:
- Transpilação com Babel
- Polyfill para fetch()
- Polyfill para Promise
