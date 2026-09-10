# MoMenu Payments SDK 🚀

[![NPM version](https://img.shields.io/npm/v/momenu-payments.svg?style=flat-square)](https://www.npmjs.com/package/momenu-payments)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](https://github.com/ithustle/sdk-momenu-react/blob/main/LICENSE)

O SDK de pagamentos oficial da **MoMenu** para React. Integre pagamentos angolanos (Multicaixa Express e Referência Bancária) na sua aplicação em minutos com conformidade **SAFT-AO**.

---

## 📦 Instalação

```bash
npm install momenu-payments
```

Importe os estilos globais na raiz do seu projecto (ex: `main.tsx` ou `App.tsx`):

```tsx
import 'momenu-payments/style.css';
```

---

## 🚀 Início Rápido

### 1. Configurar o Provider

Envolva a sua aplicação com o `MoMenuPaymentProvider`:

```tsx
import { MoMenuPaymentProvider } from 'momenu-payments';

function App() {
  return (
    <MoMenuPaymentProvider 
        config={{ 
            apiKey: 'SUA_API_KEY',
            qaMode: true // Ative para testes
        }}
    >
      <MinhaApp />
    </MoMenuPaymentProvider>
  );
}
```

### 2. Adicionar o Checkout Premium

O componente `MoMenuCheckout` oferece uma interface completa e moderna com todos os métodos suportados.

```tsx
import { MoMenuCheckout } from 'momenu-payments';

function CheckoutPage() {
  const products = [
    { id: '1', productName: 'iPhone 15 Pro', productPrice: 1500000, productQuantity: 1 }
  ];

  return (
    <MoMenuCheckout
      amount={1500000}
      products={products}
      onSuccess={(data) => console.log('Sucesso:', data)}
      onError={(err) => console.error('Erro:', err)}
    />
  );
}
```

#### Props do `MoMenuCheckout`

| Prop | Tipo | Obrigatório | Default | Descrição |
|---|---|---|---|---|
| `amount` | `number` | ✅ | — | Valor total a pagar em Kwanzas (deve coincidir com a soma dos produtos) |
| `products` | `PaymentProduct[]` | ✅ | — | Lista de produtos (obrigatório pela API para conformidade SAFT-AO) |
| `customer` | `PaymentCustomer` | ❌ | — | Dados do cliente para fatura nominal |
| `initialMethod` | `'mcx' \| 'reference'` | ❌ | `'mcx'` | Método de pagamento selecionado inicialmente |
| `isModal` | `boolean` | ❌ | `true` | Exibe o checkout como modal flutuante |
| `isOpen` | `boolean` | ❌ | `true` | Controla se o modal está visível ou oculto |
| `autoPoll` | `boolean` | ❌ | `false` | Verificação automática em segundo plano do pagamento da referência |
| `onClose` | `() => void` | ❌ | — | Callback executado ao fechar o modal |
| `simulateResult` | `SimulateResult` | ❌ | — | Simulação de resultados no ambiente QA |
| `onSuccess` | `(data) => void` | ❌ | — | Callback acionado no sucesso do pagamento |
| `onError` | `(error) => void` | ❌ | — | Callback acionado em caso de erro |

**Exemplo com modal controlado:**

```tsx
const [open, setOpen] = useState(false);

const products = [
  { id: '1', productName: 'Subscrição Mensal', productPrice: 5000, productQuantity: 1, iva: 14 }
];

<MoMenuCheckout
  amount={5000}
  products={products}
  isModal={true}
  isOpen={open}
  initialMethod="reference"
  onClose={() => setOpen(false)}
  onSuccess={(data) => console.log('Pago com sucesso:', data)}
/>
```

---

## 🧾 Facturação SAFT-AO e Campos Obrigatórios

A API da MoMenu exige dados estruturados para emissão automática de faturas legais certificadas pela AGT.

### 1. Produtos (`PaymentProduct`) — ✅ Obrigatório

A lista de produtos é a **fonte da verdade** dos itens e do cálculo de impostos.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|:---:|---|
| `id` | `string` | ✅ | Identificador único do produto no seu sistema |
| `productName` | `string` | ✅ | Nome/descrição do item para a fatura |
| `productPrice` | `number` | ✅ | Preço unitário em Kwanzas (`> 0`) |
| `productQuantity` | `number` | ✅ | Quantidade do item (inteiro `> 0`) |
| `iva` | `number` | ❌ | Taxa de IVA (de `0` a `14`, default: `0` / isento quando omitido) |

```tsx
const products: PaymentProduct[] = [
  { id: 'prod-01', productName: 'Plano Pro Anual', productPrice: 50000, productQuantity: 1, iva: 14 },
  { id: 'prod-02', productName: 'Taxa de Instalação', productPrice: 5000, productQuantity: 1, iva: 7 },
];
```

> [!IMPORTANT]
> **Validação de Soma**: O valor total informado em `amount` deve ser igual à soma de `(productPrice * productQuantity)` de todos os produtos. O SDK valida isto antes do envio.

---

### 2. Dados do Cliente (`PaymentCustomer`) — ❌ Opcional

Se omitido, a fatura é emitida automaticamente para **Consumidor Final (NIF 999999999)**.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|:---:|---|
| `name` | `string` | ⚠️ Condicional | Nome completo do cliente. **Exige `nif` real associado.** |
| `nif` | `string` | ⚠️ Condicional | NIF do cliente. **Obrigatório se enviar `name`.** (9 a 14 caracteres). |
| `phone` | `string` | ❌ Opcional | Telefone do cliente (formato `244XXXXXXXXX`) |

```tsx
const customer: PaymentCustomer = {
  name: 'Empresa Exemplo Lda',
  nif: '5417000000',
  phone: '244923456789'
};
```

> [!NOTE]
> **Regra AGT**: Se enviar `name` sem um `nif` válido, a API MoMenu emitirá a fatura a **Consumidor Final** para evitar rejeição fiscal. Apenas com nome e NIF válidos ambos figurarão no documento final.

---

### 3. Configuração do Provedor (`PaymentConfig`) — ✅ Obrigatório

| Campo | Tipo | Obrigatório | Descrição |
|---|---|:---:|---|
| `apiKey` | `string` | ✅ | Chave pública da API MoMenu (enviada no header `x-api-key`) |
| `qaMode` | `boolean` | ❌ | Se `true`, ativa o ambiente de testes/sandbox da MoMenu |
| `baseUrl` | `string` | ❌ | URL base da API (padrão: `https://api.momenu.online`) |

---

## 💳 Métodos Suportados

### 1. Multicaixa Express (MCX)
O utilizador insere o número de telefone e confirma o pagamento instantaneamente na aplicação Multicaixa Express do seu dispositivo.

### 2. Referência Bancária (ATM)
O SDK gera uma Entidade e Referência únicas. O utilizador pode pagar em qualquer ATM ou via Internet Banking. O SDK inclui um botão "✓ Já Paguei" para verificação imediata após o pagamento.

---

## 🎨 Personalização de Temas

O SDK foi desenhado para se adaptar à sua marca.

```tsx
<MoMenuPaymentProvider
  config={{ apiKey: '...' }}
  theme={{
    primaryColor: '#F97316',          // Cor principal (Botões e destaques)
    primaryHoverColor: '#EA580C',     // Cor ao passar o rato
    borderRadius: '18px',             // Arredondamento dos componentes
    backgroundColor: '#ffffff',       // Fundo do modal/container
    cardColor: '#f8fafc',             // Cor dos cartões internos
    textColor: '#1e293b',             // Cor do texto
    fontFamily: 'Inter, sans-serif'   // Fonte personalizada
  }}
>
```

---

## 🧪 Ambiente de Testes (QA)

Ative o `qaMode: true` na configuração para usar o ambiente de testes da MoMenu.

**Números Mágicos (Simulação MCX):**
- `244900000000`: Sucesso ✅
- `244900000001`: Saldo Insuficiente ❌
- `244900000002`: Timeout (Expirado) ⏳
- `244900000003`: Rejeitado pelo Cliente 🚫
- `244999999999`: Número Inválido ⚠️

---

## 🧩 Componentes Individuais

Se necessitar de incorporar apenas um método de pagamento na sua própria UI, pode usar os sub-componentes directamente em vez do `MoMenuCheckout` completo.

### `MCXPaymentForm`
Formulário de pagamento via Multicaixa Express.

```tsx
import { MCXPaymentForm } from 'momenu-payments';

<MCXPaymentForm
  amount={5000}
  products={products}
  customer={customer}
  simulateResult="success" // QA only
  onSuccess={(data) => console.log(data)}
  onError={(err) => console.error(err)}
/>
```

### `ReferencePaymentDisplay`
Geração e exibição de referência bancária (ATM), incluindo botão de verificação de pagamento.

```tsx
import { ReferencePaymentDisplay } from 'momenu-payments';

<ReferencePaymentDisplay
  amount={5000}
  products={products}
  customer={customer}
  onSuccess={(data) => console.log(data)}
  onError={(err) => console.error(err)}
/>
```

---

## 🔧 Hooks e Cliente Direto

Se preferir construir a sua própria interface personalizada:

- `useMCXPayment()`: Gestão de fluxo Multicaixa Express (estado de carregamento, erros e submissão).
- `useReferencePayment()`: Geração, visualização e polling de status de referências bancárias.
- `useMoMenuPayment()`: Acesso à instância do `MoMenuPaymentClient` e configurações globais.

---

## 📡 Mapeamento dos Endpoints da API MoMenu

O SDK comunica diretamente com os seguintes endpoints da API oficial:

### 1. Multicaixa Express
* **Endpoint:** `POST /api/payment/mcx`
* **Método no SDK:** `client.payMCX()` / `useMCXPayment()`
* **Campos Obrigatórios no Payload:**
  - `paymentInfo.amount` *(number)*: Valor em Kwanzas.
  - `paymentInfo.phoneNumber` *(string)*: Telemóvel angolano no formato `244XXXXXXXXX`.
  - `products` *(array)*: Mínimo 1 produto com `productName`, `productPrice`, `productQuantity`.
  - `instantWithdraw` *(boolean)*: **Obrigatório** (o SDK injeta automaticamente `true`).
* **Campos Opcionais:** `customer` (`name`, `nif`, `phone`), `simulateResult` *(QA)*.
* **Resposta de Sucesso:** `{ success: true, transactionId: "...", invoiceUrl: "..." }`

### 2. Geração de Referência Bancária
* **Endpoint:** `POST /api/payment/reference`
* **Método no SDK:** `client.payReference()` / `useReferencePayment()`
* **Campos Obrigatórios no Payload:**
  - `paymentInfo.amount` *(number)*: Valor em Kwanzas.
  - `products` *(array)*: Mínimo 1 produto com `productName`, `productPrice`, `productQuantity`.
  - `instantWithdraw` *(boolean)*: **Obrigatório** (o SDK injeta automaticamente `true`).
* **Campos Opcionais:** `customer` (`name`, `nif`, `phone`).
* **Resposta de Sucesso:** `{ success: true, operationId: "...", transactionId: "...", entity: "...", referenceNumber: "...", dueDate: "..." }`

### 3. Consulta de Status da Referência (Fallback / Polling)
* **Endpoint:** `GET /api/payment/reference/status/:operationId?merchantTransactionId=...`
* **Método no SDK:** `client.checkReferenceStatus(operationId, merchantTransactionId)`
* **Parâmetros:**
  - `operationId` *(Path, Obrigatório)*: ID da operação devolvido na criação da referência.
  - `merchantTransactionId` *(Query, Recomendado)*: ID da transação da ordem.
* **Resposta:** `{ success: true, payment: { status: "paid" | "open" | "cancelled", message: "..." }, invoiceUrl: "..." }`

---

## 💡 Dicas de Integração

> [!TIP]
> **Conformidade SAFT-AO (Evitar Erro 400)**: Se enviar a lista de `products`, o SDK omitirá automaticamente o campo `amount` no pedido para a API em todos os métodos. Isto permite que a MoMenu realize o cálculo total exacto com IVA, garantindo que a factura seja emitida sem discrepâncias.

> [!IMPORTANT]
> **Fiabilidade em Produção**: O SDK implementa automaticamente uma estratégia de re-tentativa (retries) para erros de rede transientes e erros de servidor (5xx), garantindo que o checkout não falhe por instabilidades momentâneas da ligação.

> [!IMPORTANT]
> **Testes em Localhost**: Para evitar erros de autorização de domínio em desenvolvimento, adicione `http://localhost:5173` (ou a sua porta local) à lista de domínios permitidos no seu Painel MoMenu.

---

## 📱 Responsividade

O SDK é **Mobile-First** e utiliza técnicas modernas de blur e glassmorphism, garantindo uma experiência premium em iPhones, Androids e Desktop.

---

## 📖 Recursos e Suporte

- **Documentação da API:** [api.momenu.online/docs](https://api.momenu.online/docs)
- **Suporte Técnico:** tecnico@toquemedia.net

---

MIT © [Toquemedia](https://toquemedia.net)
