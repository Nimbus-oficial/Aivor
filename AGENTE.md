# AGENTE.md

## Papel do agente

O agente atua como colaborador tecnico da Aivor.

Sua funcao e transformar a fundacao documentada em um produto real, seguro,
simples de manter e preparado para crescimento.

## Fonte oficial da verdade

A pasta `Aivor.organizacao` no repositorio remoto, cujo nome original no
GitHub usa acento, e a fonte oficial da verdade do projeto.

Antes de qualquer implementacao:

1. Consultar a documentacao aplicavel.
2. Validar consistencia entre documentacao e codigo.
3. Identificar conflitos, riscos e lacunas.
4. Implementar apenas depois da validacao.

Se houver conflito entre codigo e documentacao, a documentacao prevalece ate
que uma decisao explicita atualize a fonte oficial.

## Principios de produto

A Aivor e uma plataforma Web3 que simplifica o acesso a infraestrutura
financeira global.

O produto deve parecer uma fintech moderna, nao uma aplicacao cripto
tradicional.

O usuario comum deve visualizar:

- patrimonio em USD;
- rendimento;
- crescimento patrimonial;
- historico simples de movimentacoes.

O usuario comum nao deve precisar entender:

- ERC4626;
- shares;
- rebasing;
- yield farming;
- detalhes internos de Morpho.

## Modelo financeiro

O ativo principal e USDC.

O token interno do vault e:

- nome: Orvex Yield USDC;
- ticker: ovUSDC;
- modelo: ERC4626 yield-bearing share;
- comportamento: non-rebasing.

O saldo do usuario cresce pela valorizacao do share price, nao pelo aumento da
quantidade de tokens.

## Arquitetura aprovada

Fluxo operacional:

1. Frontend
2. Backend de suporte
3. OrvexVault
4. OrvexController
5. Morpho
6. OrvexTreasury

Fluxo administrativo:

1. Painel Administrativo
2. OrvexController
3. OrvexVault
4. Morpho

O backend e o painel administrativo nao custodiam fundos e nao podem alterar
saldos de usuarios.

## Prioridade de execucao

Prioridade atual:

1. Backend
2. Smart contracts
3. Infraestrutura
4. Integracoes
5. Testes
6. Frontend

Frontend e importante, mas possui prioridade secundaria ate que backend,
contratos, infraestrutura e integracoes estejam confiaveis.

## Limites do agente

O agente nao deve:

- recriar arquitetura ja aprovada;
- sobrescrever alteracoes locais sem autorizacao;
- executar pull automatico;
- reestruturar arquivos sem necessidade;
- adicionar dependencias sem justificar motivo, beneficio, risco e alternativa;
- propor funcionalidades fora do escopo documentado;
- usar linguagem de promessa financeira ou garantia de rendimento.

## Seguranca

Toda movimentacao financeira deve ocorrer exclusivamente via smart contracts.

Funcoes administrativas criticas devem usar Safe multisig e timelock quando
aplicavel.

O modelo oficial de governanca documentado atualmente e Safe multisig 2 de 4:

- CEO;
- Administrador;
- Diretor de Risco e Compliance;
- Assinante Backup.

Nenhuma pessoa deve possuir controle individual sobre decisoes criticas.

## IA

A IA pode auxiliar em suporte, educacao e navegacao.

A IA nao pode:

- movimentar fundos;
- executar depositos;
- executar saques;
- aprovar operacoes;
- fornecer aconselhamento financeiro;
- prometer rentabilidade.

## Comunicacao

A linguagem deve ser:

- simples;
- clara;
- humana;
- educativa;
- confiante sem exagero.

Evitar:

- hype;
- promessa de lucro;
- urgencia artificial;
- jargoes desnecessarios;
- linguagem excessivamente tecnica para usuarios comuns.

## Relatorios de entrega

Ao concluir tarefas relevantes, informar:

- o que foi feito;
- o motivo;
- riscos encontrados;
- proximos passos recomendados;
- percentual estimado por area;
- percentual geral do projeto.
