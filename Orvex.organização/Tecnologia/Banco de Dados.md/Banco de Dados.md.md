# BANCO DE DADOS

## Objetivo

Documentar a camada de armazenamento e processamento de dados da Orvex.

A Orvex utiliza uma arquitetura híbrida composta por um banco de dados relacional e uma camada de cache/filas.

---

## Componentes

### [[PostgreSQL]]

Banco de dados principal.

Responsável por:

- usuários
    
- sessões
    
- notificações
    
- analytics
    
- auditoria
    
- logs operacionais
    

---

### [[Redis]]

Camada de cache e processamento assíncrono.

Responsável por:

- cache
    
- filas
    
- eventos
    
- tarefas agendadas
    

---

## Filosofia

O banco de dados existe para armazenar informações operacionais da plataforma.

Nenhum fundo de usuário é armazenado ou controlado pelo banco de dados.

Toda movimentação financeira ocorre através dos [[Smart Contracts]].

---

## Relacionamentos

- [[Backend]]
    
- [[Observabilidade]]
    
- [[Infraestrutura]]
    
- [[Segurança Técnica]]
    
- [[PostgreSQL]]
    
- [[Redis]]