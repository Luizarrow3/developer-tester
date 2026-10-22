# BUG_CHECKOUT_014: Cupom aceito abaixo do valor mínimo

## Classificação

- Severidade: Alta, por impacto financeiro na regra promocional.
- Prioridade: Alta.
- Requisito relacionado: RF-045.
- Status neste projeto: cenário documentado e coberto por teste de regressão; a correção no sistema da loja não é verificável sem acesso à aplicação.

## Ambiente

Homologação e Chrome devem ser preenchidos com os dados da execução. O exemplo original cita Staging / Chrome 120; isso não foi confirmado neste workspace.

## Pré-condições

- Cliente autenticado.
- Cupom `VIP20` ativo e dentro da validade.

## Passos para reproduzir

1. Adicionar ao carrinho um produto elegível no valor de R$ 50,00.
2. Abrir o checkout.
3. Informar `VIP20` e aplicar.

## Resultado observado no relato do defeito

O checkout aceitou o cupom, concedeu R$ 10,00 de desconto e mostrou total de R$ 40,00, mesmo com subtotal inferior ao mínimo. Esse comportamento é o relato de referência, não uma execução reproduzida neste workspace.

## Resultado esperado

Recusar o cupom, manter o desconto em R$ 0,00 e exibir a mensagem de valor mínimo. A automação espera: `Este cupom é válido apenas para compras acima de R$ 100,00`.

## Evidência HTTP de referência

Os payloads abaixo são exemplos para ilustrar o relato do defeito, não uma captura real da loja:

### Requisição

```json
{
  "cart_id": "cart_987654",
  "coupon_code": "VIP20",
  "items": [
    {
      "product_id": "PROD_A",
      "quantity": 1,
      "unit_price": 50.00
    }
  ],
  "subtotal": 50.00
}
```

### Resposta incorreta relatada

```json
{
  "status": "success",
  "coupon_applied": "VIP20",
  "discount_percentage": 20,
  "discount_amount": 10.00,
  "final_total": 40.00,
  "validation_error": null
}
```

A hipótese técnica no relato é que a validação do valor mínimo não estava sendo aplicada pelo serviço de regras do cupom. O diagnóstico real depende de inspeção dos logs e do backend.

## Regressão automatizada

- Caso principal: `CT_CHECKOUT_001`.
- Fronteira: `CT_CHECKOUT_002`.
- Casos adicionais: carrinho abaixo do mínimo e remoção de item em `tests/test_checkout_coupon.py`.
- Evidências geradas durante a execução: `artifacts/evidence/`.
