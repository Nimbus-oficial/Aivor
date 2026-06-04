# Banco de Dados

## Objetivo

Descrever a estratégia de armazenamento de dados da Aivor.

Relaciona-se com:

- [[PostgreSQL]]
    
- [[Redis]]
    
- [[PostgreSQL Schema]]
    
- [[Backend]]
    
- [[Eventos e Auditoria]]
    

---

## Visão Geral

A Aivor utiliza uma arquitetura híbrida de armazenamento.

Componentes principais:

- [[PostgreSQL]]
    
- [[Redis]]
    

---

## PostgreSQL

Responsável pelo armazenamento persistente de dados.

Utilizado para:

- usuários
    
- auditoria
    
- operações
    
- configurações
    
- histórico
    

Ver:

[[PostgreSQL]]

---

## Redis

Responsável por armazenamento temporário e otimização de desempenho.

Utilizado para:

- cache
    
- sessões
    
- filas
    
- rate limiting
    

Ver:

[[Redis]]

---

## Blockchain

O patrimônio dos usuários não é armazenado no banco de dados.

A custódia permanece nos smart contracts.

Ver:

[[Smart Contracts]]

---

## Princípios

A camada de dados deve ser:

- auditável
    
- resiliente
    
- escalável
    
- observável
    

---

## Relações

Ver:

- [[Backend API]]
    
- [[Eventos e Auditoria]]
    
- [[Logs Estruturados]]