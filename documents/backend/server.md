# 🖥️ Documentação do Servidor Backend (SaaS)

## Visão Geral

Com a transformação para SaaS, o servidor principal tornou-se o **`server-saas.js`**. Ele orquestra um servidor Express moderno que além de servir arquivos estáticos, lida com conexão a banco de dados (SQLite/PostgreSQL), autenticação JWT e rotas modulares separadas na pasta `src/`. O antigo `server.js` foi mantido provisoriamente por questões de retrocompatibilidade.

## Dependências

```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');
```

- **express**: Framework web para Node.js
- **path**: Módulo nativo para manipulação de caminhos de arquivos

## Configuração do Servidor

### Inicialização

```javascript
const app = express();
```
Cria uma instância do aplicativo Express.

### Middlewares

```javascript
app.use(express.json());
```
- Habilita o parsing automático de JSON no body das requisições
- Permite receber dados no formato JSON via POST

```javascript
app.use(express.static('public'));
```
- Serve arquivos estáticos da pasta `public`
- Permite acesso direto a HTML, CSS e JS

## Endpoint Principal

### POST /calcular-ferias

**Descrição**: Recebe dados do funcionário e retorna o cálculo completo de férias.

#### Parâmetros de Entrada

```javascript
const { salarioBruto, diasFerias } = req.body;
```

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| salarioBruto | Number | Salário bruto do funcionário |
| diasFerias | Number | Quantidade de dias de férias (1-30) |

#### Validações

```javascript
if (!salarioBruto || !diasFerias || diasFerias < 1 || diasFerias > 30) {
  return res.status(400).json({ erro: 'Dados inválidos' });
}
```

**Validações aplicadas:**
- Salário bruto não pode ser vazio
- Dias de férias não pode ser vazio
- Dias de férias deve estar entre 1 e 30
- Retorna status 400 (Bad Request) em caso de erro

## Lógica de Cálculo

### 1. Valor das Férias

```javascript
const valorFerias = (salario / 30) * diasFerias;
```

**Fórmula**: (Salário ÷ 30) × Dias de Férias

**Exemplo**: 
- Salário: R$ 3.000,00
- Dias: 30
- Resultado: (3000 / 30) × 30 = R$ 3.000,00

### 2. Adicional de 1/3 Constitucional

```javascript
const adicionalTerco = valorFerias / 3;
```

**Fórmula**: Valor das Férias ÷ 3

**Base Legal**: Art. 7º, XVII da Constituição Federal

**Exemplo**:
- Valor Férias: R$ 3.000,00
- Resultado: 3000 / 3 = R$ 1.000,00

### 3. Total Bruto

```javascript
const totalBruto = valorFerias + adicionalTerco;
```

**Fórmula**: Valor das Férias + Adicional 1/3

### 4. Cálculo de INSS (Alíquotas Progressivas 2024)

```javascript
let inss = 0;
if (totalBruto <= 1412.00) {
  inss = totalBruto * 0.075;
} else if (totalBruto <= 2666.68) {
  inss = 1412.00 * 0.075 + (totalBruto - 1412.00) * 0.09;
} else if (totalBruto <= 4000.03) {
  inss = 1412.00 * 0.075 + (2666.68 - 1412.00) * 0.09 + (totalBruto - 2666.68) * 0.12;
} else {
  inss = 1412.00 * 0.075 + (2666.68 - 1412.00) * 0.09 + (4000.03 - 2666.68) * 0.12 + (totalBruto - 4000.03) * 0.14;
}
inss = Math.min(inss, 908.85); // Teto do INSS
```

**Tabela de Alíquotas:**

| Faixa Salarial | Alíquota |
|----------------|----------|
| Até R$ 1.412,00 | 7,5% |
| R$ 1.412,01 a R$ 2.666,68 | 9% |
| R$ 2.666,69 a R$ 4.000,03 | 12% |
| Acima de R$ 4.000,03 | 14% |

**Teto Máximo**: R$ 908,85

**Método de Cálculo**: Progressivo (cada faixa é calculada separadamente)

**Exemplo** (Total Bruto: R$ 4.000,00):
1. Primeira faixa: 1.412,00 × 7,5% = R$ 105,90
2. Segunda faixa: (2.666,68 - 1.412,00) × 9% = R$ 112,92
3. Terceira faixa: (4.000,00 - 2.666,68) × 12% = R$ 160,00
4. **Total INSS**: R$ 378,82

### 5. Cálculo de IRRF (Imposto de Renda Retido na Fonte)

```javascript
const baseIRRF = totalBruto - inss;

let irrf = 0;
if (baseIRRF <= 2112.00) {
  irrf = 0;
} else if (baseIRRF <= 2826.65) {
  irrf = baseIRRF * 0.075 - 158.40;
} else if (baseIRRF <= 3751.05) {
  irrf = baseIRRF * 0.15 - 370.40;
} else if (baseIRRF <= 4664.68) {
  irrf = baseIRRF * 0.225 - 651.73;
} else {
  irrf = baseIRRF * 0.275 - 884.96;
}
irrf = Math.max(irrf, 0);
```

**Base de Cálculo**: Total Bruto - INSS

**Tabela de Alíquotas:**

| Faixa Salarial | Alíquota | Dedução |
|----------------|----------|---------|
| Até R$ 2.112,00 | Isento | - |
| R$ 2.112,01 a R$ 2.826,65 | 7,5% | R$ 158,40 |
| R$ 2.826,66 a R$ 3.751,05 | 15% | R$ 370,40 |
| R$ 3.751,06 a R$ 4.664,68 | 22,5% | R$ 651,73 |
| Acima de R$ 4.664,68 | 27,5% | R$ 884,96 |

**Método de Cálculo**: Simplificado com dedução

**Exemplo** (Base: R$ 3.621,18):
- Alíquota: 15%
- Cálculo: (3.621,18 × 0,15) - 370,40 = R$ 172,78

### 6. Valor Líquido

```javascript
const totalLiquido = totalBruto - inss - irrf;
```

**Fórmula**: Total Bruto - INSS - IRRF

## Resposta JSON

### Estrutura da Resposta

```javascript
res.json({
  salarioBruto: salario.toFixed(2),
  diasFerias,
  valorFerias: valorFerias.toFixed(2),
  adicionalTerco: adicionalTerco.toFixed(2),
  totalBruto: totalBruto.toFixed(2),
  inss: inss.toFixed(2),
  irrf: irrf.toFixed(2),
  totalLiquido: totalLiquido.toFixed(2),
  explicacao: { ... }
});
```

### Objeto explicacao

Contém strings explicativas para cada cálculo:

```javascript
explicacao: {
  valorFerias: `Salário (R$ ${salario.toFixed(2)}) ÷ 30 dias × ${diasFerias} dias = R$ ${valorFerias.toFixed(2)}`,
  adicionalTerco: `Adicional de 1/3 constitucional: R$ ${valorFerias.toFixed(2)} ÷ 3 = R$ ${adicionalTerco.toFixed(2)}`,
  totalBruto: `Valor de férias + Adicional 1/3 = R$ ${totalBruto.toFixed(2)}`,
  inss: `INSS calculado sobre o total bruto (alíquota progressiva) = R$ ${inss.toFixed(2)}`,
  irrf: `IRRF calculado sobre (Total Bruto - INSS) com alíquota progressiva = R$ ${irrf.toFixed(2)}`,
  totalLiquido: `Valor líquido a receber = R$ ${totalLiquido.toFixed(2)}`
}
```

**Propósito**: Fornecer explicações legíveis para o usuário entender cada valor.

## Inicialização do Servidor

```javascript
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
```

- **Porta**: 3000
- **URL de Acesso**: http://localhost:3000
- **Callback**: Exibe mensagem no console quando o servidor inicia

## Tratamento de Erros

### Erros de Validação
- **Status**: 400 (Bad Request)
- **Resposta**: `{ erro: 'Dados inválidos' }`

### Erros Não Tratados
- Erros de servidor retornam status 500 automaticamente
- Express lida com exceções não capturadas

## Considerações de Segurança

1. **Validação de Entrada**: Todos os dados são validados antes do processamento
2. **Limitação de Valores**: Dias de férias limitados entre 1-30
3. **Parsing Seguro**: Uso de parseFloat para conversão de números
4. **Tetos Aplicados**: INSS limitado ao teto legal

## Melhorias Futuras Sugeridas

- [ ] Adicionar logging de requisições
- [ ] Implementar rate limiting
- [ ] Adicionar testes unitários
- [ ] Criar endpoint para consulta de tabelas (INSS/IRRF)
- [ ] Adicionar suporte a dependentes (dedução IRRF)
- [ ] Implementar cache de cálculos
