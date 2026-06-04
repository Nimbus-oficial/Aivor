# Smart Contracts

## Objetivo

Descrever a arquitetura dos smart contracts da Aivor.

Relaciona-se com:

- [[OrvexVault]]
    
- [[OrvexController]]
    
- [[OrvexTreasury]]
    
- [[ERC4626]]
    
- [[Arquitetura Geral]]
    

---

## Visão Geral

A Aivor utiliza smart contracts como camada principal de custódia e movimentação financeira.

Os contratos são responsáveis por:

- depósitos
    
- saques
    
- emissão de shares
    
- alocação de recursos
    
- gestão de liquidez
    

---

## Estrutura

### [[OrvexVault]]

Contrato principal de patrimônio.

Responsável pela custódia dos ativos.

---

### [[OrvexController]]

Contrato responsável pela lógica operacional.

Responsável por:

- alocação
    
- rebalanceamento
    
- integração com protocolos
    

---

### [[OrvexTreasury]]

Contrato responsável pela tesouraria da plataforma.

Responsável por:

- receitas
    
- taxas
    
- reservas operacionais
    

---

## Governança

Ações críticas devem seguir:

- [[Multisig]]
    
- [[Timelock]]
    
- [[Emergency Pause]]
    

---

## Princípios

A arquitetura deve priorizar:

- segurança
    
- simplicidade
    
- auditabilidade
    
- modularidade