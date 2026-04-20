import React from 'react';

interface StatusBannerProps {
  type: 'success' | 'error' | 'warning';
  message: string;
  action?: React.ReactNode;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({ type, message, action }) => {
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️';
  const className = `momenu-pay-status momenu-pay-status-${type}`;

  return (
    <div className={className}>
      <span>{icon} {message}</span>
      {action && <div className="momenu-pay-status-action">{action}</div>}
    </div>
  );
};
