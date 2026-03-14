# 💼 Calculadora de Férias - Plataforma SaaS (v1.02.0)

![Node.js](https://img.shields.io/badge/Node.js-v18+-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-v4.18+-blue?logo=express)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Status](https://img.shields.io/badge/Status-Active-success)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![SQLite](https://img.shields.io/badge/SQLite-07405E?logo=sqlite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
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
  - **Gestão de Usuários (RBAC)**: O administrador da conta pode convidar e gerenciar múltiplos usuários (ex: RH, Financeiro), definindo perfis de acesso para cada um.
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

## 🌟 Novidades da Versão 1.02.0

- **Integração de Dados**: Nova funcionalidade para conectar bancos de dados externos e fazer upload de planilhas (Excel, CSV, TXT) para popular os dashboards corporativos.
- **Gestão de Múltiplos Usuários (RBAC)**: Administradores de empresas agora podem criar e gerenciar sub-contas para sua equipe com perfis de acesso específicos (Admin, RH, Financeiro, Colaborador).
- **Evolução do Banco de Dados**: Suporte e documentação atualizados para PostgreSQL, garantindo maior escalabilidade e confiabilidade no isolamento de dados.
- Gestão de Funcionários Aprimorada com novas informações (Cargo, Setor, Documentação).
- Relógio de Ponto Inteligente e Central de Ajuda Integrada para empresas e funcionários.

## 🗄️ Migração para PostgreSQL

Com a evolução do sistema para uma arquitetura SaaS completa, o banco de dados principal foi migrado de **SQLite** para **PostgreSQL**. Essa transição foi fundamental pelos seguintes motivos:
- **Escalabilidade (Multi-tenancy)**: O PostgreSQL lida de forma superior com alto volume de acessos simultâneos, garantindo o isolamento performático e seguro dos dados de múltiplas empresas.
- **Confiabilidade em Produção**: Oferece melhor suporte a concorrência, transações complexas (ACID) e integridade referencial, atributos essenciais para processamento de históricos financeiros, limites de planos e auditoria.

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
- PostgreSQL
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
