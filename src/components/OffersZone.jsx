import React from 'react';

export default function OffersZone() {
  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="offers-section section-padding">
      <div className="container">
        <div className="section-header">
          <span className="badge">Special Deals</span>
          <h2>Exclusive Herbal Offers</h2>
          <p className="section-subtitle">Natural Care, Better Value</p>
        </div>

        <div className="offers-grid">
          {/* Offer 1 */}
          <div className="offer-card">
            <div>
              <span className="offer-card-tag">Best Seller Deal</span>
              <h3>The Double Nourish Pack</h3>
              <p className="offer-card-desc">
                Order two 200ml bottles of Keshira Herbal Shampoo. Perfect for long-term haircare routines. 
                Includes free express delivery to your doorstep.
              </p>
            </div>
            <div>
              <button className="btn-gold" onClick={() => handleScroll('purchase-section')}>
                Get Deal • ₹398
              </button>
              <div className="offer-coupon">
                *Automatically qualifies for Free Shipping. Combine with promo codes for additional savings.
              </div>
            </div>
          </div>

          {/* Offer 2 */}
          <div className="offer-card" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-dark)' }}>
            <div>
              <span className="offer-card-tag" style={{ color: 'var(--color-primary)' }}>Welcome Offer</span>
              <h3 style={{ color: 'var(--color-primary)' }}>First-Time Ayurvedic Care</h3>
              <p className="offer-card-desc" style={{ color: 'var(--color-text-muted)' }}>
                New to Keshira? Try our hand-poured herbal blend today and get an extra 10% off your entire first purchase. 
                Use promo code below.
              </p>
            </div>
            <div>
              <div 
                style={{ 
                  display: 'inline-block', 
                  backgroundColor: 'var(--color-primary)', 
                  color: 'var(--color-text-light)', 
                  padding: '10px 20px', 
                  borderRadius: '4px', 
                  fontFamily: 'monospace', 
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  letterSpacing: '0.05em',
                  marginBottom: '16px'
                }}
              >
                KESHIRA10
              </div>
              <button 
                className="btn-primary" 
                style={{ display: 'block', width: 'fit-content' }}
                onClick={() => handleScroll('purchase-section')}
              >
                Apply & Shop Now
              </button>
              <div className="offer-coupon" style={{ color: 'var(--color-text-muted)', borderTopColor: 'rgba(26, 50, 30, 0.1)' }}>
                *Enter coupon code in your shopping bag before checking out.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
