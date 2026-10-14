import React from 'react';

export default function TermsAndConditions() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.96rem', color: 'var(--color-text-dark, #1F2220)' }}>
      <p style={{ color: 'var(--color-text-muted, #58615A)', margin: 0, fontSize: '0.88rem' }}>
        Last Updated: July 30, 2026
      </p>

      <section>
        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-primary, #132E1B)', marginBottom: '8px' }}>1. Agreement to Terms</h4>
        <p style={{ lineHeight: '1.7', color: 'var(--color-text-dark, #1F2220)' }}>
          By accessing or ordering products from <strong>Keshira</strong> (https://keshira.vercel.app), you agree to be bound by these Terms and Conditions. Please read them carefully.
        </p>
      </section>

      <section>
        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-primary, #132E1B)', marginBottom: '8px' }}>2. Ayurvedic Herbal Formulations Disclaimer</h4>
        <p style={{ lineHeight: '1.7', color: 'var(--color-text-dark, #1F2220)' }}>
          Our products are traditional, hand-poured herbal formulations crafted with natural organic ingredients. 
          Individual hair and scalp results may vary based on hair porosity, genetic factors, lifestyle, and consistency of application. 
          Our products are for external cosmetic hair care use only and are not intended to diagnose, treat, or cure any medical condition. Patch testing is always recommended.
        </p>
      </section>

      <section>
        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-primary, #132E1B)', marginBottom: '8px' }}>3. Product Availability & Batches</h4>
        <p style={{ lineHeight: '1.7', color: 'var(--color-text-dark, #1F2220)' }}>
          Because Keshira products are micro-batched by hand to maintain maximum herbal freshness, batch availability is limited. We reserve the right to restrict order quantities per customer during high-demand release periods.
        </p>
      </section>

      <section>
        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-primary, #132E1B)', marginBottom: '8px' }}>4. Intellectual Property</h4>
        <p style={{ lineHeight: '1.7', color: 'var(--color-text-dark, #1F2220)' }}>
          All content, imagery, branding, logos, and custom code on this website are the intellectual property of Keshira. Unauthorized copying or redistribution is strictly prohibited.
        </p>
      </section>
    </div>
  );
}
