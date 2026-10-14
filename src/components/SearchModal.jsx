import React, { useState, useEffect, useRef } from 'react';
import { KESHIRA_PRODUCTS, KESHIRA_BUNDLES } from '../data/products';

export default function SearchModal({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 80);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalized = query.trim().toLowerCase();

  const allProducts = Object.values(KESHIRA_PRODUCTS);

  const matchedProducts = normalized
    ? allProducts.filter(p => {
        const text = `${p.name} ${p.shortName} ${p.concern} ${p.category} ${p.tagline} ${p.heroHerbs.map(h => h.name).join(' ')}`.toLowerCase();
        return text.includes(normalized);
      })
    : [];

  const matchedBundles = normalized
    ? KESHIRA_BUNDLES.filter(b => {
        const text = `${b.name} ${b.tagline} ${b.target} ${b.includes.join(' ')}`.toLowerCase();
        return text.includes(normalized);
      })
    : [];

  const popularSearches = [
    'Hair Fall',
    'Dandruff',
    'Herbal Oil',
    'Gentle Shampoo',
    'BOGO Offer',
    'Full Routine'
  ];

  const handleSelectProduct = () => {
    onClose();
    if (window.navigateTo) {
      window.navigateTo('/shop', 'catalog');
    } else if (onNavigate) {
      onNavigate('/shop', 'catalog');
    } else {
      const el = document.getElementById('catalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectBundle = () => {
    onClose();
    if (window.navigateTo) {
      window.navigateTo('/collections');
    } else if (onNavigate) {
      onNavigate('/collections');
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(18, 43, 25, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '16px',
        paddingTop: 'clamp(20px, 8vh, 80px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          position: 'relative',
          backgroundColor: '#FFFDF9',
          borderRadius: '20px',
          maxWidth: '620px',
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          border: '1.5px solid rgba(200, 162, 97, 0.45)',
          animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(18, 43, 25, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#FFFFFF'
        }}>
          <svg width="20" height="20" fill="none" stroke="var(--color-primary, #122B19)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search herbal remedies, concerns, or ingredients..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              color: 'var(--color-primary, #122B19)',
              backgroundColor: 'transparent',
              fontFamily: 'inherit',
              padding: '6px 0'
            }}
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#8C7A6B',
                cursor: 'pointer',
                fontSize: '0.9rem',
                padding: '4px 8px'
              }}
            >
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#F3EFEA',
              border: 'none',
              color: 'var(--color-primary, #122B19)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.95rem'
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Results / Suggestions */}
        <div style={{
          padding: '20px',
          overflowY: 'auto',
          flex: 1,
          WebkitOverflowScrolling: 'touch'
        }}>
          {!normalized ? (
            <div>
              <div style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#8C7A6B',
                marginBottom: '12px'
              }}>
                Popular Searches
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {popularSearches.map((term, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setQuery(term)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '20px',
                      backgroundColor: '#F7F3EE',
                      border: '1px solid #E8DFD0',
                      color: 'var(--color-primary, #122B19)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    🔍 {term}
                  </button>
                ))}
              </div>

              <div style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#8C7A6B',
                marginBottom: '12px'
              }}>
                Featured Ayurvedic Remedies
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {allProducts.slice(0, 3).map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProduct(p)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #EAE3D6',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <img 
                      src={p.images.primary} 
                      alt={p.name} 
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-primary, #122B19)', fontSize: '0.9rem' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#7A6B5C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.tagline}
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--color-primary, #122B19)', fontSize: '0.92rem' }}>
                      ₹{p.prices['200ml'].price}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {matchedProducts.length === 0 && matchedBundles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', color: '#7A6B5C' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🍃</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary, #122B19)', marginBottom: '4px' }}>
                    No exact match found for "{query}"
                  </div>
                  <div style={{ fontSize: '0.84rem' }}>
                    Try searching for <em>hair fall, dandruff, oil, gentle</em> or explore our complete catalog.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (window.navigateTo) window.navigateTo('/shop');
                    }}
                    style={{
                      marginTop: '16px',
                      padding: '10px 20px',
                      backgroundColor: 'var(--color-primary, #122B19)',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '20px',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer'
                    }}
                  >
                    Browse All Products
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {matchedProducts.length > 0 && (
                    <div>
                      <div style={{
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#8C7A6B',
                        marginBottom: '10px'
                      }}>
                        Products ({matchedProducts.length})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {matchedProducts.map(p => (
                          <div
                            key={p.id}
                            onClick={() => handleSelectProduct(p)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px',
                              borderRadius: '12px',
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #EAE3D6',
                              cursor: 'pointer'
                            }}
                          >
                            <img 
                              src={p.images.primary} 
                              alt={p.name} 
                              style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, color: 'var(--color-primary, #122B19)', fontSize: '0.92rem' }}>
                                {p.name}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: '#7A6B5C' }}>
                                {p.concernTag || p.concern}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 800, color: 'var(--color-primary, #122B19)', fontSize: '0.95rem' }}>
                                ₹{p.prices['200ml'].price}
                              </div>
                              <span style={{ fontSize: '0.7rem', color: '#2E7D32', fontWeight: 700 }}>
                                Buy 1 Get 1 FREE
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchedBundles.length > 0 && (
                    <div>
                      <div style={{
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#8C7A6B',
                        marginBottom: '10px'
                      }}>
                        Bundles & Regimens ({matchedBundles.length})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {matchedBundles.map(b => (
                          <div
                            key={b.id}
                            onClick={() => handleSelectBundle(b)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px',
                              borderRadius: '12px',
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #EAE3D6',
                              cursor: 'pointer'
                            }}
                          >
                            <img 
                              src={b.image} 
                              alt={b.name} 
                              style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, color: 'var(--color-primary, #122B19)', fontSize: '0.92rem' }}>
                                {b.name}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: '#7A6B5C' }}>
                                {b.tagline}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 800, color: 'var(--color-primary, #122B19)', fontSize: '0.95rem' }}>
                                ₹{b.price}
                              </div>
                              <span style={{ fontSize: '0.7rem', color: '#C8A261', fontWeight: 800 }}>
                                {b.savingsPercent}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div style={{
          padding: '10px 20px',
          backgroundColor: '#FAF7F2',
          borderTop: '1px solid rgba(18, 43, 25, 0.08)',
          fontSize: '0.75rem',
          color: '#8C7A6B',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Press <strong>ESC</strong> to close</span>
          <span>100% Ayurvedic & Chemical-Free</span>
        </div>
      </div>
    </div>
  );
}
