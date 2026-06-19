'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} style={{ color: 'var(--color-valid)' }} />;
      case 'warning':
        return <AlertTriangle size={18} style={{ color: 'var(--color-expiring)' }} />;
      case 'error':
        return <XCircle size={18} style={{ color: 'var(--color-expired)' }} />;
      default:
        return <Info size={18} style={{ color: 'var(--accent-cyan)' }} />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'rgba(16, 185, 129, 0.3)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.3)';
      case 'error':
        return 'rgba(239, 68, 68, 0.3)';
      default:
        return 'var(--border-color)';
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast"
          style={{
            borderColor: getBorderColor(toast.type),
            borderWidth: '1px',
            borderStyle: 'solid',
          }}
        >
          {getIcon(toast.type)}
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{toast.text}</span>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: '2px',
              marginLeft: 'auto',
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
