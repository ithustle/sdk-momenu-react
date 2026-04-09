# MoMenu Payments SDK for React

SDK de pagamentos Angolanos para React — suporta **Multicaixa Express (MCX)**, **E-kwanza** e **Referência ATM**.

## Instalação

```bash
npm install sdk-momenu-react
```

> ⚠️ **Obrigatório:** importa o CSS do SDK uma vez na raiz da tua aplicação:
> ```ts
> import 'sdk-momenu-react/dist/style.css';
> ```

## Início Rápido

### 1. Envolver a app com o Provider

```tsx
import 'sdk-momenu-react/dist/style.css';
import { MoMenuPaymentProvider } from 'sdk-momenu-react';

function App() {
  return (
    <MoMenuPaymentProvider config={{ apiKey: 'SUA_API_KEY' }}>
      <MinhaApp />
    </MoMenuPaymentProvider>
  );
}
```

### 2. Usar o Checkout completo (recomendado)

O `MoMenuCheckout` apresenta os 3 métodos de pagamento num só componente com UI pronta a usar:

```tsx
import { MoMenuCheckout } from 'sdk-momenu-react';

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

### Ambiente de Testes

```tsx
<MoMenuPaymentProvider
  config={{
    apiKey: 'test-key',
    qaMode: true,
  }}
  theme={{
    primaryColor: '#3b82f6',      // Altera a cor principal (ex: Azul)
    borderRadius: '8px',          // Altera o arredondamento dos cantos
    fontFamily: 'Roboto, sans-serif' // Altera a fonte do SDK
  }}
>
```

---

## Opções de Tematização (PaymentTheme)

```ts
interface PaymentTheme {
  primaryColor?: string;      // Cor dos botões e estados ativos
  primaryHoverColor?: string; // Cor ao passar o rato (opcional)
  borderRadius?: string;      // ex: '0px', '12px', '50%'
  backgroundColor?: string;   // Fundo do formulário
  cardColor?: string;         // Fundo interno dos cards
  textColor?: string;         // Cor do texto principal
  fontFamily?: string;        // Fonte padrão (ex: 'Inter', 'sans-serif')
}
```

---

## Componentes Individuais

### `MCXPaymentForm` — Multicaixa Express

Pagamento imediato via telemóvel. O cliente recebe uma notificação push para confirmar.

```tsx
import { MCXPaymentForm } from 'sdk-momenu-react';

<MCXPaymentForm
  amount={2500}
  onSuccess={(data) => console.log(data.transactionId)}
  onError={(err) => console.error(err)}
/>
```

### `EkwanzaPaymentForm` — E-kwanza

Pagamento via QR Code com polling automático de status.

```tsx
import { EkwanzaPaymentForm } from 'sdk-momenu-react';

<EkwanzaPaymentForm
  amount={2500}
  onSuccess={(data) => console.log(data)}
  onError={(err) => console.error(err)}
/>
```

### `ReferencePaymentDisplay` — Referência ATM

Gera uma referência para pagamento em caixas ATM ou internet banking.

```tsx
import { ReferencePaymentDisplay } from 'sdk-momenu-react';

<ReferencePaymentDisplay
  amount={2500}
  onSuccess={(data) => console.log(data.referenceNumber)}
  onError={(err) => console.error(err)}
/>
```

---

## Hooks

### `useMoMenuPayment` — Acesso direto ao client

Para implementações custom sem os componentes UI:

```tsx
import { useMoMenuPayment } from 'sdk-momenu-react';

function MeuCheckoutCustom() {
  const { client } = useMoMenuPayment();

  const handlePay = async () => {
    const result = await client.payMCX({
      paymentInfo: { amount: 2500, phoneNumber: '244923000000' },
    });
    console.log(result);
  };

  return <button onClick={handlePay}>Pagar com MCX</button>;
}
```

### `useMCXPayment`

```tsx
import { useMCXPayment } from 'sdk-momenu-react';

const { pay, loading, error, result } = useMCXPayment();
await pay({ paymentInfo: { amount: 2500, phoneNumber: '244923000000' } });
```

### `useEkwanzaPayment`

```tsx
import { useEkwanzaPayment } from 'sdk-momenu-react';

const { pay, loading, error, result } = useEkwanzaPayment();
```

### `useReferencePayment`

```tsx
import { useReferencePayment } from 'sdk-momenu-react';

const { pay, loading, error, result } = useReferencePayment();
```

---

## HTTP Client Direto

Para uso sem React (Node.js, etc.):

```ts
import { MoMenuPaymentClient } from 'sdk-momenu-react';

const client = new MoMenuPaymentClient({ apiKey: 'SUA_API_KEY' });

// MCX
const mcx = await client.payMCX({
  paymentInfo: { amount: 2500, phoneNumber: '244923000000' },
});

// E-kwanza
const ekwanza = await client.payEkwanza({
  paymentInfo: { amount: 2500, phoneNumber: '244923000000' },
});

// Referência ATM
const ref = await client.payReference({
  paymentInfo: { amount: 2500 },
});

// Polling manual de status
const stopPolling = client.pollEkwanzaStatus(ekwanza.code!, {
  onSuccess: (data) => console.log('Pago!', data),
  onError: (err) => console.error(err),
  intervalMs: 5000,
  maxAttempts: 60,
});

// Para parar o polling
stopPolling();
```

---

## Utils

```ts
import { formatCurrency, formatDate, validatePhone, validateAmount, calculateFee } from 'sdk-momenu-react';

formatCurrency(2500);           // "2.500,00 Kz"
formatDate('2025-01-01T12:00') // "01/01/2025, 12:00"
validatePhone('244923000000')   // true
calculateFee(2500)              // 50 (2%)
```

---

## Tipos Principais

```ts
import type {
  PaymentConfig,
  PaymentProduct,
  PaymentCustomer,
  MCXPaymentRequest,
  MCXPaymentResponse,
  EkwanzaPaymentRequest,
  EkwanzaPaymentResponse,
  ReferencePaymentRequest,
  ReferencePaymentResponse,
  WebhookPayload,
  PaymentError,
} from 'sdk-momenu-react';
```

---

## Requisitos

- React `^18.0.0` ou `^19.0.0`
- Browsers modernos com suporte a `fetch` e `Intl`

## Licença

MIT © Toquemedia
