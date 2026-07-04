import React, { useState } from 'react';
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
import AdminPanel from './components/AdminPanel';
import SubscriptionPortal from './components/SubscriptionPortal';
import ScrollReveal from './components/ScrollReveal';
import QuickBuyBar from './components/QuickBuyBar';
import BeforeAfterSlider from './components/BeforeAfterSlider';

export default function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [checkoutSummary, setCheckoutSummary] = useState({
    subtotal: 0,
    discount: 0,
    shipping: 0,
    total: 0
  });

  const handleAddToCart = (newItem) => {
    setCart((prevCart) => {
      const existingItemIdx = prevCart.findIndex((item) => item.id === newItem.id);
      if (existingItemIdx > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIdx].quantity += newItem.quantity;
        return updatedCart;
      }
      return [...prevCart, newItem];
    });
    // Open cart drawer immediately for visual feedback
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id, delta) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === id) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const handleRemoveItem = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
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

  return (
    <>
      {/* Background Floating Leaves Animation */}
      <div className="leaf-container">
        <div className="floating-leaf leaf-1"></div>
        <div className="floating-leaf leaf-2"></div>
        <div className="floating-leaf leaf-3"></div>
        <div className="floating-leaf leaf-4"></div>
      </div>

      {/* Top Promo Announcement Banner */}
      <div 
        style={{ 
          backgroundColor: 'var(--color-primary)', 
          color: 'var(--color-text-light)', 
          textAlign: 'center', 
          padding: '8px 16px', 
          fontSize: '0.8rem', 
          fontWeight: 'bold', 
          letterSpacing: '0.05em',
          position: 'relative',
          zIndex: 101
        }}
      >
        🌿 FIRST-TIME CARE: USE CODE <span style={{ color: 'var(--color-accent-gold)' }}>KESHIRA10</span> FOR 10% OFF + FREE SHIPPING ON YOUR FIRST BOTTLE!
      </div>

      <Header 
        cartCount={totalCartCount} 
        onCartOpen={() => setIsCartOpen(true)} 
        onPortalOpen={() => setIsPortalOpen(true)}
      />
      
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Hero />
        
        <ScrollReveal>
          <HairQuiz onAddToCart={handleAddToCart} />
        </ScrollReveal>
        
        <ScrollReveal>
          <ProductCatalog />
        </ScrollReveal>

        <ScrollReveal>
          <ProductDetail onAddToCart={handleAddToCart} />
        </ScrollReveal>

        <ScrollReveal>
          <IngredientsSection />
        </ScrollReveal>

        <ScrollReveal>
          <HairJourney />
        </ScrollReveal>

        <ScrollReveal>
          <BeforeAfterSlider />
        </ScrollReveal>

        <ScrollReveal>
          <OrderTracker />
        </ScrollReveal>

        <ScrollReveal>
          <OffersZone />
        </ScrollReveal>

        <ScrollReveal>
          <FAQAccordion />
        </ScrollReveal>

        <ScrollReveal>
          <SocialCollage />
        </ScrollReveal>
      </main>

      <footer className="footer" style={{ position: 'relative', zIndex: 2 }}>
        <div className="container footer-grid">
          <div className="footer-brand">
            <h2>KESHIRA</h2>
            <p>
              Premium homemade Ayurvedic haircare formulations. Hand-poured in micro batches 
              with 10 traditional organic Indian herbs.
            </p>
          </div>
          
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#hero">Home</a></li>
              <li><a href="#hair-quiz">Hair Quiz</a></li>
              <li><a href="#catalog">Shop Now</a></li>
              <li><a href="#ingredients">Our Ingredients</a></li>
              <li><a href="#hair-journey">Hair Journey</a></li>
              <li><a href="#order-tracker">Track Order</a></li>
              <li><a href="#faqs">FAQs</a></li>
              <li><a href="https://instagram.com/keshira_haircare" target="_blank" rel="noopener noreferrer">Instagram Profile</a></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>Contact Us</h4>
            <p>Email: contact@keshirahaircare.com</p>
            <p>Instagram: @keshira_haircare</p>
            <p>Batch Location: Ahmedabad, Gujarat, India</p>
          </div>
        </div>
        
        <div className="container footer-bottom">
          <p>&copy; {new Date().getFullYear()} Keshira. All rights reserved.</p>
          <p>
            Ayurvedic Formulation • Homemade in Micro Batches •{' '}
            <span 
              onClick={() => setIsAdminOpen(true)} 
              style={{ cursor: 'pointer', textDecoration: 'underline', opacity: 0.7 }}
            >
              🔒 Admin Access
            </span>
          </p>
        </div>
      </footer>

      {/* Cart Side Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckoutOpen}
      />

      {/* Checkout Modal Wizard */}
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        orderSummary={checkoutSummary}
        cart={cart}
        onClearCart={handleClearCart}
      />

      {/* Admin Panel Wizard */}
      <AdminPanel 
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Customer Subscription Portal */}
      <SubscriptionPortal 
        isOpen={isPortalOpen}
        onClose={() => setIsPortalOpen(false)}
      />

      {/* Floating Sticky Quick Buy Bar */}
      <QuickBuyBar onAddToCart={handleAddToCart} />
    </>
  );
}
