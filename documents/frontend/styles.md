# 🎨 Documentação do CSS (styles.css)

## Visão Geral

O arquivo `styles.css` define toda a estilização visual da Calculadora de Férias, implementando um design moderno com gradientes, responsividade e hierarquia visual clara.

## Reset e Configurações Globais

### Reset CSS

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

**Propósito:**
- Remove margens e paddings padrão do navegador
- **box-sizing: border-box**: Inclui padding e border no cálculo de width/height
- Garante consistência entre navegadores

### Estilização do Body

```css
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
}
```

**Propriedades:**

| Propriedade | Valor | Descrição |
|-------------|-------|-----------|
| font-family | Segoe UI, ... | Fontes modernas com fallbacks |
| display | flex | Layout flexível |
| flex-direction | column | Organização vertical |
| min-height | 100vh | Altura mínima da viewport |
| background | linear-gradient | Gradiente roxo/azul |
| color | #333 | Cor do texto padrão |

**Gradiente:**
- **Ângulo**: 135deg (diagonal)
- **Cor inicial**: #667eea (azul-roxo)
- **Cor final**: #764ba2 (roxo escuro)

## Header (Cabeçalho)

```css
header {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
```

**Características:**
- **background**: Branco semi-transparente (95% opacidade)
- **padding**: 2rem (32px) em todos os lados
- **text-align**: Centralizado
- **box-shadow**: Sombra sutil para profundidade

### Título do Header

```css
header h1 {
  color: #667eea;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}
```

- **Cor**: Azul-roxo (#667eea) - combina com gradiente
- **Tamanho**: 2.5rem (40px)
- **Espaçamento**: 0.5rem abaixo

### Subtítulo do Header

```css
header p {
  color: #666;
  font-size: 1.1rem;
}
```

- **Cor**: Cinza médio (#666)
- **Tamanho**: 1.1rem (17.6px)

## Elementos Interativos (Modais e Dropdowns)

Foram inseridos blocos de CSS de UI modernos nos arquivos como `index.html`:

### Dropdown Profile
```css
.dropdown-content { display: none; position: absolute; ... }
.dropdown-content.show { display: block; }
```
Baseado em `position: absolute`, permitindo flutuação limpa acima do conteúdo natural (z-index 101).

### Modais Administrativos
```css
.modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); backdrop-filter: blur(3px); }
```
Usa `backdrop-filter: blur(3px)` para focar a visão do usuário 100% no formulário e escurecer a tabela de ferramentas do fundo.

## Relógio de Ponto e Badges
Em `ponto.html` botões são categorizados por cores psicológicas de status:
- **Verde (27ae60)** para Entradas
- **Laranjas e Azuis** para transições e retornos.
- **Vermelho (e74c3c)** para encerramentos.

Histórico carrega **Type Badges** de bordas arredondadas garantindo leitura ágil pelo time de RH na tela de Ponto.

## Main (Conteúdo Principal)

```css
main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem 1rem;
}
```

**Layout:**
- **flex: 1**: Ocupa espaço disponível (empurra footer para baixo)
- **display: flex**: Container flexível
- **justify-content: center**: Centraliza horizontalmente
- **align-items: flex-start**: Alinha ao topo
- **padding**: 2rem vertical, 1rem horizontal

## Container

```css
.container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 800px;
}
```

**Estrutura:**
- **flex-direction: column**: Empilha seções verticalmente
- **gap: 2rem**: Espaçamento entre seções
- **width: 100%**: Largura total disponível
- **max-width: 800px**: Limita largura máxima

## Seções (Formulário e Resultados)

```css
.form-section, .result-section {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
```

**Estilo:**
- **background**: Branco sólido
- **padding**: 2rem (32px)
- **border-radius**: 15px (cantos arredondados)
- **box-shadow**: Sombra pronunciada para elevação

## Tipografia

### Títulos h2

```css
h2 {
  color: #667eea;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}
```

- **Cor**: Azul-roxo principal
- **Espaçamento**: 1.5rem abaixo
- **Tamanho**: 1.8rem (28.8px)

### Títulos h3

```css
h3 {
  color: #764ba2;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}
```

- **Cor**: Roxo escuro
- **Espaçamento**: 1rem abaixo
- **Tamanho**: 1.3rem (20.8px)

## Formulário

### Grupo de Input

```css
.input-group {
  margin-bottom: 1.5rem;
}
```

- Espaçamento entre campos do formulário

### Labels

```css
label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}
```

**Características:**
- **display: block**: Ocupa linha inteira
- **font-weight: 600**: Semi-negrito
- **color: #555**: Cinza escuro

### Inputs

```css
input {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}
```

**Estilo:**
- **width: 100%**: Largura total do container
- **padding**: 0.8rem (12.8px)
- **border**: 2px cinza claro
- **border-radius**: 8px (cantos arredondados)
- **transition**: Animação suave na borda

#### Estado Focus

```css
input:focus {
  outline: none;
  border-color: #667eea;
}
```

- Remove outline padrão
- Borda muda para azul-roxo ao focar

### Texto Pequeno (small)

```css
small {
  display: block;
  margin-top: 0.3rem;
  color: #888;
  font-size: 0.85rem;
}
```

- **Cor**: Cinza claro (#888)
- **Tamanho**: 0.85rem (13.6px)
- Usado para orientações

## Botão

```css
button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
```

**Características:**
- **background**: Mesmo gradiente do body
- **color**: Texto branco
- **border: none**: Remove borda padrão
- **cursor: pointer**: Indica clicável
- **transition**: Animações suaves

### Estado Hover

```css
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}
```

**Efeito:**
- **translateY(-2px)**: Eleva botão 2px
- **box-shadow**: Adiciona sombra azul

### Estado Active

```css
button:active {
  transform: translateY(0);
}
```

- Retorna à posição original ao clicar

## Cards de Resultado

### Cards Gerais

```css
.result-card, .explanation-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
}
```

- **background**: Cinza muito claro
- **padding**: 1.5rem (24px)
- **border-radius**: 10px

### Itens de Resultado

```css
.result-item {
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 0;
  border-bottom: 1px solid #e0e0e0;
}
```

**Layout:**
- **display: flex**: Layout flexível
- **justify-content: space-between**: Label à esquerda, valor à direita
- **border-bottom**: Linha divisória

#### Último Item

```css
.result-item:last-child {
  border-bottom: none;
}
```

- Remove borda do último item

#### Texto do Item

```css
.result-item span {
  color: #666;
}

.result-item strong {
  color: #333;
  font-size: 1.1rem;
}
```

- **span**: Label em cinza médio
- **strong**: Valor em cinza escuro, maior

## Classes Especiais de Resultado

### Highlight (Destaque)

```css
.result-item.highlight {
  background: #e3f2fd;
  padding: 0.8rem;
  margin: 0.5rem 0;
  border-radius: 5px;
}
```

- **background**: Azul muito claro
- Usado para férias e adicional 1/3

### Total

```css
.result-item.total {
  background: #fff3e0;
  padding: 0.8rem;
  margin: 0.5rem 0;
  border-radius: 5px;
  font-size: 1.1rem;
}
```

- **background**: Laranja muito claro
- Usado para total bruto

### Deduction (Desconto)

```css
.result-item.deduction {
  color: #d32f2f;
}

.result-item.deduction strong {
  color: #d32f2f;
}
```

- **color**: Vermelho (#d32f2f)
- Usado para INSS e IRRF

### Final (Valor Líquido)

```css
.result-item.final {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.2rem;
  margin-top: 1rem;
  border-radius: 8px;
  font-size: 1.2rem;
}

.result-item.final span,
.result-item.final strong {
  color: white;
  font-size: 1.3rem;
}
```

**Destaque Máximo:**
- **background**: Gradiente principal
- **color**: Branco
- **font-size**: Maior (1.3rem)
- Usado para valor líquido final

## Card de Explicação

```css
.explanation-card p {
  padding: 0.6rem;
  margin: 0.5rem 0;
  background: white;
  border-left: 4px solid #667eea;
  border-radius: 5px;
  color: #555;
  line-height: 1.6;
}
```

**Estilo:**
- **background**: Branco
- **border-left**: Barra azul de 4px
- **line-height**: 1.6 (espaçamento entre linhas)
- Cada parágrafo tem visual de "card"

## Footer (Rodapé)

```css
footer {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  text-align: center;
  padding: 1.5rem;
  margin-top: auto;
}

footer p {
  margin: 0.3rem 0;
  font-size: 0.9rem;
}
```

**Características:**
- **background**: Preto semi-transparente (80%)
- **color**: Texto branco
- **margin-top: auto**: Empurrado para o fundo (flex)
- **font-size**: 0.9rem (14.4px)

## Responsividade

### Media Query para Mobile

```css
@media (max-width: 768px) {
  header h1 {
    font-size: 1.8rem;
  }

  .container {
    padding: 0;
  }

  .form-section, .result-section {
    padding: 1.5rem;
  }
}
```

**Ajustes para Telas Pequenas:**
- **Título**: Reduz de 2.5rem para 1.8rem
- **Container**: Remove padding lateral
- **Seções**: Reduz padding de 2rem para 1.5rem

**Breakpoint**: 768px (tablets e smartphones)

## Paleta de Cores

### Cores Principais

| Cor | Código | Uso |
|-----|--------|-----|
| Azul-Roxo | #667eea | Títulos, botões, gradiente |
| Roxo Escuro | #764ba2 | Subtítulos, gradiente |
| Branco | #ffffff | Backgrounds, texto em destaque |
| Cinza Escuro | #333 | Texto principal |
| Cinza Médio | #666 | Labels, texto secundário |
| Cinza Claro | #888 | Texto auxiliar |
| Vermelho | #d32f2f | Descontos |
| Azul Claro | #e3f2fd | Highlight |
| Laranja Claro | #fff3e0 | Total bruto |

### Cores de Fundo

| Cor | Código | Uso |
|-----|--------|-----|
| Cinza Muito Claro | #f8f9fa | Cards de resultado |
| Cinza Borda | #ddd | Bordas de input |
| Cinza Divisor | #e0e0e0 | Linhas divisórias |

## Efeitos e Animações

### Transições

```css
transition: border-color 0.3s;
transition: transform 0.2s, box-shadow 0.2s;
```

**Propriedades Animadas:**
- **border-color**: 0.3s (inputs)
- **transform**: 0.2s (botão)
- **box-shadow**: 0.2s (botão)

### Transformações

```css
transform: translateY(-2px);  /* Eleva elemento */
transform: translateY(0);     /* Retorna posição */
```

### Sombras

```css
box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);      /* Sutil */
box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);     /* Pronunciada */
box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4); /* Colorida */
```

**Formato**: offset-x offset-y blur spread color

## Hierarquia Visual

### Níveis de Importância

1. **Valor Líquido Final**: Gradiente, branco, maior
2. **Total Bruto**: Fundo laranja claro
3. **Valores Destacados**: Fundo azul claro
4. **Descontos**: Texto vermelho
5. **Valores Normais**: Texto padrão

### Espaçamentos

| Elemento | Espaçamento |
|----------|-------------|
| Seções | 2rem (32px) |
| Cards | 1.5rem (24px) |
| Inputs | 1.5rem (24px) |
| Títulos | 1.5rem abaixo |
| Itens | 0.8rem (12.8px) |

## Boas Práticas Implementadas

1. **Reset CSS**: Consistência entre navegadores
2. **Box-sizing**: Cálculo intuitivo de dimensões
3. **Flexbox**: Layout moderno e responsivo
4. **Transições**: Feedback visual suave
5. **Hierarquia de Cores**: Guia visual claro
6. **Responsividade**: Media queries para mobile
7. **Acessibilidade**: Contraste adequado de cores
8. **Unidades Relativas**: rem para escalabilidade

## Melhorias Futuras Sugeridas

- [ ] Adicionar tema escuro (dark mode)
- [ ] Implementar mais breakpoints (tablet, desktop grande)
- [ ] Adicionar animações de entrada (fade-in)
- [ ] Criar variáveis CSS para cores
- [ ] Adicionar estados de loading
- [ ] Implementar skeleton screens
- [ ] Adicionar animações de transição entre estados
- [ ] Melhorar acessibilidade com focus visible
