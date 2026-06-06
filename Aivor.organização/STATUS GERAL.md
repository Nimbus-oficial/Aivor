# Status Geral

## Objetivo

Registrar o estado atual da Aivor.

Esta nota serve como visao executiva do projeto e deve ser atualizada conforme novas etapas forem concluidas.

Ultima atualizacao: Junho de 2026.

---

## Visao Geral

A Aivor encontra-se na fase de estruturacao estrategica e desenvolvimento inicial.

A fundacao institucional, operacional e tecnologica ja foi definida.

A decisao oficial da V1 e:

- [[Aivor V1 Modular Completa]]

Aivor V1 sera modular, com ativacao progressiva por risco.

Isso significa que a arquitetura da V1 contempla todos os modulos aprovados, mas a operacao ativa cada modulo apenas conforme testes, auditoria, limites e governanca.

---

## V1 Modular Completa

A V1 inclui:

- USDC;
- EURC;
- ovUSDC;
- Morpho;
- Aave;
- Uniswap;
- Aerodrome;
- Safe;
- Timelock;
- Painel Admin;
- Governanca;
- Liquidez;
- Auditoria;
- Looping;
- Leverage;
- Tesouraria;
- estrategias automaticas.

Nem todos os modulos serao ativados simultaneamente.

Cada modulo deve usar um status operacional:

- `documented`;
- `simulated`;
- `read_only`;
- `testnet`;
- `limited_capital`;
- `active`;
- `disabled`.

---

## Status por Area

### Marca

Status: concluido.

Objetivo atual:

Manter consistencia da comunicacao.

### Arquitetura

Status: atualizado para V1 modular.

Documentacao principal:

- [[Arquitetura Geral]]
- [[Aivor V1 Modular Completa]]
- [[Fluxo Completo]]
- [[ERC4626]]
- [[USDC]]
- [[EURC]]
- [[ovUSDC]]

Objetivo atual:

Servir de referencia para implementacao modular e ativacao progressiva.

### Tecnologia

Status: estruturado.

Implementacao em andamento.

Principais areas:

- Backend;
- Frontend;
- Smart Contracts;
- Infraestrutura;
- Banco de Dados;
- Observabilidade;
- Integracoes;
- Governanca.

Objetivo atual:

Transformar documentacao em produto funcional, preservando separacao entre existencia arquitetural e ativacao operacional.

### Operacao

Status: estruturado.

Areas principais:

- liquidez;
- risco;
- tesouraria;
- operacao;
- fluxos;
- limites;
- protocolos;
- estrategias.

Objetivo atual:

Validar processos durante testes e ativar modulos conforme risco.

### Governanca

Status: estruturado.

Documentacao principal:

- [[Governanca Geral]]
- [[Mapeamento de Papeis]]
- [[Multisig]]
- [[Timelock]]
- [[Emergency Pause]]

Objetivo atual:

Implementacao operacional com Safe 2-of-4, Timelock, auditoria e regras de ativacao.

### Produto

Status: atualizado para V1 modular.

Documentacao principal:

- [[Visao do Produto]]
- [[Funcionalidades]]
- [[Jornada do Usuario]]

Objetivo atual:

Implementar experiencia simples para o usuario, sem expor a complexidade modular interna.

### Juridico

Status: estruturado.

Modelo definido:

- protocolo Web3;
- nao custodial;
- sem token proprio de governanca na V1;
- atuacao global;
- necessidade de revisao especializada antes do lancamento.

### Marketing

Status: estruturado.

Objetivo atual:

Produzir conteudo, crescer audiencia e comunicar a evolucao modular sem promessa de rendimento.

### Comunidade

Status: estruturado.

Objetivo atual:

Formacao da comunidade inicial e educacao sobre riscos, modulos e ativacao progressiva.

### Lancamento

Status: validacao privada concluida.

Objetivo atual:

Preparacao da proxima validacao tecnica com Morpho, mantendo lancamento publico apenas para modulos aprovados por testes, governanca e auditoria.

---

## Private Mainnet Validation

Status: concluida.

Esta etapa nao representa lancamento, producao publica, captacao, aceite de usuarios ou operacao com capital de terceiros. Foi uma validacao privada, com carteira propria, valor minimo, Base Mainnet, USDC oficial e contratos sem mocks.

Contratos registrados:

- Vault: `0x0Ad107434e35b91a72a98663696Fc73BAA19dc1E`
- Controller: `0x6B1eC9fbdD4d935B569ea4732d15F1126a7e444b`
- Treasury: `0xFC0D792D85aaA0F2a01E5a75a4b57900E5e5e3DD`
- USDC Base: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- Validation wallet: `0x92987bd92929047449Df90040eED33D0Bd277624`

Resultado oficial:

- deploy realizado;
- Vault funcional;
- deposit aprovado;
- withdraw aprovado;
- share accounting aprovado;
- USDC recuperado integralmente;
- nenhum mock utilizado;
- nenhuma integracao Morpho utilizada;
- nenhum usuario externo participou.

Transacoes:

- Approve: `0xeadea88d236aae7070adf3734001ad612f119093a7929b1a07561a010afd9446`
- Deposit: `0xc8c4517c0791e9f8fbac9ceb48677a506f2cc3bffdbb4aac53891097d8663e31`
- Withdraw: `0x3100deb56cecd6abb7e36ae25990740a7ea41f177af40c9eedae23b242ccb17d`

Metricas da validacao:

- valor validado: `0,10 USDC`;
- shares emitidas: `100000` unidades de ovUSDC;
- shares queimadas: `100000` unidades de ovUSDC;
- `totalAssets` antes: `0`;
- `totalAssets` depois: `0`;
- `totalSupply` antes: `0`;
- `totalSupply` depois: `0`;
- `sharePrice` antes: `1.000000`;
- `sharePrice` depois: `1.000000`.

Contratos que podem ser reaproveitados como base tecnica:

- `OrvexVault`, preservando ERC4626 e revisando o caminho com allocator real;
- `OrvexController`, preservando permissoes e governanca operacional;
- `OrvexTreasury`, como base simples para evolucao futura.

Contratos e scripts da validacao privada nao devem ser tratados como deploy publico ou producao.

Riscos remanescentes:

- chave usada na validacao deve ser considerada dev-only;
- pause operacional exige multisig e nao deve ser acionado por EOA;
- Morpho real, rendimento, rebalanceamento e operacao multiusuario ainda nao foram validados;
- auditoria externa ainda e obrigatoria antes de capital real;
- limites publicos, onboarding e comunicacao ainda nao podem ser ativados.

Licoes aprendidas:

- idle-only mode provou o fluxo ERC4626 minimo sem allocator;
- private validation mode e cap baixo reduziram risco de uso publico acidental;
- scripts operacionais devem separar validacao financeira de comandos administrativos protegidos por multisig;
- a proxima etapa deve validar Morpho de forma controlada antes de qualquer capital relevante.

Percentuais estimados:

- Smart Contracts: 68%;
- Backend: 72%;
- Banco de Dados: 70%;
- Integracoes: 50%;
- Governanca: 58%;
- Painel Admin: 45%;
- Frontend publico: 35%;
- Observabilidade: 45%;
- Projeto Geral: 55%.

---

## Proximos Passos

### Curto Prazo

- revisar e autorizar, se aprovado, o deploy privado do conjunto V2 Morpho-Controlled;
- validar read-only o conjunto V2 apos deploy privado;
- manter V1 como validacao historica idle-only;
- manter o Allocator V1 como deploy read-only desativado;
- ampliar validacao do fluxo `deposit -> alocacao -> rendimento -> withdraw` somente no conjunto V2;
- manter modulos avancados como `documented`, `simulated` ou `read_only`.

### Fase 10.9E

Status: implementada em codigo, sem deploy.

O caminho Morpho foi reorganizado para um novo conjunto:

- `AivorVaultV2`;
- `AivorControllerV2`;
- `MorphoAllocatorV2`.

O conjunto V2 foi preparado para resolver a limitacao do V1 idle-only e permitir o caminho operacional completo `Vault -> Allocator -> Morpho -> Allocator -> Vault`.

Nenhum deploy, enable, approve, supply, withdraw ou movimentacao de USDC foi executado nesta fase.

### Medio Prazo

- implementar estrategias por camada;
- validar Morpho, Aave, Uniswap e Aerodrome em etapas;
- ampliar Painel Admin;
- fortalecer auditoria e observabilidade.

### Longo Prazo

- ativar estrategias com capital limitado;
- evoluir para `active` apenas por governanca;
- expandir comunidade;
- preparar capital real com auditorias especificas.

---

## Situacao Atual

A Aivor ja possui uma fundacao estrategica ampla.

O principal desafio e transformar a V1 modular em uma implementacao controlada, auditavel e ativada por risco.

---

## Relacionamentos

- [[Mapa da Aivor]]
- [[Roadmap Publico]]
- [[Roadmap Geral]]
- [[Checklist de Lancamento]]
- [[Aivor V1 Modular Completa]]
