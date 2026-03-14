require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Inicializar banco de dados
require('./src/config/database');

const authRoutes = require('./src/routes/auth');
const calculationsRoutes = require('./src/routes/calculations');
const plansRoutes = require('./src/routes/plans');
const pontoRoutes = require('./src/routes/ponto');
const funcionariosRoutes = require('./src/routes/funcionarios');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/calculations', calculationsRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/ponto', pontoRoutes);
app.use('/api/funcionarios', funcionariosRoutes);

// Rota legada (compatibilidade)
app.post('/calcular-ferias', (req, res) => {
  res.status(401).json({ 
    erro: 'Esta rota requer autenticação. Use /api/auth/login e /api/calculations' 
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.01.2' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 SaaS Calculadora de Férias rodando em http://localhost:${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}/api`);
});
