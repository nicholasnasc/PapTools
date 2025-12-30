# Debug - Campo Operadora não Aparece para "Satisfeito com a Operadora Atual"

## 🔴 Problema Relatado

Quando seleciona o motivo **"Satisfeito com a Operadora Atual"**, o campo de **operadora não aparece**.

Outros motivos testados funcionam corretamente.

## 🔍 Análise do Código

### Como Funciona

#### 1. Modelo de Dados
```dart
class RejectedSaleReasonModel {
  int id;
  String description;
  bool needsOperator;  // Flag se exige operadora
  List<ReasonFieldExtra>? fields;  // Campos extras dinâmicos
}

class ReasonFieldExtra {
  String? nomeCampo;  // Nome do campo (ex: "Operadora")
  String? tipo;       // Tipo do campo (ex: "lista")
  int? obrigatorio;   // Se é obrigatório
  int? ativo;         // Se está ativo
}
```

#### 2. Detecção do Campo
O campo de operadora é exibido quando:

```dart
if (nomeCampo.toLowerCase() == 'operadora') {
  // Mostra dropdown de provedores
}
```

### Possíveis Causas

#### Causa 1: Nome do Campo Diferente ⚠️
O campo pode estar vindo com nome diferente:
- ❌ "Operadora Atual"
- ❌ "Operadora atual"
- ❌ "operadora_atual"
- ✅ "Operadora"

#### Causa 2: Campo Não Ativo ⚠️
O campo pode estar com `ativo = 0` no banco.

#### Causa 3: Campo Não Retornado ⚠️
A API pode não estar retornando o campo na lista `motivonaovendaitens`.

## ✅ Solução Implementada

### Logs de Debug Adicionados

#### 1. No ViewModel
**Arquivo**: `rejected_sale_viewmodel.dart`

```dart
List<ReasonFieldExtra> get activeExtraFields {
  final fields = _selectedReason?.fields?.where((f) => f.ativo == 1).toList() ?? [];
  
  if (fields.isNotEmpty) {
    SecureLogger.debug('🔍 [activeExtraFields] Motivo selecionado: ${_selectedReason?.description}');
    SecureLogger.debug('🔍 [activeExtraFields] Total de campos ativos: ${fields.length}');
    for (var field in fields) {
      SecureLogger.debug('   - Campo: "${field.nomeCampo}" | Tipo: "${field.tipo}" | Obrigatório: ${field.obrigatorio}');
    }
  }
  
  return fields;
}
```

#### 2. Na Página
**Arquivo**: `rejected_sale_page.dart`

```dart
final nomeCampo = field.nomeCampo ?? '';
final tipoCampo = field.tipo ?? '';

print('🔍 [RejectedSalePage] Campo: "$nomeCampo" | Tipo: "$tipoCampo"');
print('🔍 [RejectedSalePage] nomeCampo.toLowerCase() = "${nomeCampo.toLowerCase()}"');

if (nomeCampo.toLowerCase().contains('operadora')) {
  print('✅ [RejectedSalePage] CAMPO OPERADORA DETECTADO!');
}
```

## 🧪 Como Testar

### 1. Execute o App em Modo Debug
```bash
flutter run
```

### 2. Faça Login e Acesse Venda Rejeitada

### 3. Selecione "Satisfeito com a Operadora Atual"

### 4. Verifique os Logs no Console

#### Logs Esperados (funcionando):
```
🔍 [activeExtraFields] Motivo selecionado: Satisfeito com a Operadora Atual
🔍 [activeExtraFields] Total de campos ativos: 2
   - Campo: "Operadora" | Tipo: "lista" | Obrigatório: 1
   - Campo: "Motivo" | Tipo: "texto" | Obrigatório: 1

🔍 [RejectedSalePage] Campo: "Operadora" | Tipo: "lista"
🔍 [RejectedSalePage] nomeCampo.toLowerCase() = "operadora"
✅ [RejectedSalePage] CAMPO OPERADORA DETECTADO!
```

#### Logs Problemáticos:

**Cenário A: Nenhum campo ativo**
```
🔍 [activeExtraFields] Motivo selecionado: Satisfeito com a Operadora Atual
🔍 [activeExtraFields] Total de campos ativos: 0
```
→ **Problema**: Campos não estão ativos no banco

**Cenário B: Campo com nome diferente**
```
🔍 [activeExtraFields] Total de campos ativos: 1
   - Campo: "Operadora Atual" | Tipo: "lista" | Obrigatório: 1

🔍 [RejectedSalePage] Campo: "Operadora Atual" | Tipo: "lista"
🔍 [RejectedSalePage] nomeCampo.toLowerCase() = "operadora atual"
```
→ **Problema**: Nome do campo está diferente de "operadora"

**Cenário C: Campo não retornado**
```
🔍 [activeExtraFields] Motivo selecionado: Satisfeito com a Operadora Atual
🔍 [activeExtraFields] Total de campos ativos: 1
   - Campo: "Motivo" | Tipo: "texto" | Obrigatório: 1
```
→ **Problema**: Campo "Operadora" não está na lista retornada

## 🔧 Correções Possíveis

### Se Nome do Campo Diferente

Atualizar a condição para aceitar variações:

```dart
if (nomeCampo.toLowerCase().contains('operadora')) {
  // Mostra dropdown de provedores
}
```

### Se Campo Não Ativo

Verificar e corrigir no banco de dados:

```sql
-- Ver campos do motivo
SELECT 
  mnv.id,
  mnv.descricao as motivo,
  mnvi.nomecampo,
  mnvi.tipo,
  mnvi.obrigatorio,
  mnvi.ativo
FROM motivonaovenda mnv
LEFT JOIN motivonaovendaitens mnvi ON mnv.id = mnvi.idmotivonaovenda
WHERE mnv.descricao LIKE '%Satisfeito%Operadora%'
ORDER BY mnvi.id;
```

**Correção**:
```sql
UPDATE motivonaovendaitens
SET ativo = 1
WHERE idmotivonaovenda = (
  SELECT id FROM motivonaovenda 
  WHERE descricao LIKE '%Satisfeito%Operadora%'
)
AND nomecampo LIKE '%operadora%';
```

### Se Campo Não Existe

Criar o campo no banco:

```sql
-- Encontrar ID do motivo
SELECT id FROM motivonaovenda 
WHERE descricao LIKE '%Satisfeito%Operadora%';

-- Inserir campo (substitua ID_DO_MOTIVO)
INSERT INTO motivonaovendaitens (
  idmotivonaovenda,
  nomecampo,
  tipo,
  obrigatorio,
  ativo
) VALUES (
  ID_DO_MOTIVO,  -- ID encontrado acima
  'Operadora',
  'lista',
  1,
  1
);
```

## 📊 Validação no Banco de Dados

### Query Completa
```sql
SELECT 
  mnv.id,
  mnv.descricao as motivo_descricao,
  mnv.exigeoperadora,
  mnv.exigecontato,
  mnv.ativo as motivo_ativo,
  mnvi.id as item_id,
  mnvi.nomecampo,
  mnvi.tipo,
  mnvi.obrigatorio,
  mnvi.ativo as item_ativo
FROM motivonaovenda mnv
LEFT JOIN motivonaovendaitens mnvi ON mnv.id = mnvi.idmotivonaovenda
WHERE mnv.ativo = 1
  AND (mnv.descricao LIKE '%Satisfeito%' OR mnv.descricao LIKE '%Operadora%')
ORDER BY mnv.id, mnvi.id;
```

### Resultado Esperado
| id | motivo_descricao | exigeoperadora | nomecampo | tipo | ativo |
|----|------------------|----------------|-----------|------|-------|
| X | Satisfeito com a Operadora Atual | 1 | Operadora | lista | 1 ✅ |
| X | Satisfeito com a Operadora Atual | 1 | Motivo | texto | 1 |

## 📝 Checklist de Validação

### No App
- [ ] Executar app em modo debug
- [ ] Selecionar motivo "Satisfeito com a Operadora Atual"
- [ ] Verificar logs no console
- [ ] Confirmar nome do campo retornado
- [ ] Confirmar que campo está ativo
- [ ] Verificar se dropdown aparece

### No Banco
- [ ] Verificar se motivo existe e está ativo
- [ ] Verificar se campo "Operadora" está cadastrado
- [ ] Verificar se campo está ativo (`ativo = 1`)
- [ ] Verificar tipo do campo (`tipo = 'lista'`)
- [ ] Verificar exigeoperadora (`exigeoperadora = 1`)

## 🎯 Próximos Passos

1. **Execute o app** e selecione o motivo problemático
2. **Copie os logs** do console (procure por 🔍 ✅)
3. **Execute a query SQL** para ver os dados no banco
4. **Compare** o nome do campo retornado com o esperado

Com essas informações, saberemos exatamente qual correção aplicar! 🎯

## 💡 Correção Temporária Rápida

Se o campo estiver vindo com nome diferente de "Operadora", você pode alterar temporariamente a condição:

```dart
// De:
if (nomeCampo.toLowerCase() == 'operadora') {

// Para:
if (nomeCampo.toLowerCase().contains('operadora')) {
```

Isso funcionará para:
- "Operadora" ✅
- "Operadora Atual" ✅
- "operadora_atual" ✅
- "Nome da Operadora" ✅

