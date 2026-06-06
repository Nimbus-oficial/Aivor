# Manual de Emergencia

## Objetivo

Definir procedimentos para resposta a incidentes operacionais.

Complementa:

- [[Politica de Risco]]
- [[Circuit Breakers]]
- [[Emergency Pause]]

---

## Principios

### Prioridade 1

Protecao dos usuarios.

### Prioridade 2

Preservacao da operacao.

### Prioridade 3

Retorno seguro a normalidade.

---

## Eventos Cobertos

### Falhas de Infraestrutura

- indisponibilidade;
- falhas de servicos;
- falha de RPC;
- falha de banco;
- divergencia banco vs on-chain.

### Falhas Operacionais

- erros de configuracao;
- falhas humanas;
- limite ultrapassado;
- proposta indevida.

### Falhas Externas

- problemas em protocolos integrados;
- eventos de mercado;
- oracle instavel;
- APY anormal;
- liquidez insuficiente.

### Eventos Criticos

- vulnerabilidades;
- comportamentos anormais;
- riscos sistemicos;
- risco de liquidacao;
- exploit ou suspeita de exploit.

---

## Procedimento Geral

1. Identificacao.
2. Analise.
3. Classificacao.
4. Mitigacao.
5. Monitoramento.
6. Retorno operacional.
7. Documentacao.

---

## Severidade

Usar os niveis definidos em:

- [[Circuit Breakers]]

Niveis:

- atencao;
- restricao;
- mitigacao;
- emergencia.

---

## Ferramentas

- [[Emergency Pause]]
- [[Safe]]
- [[Timelock]]
- [[Painel Administrativo]]
- [[Circuit Breakers]]

---

## Retorno a Normalidade

Retornar apenas quando:

- causa raiz foi identificada;
- risco foi mitigado;
- dados foram reconciliados;
- governanca aprovou quando necessario;
- auditoria foi registrada;
- runbook foi atualizado.

---

## Relacionamentos

- [[Gestao de Risco]]
- [[Limites Operacionais]]
- [[Operacao Geral]]
- [[Fluxos Operacionais]]
- [[Politica de Risco]]

---

## Filosofia

Agir rapidamente.

Comunicar claramente.

Retornar a operacao apenas quando houver seguranca.
