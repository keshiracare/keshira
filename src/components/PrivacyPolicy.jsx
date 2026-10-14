import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.96rem', color: 'var(--color-text-dark, #1F2220)' }}>
      <p style={{ color: 'var(--color-text-muted, #58615A)', margin: 0, fontSize: '0.88rem' }}>
        Last Updated: July 30, 2026
      </p>

      <section>
        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-primary, #132E1B)', marginBottom: '8px' }}>1. Information We Collect</h4>
        <p style={{ lineHeight: '1.7', color: 'var(--color-text-dark, #1F2220)' }}>
          At Keshira, we respect your privacy. When you purchase from our store, take our Hair Quiz, or subscribe to updates, we collect personal information such as your name, email address, shipping address, and phone number necessary for order fulfillment.
        </p>
      </section>

      <section>
        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-primary, #132E1B)', marginBottom: '8px' }}>2. How We Use Your Data</h4>
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: '1.6', color: 'var(--color-text-dark, #1F2220)' }}>
          <li>Processing, shipping, and tracking your handmade Ayurvedic product orders.</li>
          <li>Sending order confirmations, tracking alerts, and delivery updates via Email or WhatsApp.</li>
          <li>Providing personalized herbal care recommendations based on your Hair Quiz results.</li>
        </ul>
      </section>

      <section>
        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-primary, #132E1B)', marginBottom: '8px' }}>3. Data Protection & Security</h4>
        <p style={{ lineHeight: '1.7', color: 'var(--color-text-dark, #1F2220)' }}>
          We employ strict security measures to protect your personal details. We do NOT store full payment card details or net banking credentials on our servers. All financial transactions are processed securely through certified payment gateways.
        </p>
      </section>

      <section>
        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-primary, #132E1B)', marginBottom: '8px' }}>4. Third-Party Sharing</h4>
        <p style={{ lineHeight: '1.7', color: 'var(--color-text-dark, #1F2220)' }}>
          We do not sell, trade, or rent your personal identification information to third parties. We share data strictly with essential logistics and shipping partners (e.g., courier services) to deliver your packages safely.
        </p>
      </section>

      <section>
        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-primary, #132E1B)', marginBottom: '8px' }}>5. Contact Information</h4>
        <p style={{ lineHeight: '1.7', color: 'var(--color-text-dark, #1F2220)' }}>
          For any privacy concerns or data requests, please reach out to our privacy officer at <strong>keshira.care@gmail.com</strong>.
        </p>
      </section>
    </div>
  );
}
