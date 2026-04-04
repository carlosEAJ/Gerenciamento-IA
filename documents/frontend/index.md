# 📄 Documentação do HTML Frontend

## Visão Geral

Com a mudança para SaaS e a chegada da versão 3.0.0, o frontend expandiu-se e passou a incluir páginas de **Login**, a **Home (index.html com Menu Dinâmico)**, a página do **Relógio de Ponto** e os novos **Dashboards Corporativos**. Todas seguem os mesmos princípios de semântica e responsividade.

## Estrutura do Documento

### Cabeçalho HTML

```html
<!DOCTYPE html>
<html lang="pt-BR">
```

- **DOCTYPE**: HTML5
- **lang**: pt-BR (Português do Brasil) para acessibilidade e SEO

### Meta Tags

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

| Meta Tag | Propósito |
|----------|-----------|
| charset | Define codificação UTF-8 para caracteres especiais |
| viewport | Torna a página responsiva em dispositivos móveis |

### Recursos Externos

```html
<title>Calculadora de Férias</title>
<link rel="stylesheet" href="styles.css">
```

- **title**: Título exibido na aba do navegador
- **stylesheet**: Importa o arquivo CSS para estilização

## Estrutura do Body

### 1. Header (Cabeçalho)

```html
<header>
  <h1>💼 Calculadora de Férias</h1>
  <p>Calcule o valor das suas férias de forma simples e transparente</p>
  <!-- Dropdown de Autenticação gerado dinamicamente -->
  <div id="authContainer"></div>
</header>
```

**Elementos:**
- **h1**: Título principal com emoji
- **p**: Subtítulo descritivo

**Propósito**: Apresentar o sistema ao usuário

### 2. Main (Conteúdo Principal)

```html
<main>
  <div class="container">
    <!-- Seções do formulário e resultados -->
  </div>
</main>
```

**Estrutura:**
- Tag semântica `<main>` para conteúdo principal
- Container centralizado para organização

## Seção do Formulário

### Estrutura Completa

```html
<section class="form-section">
  <h2>Dados do Funcionário</h2>
  <form id="formFerias">
    <!-- Campos de entrada -->
  </form>
</section>
```

### Campo: Salário Bruto

```html
<div class="input-group">
  <label for="salarioBruto">Salário Bruto (R$)</label>
  <input type="number" id="salarioBruto" step="0.01" min="0" required placeholder="Ex: 3000.00">
</div>
```

**Atributos do Input:**

| Atributo | Valor | Descrição |
|----------|-------|-----------|
| type | number | Aceita apenas números |
| id | salarioBruto | Identificador único |
| step | 0.01 | Permite centavos |
| min | 0 | Valor mínimo zero |
| required | - | Campo obrigatório |
| placeholder | Ex: 3000.00 | Exemplo visual |

### Campo: Dias de Férias

```html
<div class="input-group">
  <label for="diasFerias">Dias de Férias</label>
  <input type="number" id="diasFerias" min="1" max="30" required placeholder="Ex: 30">
  <small>Mínimo: 1 dia | Máximo: 30 dias</small>
</div>
```

**Atributos do Input:**

| Atributo | Valor | Descrição |
|----------|-------|-----------|
| type | number | Aceita apenas números |
| id | diasFerias | Identificador único |
| min | 1 | Mínimo 1 dia |
| max | 30 | Máximo 30 dias |
| required | - | Campo obrigatório |

**Elemento `<small>`**: Fornece orientação adicional ao usuário

### Botão de Submit

```html
<button type="submit">Calcular Férias</button>
```

- **type="submit"**: Envia o formulário
- Estilizado via CSS
- Dispara evento capturado pelo JavaScript

## Seção de Resultados

### Container Principal

```html
<section class="result-section" id="resultSection" style="display: none;">
  <h2>Resultado do Cálculo</h2>
  <!-- Cards de resultados -->
</section>
```

**Características:**
- **id="resultSection"**: Permite manipulação via JavaScript
- **display: none**: Inicialmente oculto
- Exibido apenas após cálculo bem-sucedido

### Card de Valores Calculados

```html
<div class="result-card">
  <h3>📊 Valores Calculados</h3>
  <!-- Itens de resultado -->
</div>
```

#### Estrutura dos Itens de Resultado

```html
<div class="result-item">
  <span>Salário Bruto:</span>
  <strong id="resSalario">-</strong>
</div>
```

**Padrão:**
- `<span>`: Label descritivo
- `<strong>`: Valor (atualizado via JavaScript)
- **id único**: Para cada valor calculado

#### IDs dos Elementos de Resultado

| ID | Descrição |
|----|-----------|
| resSalario | Salário bruto informado |
| resDias | Dias de férias solicitados |
| resValorFerias | Valor proporcional das férias |
| resAdicional | Adicional de 1/3 |
| resTotalBruto | Total bruto (férias + 1/3) |
| resINSS | Desconto de INSS |
| resIRRF | Desconto de IRRF |
| resTotalLiquido | Valor líquido a receber |

#### Classes Especiais

```html
<div class="result-item highlight">
  <!-- Valores destacados (férias e adicional) -->
</div>

<div class="result-item total">
  <!-- Total bruto -->
</div>

<div class="result-item deduction">
  <!-- Descontos (INSS e IRRF) -->
</div>

<div class="result-item final">
  <!-- Valor líquido final -->
</div>
```

**Propósito das Classes:**
- **highlight**: Destaque visual para valores importantes
- **total**: Estilo diferenciado para total bruto
- **deduction**: Cor vermelha para descontos
- **final**: Destaque máximo para valor líquido

### Card de Explicação Detalhada

```html
<div class="explanation-card">
  <h3>📝 Explicação Detalhada</h3>
  <div id="explicacaoDetalhada"></div>
</div>
```

**Características:**
- **id="explicacaoDetalhada"**: Container dinâmico
- Conteúdo inserido via JavaScript
- Exibe fórmulas e explicações de cada cálculo

## Seção de Planos de Assinatura (Home)

```html
<section class="pricing-section" id="planos">
  <h2>💎 Planos de Assinatura</h2>
  <div class="pricing-grid">
    <!-- Cards dos planos -->
  </div>
</section>
```

**Características:**
- Cards interativos com os planos **Free**, **Pro** (Destacado como "Mais Popular") e **Enterprise**.
- Detalhamento de valores, benefícios e créditos de cálculo por mês.
- Links (botões) direcionando para a página de criação de conta (`login.html`).

## Seção de Dashboard Corporativo (v3.0.0)

```html
<section class="dashboard-section" id="dashboard">
  <h2>📊 Dashboard</h2>
  <div class="dashboard-widgets">
    <!-- Gráficos, métricas e sessões do painel -->
  </div>
  <div class="upload-section">
    <!-- Formulário para envio de planilhas e integração DB -->
  </div>
</section>
```
**Características:**
- Visualização em Sessões (1, 2 e 3) conforme nova interface.
- Suporte dinâmico para interfaces de upload de arquivos Excel e CSV.

## Footer (Rodapé)

```html
<footer>
  <p>&copy; 2024 Calculadora de Férias | Sistema de Cálculo Trabalhista</p>
  <p>Valores calculados com base na legislação brasileira vigente</p>
</footer>
```

**Elementos:**
- Copyright e nome do sistema
- Aviso legal sobre base de cálculo

## Script JavaScript

```html
<script src="script.js"></script>
```

- Carregado no final do body
- Garante que o DOM esteja completamente carregado
- Contém toda a lógica de interação

## Acessibilidade

### Boas Práticas Implementadas

1. **Tags Semânticas**: `<header>`, `<main>`, `<section>`, `<footer>`
2. **Labels Associados**: Cada input tem label com atributo `for`
3. **Atributos Required**: Indicam campos obrigatórios
4. **Placeholders**: Fornecem exemplos de entrada
5. **Elementos `<small>`**: Orientações adicionais
6. **Hierarquia de Headings**: h1 → h2 → h3

### Responsividade

- Meta tag viewport configurada
- Estrutura flexível com CSS
- Funciona em desktop, tablet e mobile

## Fluxo de Interação

```
1. Usuário preenche formulário
   ↓
2. Clica em "Calcular Férias"
   ↓
3. JavaScript captura evento submit
   ↓
4. Envia dados ao servidor
   ↓
5. Recebe resposta JSON
   ↓
6. Atualiza elementos com IDs específicos
   ↓
7. Exibe section de resultados (display: block)
   ↓
8. Scroll suave até os resultados
```

## Validações HTML5

### Validações Nativas

- **required**: Impede envio com campos vazios
- **type="number"**: Aceita apenas números
- **min/max**: Limita range de valores
- **step**: Define incremento decimal

### Mensagens de Erro

Navegadores modernos exibem mensagens automáticas:
- "Preencha este campo" (required)
- "O valor deve ser maior ou igual a 1" (min)
- "O valor deve ser menor ou igual a 30" (max)

## Estrutura Visual

```
┌─────────────────────────────────┐
│         HEADER                  │
│  💼 Calculadora de Férias       │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│    FORMULÁRIO                   │
│  ┌───────────────────────────┐  │
│  │ Salário Bruto: [____]     │  │
│  │ Dias de Férias: [____]    │  │
│  │ [Calcular Férias]         │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│    RESULTADOS (oculto)          │
│  ┌───────────────────────────┐  │
│  │ 📊 Valores Calculados     │  │
│  │ - Salário: R$ X           │  │
│  │ - Férias: R$ X            │  │
│  │ - Líquido: R$ X           │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ 📝 Explicação Detalhada   │  │
│  │ (fórmulas e cálculos)     │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│         FOOTER                  │
│  © 2024 - Legislação BR         │
└─────────────────────────────────┘
```

## Melhorias Futuras Sugeridas

- [ ] Adicionar ARIA labels para melhor acessibilidade
- [ ] Implementar loading spinner durante cálculo
- [ ] Adicionar botão para limpar formulário
- [ ] Incluir tooltip com informações sobre INSS/IRRF
- [ ] Adicionar opção de impressão do resultado
- [ ] Implementar histórico de cálculos
