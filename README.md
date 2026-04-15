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

---

## Arquitetura: Polling vs Webhooks

### Diferenças Fundamentais

O SDK MoMenu suporta duas abordagens para verificação de status de pagamentos:

**Polling (Client-Side)**
- O cliente verifica periodicamente o status do pagamento através de requisições HTTP
- Funciona em aplicações puramente client-side (sem backend)
- Ideal para MVPs, protótipos e aplicações simples
- Implementado automaticamente pelo SDK

**Webhooks (Server-Side)**
- A API MoMenu notifica o teu backend quando o status do pagamento muda
- Requer um servidor backend para receber notificações
- Mais eficiente e em tempo real
- Recomendado para aplicações em produção

### Quando Usar Cada Abordagem

| Cenário | Polling | Webhooks |
|---------|---------|----------|
| Aplicação sem backend | ✅ Recomendado | ❌ Não possível |
| MVP / Protótipo | ✅ Ideal | ⚠️ Desnecessário |
| Produção com backend | ⚠️ Fallback | ✅ Recomendado |
| Aplicação estática (Vercel, Netlify) | ✅ Única opção | ❌ Requer backend |

### Fluxo de Polling (Client-Side Only)

```
┌──────────────┐                    ┌──────────────┐
│   Browser    │                    │  MoMenu API  │
│              │                    │              │
│  1. Criar    │──────────────────▶ │              │
│     Pagamento│                    │              │
│              │ ◀──────────────────│  2. Retornar │
│              │    code/reference  │     Detalhes │
│              │                    │              │
│  3. Iniciar  │                    │              │
│     Polling  │                    │              │
│              │                    │              │
│  4. Verificar│──────────────────▶ │              │
│     Status   │                    │              │
│              │ ◀──────────────────│  5. Status   │
│              │    (pending)       │              │
│              │                    │              │
│  [aguardar]  │                    │              │
│              │                    │              │
│  6. Verificar│──────────────────▶ │              │
│     Status   │                    │              │
│              │ ◀──────────────────│  7. Status   │
│              │    (paid)          │     (paid)   │
│              │                    │              │
│  8. Parar    │                    │              │
│     Polling  │                    │              │
└──────────────┘                    └──────────────┘
```

### Fluxo de Webhooks + Polling Fallback (Com Backend)

```
┌──────────┐         ┌──────────┐         ┌──────────────┐
│ Browser  │         │ Backend  │         │  MoMenu API  │
│          │         │          │         │              │
│ 1.Criar  │────────▶│          │         │              │
│  Pagamento         │ 2.Proxy  │────────▶│              │
│          │         │  Request │         │              │
│          │         │          │◀────────│ 3. Detalhes  │
│          │◀────────│ 4.Retornar         │              │
│          │ Detalhes│          │         │              │
│          │         │          │         │              │
│ 5.Iniciar│         │          │         │              │
│  Polling │         │          │         │              │
│ (backup) │         │          │         │              │
│          │         │          │◀────────│ 6. Webhook   │
│          │         │ 7.Processar        │    (paid)    │
│          │         │  Webhook │         │              │
│          │         │          │         │              │
│          │◀────────│ 8.Notificar        │              │
│ 9.Parar  │  WebSocket/SSE     │         │              │
│  Polling │         │          │         │              │
└──────────┘         └──────────┘         └──────────────┘
```

---

## Integração Sem Backend (Client-Side Only)

Esta abordagem é ideal para aplicações sem backend, MVPs e protótipos. O SDK usa polling automático para verificar o status do pagamento.

### Passo 1: Configurar API Key

Obtém a tua API key no [dashboard MoMenu](https://momenu.online) e configura o Provider:

```tsx
import 'momenu-payments/dist/sdk-momenu-react.css';
import { MoMenuPaymentProvider } from 'momenu-payments';

function App() {
  return (
    <MoMenuPaymentProvider 
      config={{ 
        apiKey: import.meta.env.VITE_MOMENU_API_KEY, // Usar variável de ambiente
        qaMode: false,
        devMode: process.env.NODE_ENV === 'development'
      }}
    >
      <MinhaApp />
    </MoMenuPaymentProvider>
  );
}
```

### Passo 2: Usar o Checkout com Polling Automático

O polling é habilitado por padrão. O SDK verifica automaticamente o status até o pagamento ser confirmado:

```tsx
import { MoMenuCheckout } from 'momenu-payments';
import { useState } from 'react';

function PaginaPagamento() {
  const [status, setStatus] = useState<'idle' | 'pending' | 'paid' | 'failed'>('idle');

  return (
    <div>
      <MoMenuCheckout
        amount={2500}
        onSuccess={(data) => {
          console.log('Pagamento confirmado!', data);
          setStatus('paid');
          // Redirecionar para página de sucesso
          window.location.href = '/sucesso';
        }}
        onError={(error) => {
          console.error('Erro no pagamento:', error);
          setStatus('failed');
        }}
      />
      
      {status === 'pending' && (
        <div className="status-message">
          ⏳ Aguardando confirmação do pagamento...
        </div>
      )}
      
      {status === 'paid' && (
        <div className="status-message success">
          ✅ Pagamento confirmado!
        </div>
      )}
      
      {status === 'failed' && (
        <div className="status-message error">
          ❌ Erro no pagamento. Tenta novamente.
        </div>
      )}
    </div>
  );
}
```

### Passo 3: Validação de Domínio

A API MoMenu valida automaticamente o domínio de origem das requisições. Certifica-te de:

1. **Registar o teu domínio** no dashboard MoMenu
2. **Adicionar localhost** para desenvolvimento local
3. **Incluir todos os domínios** onde a aplicação será hospedada (ex: `app.exemplo.com`, `exemplo.com`)

### Limitações de Segurança

⚠️ **Importante:** Em aplicações client-side, a API key fica exposta no código JavaScript. A API MoMenu mitiga este risco através de:

- **Validação de domínio**: Apenas domínios registados podem usar a API key
- **Rate limiting**: Proteção contra uso abusivo
- **Permissões limitadas**: API keys client-side têm permissões restritas

**Quando migrar para backend:**
- Quando precisares de webhooks em tempo real
- Quando precisares de maior controle sobre transações
- Quando precisares de logs e auditoria no servidor
- Quando a aplicação crescer e precisar de mais segurança

### Exemplo Completo com Tratamento de Estados

```tsx
import { useEkwanzaPayment } from 'momenu-payments';
import { useEffect } from 'react';

function PagamentoEkwanza() {
  const { 
    pay, 
    loading, 
    data, 
    error, 
    paymentStatus,
    isPolling,
    stopPolling,
    reset 
  } = useEkwanzaPayment();

  const handlePay = async () => {
    try {
      await pay({
        amount: 5000,
        merchantTransactionId: `TXN-${Date.now()}`,
        onSuccess: (result) => {
          console.log('Pagamento confirmado:', result);
          // Lógica de sucesso
        },
        onError: (err) => {
          console.error('Erro:', err);
          // Lógica de erro
        }
      });
    } catch (err) {
      console.error('Erro ao criar pagamento:', err);
    }
  };

  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      if (isPolling) {
        stopPolling();
      }
    };
  }, [isPolling, stopPolling]);

  return (
    <div>
      {!data && (
        <button onClick={handlePay} disabled={loading}>
          {loading ? 'A processar...' : 'Pagar com E-kwanza'}
        </button>
      )}

      {data && paymentStatus === 'pending' && (
        <div className="payment-pending">
          <img src={data.qrCode} alt="QR Code" />
          <p>Escaneia o QR Code com a app E-kwanza</p>
          {isPolling && <p>⏳ A verificar pagamento...</p>}
          <button onClick={stopPolling}>Cancelar</button>
        </div>
      )}

      {paymentStatus === 'paid' && (
        <div className="payment-success">
          ✅ Pagamento confirmado!
        </div>
      )}

      {error && (
        <div className="payment-error">
          ❌ Erro: {error.message}
          <button onClick={reset}>Tentar novamente</button>
        </div>
      )}
    </div>
  );
}
```

---

## Integração Com Backend (Webhooks + Polling Fallback)

Esta é a abordagem recomendada para aplicações em produção. Usa webhooks como fonte primária e polling como fallback.

### Passo 1: Configurar Webhooks no Backend

Cria um endpoint no teu backend para receber notificações da API MoMenu:

```typescript
// backend/routes/webhooks.ts
import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// Verificar assinatura do webhook
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return hash === signature;
}

router.post('/momenu-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-momenu-signature'] as string;
  const payload = req.body.toString();

  // Verificar assinatura
  if (!verifyWebhookSignature(payload, signature, process.env.MOMENU_WEBHOOK_SECRET!)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = JSON.parse(payload);

  // Processar evento
  switch (event.type) {
    case 'payment.paid':
      await handlePaymentPaid(event.data);
      break;
    case 'payment.failed':
      await handlePaymentFailed(event.data);
      break;
    default:
      console.log('Evento desconhecido:', event.type);
  }

  res.json({ received: true });
});

async function handlePaymentPaid(data: any) {
  // Atualizar base de dados
  await db.payments.update({
    where: { merchantTransactionId: data.merchantTransactionId },
    data: { status: 'paid', paidAt: new Date() }
  });

  // Notificar frontend via WebSocket
  io.to(data.merchantTransactionId).emit('payment:status', {
    status: 'paid',
    data
  });
}

export default router;
```

### Passo 2: Desabilitar Polling Automático no Frontend

Configura o SDK para não iniciar polling automaticamente:

```tsx
import { useEkwanzaPayment } from 'momenu-payments';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

function PagamentoComWebhook() {
  const { 
    pay, 
    loading, 
    data, 
    paymentStatus,
    checkStatus // Método manual para verificar status
  } = useEkwanzaPayment({
    autoPolling: false // Desabilitar polling automático
  });

  const merchantTransactionId = `TXN-${Date.now()}`;

  useEffect(() => {
    if (!data) return;

    // Conectar ao WebSocket do backend
    const socket = io('https://teu-backend.com');
    
    socket.emit('subscribe', merchantTransactionId);

    socket.on('payment:status', (update) => {
      if (update.status === 'paid') {
        console.log('Pagamento confirmado via webhook!');
        // Atualizar estado local
      }
    });

    // Polling como fallback (caso webhook falhe)
    const fallbackTimeout = setTimeout(() => {
      console.log('Webhook não recebido, iniciando polling fallback...');
      checkStatus(); // Verificação manual
    }, 30000); // 30 segundos

    return () => {
      socket.disconnect();
      clearTimeout(fallbackTimeout);
    };
  }, [data, merchantTransactionId]);

  const handlePay = async () => {
    await pay({
      amount: 5000,
      merchantTransactionId,
      onSuccess: (result) => {
        console.log('Pagamento confirmado:', result);
      }
    });
  };

  return (
    <div>
      <button onClick={handlePay} disabled={loading}>
        Pagar com E-kwanza
      </button>
      
      {data && paymentStatus === 'pending' && (
        <div>
          <img src={data.qrCode} alt="QR Code" />
          <p>Aguardando confirmação via webhook...</p>
        </div>
      )}
    </div>
  );
}
```

### Passo 3: Registar URL do Webhook

No [dashboard MoMenu](https://momenu.online), configura:

1. **URL do webhook**: `https://teu-backend.com/api/webhooks/momenu-webhook`
2. **Eventos**: Seleciona `payment.paid`, `payment.failed`, etc.
3. **Secret**: Guarda o secret para verificar assinaturas

### Passo 4: Sincronização Webhook-Frontend

Usa WebSockets, Server-Sent Events (SSE) ou polling curto para notificar o frontend:

**Opção 1: WebSocket (Recomendado)**
```typescript
// Frontend
const socket = io('https://teu-backend.com');
socket.on('payment:status', (data) => {
  // Atualizar UI
});
```

**Opção 2: Server-Sent Events**
```typescript
// Frontend
const eventSource = new EventSource(`https://teu-backend.com/events/${transactionId}`);
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Atualizar UI
};
```

**Opção 3: Polling Curto (Fallback)**
```typescript
// Frontend - polling manual com intervalo curto
const pollInterval = setInterval(async () => {
  const status = await checkStatus();
  if (status === 'paid') {
    clearInterval(pollInterval);
  }
}, 5000); // Verificar a cada 5 segundos
```

---

## Exemplos de Configuração de Polling

O SDK permite configuração granular do comportamento de polling através da interface `PollingConfig`.

### Polling Agressivo (Intervalos Curtos)

Ideal para pagamentos que precisam de confirmação rápida (ex: E-kwanza):

```tsx
import { useEkwanzaPayment } from 'momenu-payments';

function PagamentoRapido() {
  const { pay } = useEkwanzaPayment({
    initialInterval: 2000,      // Começar com 2 segundos
    backoffMultiplier: 1.2,     // Crescimento lento
    maxInterval: 10000,         // Máximo 10 segundos
    timeout: 180000,            // Timeout de 3 minutos
    maxAttempts: 90,            // Até 90 tentativas
    enableBackoff: true
  });

  return <button onClick={() => pay({ amount: 1000 })}>Pagar</button>;
}
```

### Polling Conservador (Intervalos Longos)

Ideal para pagamentos que demoram mais (ex: Referência ATM):

```tsx
import { useReferencePayment } from 'momenu-payments';

function PagamentoReferencia() {
  const { generate } = useReferencePayment({
    initialInterval: 60000,     // Começar com 1 minuto
    backoffMultiplier: 1.5,     // Crescimento moderado
    maxInterval: 300000,        // Máximo 5 minutos
    timeout: 1800000,           // Timeout de 30 minutos
    maxAttempts: 30,            // Até 30 tentativas
    enableBackoff: true
  });

  return <button onClick={() => generate({ amount: 5000 })}>Gerar Referência</button>;
}
```

### Exponential Backoff Customizado

Controla precisamente como os intervalos crescem:

```tsx
const { pay } = useEkwanzaPayment({
  initialInterval: 5000,       // 5 segundos
  backoffMultiplier: 2.0,      // Dobrar a cada tentativa
  maxInterval: 60000,          // Cap de 1 minuto
  enableBackoff: true
});

// Sequência de intervalos:
// 5s → 10s → 20s → 40s → 60s → 60s → 60s...
```

### Desabilitação de Polling Automático

Para controle total ou uso com webhooks:

```tsx
const { pay, checkStatus, isPolling } = useEkwanzaPayment({
  autoPolling: false  // Não iniciar polling automaticamente
});

// Verificar status manualmente quando necessário
const handleManualCheck = async () => {
  const status = await checkStatus();
  console.log('Status atual:', status);
};
```

### Polling Manual Sob Demanda

Inicia e para polling quando quiseres:

```tsx
import { useMoMenuPayment } from 'momenu-payments';

function PagamentoManual() {
  const client = useMoMenuPayment();
  const [isChecking, setIsChecking] = useState(false);

  const startManualPolling = () => {
    setIsChecking(true);
    
    const stopPolling = client.pollEkwanzaStatus('CODE123', {
      config: {
        initialInterval: 3000,
        maxAttempts: 20
      },
      onSuccess: (data) => {
        console.log('Pago!', data);
        setIsChecking(false);
      },
      onError: (error) => {
        console.error('Erro:', error);
        setIsChecking(false);
      },
      onProgress: (metrics) => {
        console.log(`Tentativa ${metrics.attempts}, próximo em ${metrics.nextInterval}ms`);
      }
    });

    // Guardar função stop para cancelar depois
    return stopPolling;
  };

  return (
    <div>
      <button onClick={startManualPolling} disabled={isChecking}>
        {isChecking ? 'A verificar...' : 'Verificar Status'}
      </button>
    </div>
  );
}
```

### Configuração com Métricas de Observabilidade

Monitora o comportamento do polling em tempo real:

```tsx
const { pay, pollingMetrics } = useEkwanzaPayment({
  initialInterval: 5000,
  enableBackoff: true
});

// pollingMetrics contém:
// - startTime: Timestamp de início
// - attempts: Número de tentativas
// - currentInterval: Intervalo atual
// - nextInterval: Próximo intervalo
// - elapsedTime: Tempo decorrido
// - remainingTime: Tempo restante até timeout

useEffect(() => {
  if (pollingMetrics) {
    console.log(`Tentativa ${pollingMetrics.attempts}`);
    console.log(`Tempo decorrido: ${pollingMetrics.elapsedTime}ms`);
    console.log(`Próxima verificação em: ${pollingMetrics.nextInterval}ms`);
  }
}, [pollingMetrics]);
```

---

## Segurança e Melhores Práticas

### Proteção de API Key em Client-Side

⚠️ **Importante:** Em aplicações client-side, a API key fica exposta no código JavaScript. Segue estas práticas:

#### 1. Usar Variáveis de Ambiente

Nunca comites a API key diretamente no código:

```tsx
// ❌ ERRADO - API key hardcoded
<MoMenuPaymentProvider config={{ apiKey: 'sk_live_abc123...' }} />

// ✅ CORRETO - Usar variável de ambiente
<MoMenuPaymentProvider 
  config={{ apiKey: import.meta.env.VITE_MOMENU_API_KEY }} 
/>
```

**Configuração (.env):**
```bash
# .env.local (não comitar!)
VITE_MOMENU_API_KEY=sk_live_abc123...

# .env.example (comitar como template)
VITE_MOMENU_API_KEY=your_api_key_here
```

#### 2. Diferentes Keys para Ambientes

Usa keys diferentes para desenvolvimento, staging e produção:

```tsx
const apiKey = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_MOMENU_API_KEY_PROD
  : import.meta.env.VITE_MOMENU_API_KEY_DEV;

<MoMenuPaymentProvider config={{ apiKey }} />
```

#### 3. Adicionar .env ao .gitignore

```bash
# .gitignore
.env
.env.local
.env.*.local
```

### Validação de Domínio pela API

A API MoMenu protege contra uso não autorizado através de validação de domínio:

1. **Regista os teus domínios** no [dashboard MoMenu](https://momenu.online)
2. A API verifica o header `Origin` de cada requisição
3. Apenas requisições de domínios registados são aceites

**Domínios a registar:**
- `http://localhost:3000` (desenvolvimento)
- `http://localhost:5173` (Vite)
- `https://tua-app.com` (produção)
- `https://www.tua-app.com` (produção com www)
- `https://staging.tua-app.com` (staging)

### Riscos de Expor API Key

Mesmo com validação de domínio, há riscos:

| Risco | Descrição | Mitigação |
|-------|-----------|-----------|
| **Uso abusivo** | Alguém pode copiar a key e fazer requisições do domínio registado | Rate limiting da API |
| **Inspecção de código** | Key visível no código fonte do browser | Validação de domínio |
| **Ataques CSRF** | Requisições maliciosas do teu domínio | Headers CORS, SameSite cookies |
| **Logs públicos** | Key pode aparecer em logs de erro | Nunca logar keys completas |

### Quando Migrar para Backend

Considera migrar para arquitetura com backend quando:

#### Sinais de que precisas de backend:

✅ **Volume de transações alto** (>1000/mês)
- Backend permite melhor controle e auditoria
- Webhooks são mais eficientes que polling

✅ **Necessidade de webhooks em tempo real**
- Confirmações instantâneas
- Melhor experiência de utilizador

✅ **Requisitos de compliance/auditoria**
- Logs centralizados no servidor
- Rastreabilidade completa de transações

✅ **Lógica de negócio complexa**
- Validações customizadas
- Integração com outros sistemas
- Processamento de dados sensíveis

✅ **Múltiplos métodos de pagamento**
- Orquestração de diferentes providers
- Fallback entre métodos

#### Arquitetura Recomendada com Backend:

```
Frontend (React + SDK)
    ↓
Backend (Node.js/Python/etc)
    ↓
MoMenu API + Outros Providers
```

**Benefícios:**
- API key protegida no servidor
- Webhooks em tempo real
- Logs e auditoria centralizados
- Maior controle sobre transações
- Possibilidade de retry logic no servidor

### Checklist de Segurança

Antes de ir para produção, verifica:

- [ ] API key em variável de ambiente (não hardcoded)
- [ ] Todos os domínios registados no dashboard MoMenu
- [ ] .env adicionado ao .gitignore
- [ ] Keys diferentes para dev/staging/prod
- [ ] Rate limiting configurado (se disponível)
- [ ] Logs não expõem API keys completas
- [ ] HTTPS habilitado em produção
- [ ] Validação de inputs no frontend
- [ ] Tratamento de erros não expõe informação sensível
- [ ] Monitorização de transações suspeitas

### Recursos Adicionais

- [Dashboard MoMenu](https://momenu.online) - Gestão de API keys e domínios
- [Documentação da API](https://docs.momenu.online) - Referência completa
- [Status da API](https://status.momenu.online) - Uptime e incidentes

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
