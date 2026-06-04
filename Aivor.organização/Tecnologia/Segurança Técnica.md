# Seguranca Tecnica

## Objetivo

Definir os principios de seguranca adotados pela Aivor.

Relaciona-se com:

- [[Permissoes]]
- [[Gestao de Chaves]]
- [[Modelo de Ameacas]]
- [[Resposta a Incidentes]]
- [[Emergency Pause]]

---

## Principios

A seguranca da Aivor deve priorizar:

- protecao patrimonial;
- menor privilegio possivel;
- auditabilidade;
- rastreabilidade;
- resiliencia operacional.

---

## Camadas de Seguranca

### Smart Contracts

Protecao do patrimonio.

### Infraestrutura

Protecao dos sistemas operacionais.

### Governanca

Protecao contra acoes indevidas.

### Operacao

Protecao contra falhas humanas.

---

## Diretrizes

Toda funcionalidade critica deve possuir:

- validacao;
- monitoramento;
- auditoria;
- mecanismos de recuperacao.

---

## Autenticacao Sem Custodia

A autenticacao real usa Privy como provedor de identidade.

O backend pode:

- validar tokens Privy;
- criar sessoes operacionais;
- vincular wallets verificadas a usuarios;
- aplicar permissoes operacionais;
- registrar auditoria.

O backend nao pode:

- armazenar chaves privadas;
- armazenar tokens Privy brutos;
- assinar transacoes;
- mover fundos;
- alterar saldo ou patrimonio de usuarios.

Sessoes da Aivor devem ser armazenadas como hash.

Rotas administrativas de escrita exigem papel `operator` ou `admin`.

Governanca Safe + Timelock continua necessaria para acoes criticas on-chain.

---

## Objetivo Final

Reduzir riscos tecnicos, operacionais e financeiros.
