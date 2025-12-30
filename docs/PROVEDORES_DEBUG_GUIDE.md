# Guia de Debug - Sistema de Provedores

## Problema Identificado

O app não estava mostrando:
1. A opção "Outros" para cadastrar novos provedores
2. Provedores cadastrados após voltar à tela
3. **Inconsistência entre Regional e UF**: Usuário com Regional=SP2 mas UF=MG no cadastro

## Solução Implementada

### ⚠️ IMPORTANTE: Priorização de UF da Regional

O sistema agora **prioriza o UF extraído da regional** ao invés do UF do cadastro do usuário.

**Motivo**: Os provedores são organizados por REGIONAL, não por UF individual. Um usuário pode ter:
- Regional: SP2 (São Paulo)
- UF do cadastro: MG (Minas Gerais)

Neste caso, o correto é usar **SP** (extraído de SP2) para buscar e cadastrar provedores, pois eles devem aparecer para todos da regional SP2.

### Extração de UF da Regional

- `SP2` → `SP`
- `RJ/ES` → `RJ` (primeiro UF)
- `CE` → `CE`
- `MG1` → `MG`

## Alterações Realizadas

### 1. App (Flutter) - user_info_model.dart

**NOVO**: Adicionado getter `ufFromRegional`:
- Extrai o UF da regional (ex: SP2 → SP)
- Prioriza UF da regional sobre o UF do cadastro
- Garante consistência entre regional e UF nos provedores
- Fallback para UF do cadastro se não conseguir extrair

**NOVO**: Adicionado getter `ibgeCidade`:
- Retorna o código IBGE da cidade do usuário (`idcidadesede`)
- Usado para cadastrar provedores específicos de uma cidade
- Se null, provedor será cadastrado para toda a regional/UF

**NOVO**: Adicionado getter `cidadeNome`:
- Retorna o nome da primeira cidade do usuário
- Usado para exibir informações de debug

### 2. App (Flutter) - rejected_sale_viewmodel.dart

Alterado para usar `ufFromRegional` em todos os métodos:
- ✅ `getAllOperators()`: Usa UF da regional
- ✅ `pesquisarProvedores()`: Usa UF da regional
- ✅ `addNewProvedor()`: Usa UF da regional
- ✅ `carregarProvedores()`: Usa UF da regional

Adicionados logs detalhados em:
- `addNewProvedor()`: Para rastrear o cadastro de novos provedores
- `carregarProvedores()`: Para verificar se está buscando do banco
- `provedoresWithOthers`: Para confirmar que a lista está sendo montada corretamente
- Todos os métodos agora mostram: Regional, UF da regional, UF do cadastro

### 3. App (Flutter) - provedor_datasource.dart

Adicionados logs detalhados na comunicação HTTP:
- Request URL e Body
- Response Status e Body
- Parse de JSON
- Criação do objeto Provedor

### 4. Backend (Node.js) - api.js

Adicionados logs detalhados no endpoint POST /api/provedores:
- Content-Type e Body recebidos
- Validação de campos
- Resultado da inserção no banco

## Como Testar

### 1. Verificar Logs do Backend

Execute o backend e monitore os logs:
```powershell
cd C:\Users\nicholas.souza\StudioProjects\paptools-backend
npm start
```

### 2. Testar no App

1. Abra o app e navegue até a tela de venda rejeitada
2. Procure pelo campo de provedor
3. Verifique nos logs do app:
   - `🔄 Iniciando carregamento de provedores...`
   - `✅ Provedores carregados: X`
   - `📊 Total na lista provedoresWithOthers: X`

### 3. Cadastrar Novo Provedor

1. Selecione "Outros" no dropdown
2. Digite o nome do novo provedor
3. Salve
4. Verifique nos logs:
   - App: `🔄 Cadastrando provedor: X`
   - Backend: `[Provedores] POST recebido`
   - Backend: `[Provedores] ✅ Provedor criado com sucesso`
   - App: `✅ Provedor cadastrado com sucesso`

### 4. Voltar à Tela

1. Saia da tela e volte
2. Verifique se o provedor cadastrado aparece na lista
3. Verifique nos logs:
   - `🔄 Recarregando operadoras e provedores...`
   - `✅ Provedores carregados: X`

## Estrutura Esperada

### Lista `provedoresWithOthers` deve conter:
1. **Nacionais (3)**: Vivo, Claro, TIM
2. **Locais**: Provedores cadastrados na regional/UF do usuário
3. **Outros (1)**: Opção para cadastrar novo

**Total mínimo esperado**: 4 itens (3 nacionais + 1 "Outros")

## Endpoints Relacionados

### GET /api/provedores
- Busca provedores com filtros (regional, uf, ativo)
- Usado para carga inicial

### GET /api/provedores/pesquisa
- Pesquisa provedores por query + regional + uf
- Usado na busca dinâmica

### POST /api/provedores
- Cadastra novo provedor
- Origem: APP ou PORTAL
- Retorna o provedor criado com ID

## Verificação no Banco

```sql
-- Verificar provedores cadastrados
SELECT * FROM provedores 
WHERE regional = 'SUA_REGIONAL' 
  AND uf = 'SUA_UF'
  AND ativo = 1
ORDER BY dataCadastro DESC;

-- Verificar último provedor cadastrado pelo app
SELECT TOP 1 * FROM provedores 
WHERE origem = 'APP'
ORDER BY dataCadastro DESC;
```

## Possíveis Problemas

### 1. Lista vazia ou sem "Outros"
- Verificar se `provedoresWithOthers` está sendo chamado
- Verificar logs: `📊 Total na lista provedoresWithOthers`
- Verificar se o widget está usando a propriedade correta

### 2. Provedor não aparece após cadastro
- Verificar se `addNewProvedor()` retornou objeto válido
- Verificar se `_provedores.add()` foi chamado
- Verificar se `notifyListeners()` foi chamado
- Verificar se o widget está escutando as mudanças

### 3. Erro 422 no POST
- Verificar se nome, regional e uf estão sendo enviados
- Verificar logs do backend sobre campos faltantes

### 4. Erro 400 (JSON inválido)
- Verificar se há double-encoding
- Verificar Content-Type: application/json
- Verificar se body não está sendo encoded duas vezes

### 5. Provedor salvo mas retorna erro no app
- Verificar status code (deve ser 200 ou 201)
- Verificar estrutura da resposta: `{ success: true, data: {...} }`
- Verificar se `data` contém todos os campos do provedor

## Contato

Se os problemas persistirem após essas alterações, compartilhe os logs completos do:
1. App (console do Flutter)
2. Backend (console do Node.js)
3. Query no banco para verificar se salvou

## Checklist de Validação

- [ ] App mostra 4+ itens na lista (3 nacionais + X locais + 1 "Outros")
- [ ] Opção "Outros" está visível no dropdown
- [ ] Ao selecionar "Outros", abre campo de texto
- [ ] Ao cadastrar, provedor é salvo no banco
- [ ] Ao cadastrar, provedor aparece imediatamente na lista
- [ ] Ao sair e voltar, provedor continua na lista
- [ ] Logs mostram carregamento correto
- [ ] Logs mostram cadastro bem-sucedido

