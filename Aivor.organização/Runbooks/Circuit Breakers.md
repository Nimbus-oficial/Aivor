# Runbook - Circuit Breakers

## Objetivo

Definir como identificar, classificar e responder a circuit breakers da Aivor.

Referencia:

- [[Politica de Risco]]
- [[Manual de Emergencia]]
- [[Painel Administrativo]]

---

## Niveis de Severidade

### Nivel 1 - Atencao

Sinal anormal sem risco imediato.

Acoes:

- registrar alerta;
- revisar dados;
- acompanhar evolucao;
- nao aumentar exposicao.

### Nivel 2 - Restricao

Risco relevante ou anomalia persistente.

Acoes:

- bloquear novas alocacoes;
- criar proposta de revisao;
- notificar operador e admin;
- preparar reducao de exposicao.

### Nivel 3 - Mitigacao

Risco material para liquidez, estrategia ou protocolo.

Acoes:

- reduzir exposicao se seguro;
- pausar modulo;
- acionar governanca;
- documentar incidente.

### Nivel 4 - Emergencia

Risco iminente de perda, exploit ou incapacidade de monitoramento.

Acoes:

- acionar emergency pause quando aplicavel;
- interromper novas alocacoes;
- preservar liquidez;
- iniciar comunicacao de incidente;
- registrar auditoria completa.

---

## Circuit Breakers Cobertos

### Liquidez

Gatilhos:

- liquidez abaixo de 2%;
- queda rapida de liquidez;
- saques fora do padrao;
- retirada de protocolo falhando.

Acoes:

- bloquear novas alocacoes;
- recompor liquidez;
- revisar exposicoes;
- avaliar emergency pause.

### APY Anormal

Gatilhos:

- APY muito acima do historico;
- APY negativo inesperado;
- divergencia entre fontes.

Acoes:

- bloquear aumento de exposicao;
- revisar fontes;
- marcar estrategia como restrita.

### Protocolo

Gatilhos:

- exploit;
- protocolo pausado;
- retirada falhando;
- mudanca critica de contrato.

Acoes:

- bloquear alocacoes;
- reduzir exposicao se seguro;
- abrir incidente;
- acionar governanca.

### Oracle

Gatilhos:

- stale price;
- preco divergente;
- fonte indisponivel;
- suspeita de manipulacao.

Acoes:

- bloquear looping/leverage;
- bloquear estrategias dependentes;
- reduzir exposicao se houver risco de liquidacao.

### Liquidacao

Gatilhos:

- health factor abaixo do limite;
- borrow rate anormal;
- liquidez de unwind insuficiente.

Acoes:

- bloquear aumento de leverage;
- executar plano de reducao aprovado;
- escalar para emergencia se risco for iminente.

### Banco vs On-chain

Gatilhos:

- snapshot divergente;
- evento nao indexado;
- share price divergente;
- saldo operacional inconsistente.

Acoes:

- tratar on-chain como fonte final;
- marcar dados como inconsistentes;
- bloquear decisoes automaticas;
- registrar auditoria.

### RPC

Gatilhos:

- RPC indisponivel;
- chainId divergente;
- erro recorrente de chamada;
- resposta inconsistente.

Acoes:

- degradar modo operacional;
- bloquear execucoes dependentes;
- alertar painel;
- trocar provider somente por configuracao aprovada.

### Safe/Timelock

Gatilhos:

- Safe API indisponivel;
- owners divergentes;
- threshold divergente;
- Timelock indisponivel;
- delay divergente.

Acoes:

- bloquear ativacoes criticas;
- impedir `limited_capital` ou `active`;
- revisar configuracao;
- registrar incidente.

---

## Registro Obrigatorio

Todo circuit breaker deve gerar:

- evento;
- audit log;
- severidade;
- modulo afetado;
- origem do alerta;
- responsavel;
- acao tomada;
- status final.

---

## Retorno a Normalidade

Um modulo so retorna ao status anterior quando:

- causa raiz foi identificada;
- dados foram reconciliados;
- risco foi reduzido;
- governanca aprovou quando necessario;
- runbook foi atualizado;
- auditoria foi registrada.
