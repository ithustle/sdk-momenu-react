import { useState } from 'react';
import {
  MoMenuPaymentProvider,
  MoMenuCheckout,
} from './lib';
import './App.css';

function App() {
  const [amount, setAmount] = useState(2500);
  const [themeColor, setThemeColor] = useState<'orange' | 'blue'>('orange');

  const theme = themeColor === 'blue' ? {
    primaryColor: '#3b82f6',
    primaryHoverColor: '#2563eb',
  } : undefined;

  return (
    <MoMenuPaymentProvider
      config={{
        apiKey: 'demo-key',
        qaMode: true,
        devMode: true,
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
            {[500, 1000, 2500, 5000].map((v) => (
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

        <main className="demo-main" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
          <MoMenuCheckout
            amount={amount}
            onSuccess={(data) => console.log('Sucesso:', data)}
            onError={(err) => console.error('Erro:', err)}
          />
        </main>
      </div>
    </MoMenuPaymentProvider>
  );
}

export default App;
