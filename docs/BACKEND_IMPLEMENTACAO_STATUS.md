# Backend: Implementação de Status Trabalhado/Não Trabalhado

## 📋 Visão Geral

O backend do paptools usa **endpoints dinâmicos** registrados na tabela `Endpoint` do banco de dados SQL Server. Cada endpoint chama uma **stored procedure** específica.

Para adicionar os campos `statusAbordagem` e `statusVenda` na API de mailing, precisamos modificar a(s) stored procedure(s) que retornam os dados de oportunidades.

---

## 🔍 Stored Procedures a Modificar

Procure no SQL Server as stored procedures que retornam dados de mailing/oportunidades. Provavelmente terão nomes como:

- `sp_mailing_get`
- `sp_maillinggrid_get`
- `sp_oportunidades_get`
- `sp_condominiomailing_get`

**Como identificar:**
```sql
-- Buscar procedures que selecionam campos de mailing
SELECT ROUTINE_NAME 
FROM INFORMATION_SCHEMA.ROUTINES 
WHERE ROUTINE_TYPE = 'PROCEDURE' 
AND ROUTINE_DEFINITION LIKE '%cen_crosscell%'
OR ROUTINE_DEFINITION LIKE '%cen_winback%'
OR ROUTINE_DEFINITION LIKE '%CD_CONTRATO%'
OR ROUTINE_DEFINITION LIKE '%NOME_CLI%'
```

---

## 📝 Modificações Necessárias

### Estrutura Atual (Exemplo)

As procedures provavelmente retornam algo como:

```sql
SELECT 
    m.id,
    m.guidid,
    m.CD_CONTRATO,
    m.NOME_CLI,
    m.TP_LOGR,
    m.LOGR,
    m.NUM,
    m.COMPL,
    m.BAIRRO,
    m.CIDADE,
    m.UF,
    m.CEP,
    m.cen_blindagem,
    m.cen_crosscell,
    m.cen_ofertamvl,
    m.cen_semtv,
    m.cen_winback,
    m.cen_tvsembl,
    m.CD_IMOVEL
FROM mailing m
WHERE ...
```

### ✅ Estrutura Modificada (ADICIONAR)

```sql
SELECT 
    m.id,
    m.guidid,
    m.CD_CONTRATO,
    m.NOME_CLI,
    m.TP_LOGR,
    m.LOGR,
    m.NUM,
    m.COMPL,
    m.BAIRRO,
    m.CIDADE,
    m.UF,
    m.CEP,
    m.cen_blindagem,
    m.cen_crosscell,
    m.cen_ofertamvl,
    m.cen_semtv,
    m.cen_winback,
    m.cen_tvsembl,
    m.CD_IMOVEL,
    -- ✅ NOVOS CAMPOS A ADICIONAR:
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM maillingabordagem ma 
            WHERE ma.idmailling = m.id 
            AND ma.status IS NOT NULL
        ) 
        THEN 1 
        ELSE 0 
    END AS statusAbordagem,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM maillingabordagem ma 
            WHERE ma.idmailling = m.id 
            AND ma.status = 'Venda'
        ) 
        THEN 1 
        ELSE 0 
    END AS statusVenda
FROM mailing m
WHERE ...
```

---

## 🗂️ Estrutura da Tabela `maillingabordagem`

A tabela de abordagens provavelmente tem uma estrutura similar a:

```sql
CREATE TABLE maillingabordagem (
    id INT PRIMARY KEY,
    idmailling INT,
    dataabordagem DATETIME,
    status VARCHAR(50),  -- 'Venda' ou 'Não venda'
    observacao VARCHAR(MAX),
    motivonaovenda VARCHAR(255),
    idproduto INT,
    numerocontrato VARCHAR(50),
    -- outros campos...
)
```

---

## 📋 Exemplo de Stored Procedure Completa

### Opção 1: Stored Procedure de Grid (Lista Completa)

```sql
ALTER PROCEDURE [dbo].[sp_maillinggrid_get]
    @guid_usuario VARCHAR(50) = NULL,
    @idcarteira INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        m.id,
        m.guidid,
        m.CD_CONTRATO,
        m.NOME_CLI,
        m.TP_LOGR,
        m.LOGR,
        m.NUM,
        m.COMPL,
        m.BAIRRO,
        m.CIDADE,
        m.UF,
        m.CEP,
        m.cen_blindagem,
        m.cen_crosscell,
        m.cen_ofertamvl,
        m.cen_semtv,
        m.cen_winback,
        m.cen_tvsembl,
        m.CD_IMOVEL,
        
        -- ✅ Calcula se foi trabalhado (tem abordagem)
        CASE 
            WHEN EXISTS (
                SELECT 1 
                FROM maillingabordagem ma 
                WHERE ma.idmailling = m.id
            ) 
            THEN 1 
            ELSE 0 
        END AS statusAbordagem,
        
        -- ✅ Calcula se resultou em venda
        CASE 
            WHEN EXISTS (
                SELECT 1 
                FROM maillingabordagem ma 
                WHERE ma.idmailling = m.id 
                AND ma.status = 'Venda'
            ) 
            THEN 1 
            ELSE 0 
        END AS statusVenda
        
    FROM mailing m
    WHERE (@idcarteira IS NULL OR m.idcarteira = @idcarteira)
    ORDER BY m.id DESC;
END
GO
```

### Opção 2: Stored Procedure de Detalhes (Único Registro)

```sql
ALTER PROCEDURE [dbo].[sp_mailing_get]
    @guididmailling VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        m.*,
        
        -- ✅ Status de abordagem
        CASE 
            WHEN EXISTS (
                SELECT 1 
                FROM maillingabordagem ma 
                WHERE ma.idmailling = m.id
            ) 
            THEN 1 
            ELSE 0 
        END AS statusAbordagem,
        
        -- ✅ Status de venda
        CASE 
            WHEN EXISTS (
                SELECT 1 
                FROM maillingabordagem ma 
                WHERE ma.idmailling = m.id 
                AND ma.status = 'Venda'
            ) 
            THEN 1 
            ELSE 0 
        END AS statusVenda,
        
        -- Retorna também as abordagens (relacionamento)
        (
            SELECT 
                ma.id,
                ma.idmailling,
                ma.dataabordagem,
                ma.status,
                ma.observacao,
                ma.motivonaovenda,
                ma.idproduto,
                ma.numerocontrato
            FROM maillingabordagem ma
            WHERE ma.idmailling = m.id
            FOR JSON PATH
        ) AS maillingabordagens
        
    FROM mailing m
    WHERE m.guidid = @guididmailling;
END
GO
```

### Opção 3: Para API de Condomínio com Mailing

```sql
ALTER PROCEDURE [dbo].[sp_condominio_mailing_get]
    @guidid_condominio VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        m.id,
        m.guidid,
        m.CD_CONTRATO,
        m.NOME_CLI,
        m.TP_LOGR,
        m.LOGR,
        m.NUM,
        m.COMPL,
        m.BAIRRO,
        m.CIDADE,
        m.UF,
        m.CEP,
        m.cen_blindagem,
        m.cen_crosscell,
        m.cen_ofertamvl,
        m.cen_semtv,
        m.cen_winback,
        m.cen_tvsembl,
        m.CD_IMOVEL,
        
        -- ✅ Novos campos de status
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM maillingabordagem ma 
                WHERE ma.idmailling = m.id
            ) 
            THEN 1 
            ELSE 0 
        END AS statusAbordagem,
        
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM maillingabordagem ma 
                WHERE ma.idmailling = m.id 
                AND ma.status = 'Venda'
            ) 
            THEN 1 
            ELSE 0 
        END AS statusVenda
        
    FROM mailing m
    INNER JOIN condominio c ON c.codigo_imovel = m.CD_IMOVEL
    WHERE c.guidid = @guidid_condominio
    ORDER BY m.id DESC;
END
GO
```

---

## 🔧 Variação: Se a Lógica for Diferente

### Se o status for armazenado diretamente na tabela mailing:

```sql
SELECT 
    m.*,
    CASE WHEN m.flag_trabalhado = 1 THEN 1 ELSE 0 END AS statusAbordagem,
    CASE WHEN m.flag_venda = 1 THEN 1 ELSE 0 END AS statusVenda
FROM mailing m
```

### Se houver coluna específica de status:

```sql
SELECT 
    m.*,
    CASE WHEN m.status_abordagem IS NOT NULL THEN 1 ELSE 0 END AS statusAbordagem,
    CASE WHEN m.tipo_resultado = 'Venda' THEN 1 ELSE 0 END AS statusVenda
FROM mailing m
```

---

## 🎯 Endpoints que Precisam ser Atualizados

Verifique na tabela `Endpoint` do banco de dados quais endpoints chamam as procedures de mailing:

```sql
SELECT 
    id,
    caminho,
    procedimento,
    metodo,
    descricao
FROM Endpoint
WHERE procedimento LIKE '%mailing%'
OR procedimento LIKE '%oportunidade%'
OR caminho LIKE '%mailing%'
OR caminho LIKE '%oportunidade%'
```

Exemplo de registros:
- `caminho: 'maillinggrid'` → `procedimento: 'sp_maillinggrid_get'`
- `caminho: 'mailing'` → `procedimento: 'sp_mailing_get'`
- `caminho: 'condominio/mailing'` → `procedimento: 'sp_condominio_mailing_get'`

---

## ✅ Checklist de Implementação

### Banco de Dados
- [ ] Identificar stored procedure(s) que retornam dados de mailing
- [ ] Adicionar cálculo de `statusAbordagem` (EXISTS na maillingabordagem)
- [ ] Adicionar cálculo de `statusVenda` (EXISTS com status = 'Venda')
- [ ] Testar procedure manualmente no SQL Server Management Studio
- [ ] Verificar performance (se muitos registros, considerar índices)

### Backend API
- [ ] Verificar se os endpoints dinâmicos estão ativos
- [ ] Testar endpoint via Postman/Insomnia
- [ ] Validar retorno JSON com os novos campos

### Frontend
- [ ] Já implementado ✅ (conforme IMPLEMENTACAO_STATUS_TRABALHADO.md)

---

## 🧪 Teste das Stored Procedures

### Teste Manual no SQL Server:

```sql
-- Teste 1: Verificar se retorna os novos campos
EXEC sp_maillinggrid_get @guid_usuario = 'GUID_DO_USUARIO_TESTE'

-- Teste 2: Verificar cálculo de status
SELECT 
    m.id,
    m.CD_CONTRATO,
    CASE 
        WHEN EXISTS (SELECT 1 FROM maillingabordagem ma WHERE ma.idmailling = m.id) 
        THEN 1 
        ELSE 0 
    END AS statusAbordagem,
    (SELECT COUNT(*) FROM maillingabordagem ma WHERE ma.idmailling = m.id) AS qtd_abordagens
FROM mailing m
WHERE m.id IN (SELECT TOP 10 id FROM mailing ORDER BY id DESC)

-- Teste 3: Validar lógica de venda
SELECT 
    ma.idmailling,
    ma.status,
    CASE WHEN ma.status = 'Venda' THEN 1 ELSE 0 END AS eh_venda
FROM maillingabordagem ma
WHERE ma.idmailling IN (SELECT TOP 10 id FROM mailing ORDER BY id DESC)
```

---

## 📊 Índices Recomendados (Performance)

Se a consulta ficar lenta com muitos registros:

```sql
-- Índice na tabela maillingabordagem
CREATE NONCLUSTERED INDEX IX_maillingabordagem_idmailling_status
ON maillingabordagem (idmailling, status)
INCLUDE (id, dataabordagem)

-- Ou se preferir cobrir tudo:
CREATE NONCLUSTERED INDEX IX_maillingabordagem_idmailling
ON maillingabordagem (idmailling)
INCLUDE (status, dataabordagem)
```

---

## 🔄 Alternativa: View Materializada

Se houver problemas de performance, considere criar uma view:

```sql
CREATE VIEW vw_mailing_com_status AS
SELECT 
    m.*,
    CASE 
        WHEN EXISTS (SELECT 1 FROM maillingabordagem ma WHERE ma.idmailling = m.id) 
        THEN 1 
        ELSE 0 
    END AS statusAbordagem,
    CASE 
        WHEN EXISTS (SELECT 1 FROM maillingabordagem ma WHERE ma.idmailling = m.id AND ma.status = 'Venda') 
        THEN 1 
        ELSE 0 
    END AS statusVenda
FROM mailing m
GO

-- Então as procedures usariam:
SELECT * FROM vw_mailing_com_status WHERE ...
```

---

## 📞 Suporte

Se precisar de ajuda para:
1. Identificar as procedures corretas
2. Entender a estrutura do banco
3. Testar as modificações

Entre em contato com o DBA ou equipe de backend.

---

## 📎 Anexos

- Veja também: `IMPLEMENTACAO_STATUS_TRABALHADO.md` (mudanças no frontend)
- Estrutura do banco: Consulte o DBA para schema completo
- Documentação API: Verifique tabela `Endpoint` no banco de dados

