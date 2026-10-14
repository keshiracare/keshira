import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { seo } from './seo.js';
import Header from './components/Header';
import Hero from './components/Hero';
import HairQuiz from './components/HairQuiz';
import ProductCatalog from './components/ProductCatalog';
import ProductDetail from './components/ProductDetail';
import IngredientsSection from './components/IngredientsSection';
import HairJourney from './components/HairJourney';
import OrderTracker from './components/OrderTracker';
import OffersZone from './components/OffersZone';
import FAQAccordion from './components/FAQAccordion';
import SocialCollage from './components/SocialCollage';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AdminPage from './components/AdminPage';
import SubscriptionPortal from './components/SubscriptionPortal';
import ScrollReveal from './components/ScrollReveal';
import QuickBuyBar from './components/QuickBuyBar';
import BeforeAfterSlider from './components/BeforeAfterSlider';
import PolicyModal from './components/PolicyModal';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';
import RefundPolicy from './components/RefundPolicy';
import TestimonialsSection from './components/TestimonialsSection';
import PromoPopup from './components/PromoPopup';
import CollectionsShop from './components/CollectionsShop';
import BestSellersPage from './components/BestSellersPage';
import HairCarePage from './components/HairCarePage';
import CustomerPortalPage from './components/CustomerPortalPage';
import AyurvedicTransitionGuide from './components/AyurvedicTransitionGuide';
import ShampooComparisonTable from './components/ShampooComparisonTable';
import WhatsAppFloatingButton from './components/WhatsAppFloatingButton';
import MinimalistPillars from './components/MinimalistPillars';
import MinimalistConcernSlider from './components/MinimalistConcernSlider';

import Footer from './components/Footer';
import { getActiveOffers } from './data/products';

export default function App() {
  const [storeOffers, setStoreOffers] = useState(getActiveOffers());
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [policyModal, setPolicyModal] = useState({ isOpen: false, type: '' });
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // Client-side Routing State for Minimalist Multi-Page Architecture
  const getInitialPath = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    if (path.includes('/admin') || hash.includes('admin') || params.get('admin') === 'true') return '/admin';
    if (path.includes('/account') || hash.includes('account') || path.includes('/orders') || hash.includes('orders') || path.includes('/portal')) return '/account';
    if (path.includes('/best-sellers') || hash.includes('best-sellers')) return '/best-sellers';
    if (path.includes('/hair-care') || hash.includes('hair-care') || path.includes('/shop') || hash.includes('#shop')) return '/hair-care';
    if (path.includes('/collections') || hash.includes('collections')) return '/collections';
    if (path.includes('/guide') || path.includes('/ayurvedic-hair-transition-guide') || hash.includes('guide')) return '/ayurvedic-hair-transition-guide';
    return '/';
  };

  const [currentPath, setCurrentPath] = useState(getInitialPath);

  // Synchronize browser history and hash navigation
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(getInitialPath());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (path, scrollTarget) => {
    const [cleanPath, hash] = path.split('#');
    const target = scrollTarget || hash;
    window.history.pushState({}, '', cleanPath || '/');
    setCurrentPath(cleanPath || '/');
    if (target && target !== 'top') {
      setTimeout(() => {
        const el = document.getElementById(target);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 150);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Attach to window so child components can also trigger navigation
  useEffect(() => {
    window.navigateTo = navigateTo;
    return () => {
      delete window.navigateTo;
    };
  }, []);

  // Auto-show promo advertisement popup after a brief delay (1.2s) only if user hasn't closed/dismissed it before
  useEffect(() => {
    const hasDismissed = localStorage.getItem('keshira_promo_dismissed');
    if (!hasDismissed) {
      const timer = setTimeout(() => {
        setIsPromoOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClosePromo = () => {
    setIsPromoOpen(false);
    // Permanently remember that the user clicked close on this browser
    localStorage.setItem('keshira_promo_dismissed', 'true');
  };

  const handleOpenPolicy = (type) => {
    setPolicyModal({ isOpen: true, type });
  };

  const handleClosePolicy = () => {
    setPolicyModal({ isOpen: false, type: '' });
  };
  const [userEmail, setUserEmail] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(null); // null = unchecked, true = first time, false = returning

  // Secret Triple-Click Copyright Trigger
  const handleSecretClick = () => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        navigateTo('/admin');
        return 0; // reset
      }
      return next;
    });
  };

  // Reset count after 1.5 seconds of inactivity
  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), 1500);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  // Listen to live offer toggles from Admin Portal
  useEffect(() => {
    const handleOffersUpdated = (e) => {
      const updatedOffers = e.detail || getActiveOffers();
      setStoreOffers(updatedOffers);

      // If B1G1 offer was toggled OFF, clean up any auto-added free B1G1 bottles from active cart
      if (!updatedOffers?.isBogoEnabled) {
        setCart(prevCart => prevCart.filter(item => !item.isFreeBogoItem && !item.id?.includes('-free-bogo')));
      }
    };
    window.addEventListener('keshira_offers_updated', handleOffersUpdated);
    return () => window.removeEventListener('keshira_offers_updated', handleOffersUpdated);
  }, []);

  const [checkoutSummary, setCheckoutSummary] = useState({
    subtotal: 0,
    discount: 0,
    shipping: 0,
    total: 0
  });

  const handleAddToCart = (newItem) => {
    setCart((prevCart) => {
      let updatedCart = [...prevCart];

      // Check if product is B1G1 eligible AND store-wide B1G1 offer is active
      const isBogoActive = Boolean(storeOffers?.isBogoEnabled && newItem.isBOGO);

      if (isBogoActive && newItem.purchaseType !== 'bundle' && !newItem.isFreeBogoItem) {
        // Customer adds 1 paid bottle
        const existingItemIdx = updatedCart.findIndex((item) => item.id === newItem.id);
        if (existingItemIdx > -1) {
          updatedCart[existingItemIdx] = {
            ...updatedCart[existingItemIdx],
            quantity: updatedCart[existingItemIdx].quantity + newItem.quantity
          };
        } else {
          updatedCart.push({ ...newItem });
        }

        // Automatically add the corresponding 2nd FREE bottle of the same product & size
        const freeItemId = `${newItem.id}-free-bogo`;
        const freeItemIdx = updatedCart.findIndex((item) => item.id === freeItemId);
        const freeItem = {
          ...newItem,
          id: freeItemId,
          title: `🎁 ${newItem.title} (FREE B1G1)`,
          price: 0,
          originalPrice: newItem.price,
          isFreeBogoItem: true,
          parentBogoId: newItem.id
        };

        if (freeItemIdx > -1) {
          updatedCart[freeItemIdx] = {
            ...updatedCart[freeItemIdx],
            quantity: updatedCart[freeItemIdx].quantity + newItem.quantity
          };
        } else {
          updatedCart.push({
            ...freeItem,
            quantity: newItem.quantity
          });
        }

        return updatedCart;
      }

      // Standard non-BOGO item addition
      const existingItemIdx = updatedCart.findIndex((item) => item.id === newItem.id);
      if (existingItemIdx > -1) {
        updatedCart[existingItemIdx] = {
          ...updatedCart[existingItemIdx],
          quantity: updatedCart[existingItemIdx].quantity + newItem.quantity
        };
        return updatedCart;
      }
      return [...updatedCart, newItem];
    });

    // Open cart drawer immediately for visual feedback
    setIsCartOpen(true);
  };

  // Handler to claim the 200ml Shampoo + Free 30ml Herbal Oil offer from the popup
  const handleClaimPromoOffer = () => {
    setIsPromoOpen(false);

    const shampooItem = {
      id: 'keshira-shampoo-hairfall-200ml-one-time-0',
      title: 'Keshira Herbal Shampoo (Hair Fall Control) - 200ml',
      variant: '200ml',
      subVariant: 'Hair Fall Control',
      price: 199,
      quantity: 1,
      image: '/assets/hero-shampoo.jpg',
      purchaseType: 'one-time',
      frequency: null
    };

    const freeOilItem = {
      id: 'keshira-oil-30ml-free-promo',
      title: '🎁 Keshira Herbal Hair Oil (Complimentary Gift)',
      variant: '30ml',
      subVariant: 'Pure Herbal Botanical Infusion',
      price: 0,
      quantity: 1,
      image: '/assets/hairoil-luxury.jpg',
      purchaseType: 'one-time',
      frequency: null
    };

    setCart((prevCart) => {
      let updatedCart = [...prevCart];

      // Add Shampoo 200ml
      const shampooIdx = updatedCart.findIndex((item) => item.id === shampooItem.id);
      if (shampooIdx > -1) {
        updatedCart[shampooIdx].quantity += 1;
      } else {
        updatedCart.push(shampooItem);
      }

      // Add Free 30ml Oil
      const freeOilIdx = updatedCart.findIndex((item) => item.id === freeOilItem.id);
      if (freeOilIdx > -1) {
        updatedCart[freeOilIdx].quantity += 1;
      } else {
        updatedCart.push(freeOilItem);
      }

      return updatedCart;
    });

    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id, delta) => {
    setCart((prevCart) => {
      // Find item
      const targetItem = prevCart.find((item) => item.id === id);
      if (!targetItem) return prevCart;

      // If user clicks +/- on a free B1G1 bottle, we treat it as modifying the parent item
      const parentId = targetItem.isFreeBogoItem ? targetItem.parentBogoId : id;
      const freeItemId = `${parentId}-free-bogo`;

      let updated = prevCart.map((item) => {
        if (item.id === parentId) {
          return { ...item, quantity: item.quantity + delta };
        }
        if (item.id === freeItemId) {
          return { ...item, quantity: item.quantity + delta };
        }
        if (item.id === id && item.id !== parentId && item.id !== freeItemId) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      });

      return updated.filter((item) => item.quantity > 0);
    });
  };

  const handleRemoveItem = (id) => {
    setCart((prevCart) => {
      const targetItem = prevCart.find((item) => item.id === id);
      if (!targetItem) return prevCart;

      const parentId = targetItem.isFreeBogoItem ? targetItem.parentBogoId : id;
      const freeItemId = `${parentId}-free-bogo`;

      return prevCart.filter((item) => item.id !== parentId && item.id !== freeItemId);
    });
  };

  const handleCheckoutOpen = (summary) => {
    setCheckoutSummary(summary);
    setIsCartOpen(false); // Close cart drawer
    setIsCheckoutOpen(true); // Open checkout wizard modal
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const isAdminPage = currentPath === '/admin';
  const isAccountPage = currentPath === '/account';
  const isGuidePage = currentPath === '/ayurvedic-hair-transition-guide';
  const isCollectionsPage = currentPath === '/collections';
  const isBestSellersPage = currentPath === '/best-sellers';
  const isHairCarePage = currentPath === '/hair-care' || currentPath === '/shop';

  // Dedicated Full-Page Admin Portal
  if (isAdminPage) {
    return (
      <>
        <Helmet>
          <title>Operations & Orders Portal | Keshira Apothecary Admin</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <AdminPage onNavigateHome={() => navigateTo('/')} />
      </>
    );
  }

  // Dedicated Full-Page Customer Orders & Account Portal
  if (isAccountPage) {
    return (
      <>
        <CustomerPortalPage 
          onNavigateHome={(path = '/') => navigateTo(path)} 
          onNavigateShop={(path = '/shop') => navigateTo(path)} 
        />
        {/* Cart Side Drawer accessible on account page if needed */}
        <CartDrawer 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckout={handleCheckoutOpen}
          userEmail={userEmail}
          setUserEmail={setUserEmail}
          isFirstTime={isFirstTime}
          setIsFirstTime={setIsFirstTime}
        />
        <CheckoutModal 
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          orderSummary={checkoutSummary}
          cart={cart}
          onClearCart={handleClearCart}
          prefilledEmail={userEmail}
          setIsFirstTime={setIsFirstTime}
        />
      </>
    );
  }

  const currentSeo = isGuidePage 
    ? seo.guide 
    : isCollectionsPage 
      ? seo.collections 
      : seo;

  return (
    <>
      {/* WCAG 2.2 Accessible Skip Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

<Helmet>
  <title>{currentSeo.title}</title>
  <meta name="description" content={currentSeo.description} />
  <link rel="canonical" href={currentSeo.canonical} />
  <meta property="og:title" content={currentSeo.title} />
  <meta property="og:description" content={currentSeo.description} />
  <meta property="og:image" content={seo.ogImage} />
  <meta property="og:image:width" content={seo.ogImageWidth} />
  <meta property="og:image:height" content={seo.ogImageHeight} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content={seo.twitterHandle} />
  <meta name="robots" content="index, follow" />
  <meta name="theme-color" content="#122B19" />
  <script type="application/ld+json">{JSON.stringify(seo.jsonLd)}</script>
</Helmet>
      {/* Background Floating Leaves Animation */}
      <div className="leaf-container">
        <div className="floating-leaf leaf-1"></div>
        <div className="floating-leaf leaf-2"></div>
        <div className="floating-leaf leaf-3"></div>
        <div className="floating-leaf leaf-4"></div>
      </div>

      {/* Top Promo Announcement Bar (Deep Espresso & Warm Ivory) */}
      <div 
        style={{ 
          backgroundColor: '#271610', 
          color: '#FAF7F2', 
          textAlign: 'center', 
          padding: '9px 16px', 
          fontSize: '0.83rem', 
          fontWeight: 700, 
          letterSpacing: '0.025em',
          position: 'relative',
          zIndex: 121,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          borderBottom: '1px solid #3B2219'
        }}
      >
        <button
          type="button"
          onClick={() => setIsPromoOpen(true)}
          aria-label="Previous announcement"
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.68rem',
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            padding: 0
          }}
        >
          &#9664;
        </button>

        <div 
          onClick={() => setIsPromoOpen(true)}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span>
            {storeOffers?.isBogoEnabled 
              ? 'BUY 1 GET 1 FREE (B1G1) ON ALL SHAMPOOS + FREE HAIR OIL ON ORDERS ₹399+' 
              : 'FREE PAN-INDIA EXPRESS DELIVERY ON ORDERS ₹300+ • 100% PURE BOTANICAL AYURVEDA'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsPromoOpen(true)}
          aria-label="Next announcement"
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.68rem',
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            padding: 0
          }}
        >
          &#9654;
        </button>
      </div>

      <Header 
        cartCount={totalCartCount} 
        onCartOpen={() => setIsCartOpen(true)} 
        onPortalOpen={() => navigateTo('/account')}
        onOpenPolicy={handleOpenPolicy}
        currentPath={currentPath}
        onNavigate={navigateTo}
      />
      
      {/* Route Switcher: Multi-Page Architecture (Minimalist Style) */}
      {isGuidePage ? (
        <main id="main-content" tabIndex={-1} style={{ position: 'relative', zIndex: 1, minHeight: '80vh', backgroundColor: 'var(--color-bg-parchment-light, #FAF7F2)', outline: 'none' }}>
          <AyurvedicTransitionGuide 
            onNavigateHome={() => navigateTo('/')}
            onNavigateShop={() => navigateTo('/collections')}
          />
        </main>
      ) : isBestSellersPage ? (
        <main id="main-content" tabIndex={-1} style={{ position: 'relative', zIndex: 1, minHeight: '80vh', outline: 'none' }}>
          <BestSellersPage 
            onAddToCart={handleAddToCart}
            onNavigateHome={(path = '/') => navigateTo(path)}
          />
        </main>
      ) : isHairCarePage ? (
        <main id="main-content" tabIndex={-1} style={{ position: 'relative', zIndex: 1, minHeight: '80vh', outline: 'none' }}>
          <HairCarePage 
            onAddToCart={handleAddToCart}
            onNavigateHome={(path = '/') => navigateTo(path)}
          />
        </main>
      ) : isCollectionsPage ? (
        <main id="main-content" tabIndex={-1} style={{ position: 'relative', zIndex: 1, minHeight: '80vh', outline: 'none' }}>
          <CollectionsShop 
            onAddToCart={handleAddToCart}
            onNavigateHome={(target = 'purchase-section', productType) => {
              navigateTo('/', target === 'top' ? null : target);
              if (productType) {
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('keshira:select-product', { detail: productType }));
                }, 200);
              }
            }}
          />
        </main>
      ) : (
        <main id="main-content" tabIndex={-1} style={{ position: 'relative', zIndex: 1, outline: 'none' }}>
          <Hero storeOffers={storeOffers} />

          {/* 1. Our Best Sellers / Product Catalog with 1-Click Buy (Minimalist Section 1) */}
          <ScrollReveal>
            <ProductCatalog onAddToCart={handleAddToCart} storeOffers={storeOffers} />
          </ScrollReveal>

          {/* 2. Minimalist "Shop by Concern" Component (Minimalist Section 2) */}
          <ScrollReveal>
            <MinimalistConcernSlider onSelectConcern={(targetId) => {
              const el = document.getElementById('catalog');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              window.dispatchEvent(new CustomEvent('keshira:filter-concern', { detail: targetId }));
            }} />
          </ScrollReveal>

          {/* 3. Minimalist Core Brand Pillars: Transparency, Efficacy, Affordable, Only the Best */}
          <ScrollReveal>
            <MinimalistPillars />
          </ScrollReveal>

          {/* 4. "Which Shampoo is Right For Me?" Interactive Matrix */}
          <ScrollReveal>
            <ShampooComparisonTable onSelectProduct={(prodId) => {
              const el = document.getElementById('purchase-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              window.dispatchEvent(new CustomEvent('keshira:select-product', { detail: prodId }));
            }} storeOffers={storeOffers} />
          </ScrollReveal>

          {/* 5. Interactive Hair & Scalp Diagnostic */}
          <ScrollReveal>
            <HairQuiz onAddToCart={handleAddToCart} storeOffers={storeOffers} />
          </ScrollReveal>

          {/* 4. Clean Science Botanical Ingredients */}
          <ScrollReveal>
            <IngredientsSection />
          </ScrollReveal>

          {/* 5. 12-Week Transition Timeline */}
          <ScrollReveal>
            <HairJourney />
          </ScrollReveal>

          {/* 6. Quantified Clinical & Before/After Proof */}
          <ScrollReveal>
            <BeforeAfterSlider />
          </ScrollReveal>

          {/* 7. Apothecary Customizer & Deep Configurator */}
          <ScrollReveal>
            <ProductDetail onAddToCart={handleAddToCart} storeOffers={storeOffers} />
          </ScrollReveal>

          {/* 8. Verified Customer Reviews & Transformations */}
          <ScrollReveal>
            <TestimonialsSection />
          </ScrollReveal>

          {/* 9. Deals, Bundles & First-Order Offers */}
          <ScrollReveal>
            <OffersZone storeOffers={storeOffers} />
          </ScrollReveal>

          {/* 10. Live Pincode Order Tracker */}
          <ScrollReveal>
            <OrderTracker />
          </ScrollReveal>

          {/* 11. Educational Objections & FAQs */}
          <ScrollReveal>
            <FAQAccordion />
          </ScrollReveal>

          {/* 12. Social Community & UGC Collage */}
          <ScrollReveal>
            <SocialCollage />
          </ScrollReveal>
        </main>
      )}

      {/* Floating WhatsApp Consultation Button (temporarily disabled) */}
      {/* <WhatsAppFloatingButton /> */}

      <Footer 
        onOpenPolicy={handleOpenPolicy} 
        onSecretClick={handleSecretClick} 
        currentPath={currentPath}
        onNavigate={navigateTo}
      />

      {/* Modals & Drawers */}
      {/* Cart Side Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckoutOpen}
        userEmail={userEmail}
        setUserEmail={setUserEmail}
        isFirstTime={isFirstTime}
        setIsFirstTime={setIsFirstTime}
      />

      {/* Checkout Modal Wizard */}
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        orderSummary={checkoutSummary}
        cart={cart}
        onClearCart={handleClearCart}
        prefilledEmail={userEmail}
        setIsFirstTime={setIsFirstTime}
      />


      {/* Customer Subscription Portal */}
      <SubscriptionPortal 
        isOpen={isPortalOpen}
        onClose={() => setIsPortalOpen(false)}
      />

      {/* Floating Sticky Quick Buy Bar (Only on Homepage) */}
      {!isCollectionsPage && !isAdminPage && (
        <QuickBuyBar onAddToCart={handleAddToCart} />
      )}

      {/* Policy & Info Page Modals */}
      <PolicyModal 
        isOpen={policyModal.isOpen} 
        onClose={handleClosePolicy} 
        title={
          policyModal.type === 'about' ? 'About Keshira' :
          policyModal.type === 'contact' ? 'Contact Us' :
          policyModal.type === 'privacy' ? 'Privacy Policy' :
          policyModal.type === 'terms' ? 'Terms & Conditions' :
          policyModal.type === 'refund' ? 'Refund & Return Policy' : 'Information'
        }
      >
        {policyModal.type === 'about' && <AboutUs />}
        {policyModal.type === 'contact' && <ContactUs />}
        {policyModal.type === 'privacy' && <PrivacyPolicy />}
        {policyModal.type === 'terms' && <TermsAndConditions />}
        {policyModal.type === 'refund' && <RefundPolicy />}
      </PolicyModal>

      {/* Promotional Advertisement Popup */}
      <PromoPopup 
        isOpen={isPromoOpen}
        onClose={handleClosePromo}
        onClaimOffer={handleClaimPromoOffer}
      />
    </>
  );
}
