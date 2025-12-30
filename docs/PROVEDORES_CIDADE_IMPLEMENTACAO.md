# Implementação de Cidade (IBGE) no Sistema de Provedores

## ✅ Status da Implementação

### **APP (Flutter) - CONCLUÍDO**
- ✅ Captura IBGE da cidade do usuário logado
- ✅ Envia IBGE ao cadastrar provedor
- ✅ Prioriza regional sobre cidade
- ✅ Logs completos para debug

### **PORTAL (Flutter) - JÁ IMPLEMENTADO**
- ✅ Campo cidade na tela de provedores
- ✅ Dropdown de cidades por regional/UF
- ✅ Exibição de cidade na grid
- ✅ Edição de cidade

### **BACKEND (Node.js) - JÁ IMPLEMENTADO**
- ✅ Campo `ibge` no banco de dados
- ✅ Importação de Excel com coluna cidade (opcional)
- ✅ API aceita campo `ibge` ou `ibgeCidade`
- ✅ Logs de importação com cidade

## 📋 Estrutura de Dados

### Tabela `provedores`
```sql
CREATE TABLE paptools_hmg.dbo.provedores (
    id int IDENTITY(1,1) NOT NULL,
    nome varchar(200) NOT NULL,
    regional varchar(10) NOT NULL,
    uf varchar(2) NOT NULL,
    ibge varchar(20) NULL,              -- ✅ Campo de cidade
    origem varchar(20) NOT NULL,
    ativo bit DEFAULT 1 NOT NULL,
    dataCadastro datetime DEFAULT getdate() NOT NULL,
    dataAtualizacao datetime DEFAULT getdate() NOT NULL,
    CONSTRAINT PK__provedores PRIMARY KEY (id)
);
```

### Tabela `provedores_import_log`
```sql
CREATE TABLE paptools_hmg.dbo.provedores_import_log (
    id int IDENTITY(1,1) NOT NULL,
    nome varchar(200) NOT NULL,
    regional varchar(10) NOT NULL,
    uf varchar(2) NOT NULL,
    ibge varchar(20) NULL,              -- ✅ Campo de cidade
    ativo varchar(1) NULL,
    status varchar(20) NOT NULL,
    messagem varchar(500) NULL,
    criadoEm datetime DEFAULT getdate() NOT NULL,
    CONSTRAINT PK__provedores__importacao PRIMARY KEY (id)
);
```

## 📊 Formato do Excel para Importação

### Colunas Obrigatórias
| Coluna | Nome | Tipo | Obrigatório | Exemplo |
|--------|------|------|-------------|---------|
| A | nome | Texto | ✅ Sim | Provedor XYZ |
| B | regional | Texto | ✅ Sim | SP2 |
| C | uf | Texto (2 chars) | ✅ Sim | SP |
| D | ibge | Texto | ⚠️ Opcional | 3550308 |
| E | ativo | Número (0 ou 1) | ⚠️ Opcional | 1 |

### Exemplo de Arquivo
```
nome           | regional | uf | ibge    | ativo
Provedor A     | SP2      | SP | 3550308 | 1
Provedor B     | RJ/ES    | RJ |         | 1
Provedor C     | MG1      | MG | 3106200 | 1
```

### Regras de Importação
1. **Nome, Regional e UF são obrigatórios**
2. **IBGE é opcional** - Se vazio, provedor será para toda a regional/UF
3. **Ativo é opcional** - Padrão é 1 (ativo)
4. **UF deve ter exatamente 2 caracteres**
5. **Ativo deve ser 0 (inativo) ou 1 (ativo)**

## 🎯 Lógica de Priorização

### Regional > Cidade
- **Prioridade 1**: Regional (ex: SP2, RJ/ES, CE)
- **Prioridade 2**: UF extraído da regional (ex: SP2 → SP)
- **Prioridade 3**: Cidade (IBGE) - opcional

### Visibilidade de Provedores

#### Provedor com IBGE específico:
```sql
SELECT * FROM provedores 
WHERE regional = 'SP2' 
  AND uf = 'SP' 
  AND ibge = '3550308';  -- São Paulo capital
```
**Visível para**: Apenas usuários da regional SP2 na cidade de São Paulo

#### Provedor sem IBGE (toda regional/UF):
```sql
SELECT * FROM provedores 
WHERE regional = 'SP2' 
  AND uf = 'SP' 
  AND ibge IS NULL;
```
**Visível para**: Todos os usuários da regional SP2 no estado de SP

## 🔧 Implementações no Código

### 1. APP - UserInfo Model

**Arquivo**: `hands/lib/data/models/user/user_info_model.dart`

```dart
// Getter para obter código IBGE da cidade do usuário
int? get ibgeCidade {
  return idcidadesede;
}

// Getter para obter nome da primeira cidade do usuário
String? get cidadeNome {
  return usuariocidades?.firstOrNull?.toString();
}
```

### 2. APP - Cadastro de Provedor

**Arquivo**: `hands/lib/ui/modules/profiles/general/rejected-sale/viewmodel/rejected_sale_viewmodel.dart`

```dart
Future<Provedor?> addNewProvedor(String nome) async {
  final regional = app.userInfo?.regional;
  final uf = app.userInfo?.ufFromRegional;
  final ibgeCidade = app.userInfo?.ibgeCidade;  // ✅ Captura IBGE

  // Cadastra provedor com IBGE da cidade do usuário
  final newProvedor = await _provedorDatasource.cadastrarProvedor(
    nome: nome,
    regional: regional,
    uf: uf,
    ibge: ibgeCidade,  // ✅ Envia IBGE
  );
}
```

### 3. PORTAL - Dropdown de Cidades

**Arquivo**: `portalhandis/lib/paginas/provedores/provedores_page.dart`

```dart
// Já implementado - Busca cidades da regional/UF
Future<void> _carregarCidadesPorRegionalUf(String idRegional, String uf) async {
  final cidades = await _repository.obterCidadesPorRegionalUf(
    idRegional: idRegional,
    uf: uf,
  );
  setState(() {
    _cidadesDisponiveis = cidades;
  });
}
```

### 4. BACKEND - Importação Excel

**Arquivo**: `paptools-backend/routes/api.js`

```javascript
// Lê coluna IBGE (opcional)
const ibge = row.getCell(4).value?.toString()?.trim() || null;

// Insere provedor com IBGE
await DataSource.query(`
  INSERT INTO dbo.provedores (nome, regional, uf, ibge, ativo, origem)
  VALUES (:nome, :regional, :uf, :ibge, 1, 'UPLOAD')
`, {
  replacements: { nome, regional, uf, ibge }
});
```

## 📱 Comportamento no APP

### Ao Cadastrar Provedor

1. **Usuário seleciona "Outros"**
2. **Digite nome do provedor**
3. **Sistema captura automaticamente**:
   - Regional do usuário
   - UF da regional (extraído)
   - IBGE da cidade do usuário (se disponível)

### Exemplo de Log:
```
📍 Dados do usuário para cadastro:
   - Regional: SP2
   - UF da regional: SP
   - UF do cadastro: MG
   - IBGE Cidade: 3550308
   - Nome Cidade: São Paulo
🔄 Cadastrando provedor: Meu Provedor (Regional: SP2, UF: SP, IBGE: 3550308)
✅ Provedor cadastrado com sucesso: Meu Provedor (ID: 123)
```

## 🌐 Comportamento no PORTAL

### Tela de Provedores

1. **Grid exibe coluna "Cidade"**:
   - Se tem IBGE: Mostra código IBGE
   - Se não tem: Mostra "Toda UF"

2. **Ao criar/editar provedor**:
   - Seleciona Regional (obrigatório)
   - Seleciona UF da regional (obrigatório)
   - Seleciona Cidade (opcional)
   - Se não selecionar cidade, provedor será para toda UF

### Importação de Provedores

1. **Upload do arquivo Excel**
2. **Sistema valida cada linha**
3. **Coluna IBGE é opcional**
4. **Logs mostram se cidade foi informada**

## 🔍 Consultas SQL Úteis

### Provedores de uma regional específica
```sql
SELECT 
  id, nome, regional, uf, ibge,
  CASE 
    WHEN ibge IS NULL THEN 'Toda UF'
    ELSE 'Cidade: ' + ibge
  END as abrangencia
FROM provedores 
WHERE regional = 'SP2' 
  AND ativo = 1
ORDER BY nome;
```

### Provedores por cidade
```sql
SELECT * FROM provedores 
WHERE regional = 'SP2'
  AND uf = 'SP'
  AND ibge = '3550308'
  AND ativo = 1;
```

### Provedores de toda a UF (sem cidade específica)
```sql
SELECT * FROM provedores 
WHERE regional = 'SP2'
  AND uf = 'SP'
  AND ibge IS NULL
  AND ativo = 1;
```

## ✅ Checklist de Validação

### APP
- [x] Campo IBGE capturado do usuário
- [x] IBGE enviado na requisição de cadastro
- [x] Logs mostram IBGE e nome da cidade
- [x] Provedor cadastrado com IBGE correto no banco

### PORTAL
- [x] Coluna "Cidade" aparece na grid
- [x] Dropdown de cidades funciona
- [x] IBGE salvo ao criar/editar provedor
- [x] Importação aceita coluna IBGE

### BACKEND
- [x] Campo `ibge` existe na tabela
- [x] API aceita `ibge` ou `ibgeCidade`
- [x] Importação processa coluna IBGE
- [x] Logs de importação incluem IBGE

## 📌 Observações Importantes

1. **IBGE é opcional** - Permite provedores regionais ou específicos de cidade
2. **Regional tem prioridade** - Mesmo com IBGE, provedores são filtrados por regional
3. **Compatibilidade** - Sistema aceita tanto `ibge` quanto `ibgeCidade` na API
4. **Importação flexível** - Coluna IBGE pode estar vazia no Excel
5. **Logs completos** - Todo o fluxo tem logs para facilitar debug

## 🚀 Próximos Passos (Opcional)

### Melhorias Futuras
1. **Busca por cidade no app** - Permitir buscar provedores de cidades vizinhas
2. **Filtro de cidade no portal** - Adicionar filtro por cidade na listagem
3. **Validação de IBGE** - Verificar se IBGE é válido
4. **Autocomplete de cidades** - Sugerir cidades ao digitar

### Relatórios
1. **Provedores por regional e cidade**
2. **Cobertura de cidades**
3. **Provedores mais cadastrados por cidade**

