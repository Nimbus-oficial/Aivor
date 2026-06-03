# Backend API

## Objetivo

Definir os princípios da camada de API da Orvex.

Relaciona-se com:

- [[Backend]]
    
- [[Frontend]]
    
- [[Painel Administrativo]]
    
- [[PostgreSQL Schema]]
    
- [[Eventos e Auditoria]]
    

---

## Função

O backend atua como camada de integração entre:

- Frontend
    
- Banco de Dados
    
- Blockchain
    
- Protocolos Externos
    

O backend não possui custódia de patrimônio.

Toda movimentação financeira ocorre através dos smart contracts.

Ver:

[[Smart Contracts]]

---

## Responsabilidades

### Usuários

- cadastro
    
- autenticação
    
- sessões
    

---

### Investimentos

- consulta de posições
    
- consulta de rendimento
    
- consulta de histórico
    

---

### Operação

- monitoramento
    
- auditoria
    
- observabilidade
    

---

## Princípios

O backend deve ser:

- auditável
    
- observável
    
- escalável
    
- desacoplado
    

---

## Integrações

Relaciona-se com:

- [[Privy]]
    
- [[Morpho]]
    
- [[Aave]]
    
- [[Aerodrome]]
    
- [[Uniswap]]
    
- [[Safe]]