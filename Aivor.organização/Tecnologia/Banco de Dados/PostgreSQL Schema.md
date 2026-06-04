# PostgreSQL Schema

## Objetivo

Definir a estrutura logica dos dados utilizados pela Aivor.

Relaciona-se com:

- [[PostgreSQL]]
- [[Backend]]
- [[Eventos e Auditoria]]

---

## Principio Fundamental

O banco de dados nao possui custodia.

O banco de dados nao e a fonte final de patrimonio, saldo, shares ou ativos financeiros.

A fonte final para posicoes financeiras permanece na blockchain e nos smart contracts.

---

## Migration Inicial

Arquivo:

- `apps/backend/migrations/001_initial_schema.sql`

Execucao local com `DATABASE_URL`:

```bash
DATABASE_URL="postgres://user:password@localhost:5432/orvex" npm run db:migrate --workspace @orvex/backend
```

---

## Validacao Real Local

### Subir PostgreSQL com Docker

Comando recomendado quando Docker estiver instalado:

```bash
docker run --name orvex-postgres -e POSTGRES_USER=orvex -e POSTGRES_PASSWORD=orvex_local -e POSTGRES_DB=orvex -p 5432:5432 -d postgres:17
```

DATABASE_URL:

```bash
postgres://orvex:orvex_local@localhost:5432/orvex
```

### Rodar migrations

```bash
DATABASE_URL="postgres://orvex:orvex_local@localhost:5432/orvex" npm run db:migrate --workspace @orvex/backend
```

### Validar roundtrip operacional

```bash
DATABASE_URL="postgres://orvex:orvex_local@localhost:5432/orvex" npm run db:validate --workspace @orvex/backend
```

O script de validacao registra em transacao:

- usuario;
- carteira;
- evento;
- audit log;
- leitura de `operational_settings`;
- `position_snapshot`.

A transacao e revertida ao final para evitar lixo de teste.

### Regra do position_snapshot

`position_snapshots` registra leituras operacionais e historicas.

Ele nunca deve ser usado como fonte final de patrimonio.

Saldos, shares, ativos e valor final continuam sendo definidos pela blockchain e pelos smart contracts.

---

## Entidades Principais

### Usuarios

Tabela:

- `users`

Finalidade:

- perfil operacional;
- vinculo futuro com autenticacao;
- preferencias basicas.

---

### Carteiras

Tabela:

- `wallets`

Finalidade:

- vincular enderecos EVM a usuarios;
- identificar carteira primaria;
- registrar verificacao.

Nao representa custodia pelo backend.

---

### Sessoes

Tabela:

- `sessions`

Finalidade:

- armazenar hash de sessao;
- registrar expiracao;
- permitir revogacao.

---

### Eventos

Tabela:

- `events`

Categorias:

- `user`
- `operation`
- `governance`
- `security`
- `blockchain`
- `system`

---

### Auditoria

Tabela:

- `audit_logs`

Toda acao administrativa futura deve registrar:

- quem executou;
- quando executou;
- qual acao;
- origem;
- resultado;
- metadados relevantes.

---

### Configuracoes Operacionais

Tabela:

- `operational_settings`

Parametros oficiais iniciais:

- liquidez minima: 200 bps;
- liquidez alvo: 500 bps;
- liquidez maxima: 700 bps;
- multisig: Safe 2-of-4;
- ativos suportados: USDC e EURC;
- protocolo inicial: Morpho.

---

### Registros Administrativos

Tabela:

- `admin_records`

Finalidade:

- registrar propostas administrativas;
- acompanhar fila operacional;
- vincular Safe transaction hash quando existir;
- vincular operacao de timelock quando existir;
- registrar status e metadados.

---

### Leituras Agregadas de Posicao

Tabela:

- `position_snapshots`

Finalidade:

- armazenar snapshots historicos;
- apoiar dashboard e analytics;
- permitir reconciliacao operacional.

Importante:

Esta tabela armazena leituras agregadas.

Ela nao substitui a blockchain como fonte final de patrimonio.

---

## Principios

- normalizacao adequada;
- rastreabilidade;
- auditabilidade;
- crescimento futuro;
- separacao clara entre dados operacionais e patrimonio on-chain.
