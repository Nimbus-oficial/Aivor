# Logs Estruturados

## Objetivo

Definir os padroes de registro de eventos utilizados pela Aivor.

Relaciona-se com:

- [[Backend API]]
- [[Eventos e Auditoria]]
- [[Observabilidade Tecnica]]

---

## Finalidade

Os logs permitem:

- monitoramento;
- investigacao;
- auditoria;
- diagnostico de falhas.

---

## Implementacao Atual

Servico:

- `StructuredLogger`

Formato base:

```json
{
  "timestamp": "2026-06-04T00:00:00.000Z",
  "level": "info",
  "event": "user.created",
  "source": "backend-api",
  "result": "success",
  "metadata": {}
}
```

---

## Categorias

### Aplicacao

Eventos gerados pelo backend.

---

### Seguranca

Eventos relacionados a autenticacao, sessoes e permissoes.

---

### Operacao

Eventos relacionados a configuracoes, auditoria e registros administrativos.

---

### Blockchain

Eventos relacionados a leituras on-chain, contratos e transacoes.

---

## Informacoes Minimas

Todo log deve conter:

- data e hora;
- tipo do evento;
- origem;
- resultado;
- identificador ou metadados relevantes quando disponivel.

---

## Principios

Os logs devem ser:

- estruturados;
- pesquisaveis;
- auditaveis;
- padronizados.

---

## Relacoes

Ver:

- [[Eventos e Auditoria]]
- [[Observabilidade Tecnica]]
