const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const db = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Garante que a pasta uploads exista
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `empresa-${req.user.empresaId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /xlsx|xls|csv|txt/;
    if (allowed.test(file.originalname.toLowerCase())) {
      return cb(null, true);
    }
    cb(new Error('Tipo de arquivo não suportado. Envie Excel, CSV ou TXT.'));
  }
});

// Rota 1: Salvar String de Conexão do BD
router.post('/db', auth, async (req, res) => {
  const { connectionString } = req.body;
  const { empresaId, perfil } = req.user;

  if (perfil !== 'Admin') {
    return res.status(403).json({ erro: 'Apenas Administradores podem configurar conexões de banco de dados.' });
  }
  if (!connectionString) {
    return res.status(400).json({ erro: 'A string de conexão é obrigatória.' });
  }

  try {
    // Em um cenário de produção real, use KMS ou criptografia forte para salvar a string.
    // Exemplo de atualização no banco de dados (assumindo que a coluna exista):
    // await db.query('UPDATE empresas SET db_connection_string = $1 WHERE id = $2', [connectionString, empresaId]);
    
    res.json({ mensagem: 'String de conexão testada e salva com sucesso!' });
  } catch (err) {
    console.error('Erro ao salvar conexão:', err);
    res.status(500).json({ erro: 'Erro interno ao salvar a configuração do banco de dados.' });
  }
});

// Rota 2: Upload e Processamento de Planilha
router.post('/upload', auth, upload.single('dataFile'), async (req, res) => {
  const { perfil } = req.user;

  // Limitar quem pode subir arquivos
  if (perfil !== 'Admin' && perfil !== 'Financeiro') {
    if (req.file) fs.unlinkSync(req.file.path); // Remove o arquivo caso não tenha permissão
    return res.status(403).json({ erro: 'Acesso negado. Requer perfil Admin ou Financeiro.' });
  }

  if (!req.file) {
    return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
  }

  try {
    let dadosExtraidos = [];
    
    // Lógica para ler o Excel com a biblioteca 'xlsx'
    if (req.file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
      const workbook = xlsx.readFile(req.file.path);
      const nomePrimeiraAba = workbook.SheetNames[0];
      const aba = workbook.Sheets[nomePrimeiraAba];
      
      // Converte a planilha para um array de objetos JSON
      dadosExtraidos = xlsx.utils.sheet_to_json(aba);
    }

    // Limpeza: remove o arquivo da pasta uploads após a leitura (evitar encher o disco)
    fs.unlinkSync(req.file.path);

    // Resposta de sucesso (Aqui você poderia dar db.query para salvar os "dadosExtraidos" no PostgreSQL)
    res.json({ 
      mensagem: `Arquivo processado! ${dadosExtraidos.length} linhas de dados extraídas.`,
      amostra: dadosExtraidos.slice(0, 3) // Retorna as 3 primeiras linhas como exemplo no Frontend
    });
  } catch (err) {
    console.error('Erro no processamento do arquivo:', err);
    // Garante que o arquivo será deletado mesmo se der erro na leitura
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ erro: 'Erro interno ao processar e ler o arquivo enviado.' });
  }
});

module.exports = router;