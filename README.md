# Tag Sacola

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-087EA4?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-4-3E67B1)
![License](https://img.shields.io/badge/license-MIT-16B879)
![CI](https://github.com/nf-silveira/tagsacola/actions/workflows/ci.yml/badge.svg)

> Sua solução de etiquetas sempre que tiver B.O na operação 🚨

O **Tag Sacola** é uma aplicação web operacional para criar, editar, visualizar e imprimir etiquetas de identificação de sacolas na separação de compras de supermercado. Foi pensada como alternativa independente ao sistema principal de separação de pedidos, principalmente em situações de falha técnica: sem login, sem integrações externas e com funcionamento offline.

O foco não é gestão de pedidos, e sim velocidade, poucos cliques, confiabilidade e uma etiqueta que sai exatamente como foi pré-visualizada.

---

## Sumário

- [Visão geral](#visão-geral)
- [Stack](#stack)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Como executar](#como-executar)
- [Scripts](#scripts)
- [Testes automatizados](#testes-automatizados)
- [CI/CD e deploy](#cicd-e-deploy)
- [Impressão na Sweda SI-300](#impressão-na-sweda-si-300)
- [Privacidade dos dados](#privacidade-dos-dados)
- [Etapas de desenvolvimento](#etapas-de-desenvolvimento)
- [Fluxo de branches](#fluxo-de-branches)
- [Autor](#autor)
- [Licença](#licença)

---

## Visão geral

A aplicação se organiza em três áreas na mesma página:

1. **Cabeçalho compacto** — identidade, slogan, indicador online/offline e acesso às informações do sistema.
2. **Área operacional** — formulário de criação com as quatro categorias de sacolas (secas, resfriadas, congeladas e pack), total automático, pré-visualização da etiqueta em HTML/CSS e configurações de impressão.
3. **Histórico** — últimas etiquetas geradas, com busca, paginação, reimpressão, edição e exclusão.

Todos os campos de identificação (número da compra, cliente, data, horário e modalidade de entrega) são opcionais: quando vazios, simplesmente não aparecem na etiqueta.

### Identidade visual

| Token | Valor | Uso |
| --- | --- | --- |
| `--ef-purple` | `#5940C8` | Cor principal |
| `--ef-purple-dark` | `#4032A8` | Cor secundária e estados de hover |
| `--ef-yellow` | `#FFCA45` | Destaque |
| `--ef-bg` | `#F7F7FC` | Fundo da aplicação |
| `--ef-surface` | `#FFFFFF` | Cartões e superfícies |
| `--ef-text` | `#17183A` | Texto principal |
| `--ef-muted` | `#77788B` | Texto secundário |
| `--ef-success` | `#16B879` | Status positivo |
| `--ef-danger` | `#E5484D` | Ações destrutivas |

---

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | [Next.js](https://nextjs.org) (App Router) |
| UI | [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Base estrutural e tema | [Bootstrap 5](https://getbootstrap.com) + CSS Modules |
| Ícones | [React Icons](https://react-icons.github.io/react-icons/) |
| Validação | [Zod](https://zod.dev) |
| Persistência local | `localStorage` (preferências e histórico) |
| Deploy | [Vercel](https://vercel.com) |

Sem Tailwind, sem Lucide, sem bibliotecas pagas e sem APIs externas.

---

## Estrutura do projeto

```text
.
├─ public/                # Arquivos estáticos (favicon)
└─ src/
   ├─ app/                # App Router: layout raiz, página principal e estilos da página
   ├─ components/         # Componentes de UI, cada um com seu CSS Module
   ├─ domain/             # Contratos e regras puras do negócio (etiquetas, impressão, histórico)
   ├─ hooks/              # Estado reutilizável (formulário, histórico, busca/paginação, impressão, conexão)
   ├─ services/           # Persistência local e impressão
   └─ styles/             # Tokens, base do HTML, tema do Bootstrap e CSS de impressão
```

Convenções adotadas:

- **Componentes** ficam em `components/NomeDoComponente/NomeDoComponente.tsx` com `NomeDoComponente.module.css` ao lado; o componente cuida apenas da própria aparência interna.
- **Regras de negócio** ficam em `domain/` como funções puras, sem React e sem acesso ao navegador, o que permite testá-las isoladamente.
- **Estilos globais** (`styles/globals.css`) contêm somente tokens, base do HTML e variáveis do Bootstrap — nada específico de tela.
- **Persistência e impressão** ficam em `services/`, para que a UI não conheça detalhes de `localStorage` ou `window.print()`.
- **Estado derivado** é calculado a partir de props e estado existente, sem `useState` redundante.

---

## Como executar

Requisitos: **Node.js 24** e npm — a mesma versão declarada em `.nvmrc`, em `engines` e usada no CI.

```bash
# clonar
git clone https://github.com/nf-silveira/tagsacola.git
cd tagsacola

# instalar dependências
npm install

# ambiente de desenvolvimento (http://localhost:3000)
npm run dev
```

---

## Scripts

| Script | Descrição |
| --- | --- |
| `npm run dev` | Sobe o servidor de desenvolvimento do Next.js |
| `npm run build` | Gera o build de produção |
| `npm run start` | Executa o build de produção |
| `npm run lint` | Executa o ESLint |
| `npm run typecheck` | Verifica os tipos com TypeScript |
| `npm test` | Executa os testes em modo watch |
| `npm run test:run` | Executa a suíte de testes uma vez |
| `npm run verify` | Roda lint, tipos, testes e build em sequência (usado no CI) |

---

## Testes automatizados

A suíte usa **Vitest** com **Testing Library** em ambiente `jsdom` e cobre as regras que não dependem do navegador nem da impressora:

| Arquivo | O que valida |
| --- | --- |
| `src/domain/label.test.ts` | Total de sacolas, singular/plural, formatação de data e horário, geração de lote com quantidades congeladas |
| `src/domain/printSettings.test.ts` | Limite de 80 mm, margens consistentes, dimensões inválidas, modelos Padrão e Compacta |
| `src/domain/history.test.ts` | Busca sem acento/maiúscula, recorte de página, atalhos numerados com "…" e formatação de data/hora do histórico |
| `src/components/ConfirmDialog/confirmationMessages.test.ts` | Textos do diálogo de exclusão (com e sem número da compra) e de limpeza do histórico |
| `src/components/PrintableLabel/PrintableLabel.test.tsx` | Sequência "3 de 10", dimensões em mm, campos opcionais omitidos, resumo por categoria, chips vazados, nomes longos |
| `src/components/HistoryTable/HistoryTable.test.tsx` | Estado vazio, busca sem acento na UI, paginação numerada, tamanho de página, limites e ações por linha |
| `src/components/OrderForm/OrderForm.test.tsx` | Total derivado, geração bloqueada com zero, preenchimento automático de data/horário, limpeza do formulário |
| `src/services/storageService.test.ts` | Persistência de preferências e histórico no `localStorage` |

```bash
npm run test:run
```

**Fora do escopo automatizado (por enquanto):** geração de PDF e conferência dimensional. A checagem é manual: `Ctrl+P` → *Salvar como PDF*, com papel personalizado de 80 × 55 mm, conferindo se nenhuma etiqueta é cortada ou dividida entre páginas.

---

## CI/CD e deploy

- **Integração contínua:** `.github/workflows/ci.yml` roda em `pull_request` para `main` e `develop`, e em `push` para `main`, executando `npm ci` e `npm run verify` (lint, tipos, testes e build em sequência — os mesmos comandos que você roda localmente).
- **Gate de qualidade:** o deploy de produção só acontece depois que o workflow `CI` conclui com sucesso na `main`. O `vercel.json` desativa o deploy automático da `main` (`git.deploymentEnabled.main = false`) e `.github/workflows/deploy-production.yml` publica exatamente o commit testado usando a Vercel CLI.
- **Segredos do deploy:** `VERCEL_TOKEN`, `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` em *Settings → Secrets and variables → Actions*. Sem eles o job falha com mensagem explícita e a produção permanece na última versão publicada.
- **Proteção da `main`** (já aplicada): exige PR e o check `npm run verify` — o check tem o nome do job do workflow, não do passo. Para reaplicar com `gh` autenticado:

  ```bash
  cat > protection.json <<'JSON'
  {
    "required_status_checks": { "strict": true, "contexts": ["npm run verify"] },
    "enforce_admins": true,
    "required_pull_request_reviews": { "required_approving_review_count": 0, "dismiss_stale_reviews": true },
    "restrictions": null
  }
  JSON
  gh api --method PUT repos/nf-silveira/tagsacola/branches/main/protection --input protection.json
  rm protection.json
  ```

  `restrictions: null` é obrigatório no corpo (sem o campo a API responde `422`); `null` mantém a branch aberta a qualquer PR, apenas com o CI exigido. Com `strict: true`, o PR precisa estar atualizado com a `main` para poder ser mergeado.

- **Produção:** <https://tagsacola.vercel.app>

---

## Impressão na Sweda SI-300

Configuração de referência: [manual do fabricante](https://sweda.com.br/wp-content/uploads/2023/04/Manual-SI300-SI300W-L.pdf).

| Especificação | Valor |
| --- | --- |
| Bobina | Térmica adesiva contínua |
| Largura da bobina | 80 mm |
| Largura máxima imprimível | 72 mm |
| Resolução | 180 DPI |
| Corte | Automático, feito pela impressora |
| Dimensões iniciais | 80 × 55 mm, margem interna de 2 mm |

A impressão usa `window.print()` com CSS `@media print`, dimensões em milímetros e uma etiqueta por bloco de impressão, escondendo toda a interface. O navegador **não** comanda o cortador: o corte depende do driver e das configurações de papel no computador.

---

## Privacidade dos dados

Tudo é local: nenhuma informação de cliente sai do navegador. Não há backend, autenticação, cookies de rastreamento ou chamadas a APIs de terceiros. Histórico e preferências vivem no próprio computador do setor.

---

## Etapas de desenvolvimento

O projeto é construído em etapas, cada uma verificável por conta própria.

| Etapa | Escopo | Status |
| --- | --- | --- |
| 0 | Fundação: stack, design tokens, contratos do domínio | ✅ Concluída |
| 1 | Interface: cabeçalho, área operacional, histórico | ✅ Concluída |
| 2 | Formulário: campos opcionais, categorias, total automático | ✅ Concluída |
| 3 | Etiqueta: HTML/CSS e pré-visualização dinâmica com navegação | ✅ Concluída |
| 4 | Impressão: dimensões em mm, CSS de impressão e etiqueta de teste | ✅ Concluída (simulação local) |
| 5 | Configurações: modelos, personalização e persistência | ✅ Concluída |
| 6 | Histórico: salvar, buscar, paginar, editar, excluir e reimprimir | ✅ Concluída |
| 8 | Testes: unitários e de componente no CI | ✅ Concluída |
| 9 | Validação visual/PDF e teste físico na Sweda SI-300 | ✅ Concluída |

---

## Fluxo de branches

- `develop` — integração contínua; todo trabalho entra aqui primeiro.
- `main` — versão estável, recebida apenas por Pull Request de `develop` com o check do CI verde (proteção de branch descrita em CI/CD). Push direto é rejeitado.
- O deploy de produção é disparado pelo workflow de CD somente após o `CI` passar na `main`.

Commits seguem [Conventional Commits 1.0.0](https://www.conventionalcommits.org/pt-br/) com emoji do tipo, mensagem em inglês e corpo em tópicos.

---

## Autor

**Nelson Felipe** — [@nf-silveira](https://github.com/nf-silveira)

---

## Licença

Distribuído sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.
