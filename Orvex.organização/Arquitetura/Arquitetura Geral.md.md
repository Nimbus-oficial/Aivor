# ARQUITETURA GERAL

## Objetivo

Documentar a arquitetura tecnológica da Orvex e as relações entre seus componentes.

---

## Filosofia

A Orvex foi construída seguindo os princípios:

- simplicidade
    
- segurança
    
- modularidade
    
- escalabilidade
    

---

## Camadas da Plataforma

### Interface

Responsável pela experiência do usuário.

Ver:

- [[Frontend]]
    
- [[Jornada do Usuário]]
    
- [[Painel Administrativo]]
    

---

### Backend

Responsável pelos serviços de suporte.

Ver:

- [[Backend]]
    
- [[PostgreSQL]]
    
- [[Redis]]
    
- [[Privy]]
    
- [[Observabilidade]]
    

Importante:

O backend não possui custódia dos ativos dos usuários.

---

### Blockchain

Responsável pela execução financeira.

Ver:

- [[Smart Contracts]]
    
- [[OrvexVault]]
    
- [[OrvexController]]
    
- [[OrvexTreasury]]
    

---

### Estratégia

Responsável pela geração de rendimento.

Ver:

- [[Estratégia Morpho]]
    
- [[Morpho]]
    
- [[Limites Operacionais]]
    
- [[Gestão de Risco]]
    

---

### Governança

Responsável pelas aprovações críticas.

Ver:

- [[Governança Geral]]
    
- [[Mapeamento de Papéis]]
    
- [[Multisig]]
    
- [[Timelock]]
    
- [[Emergency Pause]]
    

---

## Fluxo Principal

Usuário

↓

[[Frontend]]

↓

[[Backend]]

↓

[[OrvexVault]]

↓

[[Morpho]]

↓

Rendimento

---

## Infraestrutura

Ver:

- [[Base]]
    
- [[Cloudflare]]
    
- [[Vercel]]
    
- [[Railway]]
    
- [[GitHub Actions]]
    

---

## Segurança

Ver:

- [[Gestão de Risco]]
    
- [[Manual de Emergência]]
    
- [[Emergency Pause]]
    
- [[Safe]]
    

---

## Documentos Relacionados

- [[Produto Principal]]
    
- [[Operação Geral]]
    
- [[Governança Geral]]
    
- [[Integrações]]