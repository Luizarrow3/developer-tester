# CT_CHECKOUT_001: Aplicação válida do cupom VIP20

## Objetivo

Verificar que o cupom `VIP20` aplica 20% de desconto quando o subtotal de produtos elegíveis é superior a R$ 100,00 e o cupom está ativo e dentro da validade.

## Pré-condições

- Cliente autenticado.
- Cupom `VIP20` ativo e não expirado.
- Carrinho vazio no início do cenário.

## Massa de dados

| Produto | Preço unitário | Elegível |
| --- | ---: | --- |
| Produto A | R$ 60,00 | Sim |
| Produto B | R$ 50,00 | Sim |

## Passos e resultados esperados

1. Adicionar Produto A e Produto B ao carrinho. O subtotal deve ser R$ 110,00.
2. Abrir o checkout, informar `VIP20` e aplicar o cupom.
3. Verificar a mensagem `Cupom VIP20 aplicado com sucesso!`.
4. Verificar desconto de R$ 22,00 (20%) e total de R$ 88,00.

## Rastreabilidade e automação

- Requisito: RF-045.
- Issue relacionada: BUG_CHECKOUT_014 (regressão da validação do valor mínimo).
- Implementação: `tests/test_checkout_coupon.py::test_vip20_applies_to_eligible_cart_over_100`.
- Evidências automáticas: relatório Markdown, screenshot e captura de rede, quando disponível, em `artifacts/evidence/`.
