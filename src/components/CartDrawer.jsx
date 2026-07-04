import React, { useState } from 'react';

export default function CartDrawer({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, onCheckout }) {
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // in percentage
  const [promoMessage, setPromoMessage] = useState({ text: '', type: '' });

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'KESHIRA10') {
      setAppliedDiscount(10);
      setPromoMessage({ text: 'Promo code KESHIRA10 applied! 10% discount added.', type: 'success' });
    } else if (promoCode.trim() === '') {
      setPromoMessage({ text: '', type: '' });
    } else {
      setPromoMessage({ text: 'Invalid promo code. Try KESHIRA10.', type: 'error' });
    }
  };

  const subtotal = calculateSubtotal();
  const shippingThreshold = 300; // Free shipping threshold in Rs
  const shippingCost = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 40;
  const discountAmount = Math.round((subtotal * appliedDiscount) / 100);
  const total = subtotal - discountAmount + shippingCost;
  const progressToFreeShipping = Math.min((subtotal / shippingThreshold) * 100, 100);

  return (
    <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()} style={{ borderLeft: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-parchment-light)' }}>
        <div className="cart-header" style={{ padding: '28px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-primary)', fontWeight: 500, margin: 0 }}>Shopping Bag</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close cart" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="cart-body" style={{ padding: '24px' }}>
          {subtotal > 0 && (
            <div className="shipping-promo-bar" style={{ backgroundColor: 'rgba(200, 162, 97, 0.05)', border: '1px solid rgba(200, 162, 97, 0.25)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
              {subtotal >= shippingThreshold ? (
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-primary)' }}>🎉 You qualify for <strong>FREE shipping</strong>!</span>
              ) : (
                <span style={{ fontSize: '0.82rem', color: 'var(--color-primary)' }}>
                  Add <strong>₹{shippingThreshold - subtotal}</strong> more for <strong>FREE shipping</strong>!
                </span>
              )}
              <div className="shipping-progress-bg" style={{ backgroundColor: 'rgba(19, 46, 27, 0.08)', height: '3px', marginTop: '10px' }}>
                <div className="shipping-progress-fill" style={{ backgroundColor: 'var(--color-accent-gold)', width: `${progressToFreeShipping}%`, height: '100%' }}></div>
              </div>
            </div>
          )}

          {cart.length === 0 ? (
            <div className="empty-cart-message" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', textAlign: 'center' }}>
              <svg width="48" height="48" fill="none" stroke="var(--color-accent-gold)" strokeWidth="1.2" viewBox="0 0 24 24" style={{ marginBottom: '20px', opacity: 0.85 }}>
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: '20px' }}>Your shopping bag is empty</p>
              <button className="btn-primary" onClick={onClose} style={{ padding: '12px 28px' }}>Continue Shopping</button>
            </div>
          ) : (
            <div className="cart-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {cart.map((item) => (
                <div key={item.id} className="cart-item" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <img src={item.image} alt={item.title} className="cart-item-img" style={{ width: '70px', height: '84px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#fff' }} />
                  <div className="cart-item-info" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-primary)', margin: 0, fontWeight: 600 }}>{item.title}</h4>
                    <p className="cart-item-variant" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                      Size: {item.variant} 
                      {item.purchaseType === 'subscribe' && (
                        <span style={{ display: 'block', color: '#27ae60', fontSize: '0.72rem', fontWeight: 'bold', marginTop: '2px' }}>
                          🔄 Auto-Delivery • Every {item.frequency}
                        </span>
                      )}
                    </p>
                    <div className="quantity-selector" style={{ width: '90px', height: '30px', border: '1px solid var(--color-border)', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', marginTop: '6px' }}>
                      <button 
                        type="button"
                        className="quantity-btn" 
                        style={{ width: '28px', height: '100%', fontSize: '0.85rem', color: 'var(--color-primary)' }} 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                      >
                        -
                      </button>
                      <div className="quantity-value" style={{ width: '34px', fontSize: '0.82rem', fontWeight: 600, textAlign: 'center', color: 'var(--color-primary)' }}>{item.quantity}</div>
                      <button 
                        type="button"
                        className="quantity-btn" 
                        style={{ width: '28px', height: '100%', fontSize: '0.85rem', color: 'var(--color-primary)' }} 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', height: '80px' }}>
                    <div className="cart-item-price" style={{ fontWeight: '700', color: 'var(--color-primary)', fontSize: '0.95rem' }}>₹{item.price * item.quantity}</div>
                    <button className="cart-item-remove-btn" onClick={() => onRemoveItem(item.id)} aria-label="Remove item" style={{ color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px' }}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer" style={{ borderTop: '1px solid var(--color-border)', padding: '24px', backgroundColor: 'var(--color-bg-parchment)' }}>
            <div className="promo-code-row" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input 
                type="text" 
                className="promo-input" 
                placeholder="Promo Code (e.g. KESHIRA10)" 
                value={promoCode} 
                onChange={(e) => setPromoCode(e.target.value)}
                style={{ flexGrow: 1, height: '38px', borderRadius: '6px', border: '1px solid var(--color-border)', padding: '0 12px', fontSize: '0.82rem', fontFamily: 'inherit', backgroundColor: 'var(--color-bg-parchment-light)' }}
              />
              <button className="promo-btn" onClick={handleApplyPromo} style={{ height: '38px', padding: '0 16px', borderRadius: '6px', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)', fontSize: '0.8rem', fontWeight: 600 }}>Apply</button>
            </div>
            {promoMessage.text && (
              <p className={`promo-message ${promoMessage.type}`} style={{ fontSize: '0.78rem', color: promoMessage.type === 'success' ? '#27ae60' : '#c0392b', margin: '0 0 16px 0', fontWeight: 500 }}>
                {promoMessage.text}
              </p>
            )}

            <div className="cart-summary" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#27ae60', fontWeight: 600 }}>
                  <span>Discount (10% Off)</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
              </div>
              <div className="summary-row total" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', color: 'var(--color-primary)', fontWeight: '700', borderTop: '1px solid var(--color-border)', paddingTop: '12px', marginTop: '4px' }}>
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <button 
              className="checkout-btn" 
              onClick={() => onCheckout({ subtotal, discount: discountAmount, shipping: shippingCost, total })}
              style={{ width: '100%', height: '48px', borderRadius: '8px', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)', fontWeight: 600, fontSize: '0.95rem', letterSpacing: '0.05em', boxShadow: 'var(--shadow-md)' }}
            >
              Checkout Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
