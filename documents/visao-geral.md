# 🎯 Visão Geral do Sistema

## Descrição do Projeto

O **Sistema de Gestão de Férias** evoluiu para uma plataforma **SaaS (Software as a Service) multi-tenancy** na versão **3.0.0**. Ele oferece gestão centralizada de funcionários, relógio de ponto eletrônico, cálculos trabalhistas com histórico em banco de dados, limites baseados em planos de assinatura, novos dashboards corporativos e esteira automatizada de CI/CD.

## Arquitetura do Sistema

### Modelo Cliente-Servidor (SaaS RESTful)

```
┌─────────────┐         HTTP          ┌─────────────┐
│   Cliente   │ ◄──────────────────► │   Servidor  │
│  (Browser)  │   POST /calcular     │  (Node.js)  │
│             │      JSON            │             │
└─────────────┘                       └─────────────┘
     │                                      │
     │                                      │
  Frontend                              Backend
  ────────                              ───────
  - HTML                                - Express
  - CSS                                 - Lógica de
  - JavaScript                            Cálculo
  - Chart.js                            - APIs
```

## Módulos do Sistema

### 👥 Para Funcionários

#### 1. Calculadora de Férias
- **Tecnologia**: Node.js + Express
- **Funcionalidades**:
  - Cálculo automatizado de férias
  - Descontos de INSS e IRRF
  - Explicações detalhadas
  - Interface responsiva

**Arquivos:**
- `public/calculadora.html` - Interface principal ([Documentação HTML](./frontend/index.md))
- `public/styles.css` - Estilização ([Documentação CSS](./frontend/styles.md))
- `public/script.js` - Lógica frontend ([Documentação JavaScript](./frontend/script.md))
- `server.js` - Lógica backend ([Documentação Backend](./backend/server.md))

#### 2. Educação Financeira
- **Tecnologia**: HTML5 + CSS3
- **Funcionalidades**:
  - Conceitos de investimentos
  - Explicação sobre dividendos
  - Guia de primeiros passos
  - Recursos educacionais

**Arquivos:**
- `public/investimentos.html` - Conteúdo educacional
- `public/investimentos.css` - Estilização

#### 3. Central de Ajuda (FAQ)
- **Tecnologia**: HTML5 + CSS3 (details/summary)
- **Funcionalidades**:
  - Respostas para dúvidas comuns sobre cálculos
  - Informações de uso do ponto
  - Detalhes de segurança e privacidade
**Arquivos:** `public/faq.html`

### 🏢 Para Empresa

#### 3. Captação de Recursos
- **Tecnologia**: Chart.js + JavaScript
- **Funcionalidades**:
  - Gráficos interativos
  - Comparativo de períodos
  - Análise e insights
  - Exportação para Excel

**Arquivos:**
- `public/captacao.html` - Interface de captação
- `public/captacao.css` - Estilização
- `public/captacao.js` - Lógica, gráficos e análises

#### 4. Sugestões de Economia
- **Tecnologia**: SheetJS + JavaScript
- **Funcionalidades**:
  - Envio de sugestões por texto
  - Upload de planilhas Excel
  - Sistema de categorização
  - Confirmação de envio

**Arquivos:**
- `public/reducao-custos.html` - Interface de sugestões
- `public/reducao-custos.css` - Estilização
- `public/reducao-custos.js` - Lógica de upload e processamento

#### 5. FAQ Administrativo
- **Tecnologia**: HTML5 + CSS3 (details/summary)
- **Funcionalidades**:
  - Instruções sobre cadastro de funcionários
  - Detalhamento de limites mensais e planos
  - Privacidade e Multi-tenancy
**Arquivos:** `public/faq.html`

#### 6. Dashboard Corporativo (Novo na v3.0.0)
- **Tecnologia**: HTML5 + CSS3 + Chart.js
- **Funcionalidades**:
  - Visão geral de métricas (Sessões 1, 2 e 3)
  - Upload e processamento de planilhas Excel/CSV
  - Integração de string de conexão para bancos externos

**Arquivos:** `public/dashboard.html` (e relacionados)

## Navegação do Sistema

### Menu Lateral Global
- **Posição**: Fixa à esquerda
- **Ativação**: Botão hamburguer (☰)
- **Estrutura**:
  - Categorias organizadas
  - Ícones visuais
  - Indicador de página ativa
  - Responsivo para mobile

**Arquivos:**
- `public/menu-global.css` - Estilos do menu lateral e botão voltar
- `public/menu-global.js` - Lógica de controle, abertura/fechamento

### Botão Voltar
- **Posição**: Fixa no canto superior direito
- **Função**: Retorna à página inicial
- **Design**: Consistente em todas as páginas

**Implementação:**
- Presente em: `calculadora.html`, `investimentos.html`, `captacao.html`, `reducao-custos.html`
- Estilizado em: `menu-global.css`

## Fluxo de Navegação

```
┌─────────────────┐
│  Página Inicial │
│   (index.html)  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼───┐
│ Para │  │ Para │
│Func. │  │Empre.│
└───┬──┘  └──┬───┘
    │         │
┌───▼──────┐  ┌──▼──────────┐
│Calculad. │  │ Captação    │
│Educação  │  │ Sugestões   │
│FAQ       │  │ FAQ         │
└──────────┘  └─────────────┘
```

## Tecnologias Utilizadas

| Camada | Tecnologia | Versão | Uso |
|--------|-----------|--------|-----|
| Runtime | Node.js | - | Servidor backend |
| Framework | Express | ^4.x | API REST |
| Frontend | HTML5 | - | Estrutura |
| Estilização | CSS3 | - | Design |
| Interação | JavaScript ES6+ | - | Lógica |
| Gráficos | Chart.js | 4.x | Visualizações |
| Excel | SheetJS | 0.18.5 | Import/Export |

## Estrutura de Arquivos

```
projeto-raiz/
├── server.js                    # Servidor Express
├── package.json                 # Dependências
├── public/                      # Arquivos públicos
│   ├── index.html              # Página inicial
│   ├── home.css                # Estilos home
│   ├── calculadora.html        # Calculadora de férias
│   ├── styles.css              # Estilos calculadora
│   ├── script.js               # Lógica calculadora
│   ├── investimentos.html      # Educação financeira
│   ├── investimentos.css       # Estilos investimentos
│   ├── captacao.html           # Captação de recursos
│   ├── captacao.css            # Estilos captação
│   ├── captacao.js             # Lógica captação
│   ├── reducao-custos.html     # Sugestões economia
│   ├── reducao-custos.css      # Estilos sugestões
│   ├── reducao-custos.js       # Lógica sugestões
│   ├── menu-global.css         # Estilos menu lateral
│   └── menu-global.js          # Lógica menu lateral
└── documents/                   # Documentação
    ├── README.md
    ├── visao-geral.md
    ├── backend/
    └── frontend/
```

## Endpoints da API

### POST /calcular-ferias

**Arquivo:** `server.js` ([Documentação completa](./backend/server.md))

**Request Body:**
```json
{
  "salarioBruto": 3000.00,
  "diasFerias": 30
}
```

**Response:**
```json
{
  "salarioBruto": "3000.00",
  "diasFerias": 30,
  "valorFerias": "3000.00",
  "adicionalTerco": "1000.00",
  "totalBruto": "4000.00",
  "inss": "466.96",
  "irrf": "263.23",
  "totalLiquido": "3269.81",
  "explicacao": { ... }
}
```

## Funcionalidades Principais

### Calculadora de Férias
**Arquivo:** `server.js` ([Documentação Backend](./backend/server.md)) + `script.js` ([Documentação Frontend](./frontend/script.md))

- Cálculo proporcional de férias
- Adicional constitucional de 1/3
- Descontos de INSS (progressivo)
- Descontos de IRRF (progressivo)
- Explicações detalhadas

### Educação Financeira
**Arquivo:** `public/investimentos.html`

- Conceitos fundamentais de investimento
- Explicação sobre dividendos
- Tipos de proventos
- Estratégias de investimento
- Recursos para aprendizado

### Captação de Recursos
**Arquivo:** `public/captacao.js`

- Visualização mensal e anual
- Gráficos comparativos
- Análise de tendências
- Insights automáticos
- Exportação de dados

### Sugestões de Economia
**Arquivo:** `public/reducao-custos.js`

- Formulário de sugestões
- Upload de planilhas Excel
- Categorização automática
- Exemplos práticos
- Confirmação de envio

## Segurança e Validações

- Validação de entrada no servidor
- Tratamento de erros com status HTTP apropriados
- Limitação de valores (dias entre 1-30)
- Cálculos com precisão de 2 casas decimais
- Validação de formato de arquivos
- Sanitização de dados de entrada

## Responsividade

- Design adaptável para desktop, tablet e mobile
- Menu lateral responsivo
- Gráficos ajustáveis
- Tabelas com scroll horizontal
- Botões e fontes otimizados para touch
