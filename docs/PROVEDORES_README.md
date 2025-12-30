# Provedores Module

## Overview
This module provides functionality to manage "provedores" (providers) in the system.

## Database Setup

### Creating the Table
Before using the provedores endpoints, you need to create the `provedores` table in your SQL Server database.

Run the SQL script:
```bash
sql/create_provedores_table.sql
```

Or execute this SQL command directly in SQL Server Management Studio or Azure Data Studio:

```sql
CREATE TABLE [dbo].[provedores] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [nome] NVARCHAR(255) NOT NULL,
    [regional] NVARCHAR(100) NOT NULL,
    [uf] NVARCHAR(2) NOT NULL,
    [ibge] NVARCHAR(20) NULL,
    [origem] NVARCHAR(20) DEFAULT 'PORTAL' NOT NULL,
    [ativo] BIT DEFAULT 1 NOT NULL,
    [dataCadastro] DATETIME DEFAULT GETDATE() NOT NULL,
    [dataAtualizacao] DATETIME NULL,
    
    INDEX [IX_provedores_nome] ([nome]),
    INDEX [IX_provedores_regional] ([regional]),
    INDEX [IX_provedores_uf] ([uf]),
    INDEX [IX_provedores_ativo] ([ativo]),
    
    CONSTRAINT [UQ_provedores_nome_regional_uf] UNIQUE ([nome], [regional], [uf])
);
```

## API Endpoints

### 1. GET /api/provedores
Lista todos os provedores com filtros opcionais.

**Query Parameters:**
- `nome` (optional): Filtra por nome (busca parcial)
- `regional` (optional): Filtra por regional exata
- `uf` (optional): Filtra por UF
- `ativo` (optional): Filtra por status ativo (0 ou 1)

**Response:**
```json
{
  "success": true,
  "provedores": [...],
  "total": 10
}
```

### 2. GET /api/provedores/pesquisa
Pesquisa provedores por nome, regional e UF (usado no app).

**Query Parameters (obrigatórios):**
- `query`: Termo de busca no nome
- `regional`: Regional
- `uf`: UF

**Response:**
```json
{
  "success": true,
  "provedores": [...],
  "total": 5
}
```

### 3. GET /api/provedores/:id
Busca um provedor específico pelo ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "Provedor Exemplo",
    "regional": "Sul",
    "uf": "RS",
    "ibge": "4300000",
    "origem": "PORTAL",
    "ativo": 1,
    "dataCadastro": "2025-12-16T10:00:00.000Z",
    "dataAtualizacao": null
  }
}
```

### 4. POST /api/provedores
Cria um novo provedor.

**Request Body:**
```json
{
  "nome": "Provedor Novo",
  "regional": "Sul",
  "uf": "RS",
  "ibge": "4300000",
  "origem": "PORTAL"  // ou "APP" - opcional, padrão é PORTAL
}
```

**Response:**
```json
{
  "success": true,
  "message": "Provedor criado com sucesso",
  "data": {
    "id": 1,
    "nome": "Provedor Novo",
    ...
  }
}
```

### 5. PUT /api/provedores
Atualiza um provedor existente.

**Request Body:**
```json
{
  "id": 1,
  "nome": "Provedor Atualizado",
  "regional": "Sul",
  "uf": "RS",
  "ibge": "4300000",
  "ativo": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Provedor atualizado com sucesso",
  "data": {
    "id": 1,
    "nome": "Provedor Atualizado",
    ...
  }
}
```

### 6. DELETE /api/provedores/:id
Remove (inativa) um provedor.

**Response:**
```json
{
  "success": true,
  "message": "Provedor removido com sucesso"
}
```

## Files

- `shared/provedores.js` - Helper module with database operations
- `routes/api.js` - API route handlers (lines 1421-1665)
- `sql/create_provedores_table.sql` - Database table creation script

## Error Handling

The module handles the following error scenarios:
- **404**: Provedor not found
- **409**: Duplicate provedor (same nome, regional, uf)
- **422**: Invalid or missing required parameters
- **500**: Internal server error

## Troubleshooting

### Error: "Cannot find module '../shared/provedores'"
- **Solution**: The file `shared/provedores.js` should exist. This issue has been resolved.

### Error: "Invalid object name 'provedores'"
- **Solution**: The table doesn't exist in the database. Run the SQL script `sql/create_provedores_table.sql` to create it.

### Error: "Invalid column name"
- **Solution**: Ensure all columns exist in your database table. Compare with the CREATE TABLE script.

