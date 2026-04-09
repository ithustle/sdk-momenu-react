import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { MoMenuPaymentProvider, MoMenuCheckout, } from './lib';
import './App.css';
function App() {
    const [amount, setAmount] = useState(2500);
    const [themeColor, setThemeColor] = useState('orange');
    const theme = themeColor === 'blue' ? {
        primaryColor: '#3b82f6',
        primaryHoverColor: '#2563eb',
    } : undefined;
    return (_jsx(MoMenuPaymentProvider, { config: {
            apiKey: 'demo-key',
            qaMode: true,
            devMode: true,
        }, theme: theme, children: _jsxs("div", { className: "demo-app", children: [_jsxs("header", { className: "demo-header", children: [_jsxs("div", { className: "logo-section", children: [_jsx("div", { className: "logo-pill", children: "SDK" }), _jsx("h1", { children: "MoMenu Payments" })] }), _jsxs("div", { className: "demo-controls", children: [_jsxs("div", { style: { display: 'flex', gap: '8px', marginRight: '16px', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '16px' }, children: [_jsx("button", { className: themeColor === 'orange' ? 'active' : '', onClick: () => setThemeColor('orange'), children: "Laranja" }), _jsx("button", { className: themeColor === 'blue' ? 'active' : '', onClick: () => setThemeColor('blue'), children: "Azul" })] }), [500, 1000, 2500, 5000].map((v) => (_jsxs("button", { className: amount === v ? 'active' : '', onClick: () => setAmount(v), children: [v.toLocaleString('pt-AO'), " Kz"] }, v)))] })] }), _jsx("main", { className: "demo-main", style: { justifyContent: 'center', alignItems: 'center', display: 'flex' }, children: _jsx(MoMenuCheckout, { amount: amount, onSuccess: (data) => console.log('Sucesso:', data), onError: (err) => console.error('Erro:', err) }) })] }) }));
}
export default App;
