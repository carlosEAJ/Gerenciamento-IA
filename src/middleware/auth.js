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

module.exports = { auth, checkPerfil, checkPlano, SECRET };
