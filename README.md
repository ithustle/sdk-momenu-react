# MoMenu Payments SDK 🚀

[![NPM version](https://img.shields.io/npm/v/momenu-payments.svg?style=flat-square)](https://www.npmjs.com/package/momenu-payments)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](https://github.com/ithustle/sdk-momenu-react/blob/main/LICENSE)
[![NPM downloads](https://img.shields.io/npm/dm/momenu-payments.svg?style=flat-square)](https://www.npmjs.com/package/momenu-payments)

SDK de pagamentos Angolanos para React — suporta **Multicaixa Express (MCX)**, **E-kwanza** e **Referência ATM**.

---

## Instalação

```bash
npm install momenu-payments
```

> ⚠️ **Obrigatório:** importa o CSS do SDK uma vez na raiz da tua aplicação:
> ```ts
> import 'momenu-payments/dist/sdk-momenu-react.css';
> ```

## Início Rápido

### 1. Envolver a app com o Provider

```tsx
import 'momenu-payments/dist/sdk-momenu-react.css';
import { MoMenuPaymentProvider } from 'momenu-payments';

function App() {
  return (
    <MoMenuPaymentProvider 
      config={{ 
        apiKey: 'SUA_API_KEY',
        qaMode: false, // true para ambiente de testes
        devMode: process.env.NODE_ENV === 'development'
      }}
    >
      <MinhaApp />
    </MoMenuPaymentProvider>
  );
}
```

### 2. Usar o Checkout completo (recomendado)

O `MoMenuCheckout` apresenta os 3 métodos de pagamento num só componente responsivo e pronto a usar:

```tsx
import { MoMenuCheckout } from 'momenu-payments';

function PaginaPagamento() {
  return (
    <MoMenuCheckout
      amount={2500}
      onSuccess={(data) => console.log('Pago!', data)}
      onError={(err) => console.error('Erro:', err)}
    />
  );
}
```

---

## Configuração do Provider

```ts
interface PaymentConfig {
  apiKey: string;       // Chave de API do merchant (obrigatório)
  baseUrl?: string;     // Base URL (default: https://api.momenu.online)
  qaMode?: boolean;     // Ambiente de testes (adiciona x-env-qa header)
  devMode?: boolean;    // Modo dev / localhost (adiciona x-dev-mode header)
}
```

### Ambiente de Testes (QA)

Para testar sem transações reais, usa `qaMode: true` e os ["Números Mágicos"](https://github.com/ithustle/sdk-momenu-react#testes):
*   `244900000000`: Sucesso
*   `244900000001`: Saldo Insuficiente
*   `244900000002`: Timeout / Erro de Processamento
*   `244900000003`: Rejeitado pelo Cliente

---

## Opções de Tematização (PaymentTheme)

O SDK é totalmente customizável via CSS Variables injetadas pelo Provider:

```tsx
<MoMenuPaymentProvider
  config={{ apiKey: '...' }}
  theme={{
    primaryColor: '#F97316',      // Cor da sua marca
    borderRadius: '12px',         // Estilo de botões e cards
    fontFamily: 'Inter, sans-serif'
  }}
>
```

---

## Componentes Individuais

### `MCXPaymentForm` — Multicaixa Express
Pagamento imediato via telemóvel. O cliente recebe uma notificação push.

### `EkwanzaPaymentForm` — E-kwanza
Pagamento via QR Code com polling automático de status até a confirmação.

### `ReferencePaymentDisplay` — Referência ATM
Gera entidade e referência para pagamento em caixas ATM ou Internet Banking.

---

## Hooks para Customização Total

Se preferires criar a tua própria UI, usa os nossos hooks:
*   `useMoMenuPayment()`: Acesso ao cliente HTTP direto.
*   `useMCXPayment()`: Lógica de submissão MCX.
*   `useEkwanzaPayment()`: Geração de QR Code e polling.
*   `useReferencePayment()`: Geração de referências ATM.

---

## Responsividade Mobile 📱
O SDK foi desenhado com foco em **Mobile First**.
- Dashboards de checkout adaptáveis.
- Grid de métodos de pagamento dinâmico.
- Suporte a ecrãs minúsculos (iPhone SE em diante).

## Requisitos
- React `^18.0.0` ou `^19.0.0`
- Browsers modernos com suporte a `fetch` e `Intl`

## Licença
MIT © Toquemedia
