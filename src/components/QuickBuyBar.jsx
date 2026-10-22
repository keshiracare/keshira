import React, { useState, useEffect } from 'react';
import { getActiveProducts, KESHIRA_BUNDLES } from '../data/products';

export default function QuickBuyBar({ onAddToCart }) {
  const [catalog, setCatalog] = useState(() => getActiveProducts());
  const [activeItemType, setActiveItemType] = useState('bundle'); // 'bundle' or 'oil'
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const handleProductsUpdated = (e) => {
      if (e.detail) setCatalog(e.detail);
    };
    window.addEventListener('keshira_products_updated', handleProductsUpdated);
    return () => window.removeEventListener('keshira_products_updated', handleProductsUpdated);
  }, []);

  const heroBundle = KESHIRA_BUNDLES[0]; // Hairfall Regimen Duo
  const heroOil = catalog.oil || { name: 'Keshira Herbal Oil', shortName: 'Herbal Oil', prices: { '200ml': { price: 599 } }, images: { primary: '/assets/Keshira Herbal Oil.jpeg' } };

  const handleAdd = () => {
    if (onAddToCart) {
      if (activeItemType === 'bundle') {
        onAddToCart({
          id: `${heroBundle.id}-combo-one-time-0`,
          title: heroBundle.name,
          variant: heroBundle.size,
          subVariant: heroBundle.tagline,
          price: heroBundle.price,
          quantity: 1,
          image: heroBundle.image,
          purchaseType: 'bundle',
          bundleItems: heroBundle.includes,
          frequency: null
        });
      } else {
        onAddToCart({
          id: `keshira-oil-200ml-one-time-0`,
          title: `${heroOil.name} - 200ml`,
          variant: '200ml',
          subVariant: heroOil.shortName,
          price: heroOil.prices['200ml'].price,
          quantity: 1,
          image: heroOil.images.primary,
          purchaseType: 'one-time',
          frequency: null
        });
      }

      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2200);
    }
  };

  return (
    <aside 
      aria-label="Quick Order Bar"
      className="quick-buy-bar" 
      style={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 990,
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--color-border)',
        boxShadow: '0 -4px 16px rgba(32, 30, 27, 0.08)',
        padding: '10px 16px'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Left: Product Thumbnail & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={activeItemType === 'bundle' ? heroBundle.image : heroOil.images.primary} 
            alt="Keshira Haircare" 
            style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border)' }} 
          />
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1.2 }}>
              {activeItemType === 'bundle' ? 'Hairfall Regimen Duo (Oil + Wash)' : 'Keshira Herbal Hair Oil (200ml)'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-accent-gold-dark)', fontWeight: 700 }}>
                {activeItemType === 'bundle' ? `Save ₹${heroBundle.savings || 298} + Free Shipping` : 'Cold-Pressed Micro-Batch'}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>• pH 5.5 Balanced</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Switcher & CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              onClick={() => setActiveItemType('bundle')}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: activeItemType === 'bundle' ? 700 : 500,
                border: activeItemType === 'bundle' ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                backgroundColor: activeItemType === 'bundle' ? 'var(--color-primary)' : '#FFF',
                color: activeItemType === 'bundle' ? '#FFFFFF' : 'var(--color-text-body)',
                cursor: 'pointer'
              }}
            >
              2-Step Duo • ₹{heroBundle.price}
            </button>
            <button
              type="button"
              onClick={() => setActiveItemType('oil')}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: activeItemType === 'oil' ? 700 : 500,
                border: activeItemType === 'oil' ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                backgroundColor: activeItemType === 'oil' ? 'var(--color-primary)' : '#FFF',
                color: activeItemType === 'oil' ? '#FFFFFF' : 'var(--color-text-body)',
                cursor: 'pointer'
              }}
            >
              Hair Oil • ₹{heroOil.prices['200ml'].price}
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            style={{
              padding: '10px 20px',
              borderRadius: '4px',
              backgroundColor: isAdded ? '#276749' : 'var(--color-primary)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.84rem',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(39, 56, 43, 0.2)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { if (!isAdded) e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)'; }}
            onMouseLeave={(e) => { if (!isAdded) e.currentTarget.style.backgroundColor = 'var(--color-primary)'; }}
          >
            {isAdded ? '✓ Added to Bag' : activeItemType === 'bundle' ? `Buy Duo • ₹${heroBundle.price}` : `Buy Oil • ₹${heroOil.prices['200ml'].price}`}
          </button>
        </div>

      </div>
    </aside>
  );
}
