import React from 'react';

export default function MinimalistMarquee() {
  const announcements = [
    "TRANSPARENT FORMULATIONS • 100% INGREDIENT DISCLOSURE • ZERO HIDDEN CHEMICALS",
    "BUY 1 GET 1 FREE (BOGO) ON ALL HERBAL SHAMPOOS • 2X BOTTLES DISPATCHED",
    "pH 5.5 CALIBRATED FOR SCALP MICROBIOME HEALTH • FRESH MICRO-BATCHES BREWED WEEKLY",
    "FREE DELIVERY ACROSS ALL INDIA PINCODES ON ORDERS ABOVE ₹300 • FAST EXPRESS SHIPPING"
  ];

  return (
    <div 
      aria-label="Keshira Notice Banner"
      style={{
        backgroundColor: '#F3F4F6',
        borderTop: '1px solid #E5E7EB',
        borderBottom: '1px solid #E5E7EB',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        padding: '12px 0',
        position: 'relative'
      }}
    >
      <div 
        style={{
          display: 'inline-flex',
          animation: 'minimalistMarquee 38s linear infinite',
          gap: '48px',
          paddingLeft: '24px'
        }}
      >
        {[...announcements, ...announcements].map((text, idx) => (
          <div 
            key={idx}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '24px',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#1F2937'
            }}
          >
            <span>{text}</span>
            <span style={{ color: '#9CA3AF' }}>✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
