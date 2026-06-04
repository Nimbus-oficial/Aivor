# Fluxo Completo

## Objetivo

Descrever o fluxo operacional completo da Aivor, desde o depósito do usuário até a geração de rendimento.

Relaciona-se com:

- [[Arquitetura Geral]]
    
- [[ERC4626]]
    
- [[ovUSDC]]
    
- [[USDC]]
    
- [[EURC]]
    
- [[Estratégia de Alocação]]
    

---

## Visão Geral

A Aivor permite que usuários depositem ativos elegíveis e recebam participação no patrimônio consolidado da plataforma.

Ativos suportados inicialmente:

- [[USDC]]
    
- [[EURC]]
    

Participação representada por:

- [[ovUSDC]]
    

---

## Fluxo de Depósito

### Etapa 1

O usuário realiza um depósito utilizando:

- [[USDC]]
    
- [[EURC]]
    

---

### Etapa 2

O smart contract recebe o ativo depositado.

---

### Etapa 3

O patrimônio do vault é atualizado.

---

### Etapa 4

O usuário recebe:

[[ovUSDC]]

representando sua participação proporcional no patrimônio consolidado da Aivor.

---

## Estrutura do Vault

O vault principal pode manter múltiplos ativos simultaneamente.

Inicialmente:

- [[USDC]]
    
- [[EURC]]
    

Todos os usuários compartilham o mesmo patrimônio operacional.

---

## Liquidez

Parte dos recursos permanece disponível para:

- saques
    
- rebalanceamentos
    
- operações de emergência
    

Ver:

- [[Liquidez]]
    
- [[Parâmetros Operacionais]]
    

---

## Alocação

Os recursos podem ser distribuídos entre protocolos aprovados.

Protocolos previstos:

- [[Morpho]]
    
- [[Aave]]
    
- [[Aerodrome]]
    
- [[Uniswap]]
    

Ver:

[[Estratégia de Alocação]]

---

## Geração de Rendimento

Os protocolos utilizados geram rendimento para o patrimônio do vault.

O crescimento do patrimônio beneficia todos os detentores de:

[[ovUSDC]]

---

## Resgate

### Etapa 1

O usuário solicita saque.

---

### Etapa 2

O sistema calcula sua participação proporcional.

---

### Etapa 3

O ovUSDC correspondente é queimado.

---

### Etapa 4

O usuário recebe o valor correspondente conforme as regras operacionais da plataforma.

---

## Governança

Toda alteração relevante segue os mecanismos definidos em:

- [[Governança Geral]]
    
- [[Multisig]]
    
- [[Timelock]]
    
- [[Emergency Pause]]
    

---

## Objetivo Final

Permitir acesso simples a rendimento em moedas fortes através de uma única experiência integrada, transparente e auditável.