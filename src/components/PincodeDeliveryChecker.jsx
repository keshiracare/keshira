import React, { useState } from 'react';

export default function PincodeDeliveryChecker() {
  const [pincode, setPincode] = useState('');
  const [status, setStatus] = useState(null); // null, 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  const checkPincode = (e) => {
    e.preventDefault();
    const cleanPin = pincode.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      setStatus('error');
      setMessage('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setStatus('loading');
    setTimeout(() => {
      // Calculate delivery estimate: 3 to 5 days from today
      const today = new Date();
      const minDate = new Date(today);
      minDate.setDate(today.getDate() + 2);
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 4);

      const options = { month: 'short', day: 'numeric', weekday: 'short' };
      const dateStr = `${minDate.toLocaleDateString('en-IN', options)} – ${maxDate.toLocaleDateString('en-IN', options)}`;

      setStatus('success');
      setMessage(`✓ Delivery by ${dateStr} • Free Express Shipping Available!`);
    }, 450);
  };

  return (
    <div style={{ backgroundColor: '#FAF7F2', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '14px 18px', marginTop: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '1rem' }}>📍</span>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Check Pincode for Free Express Delivery
        </span>
      </div>

      <form onSubmit={checkPincode} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          maxLength={6}
          placeholder="Enter 6-digit pincode (e.g. 380015, 110001)"
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value.replace(/\D/g, ''));
            setStatus(null);
          }}
          style={{
            flex: 1,
            height: '38px',
            borderRadius: '8px',
            border: '1px solid #D1D5DB',
            padding: '0 12px',
            fontSize: '0.84rem',
            backgroundColor: '#FFFFFF',
            outline: 'none',
            color: '#111827'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '0 16px',
            height: '38px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-primary)',
            color: '#FAF7F2',
            fontSize: '0.82rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          {status === 'loading' ? 'Checking...' : 'Check'}
        </button>
      </form>

      {message && (
        <div style={{
          marginTop: '8px',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: status === 'success' ? '#166534' : '#DC2626'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}
