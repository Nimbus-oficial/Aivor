# EURC

## Objetivo

Descrever o papel da EURC dentro da arquitetura da Orvex.

Relaciona-se com:

- [[Arquitetura Geral]]
    
- [[USDC]]
    
- [[ERC4626]]
    
- [[ovUSDC]]
    
- [[Fluxo Completo]]
    
- [[Moedas Suportadas]]
    

---

## Definição

EURC é uma stablecoin vinculada ao euro.

Representa uma das moedas base suportadas pela Orvex.

---

## Funções

Pode ser utilizada para:

- depósitos
    
- saques
    
- liquidez
    
- estratégias de rendimento
    

---

## Papel na Arquitetura

A EURC compõe o patrimônio operacional da Orvex juntamente com a USDC.

A plataforma aceita ambas as moedas como ativos de entrada.

---

## Relação com o Vault

A Orvex opera através de um único vault principal.

Os ativos depositados podem coexistir dentro da mesma estrutura operacional.

A participação econômica dos usuários é representada através do:

[[ovUSDC]]

---

## Relação com USDC

A Orvex aceita inicialmente:

- [[USDC]]
    
- [[EURC]]
    

Ambos os ativos podem compor o patrimônio do vault principal.

---

## Participação do Usuário

Independentemente da moeda utilizada no depósito, a participação econômica do usuário é representada pelo:

[[ovUSDC]]

O ovUSDC representa participação proporcional no patrimônio consolidado do vault.

---

## Princípios

A utilização da EURC deve respeitar:

- liquidez adequada
    
- gestão de risco
    
- transparência operacional
    
- compatibilidade com a arquitetura da Orvex