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
| `amount` | `number` | ✅ | — | Valor total em Kwanzas |
| `products` | `PaymentProduct[]` | ❌ | — | Lista de produtos para facturação SAFT-AO |
| `customer` | `PaymentCustomer` | ❌ | — | Dados do cliente (pré-preenchimento) |
| `initialMethod` | `'mcx' \| 'reference'` | ❌ | `'mcx'` | Método de pagamento seleccionado por defeito |
| `isModal` | `boolean` | ❌ | `true` | Exibe o checkout como modal com overlay |
| `isOpen` | `boolean` | ❌ | `true` | Controla a visibilidade do modal |
| `onClose` | `() => void` | ❌ | — | Callback ao fechar o modal |
| `simulateResult` | `SimulateResult` | ❌ | — | Simula resultados em modo QA |
| `onSuccess` | `(data: any) => void` | ❌ | — | Callback de pagamento bem-sucedido |
| `onError` | `(error: any) => void` | ❌ | — | Callback de erro no pagamento |

**Exemplo com modal controlado:**

```tsx
const [open, setOpen] = useState(false);

<MoMenuCheckout
  amount={5000}
  isModal={true}
  isOpen={open}
  initialMethod="reference"
  onClose={() => setOpen(false)}
  onSuccess={(data) => console.log(data)}
/>
```

---

## 🧾 Facturação SAFT-AO

Para que a API da MoMenu gere facturas válidas automaticamente, o SDK permite passar os dados do cliente e a lista de produtos.

### Dados do Cliente (`PaymentCustomer`)
Pode passar dados iniciais do cliente, mas o utilizador também tem a opção de os introduzir/editar directamente na interface do checkout.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `name` | `string` | ✅ | Nome completo do cliente |
| `nif` | `string` | ❌ | NIF para facturação SAFT-AO |
| `phone` | `string` | ❌ | Número de telefone do cliente |

```tsx
const customer = {
  name: 'João Lourenço',
  nif: '5000123456',
  phone: '244923456789'
};

// No componente
<MoMenuCheckout amount={5000} products={products} customer={customer} />
```

> [!TIP]
> De acordo com as regras de facturação, se o **Nome** for fornecido, o **NIF** também deve ser (e vice-versa). O SDK valida isto automaticamente na interface.

### Produtos (`PaymentProduct`)

A lista de produtos permite que a API calcule o total exacto com IVA incluído, garantindo facturas SAFT-AO válidas.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | `string` | ✅ | Identificador único do produto |
| `productName` | `string` | ✅ | Nome do produto para exibição |
| `productPrice` | `number` | ✅ | Preço unitário em Kwanzas |
| `productQuantity` | `number` | ✅ | Quantidade |
| `iva` | `number` | ❌ | Taxa de IVA (1 a 14, default: `14`) |

```tsx
const products = [
  { id: '1', productName: 'Plano Pro', productPrice: 5000, productQuantity: 1, iva: 14 },
  { id: '2', productName: 'Taxa de Activação', productPrice: 1000, productQuantity: 1, iva: 7 },
];
```

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

## 🔧 Hooks Avançados

Se preferir construir a sua própria interface, pode usar os hooks internos:

- `useMCXPayment()`: Gestão de fluxo Multicaixa Express.
- `useReferencePayment()`: Geração e consulta de referências bancárias.
- `useMoMenuPayment()`: Acesso ao cliente SDK e configurações globais.

---

## 💡 Dicas de Integração

> [!TIP]
> **Conformidade SAFT-AO (Evitar Erro 400)**: Se enviar a lista de `products`, o SDK omitirá automaticamente o campo `amount` no pedido para a API. Isto permite que a MoMenu realize o cálculo total exacto com IVA, garantindo que a factura seja emitida sem discrepâncias.

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
