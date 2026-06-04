# CODING_RULES.md

## Regra principal

Codigo e um ativo de longo prazo.

Toda implementacao deve priorizar:

1. simplicidade;
2. seguranca;
3. manutencao;
4. escalabilidade;
5. performance.

Nao inverter essa ordem sem justificativa tecnica.

## Fonte da verdade

A documentacao oficial da Aivor tem prioridade sobre o codigo.

Antes de implementar:

1. Consultar a documentacao em `Aivor.organizacao`.
2. Validar consistencia com o estado atual do repositorio.
3. Identificar conflitos ou lacunas.
4. Implementar de forma incremental.

Nao executar pull automatico.
Nao sobrescrever alteracoes locais.
Nao reestruturar arquivos sem necessidade.

## Arquitetura

Buscar sempre:

- baixo acoplamento;
- alta coesao;
- modularidade;
- reutilizacao;
- clareza operacional.

Antes de criar uma nova estrutura, verificar se ja existe:

- modulo;
- componente;
- servico;
- utilitario;
- biblioteca;
- tipo compartilhado.

Evitar duplicacao.

## Backend

O backend existe para suporte operacional.

Ele pode cuidar de:

- autenticacao via Privy;
- perfis e preferencias;
- analytics;
- notificacoes;
- observabilidade;
- assistente IA;
- sincronizacao de UX;
- leitura de dados on-chain.

O backend nao pode:

- custodiar fundos;
- controlar chaves privadas de usuarios;
- alterar saldo de usuarios;
- executar movimentacao financeira arbitraria;
- substituir smart contracts.

Toda API deve possuir:

- validacao;
- tratamento de erros;
- logs estruturados;
- documentacao;
- testes compativeis com sua criticidade.

## Smart contracts

Prioridade maxima: seguranca.

Toda alteracao deve considerar:

- fundos dos usuarios;
- permissoes;
- liquidez;
- riscos operacionais;
- auditabilidade;
- separacao de responsabilidades.

O vault deve seguir modelo ERC4626 yield-bearing share, non-rebasing.

O token interno deve ser:

- nome: Orvex Yield USDC;
- ticker: ovUSDC;
- ativo base: USDC.

Funcoes criticas devem respeitar:

- Safe multisig;
- timelock para mudancas relevantes;
- emergency pause;
- limites operacionais;
- separacao entre patrimonio de usuarios e tesouraria.

## Painel administrativo

O painel administrativo deve ser uma camada operacional e de observabilidade.

Ele pode:

- monitorar TVL, liquidez, rendimento e eventos;
- visualizar exposicao por estrategia;
- acompanhar limites e riscos;
- iniciar fluxos administrativos autorizados;
- exibir estado de multisig, timelock e emergency pause.

Ele nao pode:

- custodiar fundos;
- sacar fundos arbitrariamente;
- transferir saldo de usuarios;
- alterar shares de usuarios;
- alterar patrimonio manualmente.

## Frontend

O frontend deve parecer uma fintech moderna.

Prioridades:

- simplicidade;
- acessibilidade;
- clareza;
- experiencia premium;
- tecnologia invisivel para o usuario comum.

O usuario comum deve ver:

- saldo em USD;
- rendimento;
- crescimento patrimonial;
- historico;
- status claro das operacoes.

Evitar expor jargoes como:

- ERC4626;
- shares;
- yield farming;
- rebasing;
- detalhes internos de estrategia.

## Banco de dados

O banco de dados armazena informacoes operacionais.

Pode armazenar:

- usuarios;
- perfis;
- preferencias;
- sessoes;
- notificacoes;
- analytics;
- logs;
- eventos administrativos.

Nao deve armazenar:

- fundos;
- chaves privadas;
- ativos financeiros como fonte de verdade.

PostgreSQL e a camada principal de persistencia.
Redis e a camada de cache, filas e processamento assincrono.

## Integracoes

Integracoes aprovadas:

- Base;
- Morpho;
- Privy;
- Safe;
- PostgreSQL;
- Redis;
- Vercel;
- Railway;
- Cloudflare;
- GitHub Actions.

Antes de integrar servicos externos, informar:

- servico utilizado;
- motivo;
- beneficios;
- riscos;
- alternativas;
- impacto arquitetural;
- credenciais necessarias.

## Observabilidade

Todo sistema deve buscar:

- logs estruturados;
- metricas;
- rastreabilidade;
- monitoramento de disponibilidade;
- alertas para eventos criticos.

Problemas devem ser detectados antes dos usuarios perceberem.

## Testes

Prioridade de testes:

1. Smart contracts;
2. Backend;
3. Integracoes;
4. Frontend.

Toda funcionalidade relevante deve possuir testes compativeis com sua
criticidade.

Nenhuma alteracao critica deve chegar a producao sem validacao automatizada.

## Comunicacao no produto

Evitar:

- promessas de lucro;
- garantias de rendimento;
- hype;
- urgencia artificial;
- linguagem juridicamente arriscada;
- linguagem tecnica desnecessaria.

Preferir linguagem simples, educativa e clara.

## Refatoracao

Refatorar apenas quando houver ganho real de:

- seguranca;
- clareza;
- manutencao;
- remocao de duplicacao;
- alinhamento com a documentacao.

Preservar comportamento funcional.
Evitar reconstrucoes completas sem necessidade.

## Entregas

Ao concluir uma tarefa, informar:

- o que foi feito;
- motivo;
- riscos;
- proximos passos;
- percentual por area;
- percentual geral estimado.
