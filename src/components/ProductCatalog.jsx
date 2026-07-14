import React from 'react';

export default function ProductCatalog() {
  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="catalog" className="catalog-section section-padding" style={{ backgroundColor: 'var(--color-bg-parchment)' }}>
      <div className="container">
        <div className="section-header" style={{ marginBottom: '50px' }}>
          <span className="badge">Keshira Apothecary</span>
          <h2 style={{ fontSize: '2.8rem', marginTop: '10px' }}>Our Herbal Formulations</h2>
          <div style={{ width: '60px', height: '3px', backgroundColor: 'var(--color-accent-gold)', margin: '15px auto' }}></div>
          <p className="section-subtitle">Pure Ayurvedic Hair Care. Crafted for maximum follicular health.</p>
        </div>

        <div className="product-grid">
          {/* Active Shampoo Product */}
          <div className="product-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="product-card-img-wrapper" style={{ overflow: 'hidden', position: 'relative' }}>
              <img 
                src="/assets/hero-shampoo.jpg" 
                alt="Keshira Herbal Shampoo Bottle" 
                className="product-card-img"
                style={{ transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)', display: 'block', width: '100%', height: 'auto' }}
              />
            </div>
            <div className="product-card-content" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '28px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-accent-gold-dark)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', display: 'block' }}>
                Scalp Cleanse & Nourish
              </span>
              <h3 className="product-title" style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '8px' }}>
                Keshira Herbal Shampoo
              </h3>
              <p className="product-tagline" style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                A micro-batch brew loaded with 10 traditional Ayurvedic herbs to soothe, cleanse, and prevent hair fall.
              </p>
              
              <div className="product-footer" style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                <div className="product-price-range" style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                  ₹119 — ₹199
                </div>
                <button 
                  className="btn-primary" 
                  style={{ padding: '10px 20px', fontSize: '0.8rem', letterSpacing: '0.05em' }}
                  onClick={() => handleScroll('purchase-section')}
                >
                  Configure Size
                </button>
              </div>
            </div>
          </div>

          {/* Placeholder Conditioner (Coming Soon) */}
          <div className="product-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="product-card-img-wrapper" style={{ overflow: 'hidden', position: 'relative' }}>
              <div className="coming-soon-overlay" style={{ background: 'rgba(19, 46, 27, 0.45)', backdropFilter: 'blur(6px)' }}>
                <span className="coming-soon-badge" style={{ backgroundColor: 'rgba(252, 250, 247, 0.9)', color: 'var(--color-primary)', border: 'none', fontWeight: '700', fontSize: '1.1rem', letterSpacing: '0.05em', padding: '10px 20px', borderRadius: '4px' }}>
                  Coming Soon
                </span>
              </div>
              <img 
                src="/assets/conditioner-bottle.png" 
                alt="Keshira Herbal Conditioner" 
                className="product-card-img"
                style={{ opacity: 0.35, filter: 'grayscale(40%)', display: 'block', width: '100%', height: 'auto' }}
              />
            </div>
            <div className="product-card-content" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '28px', opacity: 0.85 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', display: 'block' }}>
                Softness & Strength
              </span>
              <h3 className="product-title" style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '8px' }}>
                Keshira Conditioner
              </h3>
              <p className="product-tagline" style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                Deep botanical conditioning to lock in natural moisture, untangle coarse fibers, and combat split ends.
              </p>
              
              <div className="product-footer" style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                <div className="product-price-range" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  Brewing Stage
                </div>
                <button 
                  className="btn-secondary" 
                  style={{ padding: '10px 20px', fontSize: '0.8rem', cursor: 'not-allowed', opacity: 0.5 }}
                  disabled
                >
                  Launching Soon
                </button>
              </div>
            </div>
          </div>

          {/* Placeholder Hair Oil (Coming Soon) */}
          <div className="product-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="product-card-img-wrapper" style={{ overflow: 'hidden', position: 'relative' }}>
              <div className="coming-soon-overlay" style={{ background: 'rgba(19, 46, 27, 0.45)', backdropFilter: 'blur(6px)' }}>
                <span className="coming-soon-badge" style={{ backgroundColor: 'rgba(252, 250, 247, 0.9)', color: 'var(--color-primary)', border: 'none', fontWeight: '700', fontSize: '1.1rem', letterSpacing: '0.05em', padding: '10px 20px', borderRadius: '4px' }}>
                  Coming Soon
                </span>
              </div>
              <img 
                src="/assets/hair-oil-bottle.png" 
                alt="Keshira Hair Oil" 
                className="product-card-img"
                style={{ opacity: 0.35, filter: 'grayscale(40%)', display: 'block', width: '100%', height: 'auto' }}
              />
            </div>
            <div className="product-card-content" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '28px', opacity: 0.85 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', display: 'block' }}>
                Root Stimulation
              </span>
              <h3 className="product-title" style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '8px' }}>
                Keshira Hair Oil
              </h3>
              <p className="product-tagline" style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                Bhringraj, Amla, and cold-pressed Rosemary extracts designed to revive inactive roots and thicken shafts.
              </p>
              
              <div className="product-footer" style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                <div className="product-price-range" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  Infusion Stage
                </div>
                <button 
                  className="btn-secondary" 
                  style={{ padding: '10px 20px', fontSize: '0.8rem', cursor: 'not-allowed', opacity: 0.5 }}
                  disabled
                >
                  Launching Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
