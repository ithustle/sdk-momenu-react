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
import 'momenu-payments/dist/sdk-momenu-react.css';
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

---

## 🧾 Facturação SAFT-AO

Para que a API da MoMenu gere facturas válidas automaticamente, o SDK permite passar os dados do cliente e a lista de produtos.

### Dados do Cliente (Opcional)
Pode passar dados iniciais do cliente, mas o utilizador também tem a opção de os introduzir/editar directamente na interface do checkout.

```tsx
const customer = {
  name: 'João Lourenço',
  nif: '5000123456'
};

// No componente
<MoMenuCheckout amount={5000} products={products} customer={customer} />
```

> [!TIP]
> De acordo com as regras de facturação, se o **Nome** for fornecido, o **NIF** também deve ser (e vice-versa). O SDK valida isto automaticamente na interface.

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
    primaryColor: '#F97316',      // Cor da sua marca
    borderRadius: '18px',         // Arredondamento premium
    fontFamily: 'Inter, sans-serif'
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
