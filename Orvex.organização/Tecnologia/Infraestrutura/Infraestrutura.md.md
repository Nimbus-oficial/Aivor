# INFRAESTRUTURA

## Objetivo

Documentar a infraestrutura operacional da Orvex.

A infraestrutura é responsável por disponibilizar os serviços da plataforma para usuários e administradores.

---

## Componentes

### [[Vercel]]

Responsável pelo Frontend.

Hospeda:

- Landing Page
    
- Dashboard
    
- Painel do Usuário
    

---

### [[Railway]]

Responsável pelo Backend.

Hospeda:

- APIs
    
- Serviços internos
    
- Analytics
    
- Notificações
    

---

### [[Cloudflare]]

Responsável por:

- DNS
    
- CDN
    
- Proteção
    
- Performance
    

---

## Fluxo

Usuário

↓

[[Cloudflare]]

↓

[[Vercel]]

↓

[[Backend]]

↓

[[PostgreSQL]]

↓

[[Redis]]

---

## Relacionamentos

- [[Frontend]]
    
- [[Backend]]
    
- [[Banco de Dados]]
    
- [[CI-CD]]
    
- [[Observabilidade]]
    

---

## Filosofia

Infraestrutura simples.

Escalabilidade progressiva.

Baixo custo operacional inicial.