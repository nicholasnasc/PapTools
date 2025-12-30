# Correção: dataAtualizacao vindo como NULL

## Problema
A `dataAtualizacao` estava vindo como `null` nos registros de provedores, mesmo após criação ou atualização.

## Solução Aplicada

### 1. Backend Corrigido
- **Arquivo**: `shared/provedores.js`
- **Mudança**: Ao criar novos provedores (via APP ou PORTAL), agora incluímos `dataAtualizacao = GETDATE()` junto com `dataCadastro`

### 2. Banco de Dados - Script de Correção

Para corrigir os registros existentes que já estão com `dataAtualizacao = NULL`, execute o seguinte script SQL:

**Opção 1: Execute o arquivo**
```sql
-- Caminho: sql/fix_provedores_dataAtualizacao.sql
```

**Opção 2: Execute o comando diretamente**
```sql
UPDATE provedores 
SET dataAtualizacao = dataCadastro 
WHERE dataAtualizacao IS NULL;
```

### 3. Como Executar o Script

#### Usando SQL Server Management Studio (SSMS):
1. Abra o SQL Server Management Studio
2. Conecte-se ao banco de dados
3. Clique em "New Query"
4. Copie e cole o conteúdo de `sql/fix_provedores_dataAtualizacao.sql`
5. Clique em "Execute" ou pressione F5

#### Usando Azure Data Studio:
1. Abra o Azure Data Studio
2. Conecte-se ao banco de dados
3. Clique em "New Query"
4. Copie e cole o conteúdo de `sql/fix_provedores_dataAtualizacao.sql`
5. Clique em "Run" ou pressione F5

#### Usando linha de comando:
```powershell
sqlcmd -S seu_servidor -d seu_banco -U seu_usuario -P sua_senha -i "C:\Users\nicholas.souza\StudioProjects\paptools-backend\sql\fix_provedores_dataAtualizacao.sql"
```

## Resultado Esperado

Após executar o script:
- ✅ Todos os registros terão `dataAtualizacao` preenchida
- ✅ Novos registros criados já virão com `dataAtualizacao = dataCadastro`
- ✅ Quando um provedor for atualizado, a `dataAtualizacao` será atualizada automaticamente

## Verificação

Para verificar se a correção funcionou, execute:

```sql
-- Deve retornar 0
SELECT COUNT(*) AS 'Provedores com dataAtualizacao NULL'
FROM provedores
WHERE dataAtualizacao IS NULL;

-- Visualizar alguns registros
SELECT TOP 5 
    id, 
    nome, 
    dataCadastro, 
    dataAtualizacao,
    DATEDIFF(SECOND, dataCadastro, dataAtualizacao) as 'Diferença (segundos)'
FROM provedores
ORDER BY id DESC;
```

## Arquivos Modificados

1. ✅ `shared/provedores.js` - Função `criarProvedorApp()`
2. ✅ `shared/provedores.js` - Função `criarProvedorPortal()`
3. ✅ `sql/create_provedores_table.sql` - Alterado `dataAtualizacao` para ter valor padrão
4. ✅ `sql/fix_provedores_dataAtualizacao.sql` - Novo script de correção

