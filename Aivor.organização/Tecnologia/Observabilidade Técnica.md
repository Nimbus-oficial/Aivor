# Observabilidade Técnica

## Objetivo

Garantir visibilidade sobre o funcionamento da plataforma.

Relaciona-se com:

- [[Logs Estruturados]]
    
- [[Backend API]]
    
- [[Infraestrutura]]
    
- [[Eventos e Auditoria]]
    

---

## Componentes

### Logs

Registro de eventos e atividades.

Ver:

[[Logs Estruturados]]

---

### Métricas

Monitoramento de desempenho e utilização.

---

### Alertas

Notificações automáticas para situações críticas.

---

### Auditoria

Rastreabilidade de ações relevantes.

Ver:

[[Eventos e Auditoria]]

---

## Monitoramento

Deve existir monitoramento para:

### Backend

- disponibilidade
    
- desempenho
    
- falhas
    

---

### Banco de Dados

- disponibilidade
    
- utilização
    
- integridade
    

---

### Blockchain

- transações
    
- confirmações
    
- falhas
    

---

### Protocolos Externos

- Morpho
    
- Aave
    
- Aerodrome
    
- Uniswap
    

---

## Objetivos

Permitir:

- diagnóstico rápido
    
- prevenção de falhas
    
- melhoria contínua
    
- estabilidade operacional
---

## RPC

O backend deve expor visibilidade minima da camada on-chain.

Endpoints relacionados:

- `GET /health/rpc`;
- `GET /vault/onchain/config`;
- `GET /vault/onchain/status`;
- `GET /vault/onchain/vault`.

Eventos relevantes de leitura RPC devem gerar logs estruturados.

Erros de RPC devem registrar:

- metodo;
- origem;
- resultado;
- mensagem de erro sem expor segredos.

O health RPC valida apenas disponibilidade e leitura.

Ele nao representa autorizacao para transacoes, capital real ou estrategias reais.

---

## Autenticacao

A camada de autenticacao deve registrar logs estruturados para:

- login com sucesso;
- falha de autenticacao;
- logout;
- vinculo de carteira;
- tentativa de acesso sem permissao.

Metadados permitidos:

- userId operacional;
- provider;
- resultado;
- origem;
- motivo de erro sem expor tokens.

Metadados proibidos:

- access token Privy;
- identity token Privy;
- session token bruto;
- `PRIVY_APP_SECRET`;
- chaves privadas.
