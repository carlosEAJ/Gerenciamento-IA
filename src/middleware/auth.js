const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'seu-secret-aqui-mude-em-producao';

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
};

// Middleware para verificar perfil de acesso
const checkPerfil = (...perfisPermitidos) => {
  return (req, res, next) => {
    if (!perfisPermitidos.includes(req.user.perfil)) {
      return res.status(403).json({ 
        erro: 'Acesso negado',
        perfilNecessario: perfisPermitidos,
        seuPerfil: req.user.perfil
      });
    }
    next();
  };
};

// Middleware para verificar plano ativo
const checkPlano = (...planosPermitidos) => {
  return (req, res, next) => {
    if (!planosPermitidos.includes(req.user.planoAtivo)) {
      return res.status(403).json({ 
        erro: 'Plano insuficiente',
        planosNecessarios: planosPermitidos,
        seuPlano: req.user.planoAtivo,
        mensagem: 'Faça upgrade do seu plano para acessar este recurso'
      });
    }
    next();
  };
};

// Verificar se trial expirou
const checkTrialValido = (req, res, next) => {
  if (req.user.planoAtivo === 'Trial') {
    const dataFimTrial = new Date(req.user.dataFimTrial);
    const agora = new Date();
    
    if (agora > dataFimTrial) {
      return res.status(403).json({ 
        erro: 'Trial expirado',
        mensagem: 'Seu período de teste expirou. Faça upgrade para continuar usando o sistema.',
        dataExpiracao: dataFimTrial
      });
    }
  }
  next();
};

module.exports = { auth, checkPerfil, checkPlano, checkTrialValido, SECRET };
