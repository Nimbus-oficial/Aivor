# Safe

## Objetivo

Fornecer aprovacao institucional por multisig para a governanca operacional da Aivor.

---

## Modelo Oficial

Safe 2-of-4.

Participantes previstos:

- CEO;
- Administrador operacional;
- Diretor de risco e compliance;
- Assinante backup.

---

## Fase Atual

A Fase 7 implementa apenas:

- configuracao do Safe;
- leitura basica em modo `safe_readonly`;
- validacao de endereco;
- validacao de chainId quando RPC estiver disponivel;
- associacao de propostas administrativas ao Safe configurado.

---

## Fora do Escopo Atual

O backend nao:

- cria transacoes reais no Safe;
- assina transacoes;
- executa operacoes on-chain;
- movimenta fundos;
- substitui a aprovacao institucional.

---

## Variaveis

- `SAFE_ADDRESS`
- `SAFE_CHAIN_ID`
- `SAFE_API_URL`
- `GOVERNANCE_MODE`

`GOVERNANCE_MODE=safe_readonly` habilita consulta basica.

`GOVERNANCE_MODE=simulated` mantem toda governanca em modo operacional simulado.

---

## Relacionamentos

- [[Integrações]]
- [[Governança Geral]]
- [[Timelock]]
- [[Mapeamento de Papéis]]
- [[Emergency Pause]]

---

## Filosofia

Nenhuma decisao critica deve depender de uma unica pessoa.
