# MoMenu Payments SDK 🚀

[![NPM version](https://img.shields.io/npm/v/momenu-payments.svg?style=flat-square)](https://www.npmjs.com/package/momenu-payments)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](https://github.com/ithustle/sdk-momenu-react/blob/main/LICENSE)
[![NPM downloads](https://img.shields.io/npm/dm/momenu-payments.svg?style=flat-square)](https://www.npmjs.com/package/momenu-payments)

SDK de pagamentos Angolanos para React — **Multicaixa Express (MCX)**, **E-kwanza** e **Referência ATM**.

Integra pagamentos na tua aplicação React em minutos com componentes prontos a usar.

---

## 📦 Instalação

```bash
npm install momenu-payments
```

Importa o CSS na raiz da tua aplicação:

```tsx
import 'momenu-payments/dist/sdk-momenu-react.css';
```

---

## 🚀 Início Rápido

### Passo 1: Configurar o Provider

Envolve a tua aplicação com o `MoMenuPaymentProvider`:

```tsx
import 'momenu-payments/dist/sdk-momenu-react.css';
import { MoMenuPaymentProvider } from 'momenu-payments';

function App() {
  return (
    <MoMenuPaymentProvider config={{ apiKey: 'SUA_API_KEY' }}>
      <MinhaApp />
    </MoMenuPaymentProvider>
  );
}
```

### Passo 2: Adicionar o Checkout

Usa o componente `MoMenuCheckout` na tua página de pagamento:

```tsx
import { MoMenuCheckout } from 'momenu-payments';

function PaginaPagamento() {
  return (
    <MoMenuCheckout
      amount={2500}
      onSuccess={(data) => {
        console.log('Pagamento confirmado!', data);
        // Redirecionar para página de sucesso
      }}
      onError={(err) => {
        console.error('Erro no pagamento:', err);
        // Mostrar mensagem de erro
      }}
    />
  );
}
```

**Pronto!** O SDK cuida de tudo automaticamente. 🎉

---

## 📚 Componentes

### `MoMenuCheckout`

Checkout completo com os 3 métodos de pagamento num só componente.

```tsx
<MoMenuCheckout
  amount={2500}
  onSuccess={(data) => console.log('Pago!', data)}
  onError={(err) => console.error('Erro:', err)}
/>
```

**Props:**
- `amount` (number) - Valor em Kwanzas
- `onSuccess` (function) - Callback quando pagamento é confirmado
- `onError` (function) - Callback quando ocorre erro

---

### `MCXPaymentForm`

Formulário para pagamento via Multicaixa Express.

```tsx
<MCXPaymentForm
  amount={2500}
  onSuccess={(data) => console.log('Pago!', data)}
  onError={(err) => console.error('Erro:', err)}
/>
```

**Como funciona:**
1. Utilizador insere o número de telefone
2. Recebe notificação push no telemóvel
3. Confirma o pagamento na app Multicaixa
4. Pagamento é processado instantaneamente

---

### `EkwanzaPaymentForm`

Formulário para pagamento via E-kwanza (QR Code).

```tsx
<EkwanzaPaymentForm
  amount={2500}
  onSuccess={(data) => console.log('Pago!', data)}
  onError={(err) => console.error('Erro:', err)}
/>
```

**Como funciona:**
1. Utilizador insere o número de telefone
2. SDK gera um QR Code
3. Utilizador escaneia o QR Code com a app E-kwanza
4. Utilizador clica no botão **"✓ Já Paguei"** após pagar
5. SDK verifica o pagamento e confirma

---

### `ReferencePaymentDisplay`

Gerador de referência bancária para pagamento via ATM.

```tsx
<ReferencePaymentDisplay
  amount={2500}
  onSuccess={(data) => console.log('Pago!', data)}
  onError={(err) => console.error('Erro:', err)}
/>
```

**Como funciona:**
1. SDK gera automaticamente a entidade e referência
2. Utilizador paga via ATM Multicaixa ou Internet Banking
3. Utilizador clica no botão **"✓ Já Paguei"** após pagar
4. SDK verifica o pagamento e confirma

---

## 🎨 Personalização

### Tematização

Personaliza as cores e estilos do SDK:

```tsx
<MoMenuPaymentProvider
  config={{ apiKey: '...' }}
  theme={{
    primaryColor: '#F97316',      // Cor principal
    borderRadius: '12px',         // Arredondamento dos botões
    fontFamily: 'Inter, sans-serif' // Fonte
  }}
>
```

### Configuração Completa

```tsx
<MoMenuPaymentProvider
  config={{
    apiKey: 'SUA_API_KEY',  // Obrigatório
    qaMode: false,          // true para ambiente de testes
    devMode: false          // true para desenvolvimento local
  }}
  theme={{
    primaryColor: '#F97316',
    borderRadius: '12px',
    fontFamily: 'Inter, sans-serif'
  }}
>
```

---

## 🧪 Ambiente de Testes

Para testar sem transações reais, ativa o modo QA:

```tsx
<MoMenuPaymentProvider config={{ apiKey: '...', qaMode: true }}>
```

**Números de teste (Números Mágicos):**
- `244900000000` - Pagamento bem-sucedido ✅
- `244900000001` - Saldo insuficiente ❌
- `244900000002` - Timeout / Erro de processamento ⏱️
- `244900000003` - Rejeitado pelo cliente 🚫

---

## 🔒 Segurança

### Proteger a API Key

**Nunca** exponhas a API key diretamente no código. Usa variáveis de ambiente:

```tsx
// ❌ ERRADO
<MoMenuPaymentProvider config={{ apiKey: 'sk_live_abc123...' }} />

// ✅ CORRETO
<MoMenuPaymentProvider 
  config={{ apiKey: import.meta.env.VITE_MOMENU_API_KEY }} 
/>
```

**Ficheiro `.env`:**
```bash
VITE_MOMENU_API_KEY=sk_live_abc123...
```

**Ficheiro `.gitignore`:**
```bash
.env
.env.local
.env.*.local
```

### Registar Domínios

Antes de usar em produção, regista os teus domínios no [dashboard MoMenu](https://momenu.online):

**Desenvolvimento:**
- `http://localhost:3000`
- `http://localhost:5173` (Vite)

**Produção:**
- `https://tua-app.com`
- `https://www.tua-app.com`

Apenas domínios registados podem usar a tua API key.

---

## 💡 Exemplo Completo

```tsx
import 'momenu-payments/dist/sdk-momenu-react.css';
import { MoMenuPaymentProvider, MoMenuCheckout } from 'momenu-payments';
import { useState } from 'react';

function App() {
  const [pagamentoConcluido, setPagamentoConcluido] = useState(false);

  return (
    <MoMenuPaymentProvider 
      config={{ 
        apiKey: import.meta.env.VITE_MOMENU_API_KEY,
        qaMode: false 
      }}
      theme={{
        primaryColor: '#F97316',
        borderRadius: '12px'
      }}
    >
      {pagamentoConcluido ? (
        <div className="sucesso">
          <h1>✅ Pagamento Confirmado!</h1>
          <p>Obrigado pela tua compra.</p>
        </div>
      ) : (
        <div className="pagamento">
          <h1>Finalizar Compra</h1>
          <p>Total: 2.500,00 Kz</p>
          
          <MoMenuCheckout
            amount={2500}
            onSuccess={(data) => {
              console.log('Pagamento confirmado!', data);
              setPagamentoConcluido(true);
            }}
            onError={(err) => {
              console.error('Erro:', err);
              alert('Erro ao processar pagamento. Tenta novamente.');
            }}
          />
        </div>
      )}
    </MoMenuPaymentProvider>
  );
}

export default App;
```

---

## 🔧 Hooks (Avançado)

Se precisares de mais controlo sobre o fluxo de pagamento, usa os hooks:

### `useMCXPayment()`

```tsx
import { useMCXPayment } from 'momenu-payments';

function MeuComponente() {
  const { pay, loading, data, error, reset } = useMCXPayment();

  const handlePay = async () => {
    try {
      await pay({
        paymentInfo: { 
          amount: 2500, 
          phoneNumber: '244923000000' 
        }
      });
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  return (
    <div>
      <button onClick={handlePay} disabled={loading}>
        {loading ? 'A processar...' : 'Pagar'}
      </button>
      {error && <p>Erro: {error.message}</p>}
      {data && <p>✅ Pagamento confirmado!</p>}
    </div>
  );
}
```

### `useEkwanzaPayment()`

```tsx
import { useEkwanzaPayment } from 'momenu-payments';

function MeuComponente() {
  const { 
    pay, 
    loading, 
    data, 
    checkStatus, 
    checkingStatus,
    paymentStatus,
    error 
  } = useEkwanzaPayment();

  const handlePay = async () => {
    await pay({
      paymentInfo: { 
        amount: 2500, 
        phoneNumber: '244923000000' 
      }
    });
  };

  const handleCheckStatus = async () => {
    await checkStatus();
  };

  return (
    <div>
      {!data && (
        <button onClick={handlePay} disabled={loading}>
          Gerar QR Code
        </button>
      )}

      {data && !paymentStatus && (
        <div>
          <img src={data.qrCode} alt="QR Code" />
          <p>Escaneia o QR Code com a app E-kwanza</p>
          <button onClick={handleCheckStatus} disabled={checkingStatus}>
            {checkingStatus ? 'A verificar...' : '✓ Já Paguei'}
          </button>
        </div>
      )}

      {paymentStatus?.status === 'paid' && (
        <p>✅ Pagamento confirmado!</p>
      )}

      {error && <p>❌ Erro: {error.message}</p>}
    </div>
  );
}
```

### `useReferencePayment()`

```tsx
import { useReferencePayment } from 'momenu-payments';

function MeuComponente() {
  const { 
    pay, 
    loading, 
    data, 
    checkStatus, 
    checkingStatus,
    paymentStatus,
    error 
  } = useReferencePayment();

  const handlePay = async () => {
    await pay({
      paymentInfo: { amount: 2500 }
    });
  };

  const handleCheckStatus = async () => {
    await checkStatus();
  };

  return (
    <div>
      {data && (
        <div>
          <p><strong>Entidade:</strong> {data.entity}</p>
          <p><strong>Referência:</strong> {data.referenceNumber}</p>
          <p><strong>Validade:</strong> {data.dueDate}</p>
          
          <button onClick={handleCheckStatus} disabled={checkingStatus}>
            {checkingStatus ? 'A verificar...' : '✓ Já Paguei'}
          </button>
        </div>
      )}

      {paymentStatus?.payment.status === 'paid' && (
        <p>✅ Pagamento confirmado!</p>
      )}

      {error && <p>❌ Erro: {error.message}</p>}
    </div>
  );
}
```

---

## 📱 Responsividade

O SDK foi desenhado com foco em **Mobile First**:
- ✅ Interface adaptável a todos os tamanhos de ecrã
- ✅ Suporte desde iPhone SE até tablets
- ✅ Touch-friendly para dispositivos móveis
- ✅ Otimizado para conexões lentas

---

## ⚙️ Requisitos

- React `^18.0.0` ou `^19.0.0`
- Browsers modernos (Chrome, Firefox, Safari, Edge)

---

## 📖 Recursos

- **Dashboard:** [momenu.online](https://api.momenu.online/docs) - Gestão de API keys e domínios

---

## 📄 Licença

MIT © Toquemedia

