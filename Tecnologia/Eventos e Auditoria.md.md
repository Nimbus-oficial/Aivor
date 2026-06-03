# Eventos e Auditoria

## Objetivo

Garantir rastreabilidade das ações executadas dentro da Orvex.

Relaciona-se com:

- [[Backend API]]
    
- [[PostgreSQL Schema]]
    
- [[Observabilidade Técnica]]
    
- [[Logs Estruturados]]
    

---

## Eventos Registrados

### Usuários

- login
    
- logout
    
- criação de conta
    

---

### Operação

- alterações administrativas
    
- mudanças de configuração
    
- rebalanceamentos
    

---

### Governança

- aprovações
    
- execuções
    
- pausas de emergência
    

Ver:

- [[Multisig]]
    
- [[Timelock]]
    
- [[Emergency Pause]]
    

---

## Auditoria

Toda ação relevante deve possuir:

- data
    
- responsável
    
- tipo de ação
    
- origem
    
- resultado
    

---

## Objetivos

Permitir:

- investigação
    
- monitoramento
    
- conformidade
    
- rastreabilidade
    

---

## Princípios

Nenhuma ação crítica deve ocorrer sem registro auditável.