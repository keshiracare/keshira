import React, { useState } from 'react';

export default function Header({ cartCount, onCartOpen, onPortalOpen }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleScroll = (id) => {
    setIsMenuOpen(false); // Close menu
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="header">
      <div className="container header-container">
        {/* Brand Logo */}
        <a 
          href="#" 
          className="logo" 
          onClick={(e) => { 
            e.preventDefault(); 
            setIsMenuOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
          }}
        >
          <img 
            src="/favicon.svg" 
            alt="Keshira Logo" 
            style={{ width: '32px', height: '32px', objectFit: 'contain' }} 
          />
          KESHIRA
        </a>

        {/* Desktop Navigation Link */}
        <nav className="desktop-nav">
          <ul className="nav-links">
            <li><a href="#hero" onClick={(e) => { e.preventDefault(); handleScroll('hero'); }}>Home</a></li>
            <li><a href="#catalog" onClick={(e) => { e.preventDefault(); handleScroll('catalog'); }}>Shop</a></li>
            <li><a href="#ingredients" onClick={(e) => { e.preventDefault(); handleScroll('ingredients'); }}>Ingredients</a></li>
            <li><a href="#hair-journey" onClick={(e) => { e.preventDefault(); handleScroll('hair-journey'); }}>Journey</a></li>
            <li><a href="#connect" onClick={(e) => { e.preventDefault(); handleScroll('connect'); }}>Connect</a></li>
          </ul>
        </nav>

        {/* Action Buttons (User Portal & Cart) + Hamburger Toggle */}
        <div className="nav-actions">
          {/* User Account Portal */}
          <button className="cart-icon-btn" onClick={onPortalOpen} aria-label="Open subscription portal">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-user">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>

          {/* Cart Drawer Toggle */}
          <button className="cart-icon-btn" onClick={onCartOpen} aria-label="Open shopping cart" style={{ position: 'relative' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-shopping-bag">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
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
          <li><a href="#hero" onClick={(e) => { e.preventDefault(); handleScroll('hero'); }}>Home</a></li>
          <li><a href="#catalog" onClick={(e) => { e.preventDefault(); handleScroll('catalog'); }}>Shop</a></li>
          <li><a href="#hair-journey" onClick={(e) => { e.preventDefault(); handleScroll('hair-journey'); }}>Journey</a></li>
          <li><a href="#ingredients" onClick={(e) => { e.preventDefault(); handleScroll('ingredients'); }}>Ingredients</a></li>
          <li><a href="#connect" onClick={(e) => { e.preventDefault(); handleScroll('connect'); }}>Connect</a></li>
        </ul>
      </div>
    </header>
  );
}
