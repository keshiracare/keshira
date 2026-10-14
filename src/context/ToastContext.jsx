import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  // Global browser event listener for non-React contexts or decoupled events
  React.useEffect(() => {
    const handleCustomToast = (e) => {
      if (e.detail) {
        const { message, type = 'success', duration = 3500 } = typeof e.detail === 'string' ? { message: e.detail } : e.detail;
        if (message) showToast(message, type, duration);
      }
    };

    window.addEventListener('keshira:show-toast', handleCustomToast);
    return () => window.removeEventListener('keshira:show-toast', handleCustomToast);
  }, [showToast]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return '🌿';
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'error':
        return {
          bg: '#991B1B',
          border: '#B91C1C',
          iconBg: 'rgba(255, 255, 255, 0.2)'
        };
      case 'warning':
        return {
          bg: '#92400E',
          border: '#B45309',
          iconBg: 'rgba(255, 255, 255, 0.2)'
        };
      case 'info':
        return {
          bg: '#1E3A8A',
          border: '#2563EB',
          iconBg: 'rgba(255, 255, 255, 0.2)'
        };
      case 'success':
      default:
        return {
          bg: '#132E1B',
          border: '#22543D',
          iconBg: '#C8A261'
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <div
          aria-live="polite"
          aria-atomic="true"
          style={{
            position: 'fixed',
            top: '24px',
            right: '20px',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            maxWidth: 'calc(100vw - 32px)',
            pointerEvents: 'none'
          }}
        >
          {toasts.map((toast) => {
            const colors = getColors(toast.type);
            return (
              <div
                key={toast.id}
                role="status"
                style={{
                  pointerEvents: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: colors.bg,
                  color: '#FFFFFF',
                  padding: '12px 18px',
                  borderRadius: '30px',
                  boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.35)',
                  border: `1px solid ${colors.border}`,
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  letterSpacing: '0.01em',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  animation: 'keshiraToastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, opacity 0.2s ease'
                }}
                onClick={() => removeToast(toast.id)}
                title="Click to dismiss"
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: colors.iconBg,
                    color: toast.type === 'success' ? '#132E1B' : '#FFFFFF',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    flexShrink: 0
                  }}
                >
                  {getIcon(toast.type)}
                </span>
                <span style={{ lineHeight: '1.4' }}>{toast.message}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(toast.id);
                  }}
                  aria-label="Dismiss toast"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.7)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '0 0 0 6px',
                    marginLeft: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback to custom event if outside provider
    return {
      showToast: (message, type = 'success', duration = 3500) => {
        window.dispatchEvent(new CustomEvent('keshira:show-toast', { detail: { message, type, duration } }));
      }
    };
  }
  return context;
};

// Standalone trigger that can be called anywhere in app without hooks
export const triggerToast = (message, type = 'success', duration = 3500) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('keshira:show-toast', { detail: { message, type, duration } }));
  }
};
