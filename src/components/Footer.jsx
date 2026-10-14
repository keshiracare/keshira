import React, { useState } from 'react';

export default function Footer({ onOpenPolicy, onSecretClick, currentPath, onNavigate }) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const isHome = !currentPath || currentPath === '/' || currentPath === '';

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setIsSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setIsSubscribed(false), 4000);
  };

  const handleScrollTo = (id) => {
    if (!isHome) {
      if (onNavigate) {
        onNavigate('/');
      } else {
        window.location.pathname = '/';
      }
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 120);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleNavCollections = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('/collections');
    } else if (window.navigateTo) {
      window.navigateTo('/collections');
    } else {
      window.location.pathname = '/collections';
    }
  };

  return (
    <footer className="footer-clean" style={{ position: 'relative', zIndex: 2 }}>
      <div className="container footer-clean-container">
        
        {/* Brand & Mission */}
        <div className="footer-clean-brand">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="footer-brand-logo"
          >
            <img 
              src="/favicon.svg" 
              alt="Keshira Crest" 
              style={{ width: '34px', height: '34px', objectFit: 'contain' }}
            />
            <span className="footer-brand-name">KESHIRA</span>
          </a>
          <p className="footer-brand-desc">
            Authentic Indian botanical haircare hand-poured in micro-batches with fourteen sacred Ayurvedic botanicals for scalp balance and root strength.
          </p>

          {/* Compact Newsletter */}
          <div className="footer-clean-newsletter">
            <span className="footer-newsletter-label">Join our Botanical Circle</span>
            {isSubscribed ? (
              <div className="newsletter-success-tag">
                ✓ Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="footer-newsletter-form">
                <input 
                  type="email" 
                  placeholder="Enter email for hair ritual tips" 
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="footer-newsletter-input"
                />
                <button type="submit" className="footer-newsletter-btn" aria-label="Subscribe">
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Essential Navigation Columns */}
        <div className="footer-clean-links-group">
          {/* Shop */}
          <div className="footer-clean-col">
            <h4 className="footer-col-title">Shop</h4>
            <ul className="footer-nav-list">
              <li>
                <a href="#catalog" onClick={(e) => { e.preventDefault(); handleScrollTo('catalog'); }}>
                  Herbal Shampoo
                </a>
              </li>
              <li>
                <a href="#catalog" onClick={(e) => { e.preventDefault(); handleScrollTo('catalog'); }}>
                  Herbal Hair Oil
                </a>
              </li>
              <li>
                <a href="/collections" onClick={handleNavCollections}>
                  Curated Bundles & Duos
                </a>
              </li>
              <li>
                <a href="#hair-quiz" onClick={(e) => { e.preventDefault(); handleScrollTo('hair-quiz'); }}>
                  Hair Diagnostic Quiz
                </a>
              </li>
            </ul>
          </div>

          {/* Learn & Help */}
          <div className="footer-clean-col">
            <h4 className="footer-col-title">Learn & Help</h4>
            <ul className="footer-nav-list">
              <li>
                <a href="#ingredients" onClick={(e) => { e.preventDefault(); handleScrollTo('ingredients'); }}>
                  Our 14 Botanicals
                </a>
              </li>
              <li>
                <a href="#about" onClick={(e) => { e.preventDefault(); onOpenPolicy('about'); }}>
                  Our Story
                </a>
              </li>
              <li>
                <a href="#order-tracker" onClick={(e) => { e.preventDefault(); handleScrollTo('order-tracker'); }}>
                  Track Order
                </a>
              </li>
              <li>
                <a href="/account" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('/account'); else if (window.navigateTo) window.navigateTo('/account'); else window.location.pathname = '/account'; }}>
                  My Account & Orders
                </a>
              </li>
              <li>
                <a href="#faqs" onClick={(e) => { e.preventDefault(); handleScrollTo('faqs'); }}>
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="footer-clean-col">
            <h4 className="footer-col-title">Connect</h4>
            <ul className="footer-nav-list">
              <li>
                <a href="mailto:keshira.care@gmail.com">
                  keshira.care@gmail.com
                </a>
              </li>
              <li>
                <a href="https://instagram.com/keshira_haircare" target="_blank" rel="noopener noreferrer">
                  @keshira_haircare
                </a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => { e.preventDefault(); onOpenPolicy('contact'); }}>
                  Direct Message
                </a>
              </li>
              <li style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>
                Ahmedabad, Gujarat, India
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* Bottom Bar: Copyright & Policies */}
      <div className="footer-bottom-bar">
        <div className="container footer-bottom-container">
          <p 
            onClick={onSecretClick} 
            style={{ cursor: 'default', userSelect: 'none', margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}
            title="Keshira Pure Ayurvedic Care"
          >
            &copy; {new Date().getFullYear()} KESHIRA HERBAL CARE. Handcrafted in India.
          </p>

          <div className="footer-legal-links">
            <button 
              type="button" 
              onClick={() => onOpenPolicy('privacy')} 
              className="footer-policy-link"
            >
              Privacy
            </button>
            <span className="legal-sep">•</span>
            <button 
              type="button" 
              onClick={() => onOpenPolicy('terms')} 
              className="footer-policy-link"
            >
              Terms
            </button>
            <span className="legal-sep">•</span>
            <button 
              type="button" 
              onClick={() => onOpenPolicy('refund')} 
              className="footer-policy-link"
            >
              Refunds
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
