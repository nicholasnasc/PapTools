# Troubleshooting - Provedores não encontrados (Regional SP2 + UF CE)

## 🔴 Problema Identificado

### Log do Backend
```
GET /api/provedores/pesquisa?query=&regional=SP2&uf=CE
WHERE p.regional = N'SP2' AND p.uf = N'CE'
✅ 0 provedores encontrados
```

### Análise
- **Regional**: SP2 (São Paulo)
- **UF enviado**: CE (Ceará) ❌
- **UF esperado**: SP (extraído de SP2) ✅

## 🔍 Causa Raiz

O app está enviando **regional=SP2** mas **uf=CE**. Isso é **inconsistente**!

### Possíveis Causas

#### 1. Extração Falhando
O método `_extractUfFromRegional("SP2")` deveria retornar "SP", mas está retornando null e fazendo fallback para o UF do cadastro (CE).

#### 2. Regional Null/Vazio
Se `app.userInfo?.regional` estiver null ou vazio, o getter `ufFromRegional` faz fallback direto para `uf` (CE).

#### 3. Dados Inconsistentes no Banco
O usuário pode ter:
- `regional` vindo de `usuarioregionais`: "SP2"
- `uf` direto do cadastro: "CE"

## ✅ Solução Implementada

### Logs de Debug Adicionados

**Arquivo**: `hands/lib/data/models/user/user_info_model.dart`

```dart
String? get ufFromRegional {
  final regionalStr = regional;
  
  print('🔍 [ufFromRegional] Regional: "$regionalStr"');
  print('🔍 [ufFromRegional] UF do cadastro: "$uf"');
  
  if (regionalStr != null && regionalStr.isNotEmpty) {
    final ufExtraido = _extractUfFromRegional(regionalStr);
    print('🔍 [ufFromRegional] UF extraído: "$ufExtraido"');
    
    if (ufExtraido != null && ufExtraido.isNotEmpty) {
      print('✅ [ufFromRegional] Usando UF da regional: "$ufExtraido"');
      return ufExtraido;
    }
  }
  
  print('⚠️ [ufFromRegional] Usando fallback - UF do cadastro: "$uf"');
  return uf;
}
```

### Logs na Extração

```dart
String? _extractUfFromRegional(String? regional) {
  print('🔍 [_extractUfFromRegional] Input: "$regional"');
  
  if (regional == null || regional.isEmpty) {
    print('❌ [_extractUfFromRegional] Regional null ou vazio');
    return null;
  }

  final regionalSemNumero = regional.replaceAll(RegExp(r'\d+$'), '');
  print('🔍 [_extractUfFromRegional] Após remover números: "$regionalSemNumero"');

  // ...resto do código com logs
}
```

## 🧪 Como Testar

### 1. Execute o App em Modo Debug
```bash
flutter run
```

### 2. Faça Login com o Usuário
- GUID: `04F5078C-8FC6-406D-BE5B-F840922F2F35`
- Regional: SP2
- UF Cadastro: CE

### 3. Acesse a Tela de Venda Rejeitada

### 4. Verifique os Logs no Console

Procure pelos logs:
```
🔍 [ufFromRegional] Regional: "SP2"
🔍 [ufFromRegional] UF do cadastro: "CE"
🔍 [_extractUfFromRegional] Input: "SP2"
🔍 [_extractUfFromRegional] Após remover números: "SP"
✅ [_extractUfFromRegional] Resultado final: "SP"
✅ [ufFromRegional] Usando UF da regional: "SP"
```

### 5. Verifique a Requisição no Backend

Agora deveria ser:
```
GET /api/provedores/pesquisa?query=&regional=SP2&uf=SP
```

## 📊 Cenários Possíveis

### Cenário 1: Regional Correto ✅
```
Input: "SP2"
→ Remove números: "SP"
→ Resultado: "SP" ✅
```

### Cenário 2: Regional com Barra ✅
```
Input: "RJ/ES"
→ Split por /: ["RJ", "ES"]
→ Pega primeiro: "RJ" ✅
```

### Cenário 3: Regional sem Número ✅
```
Input: "CE"
→ Sem números para remover: "CE"
→ Resultado: "CE" ✅
```

### Cenário 4: Regional NULL ❌
```
Input: null
→ Fallback para UF do cadastro: "CE" ❌
→ Inconsistência!
```

## 🔧 Correção Permanente (se necessário)

Se os logs mostrarem que `regional` está **null**, a causa pode ser:

### Opção 1: Estrutura de `usuarioregionais` Vazia
```dart
app.userInfo?.usuarioregionais?.firstOrNull?.regionais?.firstOrNull?.regionaldetalhe
```

Se qualquer parte dessa cadeia for null, `regional` será null.

### Opção 2: Dados Não Carregados
O userInfo pode não ter carregado os dados de `usuarioregionais` corretamente.

### Solução: Fallback Inteligente

Se `regional` for null, podemos tentar buscar de outra fonte ou usar uma lógica diferente:

```dart
String? get ufFromRegional {
  final regionalStr = regional;
  
  // Se regional estiver disponível, extrair UF
  if (regionalStr != null && regionalStr.isNotEmpty) {
    final ufExtraido = _extractUfFromRegional(regionalStr);
    if (ufExtraido != null && ufExtraido.isNotEmpty) {
      return ufExtraido;
    }
  }
  
  // ⚠️ AVISO: Usando UF do cadastro (pode estar inconsistente!)
  print('⚠️ [ufFromRegional] Regional não disponível, usando UF do cadastro: "$uf"');
  print('⚠️ [ufFromRegional] Isso pode causar inconsistências nos provedores!');
  
  return uf;
}
```

## 📝 Validação no Banco de Dados

### Verificar Dados do Usuário
```sql
SELECT 
  u.guidid,
  u.nome,
  u.uf as uf_cadastro,
  r.regionaldetalhe as regional,
  SUBSTRING(r.regionaldetalhe, 1, 2) as uf_extraido
FROM usuario u
LEFT JOIN usuarioregionais ur ON u.id = ur.idusuario
LEFT JOIN regionais r ON ur.idregional = r.id
WHERE u.guidid = '04F5078C-8FC6-406D-BE5B-F840922F2F35';
```

**Resultado Esperado**:
| guidid | nome | uf_cadastro | regional | uf_extraido |
|--------|------|-------------|----------|-------------|
| 04F... | User | CE | SP2 | SP |

### Verificar Provedores de SP2
```sql
SELECT COUNT(*) as total, regional, uf
FROM provedores
WHERE regional = 'SP2'
GROUP BY regional, uf;
```

**Resultado Esperado**:
| total | regional | uf |
|-------|----------|-----|
| 10 | SP2 | SP |

Se houver provedores com `regional=SP2` e `uf=CE`, isso está **errado** e precisa ser corrigido:

```sql
-- Corrigir provedores inconsistentes
UPDATE provedores
SET uf = 'SP'
WHERE regional = 'SP2' AND uf <> 'SP';
```

## 🎯 Ações Recomendadas

### Imediatas
1. ✅ Executar app e verificar logs
2. ✅ Confirmar se `regional` está null ou tem valor
3. ✅ Verificar se extração está funcionando

### Se Regional Null
1. Investigar por que `usuarioregionais` não está sendo carregado
2. Verificar API de login/userInfo
3. Verificar se dados existem no banco

### Se Regional OK mas UF Errado
1. Verificar se há lógica adicional sobrescrevendo o UF
2. Verificar se há cache do userInfo
3. Limpar cache e fazer novo login

### Banco de Dados
1. Verificar consistência dos dados do usuário
2. Corrigir provedores com regional/UF inconsistente
3. Adicionar constraint ou validação no banco

## ✅ Checklist

- [x] Logs adicionados em `ufFromRegional`
- [x] Logs adicionados em `_extractUfFromRegional`
- [ ] Executar app e verificar logs
- [ ] Confirmar valor de `regional`
- [ ] Confirmar extração de UF
- [ ] Validar dados no banco
- [ ] Corrigir inconsistências se necessário

## 📞 Próximos Passos

1. **Execute o app** e compartilhe os logs do console
2. **Procure pelos emojis** 🔍 ✅ ❌ ⚠️ nos logs
3. **Compartilhe o output** completo para análise
4. **Execute as queries SQL** para validar dados no banco

Com esses logs, conseguiremos identificar exatamente onde está o problema! 🎯

