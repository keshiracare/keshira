import React from 'react';

export default function PolicyModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(19, 46, 27, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'var(--color-bg-parchment, #FAF7F2)',
          border: '1px solid var(--color-border, rgba(19, 46, 27, 0.12))',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '760px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 48px rgba(19, 46, 27, 0.18)',
          color: 'var(--color-text-dark, #1F2220)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--color-border, rgba(19, 46, 27, 0.1))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--color-bg-parchment-light, #FCFAF7)'
        }}>
          <h2 style={{ 
            fontFamily: 'var(--font-serif, "Cormorant Garamond", serif)',
            fontSize: '1.8rem', 
            fontWeight: 600,
            color: 'var(--color-primary, #132E1B)', 
            margin: 0,
            letterSpacing: '0.02em'
          }}>
            {title}
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted, #58615A)',
              fontSize: '2rem',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '4px 8px',
              transition: 'color 0.2s'
            }}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div style={{
          padding: '20px',
          overflowY: 'auto',
          lineHeight: '1.7',
          fontSize: '0.95rem',
          color: 'var(--color-text-dark, #1F2220)'
        }}>
          {children}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--color-border, rgba(19, 46, 27, 0.1))',
          textAlign: 'right',
          background: 'var(--color-bg-parchment-light, #FCFAF7)'
        }}>
          <button 
            onClick={onClose}
            style={{
              padding: '12px 28px',
              borderRadius: '30px',
              fontWeight: 600,
              fontSize: '0.9rem',
              backgroundColor: 'var(--color-primary, #132E1B)',
              color: 'var(--color-text-light, #FCFAF7)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
