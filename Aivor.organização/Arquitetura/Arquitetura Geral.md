# Arquitetura Geral

## Objetivo

Descrever a arquitetura da Aivor e a relação entre seus principais componentes.

Relaciona-se com:

- [[Fluxo Completo]]
    
- [[ERC4626]]
    
- [[ovUSDC]]
    
- [[USDC]]
    
- [[EURC]]
    
- [[Backend]]
    
- [[Smart Contracts]]
    
- [[Frontend]]
    

---

## Visão Geral

A Aivor é composta por três camadas principais:

### Frontend

Responsável pela experiência do usuário.

Funções:

- autenticação
    
- depósitos
    
- saques
    
- acompanhamento de rendimento
    

Ver:

[[Frontend]]

---

### Backend

Responsável pela camada operacional.

Funções:

- integração de sistemas
    
- monitoramento
    
- auditoria
    
- observabilidade
    

O backend não possui custódia de patrimônio.

Ver:

[[Backend]]

---

### Smart Contracts

Responsáveis pela custódia e movimentação financeira.

Funções:

- depósitos
    
- saques
    
- emissão de shares
    
- integração com protocolos
    

Ver:

[[Smart Contracts]]

---

## Ativos

Ativos suportados inicialmente:

- [[USDC]]
    
- [[EURC]]
    

---

## Shares

Os depósitos dos usuários são representados por shares.

Ver:

[[ERC4626]]  
[[ovUSDC]]

---

## Protocolos

A Aivor pode utilizar:

- [[Morpho]]
    
- [[Aave]]
    
- [[Aerodrome]]
    
- [[Uniswap]]
    

---

## Governança

Alterações críticas seguem os mecanismos definidos em:

- [[Multisig]]
    
- [[Timelock]]
    
- [[Emergency Pause]]
    

---

## Princípios

A arquitetura prioriza:

- simplicidade
    
- auditabilidade
    
- segurança
    
- escalabilidade
    
- transparência