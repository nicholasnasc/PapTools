# Implementação Campo "Cidade" (Nome Legível) - Sistema de Provedores

## 📋 Solicitação
Adicionar campo **cidade** (nome legível) além do código IBGE nos provedores.

## ✅ Alterações Realizadas

### 1. **Modelos de Dados**

#### App Flutter - `provedor_model.dart`
```dart
class Provedor {
  int? id;
  String? nome;
  String? regional;
  String? uf;
  int? ibge;
  String? cidade;  // ✅ NOVO: Nome legível da cidade
  // ...outros campos
  
  String get cidadeNome => cidade ?? (ibge != null ? 'IBGE: $ibge' : 'Toda UF');
}
```

#### Portal Flutter - `provedoresmodel.dart`
```dart
class Provedor {
  int? id;
  String? nome;
  String? regional;
  String? uf;
  String? ibgeCidade;
  String? cidade;  // ✅ NOVO: Nome legível da cidade
  // ...outros campos
  
  String get cidadeNome => cidade ?? (ibgeCidade != null ? 'IBGE: $ibgeCidade' : 'Toda UF');
}
```

### 2. **Backend - Queries SQL com LEFT JOIN**

Todas as consultas SQL foram atualizadas para incluir LEFT JOIN com a tabela `cidades`:

#### Exemplo:
```sql
SELECT
  p.id,
  p.nome,
  p.regional,
  p.uf,
  p.ibge,
  c.nome as cidade,  -- ✅ NOVO: Nome da cidade via LEFT JOIN
  p.ativo,
  p.origem,
  p.dataCadastro,
  p.dataAtualizacao
FROM provedores p
LEFT JOIN cidades c ON p.ibge = c.id
WHERE p.ativo = 1
ORDER BY p.nome ASC
```

#### Funções Atualizadas em `shared/provedores.js`:
- ✅ `obterProvedores()` - Lista todos os provedores com nome da cidade
- ✅ `pesquisarProvedores()` - Pesquisa provedores com nome da cidade
- ✅ `obterProvederPorId()` - Busca provedor específico com nome da cidade
- ✅ `criarProvedorApp()` - Retorna provedor criado com nome da cidade
- ✅ `criarProvedorPortal()` - Retorna provedor criado com nome da cidade

### 3. **Estrutura de Dados**

#### Tabela `cidades` (já existente)
```sql
CREATE TABLE cidades (
  id int PRIMARY KEY,
  nome varchar(255),
  uf varchar(2),
  idregional int
);
```

#### Tabela `provedores` (não requer alteração)
```sql
CREATE TABLE provedores (
  id int IDENTITY(1,1) PRIMARY KEY,
  nome varchar(200) NOT NULL,
  regional varchar(10) NOT NULL,
  uf varchar(2) NOT NULL,
  ibge varchar(20) NULL,  -- ← Relaciona com cidades.id via LEFT JOIN
  origem varchar(20) NOT NULL,
  ativo bit DEFAULT 1 NOT NULL,
  dataCadastro datetime DEFAULT getdate() NOT NULL,
  dataAtualizacao datetime DEFAULT getdate() NOT NULL
);
```

## 📊 Formato de Resposta da API

### Antes (sem nome da cidade):
```json
{
  "id": 1,
  "nome": "Provedor ABC",
  "regional": "SP2",
  "uf": "SP",
  "ibge": "3550308",
  "ativo": true
}
```

### Depois (com nome da cidade):
```json
{
  "id": 1,
  "nome": "Provedor ABC",
  "regional": "SP2",
  "uf": "SP",
  "ibge": "3550308",
  "cidade": "São Paulo",  // ✅ NOVO
  "ativo": true
}
```

### Quando não tem cidade (toda UF):
```json
{
  "id": 2,
  "nome": "Provedor XYZ",
  "regional": "RJ/ES",
  "uf": "RJ",
  "ibge": null,
  "cidade": null,  // ✅ NULL = Toda UF
  "ativo": true
}
```

## 🎯 Exibição para Usuários

### No App:
```dart
provedor.cidadeNome
```
**Resultado**:
- Se tem cidade: `"São Paulo"`
- Se tem IBGE mas não resolveu: `"IBGE: 3550308"`
- Se não tem: `"Toda UF"`

### No Portal:
```dart
provedor.cidadeNome
```
**Resultado**:
- Se tem cidade: `"São Paulo"`
- Se tem IBGE mas não resolveu: `"IBGE: 3550308"`
- Se não tem: `"Toda UF"`

## 🔄 Compatibilidade

### ✅ Retrocompatibilidade Total
- **LEFT JOIN**: Provedores sem cidade (ibge = NULL) continuam funcionando
- **Fallback**: Se cidade não for encontrada, exibe código IBGE
- **Sem alteração de tabela**: Usa JOIN apenas nas queries
- **API Flexível**: Aceita `cidade`, `nomeCidade`, `nome_cidade`

### ✅ Importação de Excel
O sistema continua aceitando apenas código IBGE:
```
nome           | regional | uf | ibge    | ativo
Provedor A     | SP2      | SP | 3550308 | 1
```

O **nome da cidade será resolvido automaticamente** via LEFT JOIN com a tabela `cidades`.

## 🧪 Exemplos de Teste

### 1. Buscar Provedores com Cidade
```sql
SELECT 
  p.nome as provedor,
  p.regional,
  p.uf,
  p.ibge,
  c.nome as cidade,
  CASE 
    WHEN c.nome IS NOT NULL THEN c.nome
    WHEN p.ibge IS NOT NULL THEN 'IBGE: ' + p.ibge
    ELSE 'Toda UF'
  END as exibicao
FROM provedores p
LEFT JOIN cidades c ON p.ibge = c.id
WHERE p.ativo = 1
ORDER BY p.regional, c.nome;
```

### 2. API - Listar Provedores
```bash
GET /api/provedores?regional=SP2&uf=SP
```

**Resposta**:
```json
{
  "success": true,
  "provedores": [
    {
      "id": 1,
      "nome": "Provedor A",
      "regional": "SP2",
      "uf": "SP",
      "ibge": "3550308",
      "cidade": "São Paulo",
      "ativo": true
    },
    {
      "id": 2,
      "nome": "Provedor B",
      "regional": "SP2",
      "uf": "SP",
      "ibge": null,
      "cidade": null,
      "ativo": true
    }
  ]
}
```

### 3. API - Cadastrar Provedor
```bash
POST /api/provedores
{
  "nome": "Novo Provedor",
  "regional": "SP2",
  "uf": "SP",
  "ibge": "3550308",
  "origem": "APP"
}
```

**Resposta** (com cidade já resolvida):
```json
{
  "success": true,
  "message": "Provedor criado com sucesso",
  "data": {
    "id": 123,
    "nome": "Novo Provedor",
    "regional": "SP2",
    "uf": "SP",
    "ibge": "3550308",
    "cidade": "São Paulo",  // ✅ Resolvido automaticamente
    "ativo": true,
    "origem": "APP"
  }
}
```

## 📱 Comportamento no App e Portal

### Grid de Provedores
| Nome | Regional | UF | Cidade |
|------|----------|----|----- --|
| Provedor A | SP2 | SP | São Paulo |
| Provedor B | RJ/ES | RJ | Rio de Janeiro |
| Provedor C | MG1 | MG | Toda UF |
| Provedor D | CE | CE | Fortaleza |

### Detalhes do Provedor
```
Nome: Provedor A
Regional: SP2
UF: SP
IBGE: 3550308
Cidade: São Paulo  ✅ Nome legível
Status: Ativo
```

## ✅ Checklist de Validação

- [x] Campo `cidade` adicionado aos modelos (app e portal)
- [x] LEFT JOIN implementado em todas as queries SQL
- [x] Nome da cidade retornado pela API
- [x] Getter `cidadeNome` atualizado para priorizar nome legível
- [x] Portal exibe nome da cidade na grid
- [x] App exibe nome da cidade
- [x] Compatibilidade com provedores sem cidade (ibge = NULL)
- [x] Fallback para "IBGE: XXX" quando cidade não encontrada
- [x] Fallback para "Toda UF" quando não tem IBGE

## 🎯 Resultado Final

**Antes**: Usuários viam apenas código IBGE (ex: "3550308")
**Depois**: Usuários veem nome legível da cidade (ex: "São Paulo")

**Vantagens**:
- ✅ Mais amigável para usuários
- ✅ Não requer alteração de tabela
- ✅ Não quebra sistema existente
- ✅ Resolve automaticamente via JOIN
- ✅ Funciona em importação de Excel
- ✅ Funciona em cadastro manual

**Implementação Completa**: Backend, App e Portal! 🎉

