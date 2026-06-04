# OrvexVault

## Objetivo

Descrever o contrato principal de patrimônio da Aivor.

Relaciona-se com:

- [[ERC4626]]
    
- [[ovUSDC]]
    
- [[OrvexController]]
    
- [[Fluxo Completo]]
    

---

## Função

O OrvexVault é o contrato responsável pela custódia dos ativos dos usuários.

---

## Ativos Aceitos

Inicialmente:

- USDC
    
- EURC
    

---

## Responsabilidades

### Depósitos

Receber ativos elegíveis.

---

### Resgates

Executar saques autorizados.

---

### Shares

Emitir e queimar:

[[ovUSDC]]

---

### Patrimônio

Manter o patrimônio consolidado da plataforma.

---

## Relação com o Controller

O Vault não toma decisões de investimento.

A lógica operacional é delegada ao:

[[OrvexController]]

---

## Segurança

O patrimônio dos usuários permanece protegido dentro do Vault.

Nenhum componente externo possui custódia direta dos recursos.

---

## Princípios

- segurança
    
- transparência
    
- auditabilidade
    
- isolamento de responsabilidades