import React from 'react';

export default function RefundPolicy() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.96rem', color: 'var(--color-text-dark, #1F2220)' }}>
      <p style={{ color: 'var(--color-text-muted, #58615A)', margin: 0, fontSize: '0.88rem' }}>
        Last Updated: July 30, 2026
      </p>

      <section>
        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-primary, #132E1B)', marginBottom: '8px' }}>1. Hand-Poured Nature & Hygiene</h4>
        <p style={{ lineHeight: '1.7', color: 'var(--color-text-dark, #1F2220)' }}>
          Due to the hygienic nature of micro-batched personal care products and traditional organic oils, opened or used bottles cannot be returned or resold.
        </p>
      </section>

      <section>
        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-primary, #132E1B)', marginBottom: '8px' }}>2. Damaged or Transit Defect Replacement</h4>
        <p style={{ lineHeight: '1.7', color: 'var(--color-text-dark, #1F2220)' }}>
          If your Keshira bottle arrives damaged, leaking, or defective during shipping, we will immediately send you a free batch replacement:
        </p>
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: '1.6', marginTop: '6px', color: 'var(--color-text-dark, #1F2220)' }}>
          <li>Notify us within <strong>48 hours</strong> of package delivery at <strong>keshira.care@gmail.com</strong> or Instagram <strong>@keshira_haircare</strong>.</li>
          <li>Attach a clear photo or short unboxing video of the damaged outer packaging and bottle leak.</li>
          <li>Our care team will dispatch a replacement bottle within 24 hours at zero cost to you.</li>
        </ul>
      </section>

      <section>
        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-primary, #132E1B)', marginBottom: '8px' }}>3. Order Cancellations</h4>
        <p style={{ lineHeight: '1.7', color: 'var(--color-text-dark, #1F2220)' }}>
          Order cancellations are accepted within <strong>6 hours</strong> of placing your order, provided the batch dispatch has not already been processed with our shipping courier.
        </p>
      </section>
    </div>
  );
}
