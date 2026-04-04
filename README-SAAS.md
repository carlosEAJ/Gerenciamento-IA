# 🚀 Calculadora de Férias - SaaS Edition (v3.0.0)

Sistema completo de cálculo de férias transformado em SaaS com multi-tenancy, autenticação e planos de assinatura.

## 📦 O que foi adicionado

### Arquitetura SaaS
- ✅ **Multi-tenancy**: Cada empresa tem seus dados isolados
- ✅ **Autenticação JWT**: Login seguro com tokens
- ✅ **3 Planos de Assinatura**: Free, Pro, Enterprise
- ✅ **Limites por Plano**: Controle de uso por ciclo de 30 dias
- ✅ **Banco de Dados**: SQLite (fácil migrar para PostgreSQL/MySQL)
- ✅ **API RESTful**: Endpoints documentados
- ✅ **Dashboard Completo**: Interface moderna
- ✅ **Histórico de Cálculos**: Rastreamento completo
- ✅ **CI/CD Pipeline**: Integração contínua com GitHub Actions (v3.0.0)

## 🏗️ Estrutura do Projeto

```
projeto-raiz/
├── src/
│   ├── config/
│   │   └── database.js          # Configuração SQLite
│   ├── middleware/
│   │   └── auth.js               # JWT e controle de acesso
│   └── routes/
│       ├── auth.js               # Login e registro
│       ├── calculations.js       # Cálculos de férias
│       └── plans.js              # Gerenciamento de planos
├── .github/
│   └── workflows/
│       └── ci.yml                # Pipeline de CI/CD
├── public/
│   ├── login.html                # Página de login/registro
│   └── dashboard.html            # Dashboard principal
├── data/
│   └── saas.db                   # Banco de dados (criado automaticamente)
├── server-saas.js                # Servidor principal
├── server.js                     # Servidor legado (mantido)
├── .env.example                  # Variáveis de ambiente
└── package.json                  # Dependências atualizadas
```

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
copy .env.example .env
```
Edite o `.env` e altere o `JWT_SECRET` para algo seguro.

### 3. Iniciar o Servidor
```bash
npm start
```

### 4. Acessar a Aplicação
- **Login/Registro**: http://localhost:3000/login.html
- **Dashboard**: http://localhost:3000/dashboard.html (após login)
- **API Health**: http://localhost:3000/api/health

## 📊 Planos Disponíveis

| Plano | Preço/mês | Cálculos/Mês | Recursos |
|-------|-----------|--------------|----------|
| **Free** | R$ 0 | 10 | Básico, suporte por email |
| **Pro** | R$ 79,90 | 40 | Histórico completo, API, suporte prioritário |
| **Enterprise** | R$ 199,90 | Ilimitado | Multi-usuários, suporte 24/7, customizações |

## 🔌 API Endpoints

### Autenticação

#### POST /api/auth/register
Registrar nova empresa
```json
{
  "companyName": "Minha Empresa",
  "name": "João Silva",
  "email": "joao@empresa.com",
  "password": "senha123"
}
```

#### POST /api/auth/login
Fazer login
```json
{
  "email": "joao@empresa.com",
  "password": "senha123"
}
```
Retorna: `{ token, user }`

### Cálculos

#### POST /api/calculations
Calcular férias (requer autenticação)
```bash
Authorization: Bearer {token}
```
```json
{
  "salarioBruto": 3000,
  "diasFerias": 30
}
```

#### GET /api/calculations/historico
Buscar histórico de cálculos (requer autenticação)

### Planos

#### GET /api/plans
Listar todos os planos disponíveis

#### GET /api/plans/status
Ver status da assinatura atual (requer autenticação)

#### POST /api/plans/upgrade
Fazer upgrade de plano (requer autenticação e role admin)
```json
{
  "plan": "Pro"
}
```

## 🔐 Segurança

- Senhas criptografadas com bcrypt
- Tokens JWT com expiração de 7 dias
- Isolamento de dados por empresa (multi-tenancy)
- Validação de entrada em todas as rotas
- CORS habilitado

## 📈 Próximos Passos (Roadmap)

### Essencial para Produção
- [ ] Integração com gateway de pagamento (Stripe/Mercado Pago)
- [ ] Migrar para PostgreSQL/MySQL
- [ ] Sistema de recuperação de senha
- [ ] Confirmação de email
- [ ] Rate limiting
- [ ] Logs estruturados
- [ ] Testes automatizados

### Funcionalidades Avançadas
- [x] Multi-usuários por empresa
- [x] Permissões granulares (RBAC)
- [ ] Webhooks para integrações
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Dashboard de analytics
- [ ] API pública com documentação Swagger
- [ ] Notificações por email
- [ ] Auditoria completa

### Escalabilidade
- [ ] Cache com Redis
- [ ] Fila de processamento (Bull/RabbitMQ)
- [ ] Deploy em containers (Docker)
- [ ] Monitoramento (Prometheus/Grafana)

## 🔄 Migração do Sistema Legado

O servidor antigo (`server.js`) foi mantido. Para migrar:

1. Usuários existentes devem se registrar no novo sistema
2. A rota antiga `/calcular-ferias` agora retorna erro pedindo autenticação
3. Use `/api/calculations` com token JWT

## 💡 Exemplo de Uso da API

```javascript
// 1. Registrar
const register = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    companyName: 'Tech Corp',
    name: 'Admin',
    email: 'admin@tech.com',
    password: 'senha123'
  })
});

// 2. Login
const login = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@tech.com',
    password: 'senha123'
  })
});
const { token } = await login.json();

// 3. Calcular férias
const calc = await fetch('/api/calculations', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    salarioBruto: 5000,
    diasFerias: 30
  })
});
const resultado = await calc.json();
```

## 🛠️ Tecnologias

- **Backend**: Node.js + Express
- **Autenticação**: JWT + bcrypt
- **Banco de Dados**: SQLite (produção: PostgreSQL)
- **Frontend**: HTML5 + CSS3 + Vanilla JS
- **Segurança**: CORS, validação de entrada

## 📝 Licença

MIT

---

**Desenvolvido para ser um SaaS completo e escalável** 🚀
