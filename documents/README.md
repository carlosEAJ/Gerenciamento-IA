# 📚 Documentação do Projeto - Sistema de Férias SaaS (v1.01.2)

Esta pasta contém toda a documentação técnica do projeto, organizada por categorias.

## 📋 Estrutura da Documentação

### 📄 Raiz
- **visao-geral.md** - Visão geral do sistema, arquitetura e módulos

### 📁 backend/
Documentação do servidor e lógica de negócio
- **server.md** - Documentação da API Express, rotas SaaS e lógica de cálculo (`server-saas.js` e `server.js`)

### 📁 frontend/
Documentação da interface do usuário
- **index.md** - Documentação da estrutura HTML (index.html)
- **script.md** - Documentação do JavaScript frontend (script.js)
- **styles.md** - Documentação dos estilos CSS (styles.css)

## 🔍 Navegação Rápida

### Para entender o sistema
- 🎯 [Visão Geral](./visao-geral.md) - Arquitetura completa e módulos

### Para entender o backend
- 🖥️ [Server.js](./backend/server.md) - API e lógica de cálculo

### Para entender o frontend
- 📝 [HTML](./frontend/index.md) - Estrutura das páginas
- ⚙️ [JavaScript](./frontend/script.md) - Lógica de interação
- 🎨 [CSS](./frontend/styles.md) - Estilização e design

## 📊 Módulos do Sistema

### 🏢 Administrativo (SaaS)
- Autenticação e Autorização (JWT)
- Multi-tenancy (isolamento por empresa)
- Gestão de Planos de Assinatura (Free, Pro, Enterprise)
- Gestão de Funcionários (Cargo, Setor, Documentação)
- Controle de Histórico e Status

**Arquivos:** `src/routes/auth.js`, `src/routes/plans.js`, `src/routes/funcionarios.js`, `src/routes/calculations.js`

### 👥 Para Funcionários

#### 1. Calculadora de Férias
- Cálculo automatizado com INSS e IRRF
- Explicações detalhadas de cada valor
- Interface responsiva

**Arquivos:**
- `calculadora.html` - Interface
- `styles.css` - Estilos
- `script.js` - Lógica frontend
- `server.js` - Lógica backend

#### 2. Educação Financeira
- Conceitos de investimentos
- Explicação sobre dividendos
- Guia de primeiros passos
- Recursos educacionais

**Arquivos:**
- `investimentos.html` - Conteúdo educacional
- `investimentos.css` - Estilos

#### 3. Relógio de Ponto
- Relógio em tempo real
- Seleção de funcionário dinâmico
- Registro de Entrada, Pausas e Saídas
- Histórico de batidas em tempo real

**Arquivos:**
- `ponto.html` - Interface e Lógica de Ponto
- `src/routes/ponto.js` - API de controle no banco

### 🏢 Para Empresa

#### 3. Captação de Recursos
- Gráficos interativos (Chart.js)
- Comparativo mensal e anual
- Análise e insights automáticos
- Exportação para Excel

**Arquivos:**
- `captacao.html` - Interface
- `captacao.css` - Estilos
- `captacao.js` - Lógica e gráficos

#### 4. Sugestões de Economia
- Formulário de sugestões
- Upload de planilhas Excel
- Categorização automática
- Sistema de confirmação

**Arquivos:**
- `reducao-custos.html` - Interface
- `reducao-custos.css` - Estilos
- `reducao-custos.js` - Lógica e upload

### 🏛️ Componentes Globais

#### Menu Lateral
- Navegação consistente em todas as páginas
- Categorias organizadas
- Responsivo para mobile

**Arquivos:**
- `menu-global.css` - Estilos do menu
- `menu-global.js` - Lógica de controle

## 🛠️ Tecnologias

### Backend
- Node.js
- Express.js
- **SQLite / PostgreSQL** (Armazenamento SaaS)
- **JWT (JSON Web Token)** (Autenticação)
- **Bcryptjs** (Criptografia de senhas)

### Frontend
- HTML5
- CSS3 (Flexbox, Grid)
- JavaScript ES6+

### DevOps / Automação
- **GitHub Actions**: Pipeline CI/CD para build e validação (Node.js)
- **Estrutura Modular**: Separação completa de Rotas e Middlewares

### Bibliotecas
- Chart.js - Gráficos interativos
- SheetJS (XLSX) - Manipulação de Excel

## 📚 Como Usar Esta Documentação

1. **Iniciantes**: Comece pela [Visão Geral](./visao-geral.md)
2. **Desenvolvedores Backend**: Consulte [server.md](./backend/server.md)
3. **Desenvolvedores Frontend**: Veja os arquivos em [frontend/](./frontend/)
4. **Manutenção**: Cada documento contém explicações detalhadas

## 📈 Estrutura de Arquivos do Projeto

```
projeto-raiz/
├── server.js                    # Servidor Express
├── package.json                 # Dependências
├── public/                      # Arquivos públicos
│   ├── index.html              # Página inicial
│   ├── home.css                # Estilos home
│   ├── login.html              # Página de login/registro SaaS
│   ├── calculadora.html        # Calculadora
│   ├── styles.css              # Estilos calculadora
│   ├── script.js               # Lógica calculadora
│   ├── investimentos.html      # Educação financeira
│   ├── investimentos.css       # Estilos investimentos
│   ├── ponto.html              # Interface do Relógio de Ponto
│   ├── captacao.html           # Captação
│   ├── captacao.css            # Estilos captação
│   ├── captacao.js             # Lógica captação
│   ├── reducao-custos.html     # Sugestões
│   ├── reducao-custos.css      # Estilos sugestões
│   ├── reducao-custos.js       # Lógica sugestões
│   ├── menu-global.css         # Menu lateral
│   └── menu-global.js          # Lógica menu
└── documents/                   # Documentação
    ├── README.md               # Este arquivo
    ├── visao-geral.md          # Visão geral
    ├── backend/
    │   └── server.md
    └── frontend/
        ├── index.md
        ├── script.md
        └── styles.md
```
