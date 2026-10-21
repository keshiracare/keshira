import React, { useState, useEffect } from 'react';
import { getActiveProducts, getProductsWithLiveRatings, KESHIRA_BUNDLES, getActiveOffers, getEffectiveProductPrice } from '../data/products';

export default function BestSellersPage({ onAddToCart, onNavigateHome, storeOffers: propStoreOffers }) {
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
    window.addEventListener('keshira:reviews-synced', handleReviewsSynced);
    return () => window.removeEventListener('keshira:reviews-synced', handleReviewsSynced);
  }, []);

  const [selectedSizes, setSelectedSizes] = useState({
    hairfall: '200ml',
    dandruff: '200ml',
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

  const bestSellers = [
    {
      ...(catalogMap.hairfall || {}),
      rank: '#1 Best Seller',
      badgeText: 'Highest Repeat Purchase Rate (84%)'
    },
    {
      ...(catalogMap.dandruff || {}),
      rank: '#2 Best Seller',
      badgeText: 'Instant Flake & Itch Relief at pH 5.5'
    },
    {
      ...(catalogMap.oil || {}),
      rank: '#3 Best Seller',
      badgeText: '14 Sacred Herbs Cold-Pressed Infusion'
    }
  ].filter(p => p && p.id);

  const handleAdd = (prod) => {
    const size = selectedSizes[prod.id] || '200ml';
    const rawPriceData = prod.prices[size];
    const isBogoActive = Boolean(storeOffers?.isBogoEnabled && prod.isBOGO);
    const priceData = getEffectiveProductPrice(rawPriceData, isBogoActive);

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
      });
      showToast(prod.shortName);
    }
  };

  const handleAddBundle = (bundle) => {
    if (onAddToCart) {
      onAddToCart({
        id: `${bundle.id}-combo-one-time-0`,
        title: bundle.name,
        variant: bundle.size,
        subVariant: bundle.tagline,
        price: bundle.price,
        quantity: 1,
        image: bundle.image,
        purchaseType: 'bundle',
        bundleItems: bundle.includes,
        frequency: null
      });
      showToast(bundle.name);
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
          <span>Best Sellers</span>
        </div>

        {/* Header */}
        <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '24px', marginBottom: '40px' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B7280' }}>
            Curated Community Favorites
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, color: '#111827', margin: '6px 0 12px 0', letterSpacing: '-0.03em' }}>
            Our Best Sellers
          </h1>
          <p style={{ color: '#4B5563', fontSize: '0.98rem', maxWidth: '680px', margin: 0, lineHeight: 1.5 }}>
            Our highest-rated, clinically-backed botanical formulations loved by over 1,250+ verified customers across India.
          </p>
        </div>

        {/* 3 Best Selling Products Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px', marginBottom: '60px' }}>
          {bestSellers.map(product => {
            const currentSize = selectedSizes[product.id] || '200ml';
            const rawPriceData = product.prices[currentSize];
            const isBogoActive = Boolean(storeOffers?.isBogoEnabled && product.isBOGO);
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
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
              >
                <div>
                  {/* Image container */}
                  <div style={{ position: 'relative', width: '100%', height: '280px', backgroundColor: '#F9FAFB' }}>
                    <span style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2, backgroundColor: '#111827', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: '4px' }}>
                      {product.rank}
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

                  {/* Body */}
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ color: '#D97706', fontSize: '0.82rem', fontWeight: 700 }}>★ {product.rating}</span>
                      <span style={{ color: '#6B7280', fontSize: '0.78rem' }}>({product.reviewCount} verified review{product.reviewCount === 1 ? '' : 's'})</span>
                    </div>

                    <h2 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#111827', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                      {product.name}
                    </h2>

                    <p style={{ fontSize: '0.82rem', color: '#4B5563', margin: '0 0 12px 0', lineHeight: 1.45 }}>
                      {product.tagline}
                    </p>

                    <div style={{ backgroundColor: '#F3F4F6', color: '#1F2937', padding: '6px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, marginBottom: '16px' }}>
                      {product.badgeText}
                    </div>

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

                {/* Footer with Price and Add to Bag */}
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

                  <button
                    type="button"
                    onClick={() => handleAdd(product)}
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
                </div>
              </div>
            );
          })}
        </div>

        {/* Best Selling Routine Duos */}
        <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.06em' }}>
              Most Popular Bundles
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#111827', margin: '4px 0 0 0' }}>
              Frequently Bought Together Duos
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {KESHIRA_BUNDLES.slice(0, 2).map(bundle => (
              <div 
                key={bundle.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#166534', backgroundColor: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>
                    {bundle.badge}
                  </span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: '6px 0 4px 0' }}>
                    {bundle.name}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0 0 8px 0' }}>
                    {bundle.tagline}
                  </p>
                  <div>
                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#111827' }}>₹{bundle.price}</span>
                    <span style={{ fontSize: '0.82rem', color: '#9CA3AF', textDecoration: 'line-through', marginLeft: '6px' }}>₹{bundle.originalPrice}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddBundle(bundle)}
                  style={{
                    backgroundColor: 'var(--color-primary, #2D3E2F)',
                    color: '#FFFFFF',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary-light, #3D533F)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary, #2D3E2F)'; }}
                >
                  Buy Duo
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
