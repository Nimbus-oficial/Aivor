# Eventos e Auditoria

## Objetivo

Garantir rastreabilidade das acoes executadas dentro da Aivor.

Relaciona-se com:

- [[Backend API]]
- [[PostgreSQL Schema]]
- [[Observabilidade Tecnica]]
- [[Logs Estruturados]]

---

## Eventos Registrados

### Usuarios

- criacao de usuario;
- vinculacao de carteira;
- criacao de sessao;
- revogacao de sessao.

---

### Operacao

- alteracoes de configuracao operacional;
- registros administrativos;
- snapshots operacionais;
- eventos de sistema.

---

### Governanca

- propostas administrativas;
- filas futuras de Safe;
- operacoes futuras de Timelock;
- pausas de emergencia quando integradas.

Ver:

- [[Multisig]]
- [[Timelock]]
- [[Emergency Pause]]

---

## Auditoria

Toda acao relevante deve possuir:

- data;
- responsavel;
- tipo de acao;
- origem;
- resultado;
- metadados relevantes.

Tabela principal:

- `audit_logs`

Eventos gerais:

- `events`

---

## Implementacao Atual

Camada criada:

- `AuditLogService`;
- `AuditRepository`;
- `EventRepository`;
- endpoints em `/operations/events`;
- endpoints em `/operations/audit-logs`.

---

## Regra de Nao Custodia

Eventos e auditoria registram fatos operacionais.

Eles nao autorizam movimentacao financeira.

Eles nao alteram saldos.

Eles nao substituem a blockchain como fonte final de patrimonio.

---

## Objetivos

Permitir:

- investigacao;
- monitoramento;
- conformidade;
- rastreabilidade.

---

## Principios

Nenhuma acao critica deve ocorrer sem registro auditavel.
