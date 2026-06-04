# Permissões

## Objetivo

Definir quais entidades possuem autorização para executar ações dentro dos smart contracts da Aivor.

Relaciona-se com:

- [[OrvexVault]]
    
- [[OrvexController]]
    
- [[OrvexTreasury]]
    
- [[Multisig]]
    
- [[Timelock]]
    

---

## Princípio Fundamental

Nenhuma entidade isolada deve possuir controle absoluto sobre o patrimônio da plataforma.

---

## Usuários

Podem:

- depositar
    
- solicitar resgates
    
- consultar informações públicas
    

Não podem:

- alterar parâmetros
    
- movimentar tesouraria
    
- modificar estratégias
    

---

## Controller

Pode:

- executar estratégias aprovadas
    
- rebalancear posições
    
- interagir com protocolos autorizados
    

Não pode:

- alterar governança
    
- modificar permissões
    

---

## Multisig

Pode:

- aprovar ações críticas
    
- aprovar atualizações
    
- aprovar parâmetros operacionais
    

---

## Timelock

Responsável por aplicar período de espera antes da execução de ações críticas.

---

## Emergency Pause

Pode interromper operações previamente definidas em situações excepcionais.

---

## Objetivo

Garantir:

- separação de responsabilidades
    
- redução de risco operacional
    
- proteção patrimonial