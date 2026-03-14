# 💼 Calculadora de Férias - Plataforma SaaS (v1.01.2)

![Node.js](https://img.shields.io/badge/Node.js-v18+-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-v4.18+-blue?logo=express)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Status](https://img.shields.io/badge/Status-Active-success)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![SQLite](https://img.shields.io/badge/SQLite-07405E?logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?logo=JSON%20web%20tokens)

**Sistema de Gestão de Férias - Plataforma SaaS**
Sistema completo para cálculo de férias com suporte a multi-tenancy (múltiplas empresas), autenticação JWT, histórico em banco de dados e planos de assinatura.

## 📸 Preview

### Interface para Funcionários
![Screenshot da Interface para Funcionários](./screenshots/para_funcionarios.png)

### Interface para Empresas
![Screenshot da Interface para Empresas](./screenshots/para_empresa.png)

## 📋 Funcionalidades

- **Módulo SaaS (Administrativo)**:
  - Multi-tenancy: Cada empresa tem seus dados isolados.
  - Autenticação JWT e senhas criptografadas.
  - Gestão de Planos de Assinatura (Free, Pro, Enterprise) com limites mensais.
  - Controle de Funcionários e Histórico de Cálculos salvo no Banco de Dados.
- **Módulo de Ponto Eletrônico**: Registro de jornada (Entrada, Pausas e Saída) com histórico em tempo real.
- **Educação Financeira e FAQ**: Central de ajuda completa para empresas e funcionários.
- **Cálculo de Férias**:
  - Cálculo proporcional de férias baseado nos dias solicitados
  - Adicional constitucional de 1/3 sobre as férias
  - Cálculo automático de INSS (alíquotas progressivas)
  - Cálculo automático de IRRF (Imposto de Renda)
  - Explicação detalhada de cada valor calculado

## 🌟 Novidades da Versão 1.01.2

- **Gestão de Funcionários Aprimorada**: Modal rápido de cadastro com informações de Cargo, Setor e Documentação.
- **Relógio de Ponto Inteligente**: Nova interface para os colaboradores baterem ponto com seleção dinâmica.
- **Integração Contínua (CI/CD)**: Pipeline configurado no GitHub Actions para validação automatizada.
- **Central de Ajuda Integrada**: Páginas separadas de FAQ focadas na experiência do Administrador/RH e do Colaborador.
- **Nova Página Inicial**: Design moderno com cartões informativos e demonstrativo dos planos de assinatura.

## 🚀 Como Executar

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor:
```bash
npm start
```

3. Acesse no navegador:
```
http://localhost:3000
```

## 📊 Como Funciona o Cálculo

### 1. Valor das Férias
- Fórmula: (Salário Bruto ÷ 30) × Dias de Férias

### 2. Adicional de 1/3
- Fórmula: Valor das Férias ÷ 3
- Base Legal: Art. 7º, XVII da Constituição Federal

### 3. Total Bruto
- Fórmula: Valor das Férias + Adicional 1/3

### 4. INSS (Alíquotas Progressivas 2024)
- Até R$ 1.412,00: 7,5%
- De R$ 1.412,01 até R$ 2.666,68: 9%
- De R$ 2.666,69 até R$ 4.000,03: 12%
- Acima de R$ 4.000,03: 14%
- Teto: R$ 908,85

### 5. IRRF (Alíquotas Progressivas 2024)
- Até R$ 2.112,00: Isento
- De R$ 2.112,01 até R$ 2.826,65: 7,5%
- De R$ 2.826,66 até R$ 3.751,05: 15%
- De R$ 3.751,06 até R$ 4.664,68: 22,5%
- Acima de R$ 4.664,68: 27,5%

### 6. Valor Líquido
- Fórmula: Total Bruto - INSS - IRRF

## 🛠️ Tecnologias

- Node.js
- Express
- HTML5
- CSS3 (Flexbox)
- JavaScript (ES6+)

## 📁 Estrutura do Projeto

```
projeto-raiz/
├── server.js           # Servidor Express e lógica de cálculo
├── package.json        # Dependências
└── public/
    ├── index.html      # Interface do usuário
    ├── styles.css      # Estilização
    └── script.js       # Interação frontend
```
