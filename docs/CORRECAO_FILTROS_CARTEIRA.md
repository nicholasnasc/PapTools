# 🔧 Correção: Filtros "Trabalhado" e "Não Trabalhado" na Carteira

## 🐛 Problema Relatado

**Módulo:** Carteira → Aba Oportunidades

**Sintomas:**
- ✅ Filtro "Trabalhado" não traz resultados (diz "sem oportunidades")
- ❌ Filtro "Não Trabalhado" traz oportunidades trabalhadas (invertido)

---

## 🔍 Causa Raiz

O problema estava no **parsing dos dados** vindos do backend. O modelo `MailingList` estava esperando que os campos `statusAbordagem` e `statusVenda` viessem sempre como números (0 ou 1), mas o backend pode estar retornando em diferentes formatos:

- String numérica: `"0"`, `"1"`
- Booleano: `true`, `false`
- String descritiva: `"Contactado"`, `"Aguardando Contato"`
- Null/undefined

Quando o formato era diferente do esperado, o parsing falhava e todos os itens eram marcados incorretamente.

---

## ✅ Solução Implementada

**Arquivo modificado:**
`paptools-app/hands/lib/data/models/mailing/mailing_list_model.dart`

### Métodos de Parsing Robustos

Adicionados dois métodos auxiliares que aceitam múltiplos formatos:

```dart
static String _parseStatusAbordagem(dynamic value) {
  if (value == null) return 'Aguardando Contato';
  
  // Se for número (0 ou 1)
  if (value is int || value is double) {
    return value == 1 ? 'Contactado' : 'Aguardando Contato';
  }
  
  // Se for string numérica ("0" ou "1")
  if (value is String) {
    if (value == '1' || value.toLowerCase() == 'true') {
      return 'Contactado';
    }
    if (value == '0' || value.toLowerCase() == 'false') {
      return 'Aguardando Contato';
    }
    // Se já vier como string descritiva
    if (value.toLowerCase().contains('contact') || 
        value.toLowerCase().contains('aborda')) {
      return 'Contactado';
    }
  }
  
  // Se for booleano
  if (value is bool) {
    return value ? 'Contactado' : 'Aguardando Contato';
  }
  
  return 'Aguardando Contato'; // Valor padrão
}

static String _parseStatusVenda(dynamic value) {
  // Lógica similar para statusVenda
}
```

### Mudanças no fromJson

**Antes:**
```dart
statusAbordagem: json['statusAbordagem'] == 1
    ? 'Contactado'
    : 'Aguardando Contato',
```

**Depois:**
```dart
statusAbordagem: _parseStatusAbordagem(json['statusAbordagem']),
```

---

## 🎯 Formatos Aceitos Agora

### statusAbordagem

| Valor do Backend | Resultado |
|------------------|-----------|
| `1` ou `1.0` | ✅ Contactado |
| `0` ou `0.0` | ❌ Aguardando Contato |
| `"1"` | ✅ Contactado |
| `"0"` | ❌ Aguardando Contato |
| `true` | ✅ Contactado |
| `false` | ❌ Aguardando Contato |
| `"true"` | ✅ Contactado |
| `"false"` | ❌ Aguardando Contato |
| `"Contactado"` | ✅ Contactado |
| `"contactado"` | ✅ Contactado |
| `"Abordado"` | ✅ Contactado |
| `null` | ❌ Aguardando Contato (padrão) |

### statusVenda

| Valor do Backend | Resultado |
|------------------|-----------|
| `1` ou `1.0` | ✅ Venda |
| `0` ou `0.0` | ❌ Não venda |
| `"1"` | ✅ Venda |
| `"0"` | ❌ Não venda |
| `true` | ✅ Venda |
| `false` | ❌ Não venda |
| `"Venda"` | ✅ Venda |
| `"venda"` | ✅ Venda |
| `null` | ❌ Não venda (padrão) |

---

## 🧪 Como Testar

### 1. Módulo Carteira → Aba Oportunidades

```
1. Abrir APP
2. Ir em Carteira
3. Selecionar uma carteira
4. Selecionar um condomínio
5. Ir na aba "Oportunidades"
6. Testar filtro "Trabalhado"
   ✅ Deve mostrar apenas oportunidades com abordagem registrada
7. Testar filtro "Não Trabalhado"
   ✅ Deve mostrar apenas oportunidades sem abordagem
8. Testar outros filtros (BL sem Móvel, etc)
   ✅ Devem funcionar normalmente
```

### 2. Verificar Visual dos Cards

**Oportunidades Trabalhadas:**
- Borda verde
- Badge "TRABALHADO"
- Badge "VENDA" ou "NÃO VENDA"

**Oportunidades Não Trabalhadas:**
- Borda vermelha
- Badge "NÃO TRABALHADO"

---

## 🔧 Debug (Se o problema persistir)

### Verificar dados do backend

Adicione temporariamente um print no método `fromJson`:

```dart
factory MailingList.fromJson(Map<String, dynamic> json) {
  // DEBUG: Remover após teste
  print('DEBUG statusAbordagem: ${json['statusAbordagem']} (${json['statusAbordagem'].runtimeType})');
  print('DEBUG statusVenda: ${json['statusVenda']} (${json['statusVenda'].runtimeType})');
  
  return MailingList(
    // ... resto do código
  );
}
```

### Verificar SQL Server

Execute a query na stored procedure `api_mailing_grid_get`:

```sql
-- Testar se os campos estão sendo retornados corretamente
EXEC api_mailing_grid_get @guididoperador = 'GUID_DO_USUARIO_TESTE'

-- Verificar os valores de statusAbordagem e statusVenda
-- Devem ser 0 ou 1
```

### Verificar resposta da API

Use Postman/Insomnia para testar:

```
GET /api/mailinggrid
Headers: Authorization: Bearer {TOKEN}

Resposta esperada:
{
  "mailinggrid": [
    {
      "id": 123,
      "statusAbordagem": 0 ou 1,  ← Verificar este campo
      "statusVenda": 0 ou 1,       ← Verificar este campo
      // ... outros campos
    }
  ]
}
```

---

## 📊 Cenários de Teste

### Cenário 1: Condomínio com Mix de Oportunidades

**Setup:**
- 5 oportunidades trabalhadas (com abordagem)
- 3 oportunidades não trabalhadas (sem abordagem)

**Testes:**
- [ ] Sem filtro: Mostra todas (8 oportunidades)
- [ ] Filtro "Trabalhado": Mostra apenas 5
- [ ] Filtro "Não Trabalhado": Mostra apenas 3
- [ ] Filtro "BL sem Móvel": Filtra dentro do conjunto visível

### Cenário 2: Condomínio sem Oportunidades Trabalhadas

**Setup:**
- 0 oportunidades trabalhadas
- 10 oportunidades não trabalhadas

**Testes:**
- [ ] Sem filtro: Mostra todas (10 oportunidades)
- [ ] Filtro "Trabalhado": Mostra mensagem "sem oportunidades"
- [ ] Filtro "Não Trabalhado": Mostra todas (10 oportunidades)

### Cenário 3: Condomínio com Todas Trabalhadas

**Setup:**
- 15 oportunidades trabalhadas
- 0 oportunidades não trabalhadas

**Testes:**
- [ ] Sem filtro: Mostra todas (15 oportunidades)
- [ ] Filtro "Trabalhado": Mostra todas (15 oportunidades)
- [ ] Filtro "Não Trabalhado": Mostra mensagem "sem oportunidades"

---

## 🔄 Rollback (Se necessário)

Se a correção causar problemas, reverter para o código original:

```dart
// Versão original (menos robusta)
statusAbordagem: json['statusAbordagem'] == 1
    ? 'Contactado'
    : 'Aguardando Contato',
statusVenda: json['statusVenda'] == 1 
    ? 'Venda' 
    : 'Não venda',
```

---

## 📝 Notas Importantes

1. **Backend deve retornar 0 ou 1**
   - Embora o código agora aceite múltiplos formatos, o ideal é o backend retornar consistentemente 0 ou 1

2. **Módulo Oportunidades não afetado**
   - O módulo Oportunidades (página principal) usa a mesma model, então a correção também beneficia aquele módulo

3. **Portal não afetado**
   - O portal tem seu próprio modelo e não precisa desta correção

4. **Valores padrão**
   - Se o backend não retornar os campos, assume "Aguardando Contato" e "Não venda"

---

## ✅ Checklist Pós-Implementação

- [x] Código atualizado em `mailing_list_model.dart`
- [x] Métodos de parsing robustos adicionados
- [x] Sem erros de compilação
- [ ] Testar no dispositivo/emulador
- [ ] Validar com dados reais do backend
- [ ] Confirmar filtros funcionam corretamente
- [ ] Verificar visual dos cards mantido

---

**Data da correção:** 2025-12-19  
**Arquivo modificado:** `mailing_list_model.dart`  
**Status:** ✅ Implementado e pronto para testes

