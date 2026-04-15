import { useState } from 'react';
import {
  MoMenuPaymentProvider,
  MoMenuCheckout,
} from './lib';
import './App.css';

function App() {
  const [amount, setAmount] = useState(2500);
  const [themeColor, setThemeColor] = useState<'orange' | 'blue'>('orange');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const theme = themeColor === 'blue' ? {
    primaryColor: '#3b82f6',
    primaryHoverColor: '#2563eb',
  } : undefined;

  return (
    <MoMenuPaymentProvider
      config={{
        apiKey: 'qUZJtbYSs0SoSb8u4zKZ438hCic2',
        qaMode: true,
        devMode: false,
      }}
      theme={theme}
    >
      <div className="demo-app">
        <header className="demo-header">
          <div className="logo-section">
            <div className="logo-pill">SDK</div>
            <h1>MoMenu Payments</h1>
          </div>
          <div className="demo-controls">
            <div style={{ display: 'flex', gap: '8px', marginRight: '16px', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '16px' }}>
              <button 
                className={themeColor === 'orange' ? 'active' : ''} 
                onClick={() => setThemeColor('orange')}
              >
                Laranja
              </button>
              <button 
                className={themeColor === 'blue' ? 'active' : ''} 
                onClick={() => setThemeColor('blue')}
              >
                Azul
              </button>
            </div>
            {[50, 100, 2500, 5000].map((v) => (
              <button
                key={v}
                className={amount === v ? 'active' : ''}
                onClick={() => setAmount(v)}
              >
                {v.toLocaleString('pt-AO')} Kz
              </button>
            ))}
          </div>
        </header>

        <main className="demo-main" style={{ flexDirection: 'column', gap: '2rem' }}>
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.6s ease-out' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(white, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Pronto para integrar?
            </h2>
            <p style={{ color: '#888', maxWidth: '500px', margin: '0 auto 2rem' }}>
              Experimente o novo SDK da MoMenu com suporte nativo a modal e temas customizáveis.
            </p>
            <button 
              onClick={() => setIsCheckoutOpen(true)}
              style={{
                background: 'var(--app-accent)',
                color: 'white',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(249, 115, 22, 0.3)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Abrir Checkout
            </button>
          </div>

          <MoMenuCheckout
            amount={amount}
            isModal={true}
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            onSuccess={(data) => {
              console.log('Sucesso:', data);
              // Não fechar o modal aqui, deixar o MoMenuCheckout mostrar a tela de sucesso
            }}
            onError={(err) => console.error('Erro:', err)}
          />
        </main>
      </div>
    </MoMenuPaymentProvider>
  );
}

export default App;
