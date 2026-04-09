import { jsx as _jsx } from "react/jsx-runtime";
import React, { useMemo } from 'react';
import { MoMenuPaymentContext } from '../context/MoMenuPaymentContext';
import { MoMenuPaymentClient } from '../client/MoMenuPaymentClient';
export const MoMenuPaymentProvider = ({ children, config, theme, }) => {
    const client = useMemo(() => new MoMenuPaymentClient(config), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.apiKey, config.baseUrl, config.qaMode, config.devMode]);
    const themeStyle = useMemo(() => {
        if (!theme)
            return {};
        const style = {};
        if (theme.primaryColor) {
            style['--momenu-pay-primary'] = theme.primaryColor;
            // Auto-generate lighter version for active states if not provided
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
        return style;
    }, [theme]);
    return (_jsx(MoMenuPaymentContext.Provider, { value: { client }, children: _jsx("div", { className: "momenu-pay-wrapper", style: {
                display: 'contents',
                fontFamily: theme?.fontFamily || 'inherit',
                ...themeStyle
            }, children: children }) }));
};
