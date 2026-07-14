import React from 'react';

export default function Hero() {
  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="hero section-padding" style={{ position: 'relative', overflow: 'hidden', padding: '120px 0 80px 0' }}>
      {/* Decorative subtle ambient glows */}
      <div 
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(180, 147, 84, 0.05) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      ></div>

      <div className="container hero-grid" style={{ position: 'relative', zIndex: 1 }}>
        <div className="hero-content">
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              marginBottom: '16px' 
            }}
          >
            <span style={{ width: '20px', height: '1px', backgroundColor: 'var(--color-accent-gold)' }}></span>
            <span className="hero-subtitle" style={{ fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-accent-gold-dark)', fontWeight: 'bold' }}>
              Hand-Poured in Micro Batches
            </span>
          </div>

          <h1 
            className="hero-title" 
            style={{ 
              fontSize: 'clamp(2.8rem, 6vw, 4.4rem)', 
              lineHeight: '1.1', 
              fontFamily: 'var(--font-serif)', 
              color: 'var(--color-primary)', 
              marginBottom: '20px',
              fontWeight: 500
            }}
          >
            Nourishing <br />
            <span style={{ fontStyle: 'italic', fontFamily: 'var(--font-serif)', color: 'var(--color-accent-gold-dark)' }}>Ayurvedic</span> Care.
          </h1>

          <p 
            className="hero-description" 
            style={{ 
              fontSize: '1.05rem', 
              color: 'var(--color-text-muted)', 
              lineHeight: '1.7', 
              marginBottom: '32px',
              maxWidth: '520px'
            }}
          >
            Experience the raw potency of traditional Indian botanicals. Lovingly brewed to strengthen hair roots, restore natural scalp balance, and bring back organic vitality.
          </p>

          {/* Premium Scarcity Panel */}
          <div 
            className="batch-freshness-banner" 
            style={{ 
              marginBottom: '32px', 
              marginTop: '0', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '12px 20px',
              backgroundColor: 'rgba(19, 46, 27, 0.03)',
              borderRadius: '8px',
              border: '1px solid rgba(200, 162, 97, 0.2)'
            }}
          >
            <div className="batch-dot" style={{ backgroundColor: 'var(--color-accent-gold)', width: '8px', height: '8px', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-dark)', fontWeight: 500 }}>
              Batch #043: 84% Sold out. Only 14 bottles remaining.
            </span>
          </div>

          <div className="hero-cta-group" style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
            <button className="btn-primary" onClick={() => handleScroll('purchase-section')}>
              Shop Shampoo
            </button>
            <button className="btn-secondary" onClick={() => handleScroll('ingredients')}>
              Explore Ingredients
            </button>
          </div>

          {/* Clean minimal trust icons */}
          <div className="hero-badges" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div className="hero-badge-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)' }}>
              <svg width="14" height="14" fill="none" stroke="var(--color-accent-gold)" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              No Sulphates
            </div>
            <div className="hero-badge-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)' }}>
              <svg width="14" height="14" fill="none" stroke="var(--color-accent-gold)" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              No Parabens
            </div>
            <div className="hero-badge-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)' }}>
              <svg width="14" height="14" fill="none" stroke="var(--color-accent-gold)" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Cruelty-Free
            </div>
          </div>
        </div>
        
        {/* Right Column: Hero Image with gold frame accents */}
        <div className="hero-image-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '420px', aspectRatio: '4/5' }}>
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: '1px solid rgba(200, 162, 97, 0.25)',
                transform: 'translate(20px, 20px)',
                borderRadius: '16px',
                zIndex: 0,
                pointerEvents: 'none'
              }}
            ></div>
            <div className="hero-image-wrapper" style={{ zIndex: 1, borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', width: '100%', height: '100%' }}>
              <img 
                src="/assets/hero-shampoo.jpg" 
                alt="Keshira Homemade Herbal Shampoo Bottle" 
                className="hero-image" 
                style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
