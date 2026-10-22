# CT_CHECKOUT_002: Valores limite do cupom VIP20

## Objetivo

Validar a fronteira da regra estrita `subtotal elegível > R$ 100,00`.

## Pré-condições

- Cliente autenticado.
- Cupom `VIP20` ativo e não expirado.
- Cada variação começa com carrinho limpo e contém um único produto elegível.

## Casos de borda

| Subtotal | Condição | Resultado esperado |
| ---: | --- | --- |
| R$ 99,99 | Abaixo do mínimo | Recusar, desconto R$ 0,00 |
| R$ 100,00 | Igual ao mínimo | Recusar, desconto R$ 0,00 |
| R$ 100,01 | Acima do mínimo | Aprovar; desconto arredondado de R$ 20,00 e total R$ 80,01 |

A regra usa `>`; portanto, R$ 100,00 não satisfaz o mínimo. Se o requisito mudar para `>=`, este caso e as expectativas devem ser atualizados com o Product Owner.

## Rastreabilidade e automação

- Requisito: RF-045.
- Issue relacionada: BUG_CHECKOUT_014.
- Implementação: `tests/test_checkout_coupon.py::test_vip20_boundary_values`.
- Evidências automáticas: relatório Markdown, screenshot e captura de rede, quando disponível, em `artifacts/evidence/`.
