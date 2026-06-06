# Morpho Allocator Real

Status: testado em fork

## Objetivo

O Morpho Allocator Real conecta o Aivor Vault ao Morpho Blue de forma controlada.

Nesta fase ele existe apenas para design, testes unitarios e fork testing. Nao deve ser ativado com capital real sem nova aprovacao.

## Arquitetura

Fluxo previsto:

1. Aivor Vault recebe USDC.
2. Vault mantem liquidez idle conforme politica oficial.
3. Vault transfere excesso para o allocator.
4. Vault chama `deposit(assets)` no allocator.
5. Allocator valida circuit breakers.
6. Allocator executa `supply` no Morpho Blue.
7. Accounting do Vault passa por `allocator.totalAssets()`.
8. Saques chamam `allocator.withdraw(assets)` quando a liquidez idle nao for suficiente.

O backend nao assina transacoes, nao guarda chaves e nao movimenta fundos.

## Controles

O allocator deve respeitar:

- market allowlist;
- market enabled/disabled;
- protocol enabled/disabled;
- pause;
- max exposure por market;
- max exposure total;
- limite de utilizacao;
- limite de risco;
- freshness de dados;
- emergency withdraw via controller/governanca.

## Fluxos Testados

### Deposit -> Allocation -> Accounting -> Withdraw

1. Vault transfere USDC ao allocator.
2. Allocator faz supply no Morpho.
3. `totalAssets()` reflete a posicao.
4. `withdraw()` retorna USDC ao Vault.

### Deposit -> Allocation -> Yield -> Accounting -> Withdraw

1. Supply inicial e realizado.
2. Yield aumenta `totalSupplyAssets` no mercado simulado.
3. `totalAssets()` aumenta sem rebasing.
4. Withdraw retorna principal + yield disponivel.

### Deposit -> Allocation -> Emergency Withdraw

1. Supply inicial e realizado.
2. Controller chama `emergencyWithdraw`.
3. Liquidez disponivel retorna ao Vault.

## Fork Testing

Rede usada:

- Base Mainnet fork

Contratos:

- Morpho Blue: `0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb`
- USDC Base: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- Market USDC/cbBTC: `0x9103c3b4e834476c9a62ea009ba2c884ee42e94e6e314a26f04d312434191836`

O fork test valida:

- leitura real de `idToMarketParams`;
- inicializacao do allocator;
- market real com USDC como loan token;
- supply no Morpho dentro do fork local;
- withdraw no Morpho dentro do fork local;
- accounting apos supply e withdraw.

Nenhuma transacao foi enviada para a rede real.

## Eventos Previsto

- `MorphoAllocationExecuted`
- `MorphoWithdrawExecuted`
- `MorphoEmergencyWithdraw`
- `MorphoMarketLimitHit`
- `MorphoMarketBlocked`
- `MorphoRiskDataUpdated`

## Criterio para Capital Minimo

Antes de liberar qualquer capital minimo:

1. Deploy privado do allocator desativado por padrao.
2. Market aprovado por governanca.
3. Limites baixos configurados.
4. Freshness alimentada por backend/governanca.
5. Circuit breakers validados em fork.
6. Saque e emergency withdraw testados em fork.
7. Painel Admin mostrando exposicao real em read-only.
8. Safe/Timelock definidos para ativacao.
9. Revisao manual do market escolhido.
10. Aprovacao explicita para movimentar valor minimo.
