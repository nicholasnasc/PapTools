# Correção - Erro "type 'int' is not a subtype of type 'double'"

## 🔴 Problema
```
Another exception was thrown: type 'int' is not a subtype of type 'double'
```

Este erro começou após remover a opção "Outros" das operadoras.

## 🔍 Causa Raiz

O erro ocorre quando o JSON do backend retorna números em formato diferente do esperado:
- Backend retorna `double`: `1.0`, `2.0`, `-999.0`
- Dart espera `int`: `1`, `2`, `-999`

Ao fazer parse do JSON sem conversão adequada, o Dart lança exceção de tipo.

## ✅ Correções Implementadas

### 1. **Provedor Model** - Conversão Robusta

**Arquivo**: `data/models/provedor/provedor_model.dart`

```dart
Provedor.fromJson(Map<String, dynamic> json) {
  try {
    // ID - Aceita int, double ou string
    final jsonId = json["id"];
    if (jsonId != null) {
      if (jsonId is int) {
        id = jsonId;
      } else if (jsonId is double) {
        id = jsonId.toInt();  // ✅ Converte double para int
      } else if (jsonId is String) {
        id = int.tryParse(jsonId);  // ✅ Tenta converter string
      }
    }
    
    // IBGE - Aceita int, double ou string
    final jsonIbge = json["ibge"];
    if (jsonIbge != null) {
      if (jsonIbge is int) {
        ibge = jsonIbge;
      } else if (jsonIbge is double) {
        ibge = jsonIbge.toInt();
      } else if (jsonIbge is String) {
        ibge = int.tryParse(jsonIbge);
      }
    }
    
    // Outros campos com .toString() para segurança
    nome = json["nome"]?.toString();
    regional = json["regional"]?.toString();
    // ...
  } catch (e) {
    print('❌ Erro ao fazer parse de Provedor: $e');
    print('JSON: $json');
    rethrow;
  }
}
```

### 2. **Operator Model** - Conversão Robusta

**Arquivo**: `data/models/operator_model.dart`

```dart
factory Operator.fromJson(Map<String, dynamic> json) {
  return Operator(
    id: json['id'] is int 
        ? json['id'] 
        : (json['id'] is double ? (json['id'] as double).toInt() : null),
    nome: json['nome'],
    atuacao: json['atuacao'],
  );
}
```

### 3. **RejectedSaleReasonModel** - Conversão Robusta

**Arquivo**: `data/models/sale/rejected_sale_reason_model.dart`

```dart
factory RejectedSaleReasonModel.fromJson(Map<String, Object?> json) {
  // Conversões seguras para todos os campos int
  final id = json['id'];
  final exigecontato = json['exigecontato'];
  final exigeoperadora = json['exigeoperadora'];
  final ativo = json['ativo'];
  
  return RejectedSaleReasonModel(
    id: id is int ? id : (id is double ? id.toInt() : 0),
    needsContact: (exigecontato is int ? exigecontato : (exigecontato is double ? exigecontato.toInt() : 0)) == 1,
    needsOperator: (exigeoperadora is int ? exigeoperadora : (exigeoperadora is double ? exigeoperadora.toInt() : 0)) == 1,
    ativo: (ativo is int ? ativo : (ativo is double ? ativo.toInt() : 0)) == 1,
    // ...
  );
}
```

### 4. **ReasonFieldExtra** - Conversão Robusta

```dart
ReasonFieldExtra.fromJson(Map<String, dynamic> json) {
  final jsonId = json['id'];
  final jsonIdMotivo = json['idmotivonaovenda'];
  final jsonObrigatorio = json['obrigatorio'];
  final jsonAtivo = json['ativo'];
  
  id = jsonId is int ? jsonId : (jsonId is double ? jsonId.toInt() : null);
  idMotivoNaoVenda = jsonIdMotivo is int ? jsonIdMotivo : (jsonIdMotivo is double ? jsonIdMotivo.toInt() : null);
  obrigatorio = jsonObrigatorio is int ? jsonObrigatorio : (jsonObrigatorio is double ? jsonObrigatorio.toInt() : null);
  ativo = jsonAtivo is int ? jsonAtivo : (jsonAtivo is double ? jsonAtivo.toInt() : null);
  // ...
}
```

### 5. **ViewModel** - Proteção Adicional

**Arquivo**: `rejected_sale_viewmodel.dart`

```dart
// Adicionar provedores um por um com try-catch
for (var provedor in _provedores) {
  try {
    if (provedor.nome != null && provedor.nome!.isNotEmpty) {
      list.add(provedor);
    }
  } catch (e) {
    SecureLogger.error('❌ Erro ao adicionar provedor ${provedor.nome}: $e');
  }
}
```

## 📊 Exemplos de Conversão

### Caso 1: Backend retorna Double
```json
{
  "id": 1.0,
  "nome": "Provedor A",
  "ibge": 3550308.0
}
```
**Antes**: ❌ Crash `type 'int' is not a subtype of type 'double'`  
**Depois**: ✅ `id = 1`, `ibge = 3550308`

### Caso 2: Backend retorna Int
```json
{
  "id": 1,
  "nome": "Provedor A",
  "ibge": 3550308
}
```
**Antes**: ✅ Funcionava  
**Depois**: ✅ Continua funcionando

### Caso 3: Backend retorna String
```json
{
  "id": "1",
  "nome": "Provedor A",
  "ibge": "3550308"
}
```
**Antes**: ❌ Crash ou valor null  
**Depois**: ✅ `id = 1`, `ibge = 3550308`

### Caso 4: Operadoras Nacionais (criadas no código)
```dart
Operator(id: -1, nome: 'Vivo', atuacao: 'Nacional')
Operator(id: -999, nome: 'Outros', atuacao: '')
```
**Antes**: ✅ Funcionava (valores literais int)  
**Depois**: ✅ Continua funcionando

## 🎯 Por que o erro apareceu após remover "Outros"?

Provavelmente porque:
1. A remoção de "Outros" alterou o fluxo de carregamento
2. Provedores do banco começaram a ser carregados em momento diferente
3. JSON do backend tinha campos com tipo `double` que não eram convertidos

## ✅ Checklist de Validação

- [x] Conversão robusta em `Provedor.fromJson()`
- [x] Conversão robusta em `Operator.fromJson()`
- [x] Conversão robusta em `RejectedSaleReasonModel.fromJson()`
- [x] Conversão robusta em `ReasonFieldExtra.fromJson()`
- [x] Try-catch ao adicionar provedores na lista
- [x] Logs de erro para identificar problemas
- [x] Aceita int, double e string para campos numéricos

## 🧪 Como Testar

1. **Limpar build**:
   ```bash
   flutter clean
   flutter pub get
   ```

2. **Executar app**:
   ```bash
   flutter run
   ```

3. **Arrastar para Não Venda**:
   - Abrir lista de rotas
   - Arrastar card para a esquerda
   - Verificar que modal abre sem erro

4. **Verificar logs**:
   - Se houver erro, vai aparecer: `❌ Erro ao fazer parse de Provedor: ...`
   - Com o JSON problemático

## 📝 Resultado Esperado

✅ Modal de Não Venda abre sem erros  
✅ Provedores carregam corretamente  
✅ Operadoras nacionais aparecem (Vivo, Claro, TIM, Outros)  
✅ Sem crash de tipo  

## 🔧 Se o Erro Persistir

Execute com logs e envie o output:
```dart
// No console, procure por:
❌ Erro ao fazer parse de Provedor: type 'int' is not a subtype of type 'double'
JSON: { ... }
```

Isso mostrará exatamente qual campo está com problema.

