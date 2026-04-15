import React, { useMemo } from 'react';
import { MoMenuPaymentContext } from '../context/MoMenuPaymentContext';
import { MoMenuPaymentClient } from '../client/MoMenuPaymentClient';
import type { PaymentConfig, PaymentTheme } from '../types';

interface MoMenuPaymentProviderProps {
  children: React.ReactNode;
  config: PaymentConfig;
  theme?: PaymentTheme;
}

export const MoMenuPaymentProvider: React.FC<MoMenuPaymentProviderProps> = ({
  children,
  config,
  theme,
}) => {
  
  const client = useMemo(
    () => new MoMenuPaymentClient(config),
    [config.apiKey, config.qaMode, config.devMode]
  );

  const themeStyle = useMemo(() => {
    if (!theme) return {};

    const style: any = {};
    if (theme.primaryColor) {
      style['--momenu-pay-primary' as any] = theme.primaryColor;
      // Auto-generate lighter version for active states if not provided
      style['--momenu-pay-primary-light' as any] = `${theme.primaryColor}1f`;
      style['--momenu-pay-primary-border' as any] = `${theme.primaryColor}59`;
    }
    if (theme.primaryHoverColor) {
      style['--momenu-pay-primary-hover' as any] = theme.primaryHoverColor;
    }
    if (theme.borderRadius) {
      style['--momenu-pay-radius' as any] = theme.borderRadius;
    }
    if (theme.backgroundColor) {
      style['--momenu-pay-bg' as any] = theme.backgroundColor;
    }
    if (theme.cardColor) {
      style['--momenu-pay-card' as any] = theme.cardColor;
    }
    if (theme.textColor) {
      style['--momenu-pay-text' as any] = theme.textColor;
    }
    if (theme.fontFamily) {
      style['--momenu-pay-font-family' as any] = theme.fontFamily;
    }
    return style;
  }, [theme]);

  return (
    <MoMenuPaymentContext.Provider value={{ client }}>
      <div 
        className="momenu-pay-wrapper" 
        style={{ 
          display: 'contents', 
          fontFamily: theme?.fontFamily || 'inherit',
          ...themeStyle 
        }}
      >
        {children}
      </div>
    </MoMenuPaymentContext.Provider>
  );
};
