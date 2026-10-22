# Testes Selenium do cupom VIP20

Suíte automatizada em Python para validar o cupom `VIP20` no checkout:

- Carrinho de R$ 110,00: desconto de R$ 22,00 e total de R$ 88,00.
- Fronteira: R$ 99,99 e R$ 100,00 recusados; R$ 100,01 aprovado.
- Carrinho de R$ 50,00: cupom recusado, sem desconto.
- Cupom expirado e produto não elegível: aplicação recusada.
- Remoção de item: desconto removido quando o subtotal cai abaixo do mínimo.

## Portfólio web

O workspace também contém a aplicação React do portfólio. Para iniciar localmente:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Preencha `VITE_GITHUB_URL`, `VITE_LINKEDIN_URL` e `VITE_CONTACT_EMAIL` em `.env.local` para habilitar os links pessoais. URLs de projetos podem ser definidas em `VITE_SPECTRUM_URL` e `VITE_CENSUS_URL`. O cartão de bug e seu payload são exemplos demonstrativos, não evidência de uma chamada real.

## Problema corrigido

O defeito `BUG_CHECKOUT_014` ocorria quando o checkout aceitava o cupom `VIP20` em compras abaixo do mínimo de R$ 100,00. Por exemplo, em um carrinho de R$ 50,00, o sistema concedia R$ 10,00 de desconto e cobrava R$ 40,00, contrariando a regra promocional.

A regra esperada é permitir o desconto de 20% somente quando o subtotal elegível for superior a R$ 100,00 e o cupom estiver válido. Abaixo desse limite, o checkout deve recusar o cupom, exibir a mensagem de valor mínimo e manter o desconto em zero. Os testes desta suíte verificam a aplicação correta acima do limite e a recusa abaixo dele.

## Apresentação do projeto

### Pitch para entrevista

> Minha abordagem de qualidade começa pelas regras de negócio e pelo risco. Em uma funcionalidade financeira como cupons de desconto, não valido apenas o caminho feliz: testo os limites de R$ 99,99, R$ 100,00 e R$ 100,01, além de validade, elegibilidade dos produtos e mudanças no carrinho. Também preparo evidências reproduzíveis com screenshots, resultado das asserções e, quando a aplicação permite, requisição e resposta HTTP. Isso dá ao time um diagnóstico mais acionável, reduz retrabalho na comunicação e ajuda a evitar regressões financeiras.

Adapte o relato aos testes que realmente executou. Neste projeto, os cenários estão automatizados em Selenium, mas ainda dependem de uma loja de homologação configurada para produzir evidências reais.

### Técnica e valor de negócio

| Prática de QA | Valor para o negócio |
| --- | --- |
| Análise de valor limite (BVA) | Reduz o risco de descontos incorretos e prejuízo financeiro. |
| Evidências com screenshot e tráfego HTTP | Acelera a reprodução e o diagnóstico, reduzindo idas e vindas com desenvolvimento. |
| Matriz de rastreabilidade | Mostra quais requisitos e issues são cobertos pelos casos documentados. |
| Cenários negativos e de borda | Verifica a resposta do checkout a cupom expirado, produto inelegível e alteração do carrinho. |

### Estrutura do portfólio

```text
README.md                         Visão geral, pitch, estratégia e rastreabilidade
test-cases/                       Especificações CT_CHECKOUT_001 e CT_CHECKOUT_002
bug-reports/                      Relato estruturado do BUG_CHECKOUT_014
tests/                            Automação de regressão em Python/Selenium
conftest.py                       Relatórios, screenshots e captura de rede
artifacts/evidence/               Evidências geradas durante a execução (não versionadas)
```

## Matriz de rastreabilidade

| Requisito | Caso de teste | Issue relacionada | Cobertura |
| --- | --- | --- | --- |
| RF-045: aplicar VIP20 somente a subtotal elegível acima de R$ 100,00 e cupom válido | CT_CHECKOUT_001 | BUG_CHECKOUT_014 | R$ 110,00: desconto de R$ 22,00 e total de R$ 88,00 |
| RF-045 | CT_CHECKOUT_002 | BUG_CHECKOUT_014 | R$ 99,99 e R$ 100,00 recusados; R$ 100,01 aprovado |
| RF-045 | CT_CHECKOUT_003 | N/A | Cupom expirado recusado, sem desconto |
| RF-045 | CT_CHECKOUT_004 | N/A | Produtos em promoção não elegíveis recusados |
| RF-045 | CT_CHECKOUT_005 | BUG_CHECKOUT_014 | Ao remover item e cair para R$ 60,00, desconto removido |
| RF-045 | CT_CHECKOUT_006 | BUG_CHECKOUT_014 | Carrinho de R$ 50,00 recusado, sem desconto |

O `BUG_CHECKOUT_014` é a issue da falha de valor mínimo. As demais linhas são cenários de cobertura da mesma regra; não há outras issues informadas.

## Massa de dados

Prepare os produtos de teste abaixo na aplicação e garanta que cada execução comece com um carrinho limpo:

| Identificador do seletor | Preço | Condição |
| --- | ---: | --- |
| `product-a-add` | R$ 60,00 | Elegível |
| `product-b-add` | R$ 50,00 | Elegível |
| `product-under-minimum-add` | R$ 50,00 | Elegível |
| `product-99-99-add` | R$ 99,99 | Elegível |
| `product-100-00-add` | R$ 100,00 | Elegível |
| `product-100-01-add` | R$ 100,01 | Elegível |
| `product-expired-coupon-add` | R$ 150,00 | Elegível; usado no ambiente com cupom expirado |
| `product-non-eligible-add` | R$ 120,00 | Categoria Promoção, não elegível |

O teste de expiração usa um ambiente preparado à parte, indicado por `EXPIRED_COUPON_BASE_URL`, no qual `VIP20` está expirado. Se essa variável não estiver configurada, o caso é marcado como ignorado. Credenciais e seletores permanecem os mesmos.

Os seletores padrão usam atributos `data-testid`. Se a aplicação usar outros seletores, substitua-os pelas variáveis `SEL_*` descritas abaixo.

## Configuração

Instale as dependências e configure URL e credenciais da conta de teste:

```bash
python -m pip install -r requirements.txt
export BASE_URL="https://sua-loja.example"
export TEST_USER="usuario-de-teste"
export TEST_PASSWORD="senha-de-teste"
```

O Selenium Manager do Selenium 4 gerencia o ChromeDriver. Por padrão, o Chrome inicia em modo headless; use `HEADLESS=false` para abrir a janela do navegador.

## Evidências da execução

Ao final da fase de execução de cada teste, o `conftest.py` grava evidências em `artifacts/evidence/` (ou no diretório definido por `EVIDENCE_DIR`):

- Um relatório `.md` com ID e título rastreáveis, data/hora local, testador, ambiente, navegador, status e traceback quando houver falha.
- Uma captura `.png` com marcações nos elementos visíveis de feedback, subtotal, desconto e total. Marcações verdes indicam aprovação; vermelhas, reprovação.
- Um arquivo `_network.json`, se o Chrome registrar tráfego para `/api/v1/coupons/validate`, com método, URL, status HTTP e payloads JSON de requisição/resposta.

Configure `TESTER_NAME` e `TEST_ENV` para preencher a identificação do relatório. Configure `COUPON_VALIDATE_PATH` se o endpoint tiver outro caminho. O navegador usa log de performance do Chrome para capturar o tráfego; respostas indisponíveis no log podem não incluir corpo. Chaves comuns de credenciais e dados pessoais são redigidas antes de gravar JSON; ainda assim, use contas e dados sintéticos nos testes.

As evidências ajudam na análise, mas não são anexadas automaticamente a Jira ou Azure DevOps. Em caso de falha na preparação do navegador, o pytest não chega à fase de execução e pode não haver screenshot daquela tentativa.

Seletores configuráveis (todos são CSS):

| Variável | Padrão |
| --- | --- |
| `SEL_LOGIN_USER` | `[data-testid="login-user"]` |
| `SEL_LOGIN_PASSWORD` | `[data-testid="login-password"]` |
| `SEL_LOGIN_SUBMIT` | `[data-testid="login-submit"]` |
| `SEL_PRODUCT_A_ADD` | `[data-testid="product-a-add"]` |
| `SEL_PRODUCT_B_ADD` | `[data-testid="product-b-add"]` |
| `SEL_PRODUCT_UNDER_MINIMUM_ADD` | `[data-testid="product-under-minimum-add"]` |
| `SEL_PRODUCT_99_99_ADD` | `[data-testid="product-99-99-add"]` |
| `SEL_PRODUCT_100_00_ADD` | `[data-testid="product-100-00-add"]` |
| `SEL_PRODUCT_100_01_ADD` | `[data-testid="product-100-01-add"]` |
| `SEL_PRODUCT_EXPIRED_COUPON_ADD` | `[data-testid="product-expired-coupon-add"]` |
| `SEL_PRODUCT_NON_ELIGIBLE_ADD` | `[data-testid="product-non-eligible-add"]` |
| `SEL_CHECKOUT` | `[data-testid="checkout"]` |
| `SEL_COUPON_INPUT` | `[data-testid="coupon-input"]` |
| `SEL_COUPON_APPLY` | `[data-testid="coupon-apply"]` |
| `SEL_COUPON_SUCCESS` | `[data-testid="coupon-success"]` |
| `SEL_COUPON_ERROR` | `[data-testid="coupon-error"]` |
| `SEL_SUBTOTAL` | `[data-testid="subtotal"]` |
| `SEL_DISCOUNT` | `[data-testid="discount"]` |
| `SEL_TOTAL` | `[data-testid="total"]` |
| `SEL_PRODUCT_B_REMOVE` | `[data-testid="product-b-remove"]` |

Execute a suíte com:

```bash
python -m pytest -v
```