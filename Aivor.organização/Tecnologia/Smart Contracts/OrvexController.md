# OrvexController

## Objetivo

Descrever o contrato responsável pela operação financeira da Aivor.

Relaciona-se com:

- [[OrvexVault]]
    
- [[OrvexTreasury]]
    
- [[Estratégia de Alocação]]
    
- [[Protocolos]]
    

---

## Função

Executar a lógica operacional da plataforma.

---

## Responsabilidades

### Alocação

Distribuir recursos entre protocolos aprovados.

---

### Rebalanceamento

Manter liquidez dentro das faixas definidas.

---

### Gestão de Risco

Aplicar limites operacionais.

---

### Integrações

Comunicar-se com:

- Morpho
    
- Aave
    
- Aerodrome
    
- Uniswap
    

---

## Limitações

O Controller não possui propriedade sobre os ativos.

Sua função é exclusivamente operacional.

---

## Governança

Alterações críticas devem seguir:

- Multisig
    
- Timelock
    

---

## Princípios

- modularidade
    
- auditabilidade
    
- previsibilidade