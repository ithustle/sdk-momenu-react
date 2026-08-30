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
    [config.apiKey, config.qaMode, config.baseUrl]
  );

  const themeStyle = useMemo((): React.CSSProperties => {
    if (!theme) return {};

    const style: Record<string, string> = {};
    if (theme.primaryColor) {
      style['--momenu-pay-primary'] = theme.primaryColor;
      style['--momenu-pay-primary-light'] = `${theme.primaryColor}1f`;
      style['--momenu-pay-primary-border'] = `${theme.primaryColor}59`;
    }
    if (theme.primaryHoverColor) {
      style['--momenu-pay-primary-hover'] = theme.primaryHoverColor;
    }
    if (theme.borderRadius) {
      style['--momenu-pay-radius'] = theme.borderRadius;
    }
    if (theme.backgroundColor) {
      style['--momenu-pay-bg'] = theme.backgroundColor;
    }
    if (theme.cardColor) {
      style['--momenu-pay-card'] = theme.cardColor;
    }
    if (theme.textColor) {
      style['--momenu-pay-text'] = theme.textColor;
    }
    if (theme.fontFamily) {
      style['--momenu-pay-font-family'] = theme.fontFamily;
    }
    return style as React.CSSProperties;
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
