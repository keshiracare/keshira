import React from 'react';

export default function WhatsAppFloatingButton() {
  const whatsappNumber = "919999999999"; // Replace with brand WhatsApp business number
  const prefilledMessage = encodeURIComponent("Hello Keshira! I have a question regarding my hair concern and would love guidance on choosing the right shampoo & oil routine.");

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${prefilledMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Keshira Ayurvedic Consultant on WhatsApp"
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        zIndex: 980,
        backgroundColor: '#25D366',
        color: '#FFFFFF',
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(37, 211, 102, 0.45)',
        textDecoration: 'none',
        transition: 'transform 0.2s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      title="Chat with Ayurvedic Hair Consultant on WhatsApp"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.031 2C6.516 2 2.031 6.484 2.031 12c0 1.977.578 3.824 1.574 5.378L2.031 22l4.781-1.543A9.957 9.957 0 0012.031 22c5.516 0 10-4.484 10-10s-4.484-10-10-10zm5.82 14.281c-.242.684-1.211 1.258-1.996 1.426-.539.113-1.242.203-3.609-.777-3.023-1.258-4.969-4.32-5.121-4.523-.148-.203-1.223-1.625-1.223-3.102 0-1.477.77-2.203 1.043-2.5.273-.297.598-.371.797-.371.199 0 .398.004.57.012.184.012.43-.07.672.512.242.586.832 2.031.906 2.18.074.148.121.32.023.516-.098.199-.148.324-.297.496-.148.176-.316.391-.453.527-.148.148-.305.312-.133.609.172.297.766 1.266 1.645 2.047 1.129 1.008 2.082 1.32 2.379 1.469.297.148.473.125.648-.074.176-.199.746-.871.945-1.172.199-.297.398-.246.672-.148.273.098 1.734.816 2.031.965.297.148.496.223.57.348.074.125.074.723-.168 1.406z"/>
      </svg>
    </a>
  );
}
