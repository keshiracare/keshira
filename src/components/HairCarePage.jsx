import React, { useState, useEffect } from 'react';
import { getActiveProducts, getProductsWithLiveRatings, getActiveOffers, getEffectiveProductPrice } from '../data/products';

export default function HairCarePage({ onAddToCart, cart = [], onGoToBag, onNavigateHome, initialConcern = 'all', storeOffers: propStoreOffers }) {
  const [selectedConcern, setSelectedConcern] = useState(initialConcern);
  const [storeOffers, setStoreOffers] = useState(propStoreOffers || getActiveOffers());

  useEffect(() => {
    if (propStoreOffers) setStoreOffers(propStoreOffers);
  }, [propStoreOffers]);

  useEffect(() => {
    const handleOffersUpdated = (e) => setStoreOffers(e.detail || getActiveOffers());
    window.addEventListener('keshira_offers_updated', handleOffersUpdated);
    return () => window.removeEventListener('keshira_offers_updated', handleOffersUpdated);
  }, []);

  const [catalogMap, setCatalogMap] = useState(() => {
    try {
      const saved = localStorage.getItem('keshira_reviews');
      const reviewsList = saved ? JSON.parse(saved) : [];
      return getProductsWithLiveRatings(getActiveProducts(), reviewsList);
    } catch {
      return getActiveProducts();
    }
  });

  useEffect(() => {
    const handleReviewsSynced = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setCatalogMap(prev => getProductsWithLiveRatings(prev, e.detail));
      }
    };
    const handleProductsUpdated = (e) => {
      const base = e.detail || getActiveProducts();
      try {
        const saved = localStorage.getItem('keshira_reviews');
        const reviewsList = saved ? JSON.parse(saved) : [];
        setCatalogMap(getProductsWithLiveRatings(base, reviewsList));
      } catch {
        setCatalogMap(base);
      }
    };
    window.addEventListener('keshira:reviews-synced', handleReviewsSynced);
    window.addEventListener('keshira_products_updated', handleProductsUpdated);
    return () => {
      window.removeEventListener('keshira:reviews-synced', handleReviewsSynced);
      window.removeEventListener('keshira_products_updated', handleProductsUpdated);
    };
  }, []);

  const [selectedSizes, setSelectedSizes] = useState({
    hairfall: '200ml',
    dandruff: '200ml',
    gentle: '200ml',
    oil: '200ml'
  });
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSizeChange = (id, size) => {
    setSelectedSizes(prev => ({ ...prev, [id]: size }));
  };

  const concernsList = [
    { id: 'all', label: 'All Products (4)' },
    { id: 'dandruff', label: 'Dandruff (Neem)' },
    { id: 'hairfall', label: 'Dryness & Hair Fall (Hibiscus)' },
    { id: 'gentle', label: 'Gentle Care' },
    { id: 'oil', label: 'Scalp Oil Therapy' }
  ];

  const products = [
    catalogMap.hairfall,
    catalogMap.dandruff,
    catalogMap.gentle,
    catalogMap.oil
  ].filter(Boolean);

  const displayedProducts = selectedConcern === 'all'
    ? products
    : products.filter(p => {
        if (selectedConcern === 'hairfall') return p.id === 'hairfall' || p.id === 'oil';
        if (selectedConcern === 'dandruff') return p.id === 'dandruff' || p.id === 'oil';
        if (selectedConcern === 'gentle') return p.id === 'gentle' || p.id === 'oil';
        if (selectedConcern === 'oil') return p.id === 'oil';
        return true;
      });

  const handleAdd = (prod, e) => {
    const size = selectedSizes[prod.id] || '200ml';
    const rawPriceData = prod.prices[size];
    const isBogoActive = Boolean(storeOffers?.isBogoEnabled);
    const priceData = getEffectiveProductPrice(rawPriceData, isBogoActive);
    const targetEl = e?.currentTarget || e?.target;

    if (onAddToCart) {
      onAddToCart({
        id: `keshira-${prod.id}-${size}-one-time-0`,
        productId: prod.id,
        productType: prod.productType || (prod.id === 'oil' ? 'oil' : 'shampoo'),
        title: `${prod.name} - ${size}`,
        variant: size,
        subVariant: prod.shortName,
        price: priceData.price,
        originalPrice: priceData.originalPrice,
        bogoPairPrice: rawPriceData.bogoPairPrice,
        quantity: 1,
        image: prod.images.primary,
        purchaseType: 'one-time',
        isBOGO: isBogoActive,
        frequency: null
      }, targetEl);
      showToast(prod.shortName);
    }
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '80vh', padding: '40px 0 80px' }}>
      <div className="container">
        {toast && (
          <div 
            style={{
              position: 'fixed',
              top: '80px',
              right: '20px',
              zIndex: 1000,
              backgroundColor: '#111827',
              color: '#FFF',
              padding: '12px 20px',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              fontSize: '0.86rem',
              fontWeight: 600
            }}
          >
            ✓ {toast} added to your bag!
          </div>
        )}

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#6B7280', marginBottom: '24px' }}>
          <button 
            type="button" 
            onClick={() => onNavigateHome('/')} 
            style={{ color: '#111827', fontWeight: 600, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            Home
          </button>
          <span>/</span>
          <span>Hair & Scalp Care</span>
        </div>

        {/* Header */}
        <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '24px', marginBottom: '32px' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B7280' }}>
            Pure Botanical Trichology
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, color: '#111827', margin: '6px 0 12px 0', letterSpacing: '-0.03em' }}>
            Hair & Scalp Care Range
          </h1>
          <p style={{ color: '#4B5563', fontSize: '0.98rem', maxWidth: '680px', margin: 0, lineHeight: 1.5 }}>
            Calibrated formulations engineered at scalp pH 5.5. Enriched with cold-pressed Ayurvedic botanicals and zero synthetic fillers.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '36px' }}>
          {concernsList.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedConcern(tab.id)}
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: selectedConcern === tab.id ? 800 : 500,
                border: selectedConcern === tab.id ? '1.5px solid var(--color-primary, #2D3E2F)' : '1px solid #E5E9E5',
                backgroundColor: selectedConcern === tab.id ? 'var(--color-primary, #2D3E2F)' : '#FFFFFF',
                color: selectedConcern === tab.id ? '#FFFFFF' : '#1F2937',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
          {displayedProducts.map(product => {
            const currentSize = selectedSizes[product.id] || '200ml';
            const rawPriceData = product.prices[currentSize];
            const isBogoActive = Boolean(storeOffers?.isBogoEnabled);
            const priceData = getEffectiveProductPrice(rawPriceData, isBogoActive);

            return (
              <div 
                key={product.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <div>
                  <div style={{ position: 'relative', width: '100%', height: '260px', backgroundColor: '#F9FAFB' }}>
                    <span style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2, backgroundColor: '#111827', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 800, padding: '4px 8px', borderRadius: '4px' }}>
                      {product.concern}
                    </span>
                    <span style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2, backgroundColor: 'rgba(255,255,255,0.92)', color: '#111827', fontSize: '0.7rem', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', border: '1px solid #E5E7EB' }}>
                      {product.pH}
                    </span>
                    <img 
                      src={product.images.primary} 
                      alt={product.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ color: '#D97706', fontSize: '0.82rem', fontWeight: 700 }}>★ {product.rating}</span>
                      <span style={{ color: '#6B7280', fontSize: '0.78rem' }}>({product.reviewCount}+ reviews)</span>
                    </div>

                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                      {product.name}
                    </h2>

                    <p style={{ fontSize: '0.82rem', color: '#4B5563', margin: '0 0 16px 0', lineHeight: 1.45 }}>
                      {product.tagline}
                    </p>

                    {/* Size Selector */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                      {Object.keys(product.prices).map(sizeKey => {
                        const rawSInfo = product.prices[sizeKey];
                        const sInfo = getEffectiveProductPrice(rawSInfo, isBogoActive);
                        const isActive = currentSize === sizeKey;
                        return (
                            <button
                              key={sizeKey}
                              type="button"
                              onClick={() => handleSizeChange(product.id, sizeKey)}
                              style={{
                                flex: 1,
                                padding: '8px',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: isActive ? 800 : 500,
                                border: isActive ? '1.5px solid var(--color-primary, #2D3E2F)' : '1px solid #E5E9E5',
                                backgroundColor: isActive ? 'var(--color-primary, #2D3E2F)' : '#FFFFFF',
                                color: isActive ? '#FFFFFF' : 'var(--color-primary, #2D3E2F)',
                                cursor: 'pointer'
                              }}
                            >
                              {rawSInfo.size} • ₹{sInfo.price}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '0 20px 20px 20px' }}>
                    {isBogoActive && (
                      <div style={{ backgroundColor: '#F0F4F0', color: 'var(--color-primary, #2D3E2F)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, marginBottom: '10px', textAlign: 'center', border: '1px solid #C8D6C9' }}>
                        🎁 BUY 1 GET 1 FREE • 2x {currentSize} Dispatched
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div>
                        <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-primary, #2D3E2F)' }}>
                          ₹{priceData.price}
                        </span>
                        {priceData.isDiscounted && (
                          <span style={{ fontSize: '0.85rem', color: '#9CA3AF', textDecoration: 'line-through', marginLeft: '6px' }}>
                            ₹{priceData.originalPrice}
                          </span>
                        )}
                      </div>
                      {isBogoActive && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-primary, #2D3E2F)' }}>
                          {rawPriceData.savings}
                        </span>
                      )}
                    </div>

                    {(() => {
                      const size = selectedSizes[product.id] || '200ml';
                      const isItemInCart = cart.some(item => 
                        (item.productId === product.id || item.id?.includes(`keshira-${product.id}`)) &&
                        (item.variant === size || !item.variant)
                      );

                      if (isItemInCart) {
                        return (
                          <button
                            type="button"
                            onClick={() => onGoToBag ? onGoToBag() : window.location.assign('/checkout')}
                            style={{
                              width: '100%',
                              padding: '12px',
                              borderRadius: '6px',
                              backgroundColor: '#0F5132',
                              color: '#FFFFFF',
                              fontSize: '0.88rem',
                              fontWeight: 700,
                              border: '1px solid #198754',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            Go to Bag &rarr;
                          </button>
                        );
                      }

                      return (
                        <button
                          type="button"
                          onClick={(e) => handleAdd(product, e)}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--color-primary, #2D3E2F)',
                            color: '#FFFFFF',
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary-light, #3D533F)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary, #2D3E2F)'; }}
                        >
                          Add to Bag &rarr;
                        </button>
                      );
                    })()}
                  </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
