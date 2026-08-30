# TMS.md — MoMenu Payments SDK

## Overview
SDK React para pagamentos angolanos (Multicaixa Express e Referência Bancária ATM). Publicado como `momenu-payments` no npm. Desenvolvido pela Toquemedia.

## Stack
- **Linguagem**: TypeScript 6.0
- **Framework**: React 18/19 (peer dependency)
- **Build**: Vite 8 + vite-plugin-dts (gera `dist/` com ESM + UMD + `.d.ts`)
- **Testes**: Vitest 3
- **Lint**: ESLint 9
- **Package Manager**: yarn@1.22.22

## Commands
- `yarn dev` — servidor de desenvolvimento (demo app em `src/App.tsx`)
- `yarn build` — `tsc -b && vite build` (typecheck + bundle)
- `yarn lib:build` — `vite build` (só bundle, sem typecheck)
- `yarn test` — `vitest run`
- `yarn lint` — ESLint

## Structure
```
src/
  lib/
    payment/
      client/MoMenuPaymentClient.ts   — cliente HTTP (fetch, retry, timeout, erros estruturados)
      components/                      — MoMenuCheckout, MCXPaymentForm, ReferencePaymentDisplay, PaymentSuccess
      components/shared/               — StatusBanner, CustomerDetailsForm, PaymentDetailRow
      context/MoMenuPaymentContext.tsx — React context para o client
      hooks/                           — useMoMenuPayment, useMCXPayment, useReferencePayment (com autoPoll)
      types/index.ts                   — tipos partilhados (PaymentConfig, requests, responses, errors)
      utils/errors.ts                  — MoMenuPaymentError (erro estruturado com code)
      utils/format.ts                  — formatCurrency, formatDate, sanitizeUrl
      utils/validation.ts              — validateAmount, validatePhoneNumber, validateProductsSum
      __tests__/                        — payment-client.test.ts, validation.test.ts
  lib/index.ts                         — barrel export de toda a API pública
  App.tsx                              — demo app
```

## EntryPoints
- **Library**: `src/lib/index.ts` → `dist/sdk-momenu-react.js` (ESM), `dist/sdk-momenu-react.umd.cjs` (UMD)
- **Types**: `dist/index.d.ts`
- **CSS**: `dist/momenu-payments.css` (importável via `momenu-payments/style.css`)
- **Demo**: `src/main.tsx` → `src/App.tsx`

## Project Patterns
- **API compliance**: `instantWithdraw: true` sempre enviado; `products` e `paymentInfo.amount` ambos obrigatórios; `simulateResult` só em QA mode. Ver `project_momenu-api-compliance` memory.
- **Erros estruturados**: `MoMenuPaymentError` com `code: PaymentErrorCode` e `status?: number`. Nunca `throw new Error(...)` no client.
- **URL safety**: `sanitizeUrl()` valida esquema `https:`/`http:` antes de usar URLs da API em `href`.
- **Logs PII**: `console.log`/`error` gated behind `qaMode` — zero logs em produção.
- **AbortController**: timeout de 30s em todos os requests.
- **Retry**: 5xx e 429 com backoff; network errors com retry de conexão.

## Agent Rules
- Sempre correr `tsc -b && vitest run` após alterações no `src/lib/`.
- Os `.d.ts` ao lado do source são gerados por `tsc -b` (emitDeclarationOnly, sem outDir) — não editar à mão.
- `react`/`react-dom` estão em `peerDependencies` E `devDependencies` (necessário para Vite resolver imports no demo).
- API key é pública/restrita por domínio — não é secreta. Documentado no JSDoc de `PaymentConfig.apiKey`.

## Confirmed
- API docs em https://api.momenu.online/docs
- Endpoints: POST `/api/payment/mcx`, POST `/api/payment/reference`, GET `/api/payment/reference/status/:operationId`
- `instantWithdraw: true` obrigatório nos bodies de criação de pagamento
- `products` e `paymentInfo.amount` ambos obrigatórios simultaneamente
- `simulateResult` só deve ser enviado em QA mode

## Inferred
- `merchantTransactionId` vs `transactionId` — o hook passa `data.transactionId` como `merchantTransactionId`; confirmar com backend se são equivalentes

## Pending Confirmation
- Webhook handling: tipos `WebhookPayload` existem mas sem utilitário de verificação de assinatura
- Polling interval ideal para referência (atualmente 10s por defeito)

## lastGeneratedAt
2026-08-30

## sourceFilesUsed
package.json, vite.config.ts, tsconfig.app.json, src/lib/payment/**/*.ts, src/lib/payment/**/*.tsx, src/lib/index.ts, https://api.momenu.online/docs
