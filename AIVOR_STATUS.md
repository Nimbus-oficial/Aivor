# Aivor - Status do Projeto

Este arquivo resume, em linguagem simples, o que foi feito ate agora e o que ainda falta.

## O que foi feito

Foi criada a estrutura inicial da Aivor como um monorepo, ou seja, uma pasta principal que organiza todas as partes do produto:

- `apps/web`: aplicativo visual da Aivor, pensado como uma fintech moderna.
- `apps/backend`: backend em NestJS, apenas para conta, suporte, notificacoes, analytics e observabilidade.
- `packages/ui`: componentes visuais compartilhados.
- `packages/types`: tipos compartilhados entre frontend e backend.
- `packages/sdk`: camada simples para o app conversar com dados da conta/vault.
- `packages/config`: configuracoes compartilhadas.
- `contracts`: contratos Solidity do vault.

Tambem foi criada uma primeira tela do aplicativo com:

- saldo em dolar,
- rendimento,
- crescimento,
- botao para adicionar saldo,
- botao para sacar,
- atividades recentes,
- assistente IA,
- visual limpo, premium e sem linguagem cripto.

No backend, foram criados os modulos principais:

- Auth,
- User,
- Vault,
- Analytics,
- Notification,
- AI,
- Security,
- Observability.

Nos contratos, foram criados:

- `OrvexVault.sol`,
- `OrvexTreasury.sol`,
- `OrvexController.sol`.

Tambem foi definido o modelo do token interno do vault:

- ticker tecnico: `ovUSDC`,
- nome tecnico: `Orvex Yield USDC`,
- modelo: ERC4626-style yield-bearing shares,
- comportamento: nao rebasing,
- valorizacao: o saldo cresce pelo preco da share, nao pelo aumento da quantidade de tokens.

Exemplo do modelo:

- deposito inicial: `1 ovUSDC = 1 USDC`,
- com rendimento: `1 ovUSDC > 1 USDC`.

O usuario comum nao deve ver essa complexidade. O frontend deve mostrar apenas saldo em USD, rendimento e crescimento patrimonial.

Foi adicionada uma rota inicial de painel administrativo em `apps/web/app/admin`, seguindo a identidade visual escura/azul da marca.

## O que ainda falta

Ainda falta transformar essa base inicial em um produto real e conectado.

Principais proximos passos:

- Instalar Node.js/npm nesta maquina ou usar um ambiente que ja tenha Node.
- Instalar Foundry para compilar e testar os contratos Solidity.
- Instalar as dependencias do projeto.
- Rodar o aplicativo web localmente.
- Rodar o backend localmente.
- Escrever testes completos dos contratos.
- Fazer auditoria de seguranca antes de qualquer deploy real.
- Configurar Privy para login com Google, Apple e Email.
- Configurar banco de dados PostgreSQL.
- Configurar Redis.
- Configurar deploy na Vercel e Railway.
- Configurar CI/CD no GitHub Actions.
- Conectar com contratos reais em Base.
- Conectar o painel admin a operacoes reais assinadas por Safe Multisig.
- Implementar markets Morpho reais e rebalanceamento real dentro dos limites dos contratos.

## Existe vinculo real com Morpho?

Ainda nao.

O que existe agora e uma preparacao tecnica para conectar com Morpho.

No contrato `OrvexVault.sol`, existe uma interface chamada `IMorphoAllocator`. Ela representa o modulo que futuramente vai conversar com o Morpho.

Em termos simples:

- o vault ja sabe que precisa manter 5% em liquidez interna, com faixa oficial de 2% minimo e 7% maximo,
- o vault ja sabe que 90% deve ir para uma estrategia externa,
- mas o endereco real, a estrategia real e a integracao real com Morpho ainda precisam ser implementados, testados e auditados.

Isso e intencional. Nao seria seguro fingir uma conexao real com Morpho sem configurar o mercado correto, endereco correto, rede correta, testes e auditoria.

## O backend controla dinheiro?

Nao.

Pela arquitetura criada, o backend existe para suporte ao produto:

- login,
- perfil,
- analytics,
- notificacoes,
- IA,
- monitoramento.

O backend nao deve sacar fundos, mover dinheiro do usuario ou controlar o vault.

## Como deve funcionar o painel admin?

A arquitetura definida e:

`Admin Panel -> OrvexController.sol -> OrvexVault.sol -> Morpho Markets`

O painel admin deve ser limitado. Ele pode servir para operacao, estrategias, monitoramento, rebalanceamento autorizado e observabilidade.

O painel admin nao pode:

- custodiar fundos diretamente,
- sacar fundos arbitrariamente,
- transferir saldo de usuarios,
- alterar shares de usuarios,
- alterar patrimonio manualmente.

Funcoes criticas devem passar por Safe Multisig, com modelo aprovado de 2-of-4. Mudancas criticas de estrategia devem ter timelock, com janela inicial recomendada de 24h ou mais.

Controles de emergencia devem existir para pausar depositos, pausar estrategias, ativar emergency shutdown e puxar liquidez de volta para o vault sem transferir fundos para administradores.

## A IA pode movimentar dinheiro?

Nao.

A IA foi planejada apenas para:

- onboarding,
- suporte,
- duvidas sobre a conta.

Ela nao recomenda investimento e nao movimenta fundos.

## O produto ja esta pronto?

Nao.

O que existe agora e a fundacao inicial do projeto. Pense nisso como a planta e a primeira estrutura de um predio, nao como o banco funcionando com dinheiro real.

## Decisao oficial da V1

A V1 da Aivor foi atualizada para uma V1 Modular Completa, com ativacao progressiva por risco.

A arquitetura da V1 inclui USDC, EURC, ovUSDC, Morpho, Aave, Uniswap, Aerodrome, Safe, Timelock, Painel Admin, Governanca, Liquidez, Auditoria, Looping, Leverage, Tesouraria e estrategias automaticas.

Isso nao significa que todos os modulos ficam ativos ao mesmo tempo.

Cada modulo deve evoluir por status:

- `documented`,
- `simulated`,
- `read_only`,
- `testnet`,
- `limited_capital`,
- `active`,
- `disabled`.

Capital real exige testes, auditoria, limites operacionais e aprovacao de governanca conforme o risco do modulo.

## Private Mainnet Validation

Status: concluida.

Esta validacao foi privada, nao publica, sem usuarios externos, sem captacao, sem Morpho real e sem mocks. O objetivo foi provar o fluxo tecnico minimo do ERC4626 em Base Mainnet com USDC real de valor minimo e carteira propria.

Contratos da validacao privada:

- Vault: `0x0Ad107434e35b91a72a98663696Fc73BAA19dc1E`
- Controller: `0x6B1eC9fbdD4d935B569ea4732d15F1126a7e444b`
- Treasury: `0xFC0D792D85aaA0F2a01E5a75a4b57900E5e5e3DD`
- USDC Base: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- Validation wallet: `0x92987bd92929047449Df90040eED33D0Bd277624`

Resultado validado:

- deploy realizado em Base Mainnet;
- vault funcional em `idleOnlyMode`;
- `privateValidationMode` restringindo deposito a validation wallet;
- deposit de `0,10 USDC` aprovado;
- withdraw total aprovado;
- share accounting aprovado;
- `100000` unidades de ovUSDC emitidas e queimadas;
- USDC recuperado integralmente;
- `totalAssets` voltou para `0`;
- `totalSupply` voltou para `0`;
- `sharePrice` permaneceu em `1.000000`;
- nenhum mock utilizado;
- nenhuma integracao Morpho utilizada;
- nenhum usuario externo participou.

Transacoes da validacao:

- Approve: `0xeadea88d236aae7070adf3734001ad612f119093a7929b1a07561a010afd9446`
- Deposit: `0xc8c4517c0791e9f8fbac9ceb48677a506f2cc3bffdbb4aac53891097d8663e31`
- Withdraw: `0x3100deb56cecd6abb7e36ae25990740a7ea41f177af40c9eedae23b242ccb17d`

Riscos remanescentes:

- a chave usada na validacao deve ser considerada dev-only e nao deve ser reutilizada para producao ou valores relevantes;
- o pause operacional exige multisig e nao pode ser executado pela EOA de validacao;
- os contratos provaram o fluxo idle-only, mas ainda nao provaram rendimento real, Morpho, rebalanceamento, filas de governanca reais ou operacao multiusuario;
- os contratos da validacao privada nao devem ser tratados como deploy de producao.

Licoes aprendidas:

- o modo idle-only e suficiente para provar o fluxo ERC4626 minimo sem allocator;
- o cap baixo e a validation wallet reduziram a superficie de uso publico;
- scripts de validacao precisam separar teste de deposit/withdraw de acoes administrativas protegidas por multisig;
- a proxima fase deve focar em adapter Morpho, limites e simulacao operacional antes de qualquer capital relevante.

Contratos reaproveitaveis na proxima fase:

- `OrvexVault` pode ser reaproveitado como base tecnica, preservando ERC4626 e revisando o caminho com allocator real;
- `OrvexController` pode ser reaproveitado como base de governanca operacional;
- `OrvexTreasury` pode ser reaproveitado como base simples, ainda sem tesouraria real;
- os scripts private mainnet devem permanecer apenas como ferramenta de validacao privada, nao como deploy publico.

Percentuais estimados apos a validacao:

- Smart Contracts: 68%
- Backend: 72%
- Banco de Dados: 70%
- Integracoes: 50%
- Governanca: 58%
- Painel Admin: 45%
- Frontend publico: 35%
- Observabilidade: 45%
- Projeto Geral: 55%

## Fase 10.3 - Morpho Market Approval, Staleness e Risk History

Status: concluida operacionalmente com PostgreSQL remoto/Railway.

Validado:

- `GET /health/morpho` com Morpho real em Base;
- `GET /morpho/markets` com dados reais da Morpho GraphQL API;
- `GET /morpho/markets/:marketId` retornando detalhe de mercado e approval;
- `GET /morpho/markets/:marketId/risk-history` retornando snapshots persistidos;
- `POST /morpho/markets/:marketId/approve` com admin;
- `POST /morpho/markets/:marketId/reject` com admin;
- `POST /morpho/markets/:marketId/disable` com admin;
- bloqueio de usuario comum com `403`;
- auditoria persistida para approval, reject, disable, snapshot e permission denied;
- tabelas `morpho_market_approvals` e `morpho_market_risk_snapshots` criadas;
- staleness funcionando em `/health/morpho`;
- backend build passando;
- backend schema test passando;
- typecheck de types, SDK e web passando.

Resultado da migration:

- `001_initial_schema.sql`: aplicado;
- `002_privy_auth_foundation.sql`: aplicado;
- `003_governance_proposals.sql`: aplicado;
- `004_morpho_market_risk.sql`: aplicado.

Resultado operacional:

- approvals persistidos: `1`;
- risk snapshots persistidos: `4`;
- Morpho health: `ok`;
- fonte: `real`;
- chainId: `8453`;
- stale: `false`;
- fallback: `false`.

Antes de qualquer uso real com fundos, ainda sao obrigatorios:

- testes automatizados,
- revisao de seguranca,
- auditoria,
- integracao real com Morpho,
- deploy em testnet,
- validacao operacional,
- deploy controlado em producao.

## Fase 10.9E - Novo conjunto Morpho-Controlled

Status: implementado em codigo, sem deploy.

A revisao Go/No-Go mostrou que o conjunto V1 privado nao deve receber capital no Morpho porque o Vault atual e `idleOnlyMode` e o Controller atual nao possui caminho governado para operar o allocator.

Decisao aplicada: preparar novo conjunto V2:

- `AivorVaultV2`;
- `AivorControllerV2`;
- `MorphoAllocatorV2`.

Arquitetura V2:

- Vault V2 conectado ao Allocator V2 desde o deploy;
- Controller V2 com funcoes governadas para `setProtocolEnabled`, `setMarketEnabled`, `updateRiskData`, limites e emergencia;
- Allocator V2 nasce desativado, sem market habilitado, sem capital e com limite inicial de `1 USDC`;
- scripts privados separados para deploy e validacao read-only;
- painel admin reconhece V1 idle-only e V2 morpho-controlled como conjuntos separados.

Nada foi deployado nesta fase. Nenhum USDC foi movido, nenhum approve foi feito, nenhum supply foi executado e nenhum protocolo ou market foi ativado.

Percentuais estimados apos a Fase 10.9E:

- Smart Contracts: 76%;
- Backend: 75%;
- Banco de Dados: 70%;
- Integracoes: 60%;
- Governanca: 64%;
- Painel Admin: 52%;
- Frontend publico: 35%;
- Observabilidade: 52%;
- Projeto Geral: 61%.

## Resumo simples

Foi criada a base inicial da Aivor como uma fintech Web3 premium.

Ainda nao ha dinheiro real, Morpho real, deploy real ou aplicativo rodando em producao.

O proximo passo recomendado e preparar o ambiente de desenvolvimento, instalar dependencias e validar a aplicacao localmente.

O ambiente Node local ja foi validado com `npm.cmd`: typecheck e build passam.

Foundry foi instalado localmente e os testes Solidity passam com `forge test`.

Resultado atual dos contratos:

- 6 testes passando,
- 0 falhas,
- `OrvexVault` compila com Solc 0.8.26,
- Foundry/forge 1.7.1.

O backend agora expoe endpoints REST somente de leitura para o vault:

- `/vault/account-summary`,
- `/vault/operational-policy`,
- `/vault/admin-overview`.

Esses endpoints servem para UX, analytics e painel operacional. Eles nao movimentam fundos e nao executam operacoes administrativas.

Foi adicionada uma camada inicial de leitura on-chain no backend:

- servico: `VaultChainService`,
- variaveis necessarias: `ORVEX_RPC_URL` e `ORVEX_VAULT_ADDRESS`,
- chamadas lidas por RPC: `totalAssets`, `sharePrice`, `paused`, `strategiesPaused`, `emergencyShutdown`, `idleLiquidityBps`, `asset` e saldo USDC disponivel no vault,
- comportamento seguro: se RPC ou endereco nao estiverem configurados, o backend usa dados mockados para desenvolvimento local.

Essa camada e apenas de leitura. Ela nao assina transacoes, nao altera estrategias, nao move saldo de usuarios e nao controla fundos.

O frontend agora consome esses endpoints pelo SDK:

- a tela principal busca `/vault/account-summary`,
- o painel admin busca `/vault/admin-overview`,
- o SDK mantem fallback local para build e desenvolvimento quando a API nao estiver rodando.

Foi feita verificacao local com backend e web rodando:

- `http://127.0.0.1:3000` carregou saldo e metricas da conta,
- `http://127.0.0.1:3000/admin` carregou multisig, timelock, strategies e `ovUSDC`,
- sem erros de console no navegador.

Identidade visual incorporada do PDF:

- tipografia: Grotesk/Helvetica,
- escuro: `#15181A`,
- medio: `#222529`,
- cinza: `#383B3E`,
- texto secundario: `#6F7174` e `#9C9D9F`,
- branco: `#FFFFFF`,
- destaque azul: `#2973FF`, `#5792FF`, `#C4DAFF`.
