# ORVEX VAULT

## Objetivo

Contrato principal da Orvex.

Responsável pela interação direta com os usuários.

---

## Responsabilidades

### Depósitos

Receber [[USDC]].

---

### Emissão

Emitir [[ovUSDC]].

---

### Saques

Converter [[ovUSDC]] em [[USDC]].

---

### Contabilidade

Controlar:

- patrimônio total
    
- participações
    
- conversões
    

---

## Padrão

Baseado em:

[[ERC4626]]

---

## Fluxo

Usuário

↓

Depósito

↓

OrvexVault

↓

Emissão de ovUSDC

↓

Alocação

↓

Rendimento

↓

Saque

---

## Integrações

- [[OrvexController]]
    
- [[Morpho]]
    
- [[Base]]
    

---

## Relacionamentos

- [[USDC]]
    
- [[ovUSDC]]
    
- [[Fluxo Completo]]
    
- [[Arquitetura Geral]]
    

---

## Filosofia

O Vault é a porta de entrada e saída do patrimônio do usuário.