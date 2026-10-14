import React from 'react';

export default function AboutUs() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', color: 'var(--color-text-dark, #1F2220)' }}>
      <section>
        <h3 style={{ 
          fontFamily: 'var(--font-serif)',
          fontSize: '1.4rem',
          color: 'var(--color-primary, #132E1B)', 
          marginBottom: '10px' 
        }}>
          Our Sacred Origin
        </h3>
        <p style={{ color: 'var(--color-text-dark, #1F2220)', lineHeight: '1.7' }}>
          Welcome to <strong>Keshira</strong>. Born in the cultural heart of <strong>Ahmedabad, Gujarat</strong>, Keshira was established with a singular mission: to bring back authentic, unadulterated Ayurvedic hair care formulated with pure intention and traditional wisdom.
        </p>
        <p style={{ color: 'var(--color-text-muted, #58615A)', marginTop: '8px', lineHeight: '1.7' }}>
          In a market crowded with synthetic chemicals, artificial fragrances, and mass-produced dilutions, Keshira stands apart as a sanctuary for genuine herbal efficacy.
        </p>
      </section>

      <section style={{ 
        background: 'var(--color-bg-card, #F4ECE1)', 
        padding: '24px', 
        borderRadius: '16px', 
        border: '1px solid var(--color-border, rgba(19, 46, 27, 0.08))' 
      }}>
        <h3 style={{ 
          fontFamily: 'var(--font-serif)',
          fontSize: '1.3rem',
          color: 'var(--color-primary, #132E1B)', 
          marginBottom: '10px' 
        }}>
          The Micro-Batch Hand-Pouring Process
        </h3>
        <p style={{ color: 'var(--color-text-dark, #1F2220)', lineHeight: '1.7' }}>
          We do not mass-produce in large industrial factories. Every single bottle of Keshira is <strong>hand-poured in micro-batches</strong>. 
          We slow-infuse 14 authentic Indian botanicals—including raw Amla, Bhringraj, Brahmi, Hibiscus, Neem, Shikakai, and Rosemary—into pure sesame and virgin coconut oils over days.
        </p>
        <p style={{ color: 'var(--color-text-muted, #58615A)', marginTop: '8px', lineHeight: '1.7' }}>
          This gentle thermal extraction ensures that maximum phytonutrients, vitamins, and essential fatty acids remain active to nourish your hair roots deeply.
        </p>
      </section>

      <section>
        <h3 style={{ 
          fontFamily: 'var(--font-serif)',
          fontSize: '1.4rem',
          color: 'var(--color-primary, #132E1B)', 
          marginBottom: '12px' 
        }}>
          Our Purity Commitment
        </h3>
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--color-text-dark, #1F2220)' }}>
          <li>🌿 <strong>100% Organic Botanicals:</strong> Ethically harvested from trusted Indian organic growers.</li>
          <li>❌ <strong>Zero Mineral Oil & Silicones:</strong> Free from petroleum derivatives, parabens, and synthetic preservatives.</li>
          <li>🐇 <strong>Cruelty-Free:</strong> Tested only on human volunteers, never on animals.</li>
          <li>♻️ <strong>Eco-Conscious Packaging:</strong> Bottled with care in recyclable materials to respect Mother Earth.</li>
        </ul>
      </section>
    </div>
  );
}
