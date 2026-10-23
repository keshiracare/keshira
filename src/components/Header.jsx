import React, { useState } from 'react';

export default function Header({ 
  cartCount, 
  onCartOpen, 
  onPortalOpen, 
  onOpenPolicy, 
  currentPath, 
  onNavigate,
  onSearchOpen,
  isCartBumping = false
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isHome = !currentPath || currentPath === '/' || currentPath === '';
  const isCollections = currentPath === '/collections';

  const handleLinkClick = (id) => {
    setIsMenuOpen(false); // Close menu
    if (!isHome) {
      // If currently on other pages, navigate back to home and then scroll
      onNavigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleCollectionsClick = (e) => {
    e.preventDefault();
    setIsMenuOpen(false);
    onNavigate('/collections');
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    setIsMenuOpen(false);
    if (!isHome) {
      onNavigate('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchClick = () => {
    if (onSearchOpen) {
      onSearchOpen();
    } else {
      const el = document.getElementById('catalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="header">
      <div className="container header-container">
        {/* Brand Wordmark with botanical crest */}
        <a 
          href="/" 
          className="brand-logo" 
          onClick={handleHomeClick}
          aria-label="Keshira Homepage"
        >
          <img 
            src="/favicon.svg" 
            alt="Keshira crest" 
            className="brand-logo-icon"
          />
          <span className="brand-logo-text">KESHIRA</span>
        </a>

        {/* Minimalist Ultra-Clean Navigation */}
        <nav className="desktop-nav">
          <ul className="minimalist-nav-links">
            <li className="minimalist-nav-item">
              <a 
                href="/shop" 
                className="minimalist-nav-link"
                onClick={(e) => { e.preventDefault(); onNavigate('/shop'); }}
                style={{ fontWeight: (currentPath === '/shop' || currentPath === '/hair-care') ? 800 : 500 }}
              >
                <span className="nav-link-text">Shop</span>
              </a>
            </li>

            <li className="minimalist-nav-item">
              <a 
                href="/best-sellers" 
                className="minimalist-nav-link"
                onClick={(e) => { e.preventDefault(); onNavigate('/best-sellers'); }}
                style={{ fontWeight: currentPath === '/best-sellers' ? 800 : 500 }}
              >
                <span className="nav-link-text">Best Sellers</span>
              </a>
            </li>

            <li className="minimalist-nav-item">
              <a 
                href="/hair-care" 
                className="minimalist-nav-link"
                onClick={(e) => { e.preventDefault(); onNavigate('/hair-care'); }}
                style={{ fontWeight: currentPath === '/hair-care' ? 800 : 500 }}
              >
                <span className="nav-link-text">Hair Care</span>
              </a>
            </li>

            <li className="minimalist-nav-item">
              <a 
                href="/collections" 
                className="minimalist-nav-link"
                onClick={handleCollectionsClick}
                style={{ fontWeight: isCollections ? 800 : 500 }}
              >
                <span className="nav-link-text">Build Routine</span>
              </a>
            </li>

            <li className="minimalist-nav-item">
              <a 
                href="#order-tracker" 
                className="minimalist-nav-link"
                onClick={(e) => { e.preventDefault(); handleLinkClick('order-tracker'); }}
                style={{ fontWeight: 500 }}
              >
                <span className="nav-link-text">Track Order</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Action Buttons: Search, Account, Bag (Exact Minimalist Top Nav Actions) */}
        <div className="nav-actions">
          {/* Search Icon */}
          <button 
            className="minimalist-action-btn" 
            onClick={handleSearchClick}
            aria-label="Search Catalog" 
            title="Search"
          >
            <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>

          {/* User Account Portal */}
          <button className="minimalist-action-btn" onClick={onPortalOpen} aria-label="Open customer account portal" title="Account">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>

          {/* Cart Checkout Toggle */}
          <button 
            id="header-cart-icon-btn"
            className={`minimalist-action-btn cart-header-action-btn ${isCartBumping ? 'cart-icon-bump' : ''}`} 
            onClick={onCartOpen} 
            aria-label="View shopping bag and checkout" 
            title="Cart & Checkout"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {cartCount > 0 && <span className="minimalist-cart-badge">{cartCount}</span>}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button 
            className={`mobile-menu-toggle ${isMenuOpen ? 'open' : ''}`} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
          </button>
        </div>
      </div>

      {/* Mobile Glassmorphic Navigation Panel */}
      <div className={`mobile-nav-panel ${isMenuOpen ? 'active' : ''}`}>
        <ul className="mobile-nav-links">
          <li>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleSearchClick();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                background: 'rgba(200, 162, 97, 0.12)',
                border: '1px solid rgba(200, 162, 97, 0.3)',
                borderRadius: '10px',
                color: 'var(--color-primary, #122B19)',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span>Search Products & Remedies...</span>
            </button>
          </li>
          <li><a href="/" onClick={handleHomeClick}>Home</a></li>
          <li>
            <a 
              href="/collections" 
              onClick={handleCollectionsClick}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-accent-gold-dark)', fontWeight: 700 }}
            >
              <span>Collections & Bundles</span>
              <span style={{ backgroundColor: 'var(--color-accent-gold)', color: 'var(--color-primary)', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px' }}>SAVE 20%</span>
            </a>
          </li>
          <li><a href="/shop" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); onNavigate('/shop'); }}>Flagship Shop</a></li>
          <li><a href="/hair-care" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); onNavigate('/hair-care'); }}>Hair Care Formulas</a></li>
          <li><a href="#ingredients" onClick={(e) => { e.preventDefault(); handleLinkClick('ingredients'); }}>Ingredients</a></li>
          <li><a href="#testimonials" onClick={(e) => { e.preventDefault(); handleLinkClick('testimonials'); }}>Reviews</a></li>
          <li><a href="#account" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); onPortalOpen(); }}>My Account & Orders</a></li>
          <li><a href="#about" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); onOpenPolicy('about'); }}>About Us</a></li>
          <li><a href="#contact" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); onOpenPolicy('contact'); }}>Contact</a></li>
        </ul>
      </div>
    </header>
  );
}
