import React, { useState } from 'react';
import { supabase } from '../supabase';

const TRACKING_STEPS = [
  { name: 'Received', desc: 'Order received and added to preparation queue.' },
  { name: 'Packed', desc: 'Bottled fresh, quality checked, and packed securely.' },
  { name: 'Dispatched', desc: 'Handed over to courier partner. Tracking details sent.' },
  { name: 'Delivered', desc: 'At your doorstep. Open and remember to shake well before use!' }
];

export default function OrderTracker() {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [activeOrder, setActiveOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');

  const handleTrack = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const formattedInput = orderIdInput.trim().toUpperCase();

    // Regex check for KES-XXXXXX
    const regex = /^KES-\d{6}$/;
    if (regex.test(formattedInput)) {
      setErrorMsg('');
      setCancelSuccessMsg('');
      setIsSearching(true);

      const statusMap = {
        'Received': 1,
        'Packed': 2,
        'Dispatched': 3,
        'Delivered': 4,
        'Cancelled': 0
      };

      let foundStatus = null;
      let orderDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      let orderCreatedAt = null;
      let rawOrderData = null;

      // 1. Try querying Supabase live
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('status, created_at, order_data')
          .eq('id', formattedInput)
          .maybeSingle();

        if (!error && data) {
          foundStatus = data.status || (data.order_data && data.order_data.status);
          orderCreatedAt = data.created_at || (data.order_data && (data.order_data.timestamp || data.order_data.created_at));
          rawOrderData = data.order_data;
          orderDate = (data.order_data && data.order_data.date) || 
            new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
      } catch (err) {
        console.warn('Could not query Supabase for tracking:', err);
      }

      // 2. Fall back to localStorage if not found on Supabase
      if (!foundStatus) {
        const savedOrders = localStorage.getItem('keshira_orders');
        const orderList = savedOrders ? JSON.parse(savedOrders) : [];
        const foundOrder = orderList.find(order => order.id === formattedInput);
        if (foundOrder) {
          foundStatus = foundOrder.status;
          orderDate = foundOrder.date || orderDate;
          orderCreatedAt = foundOrder.timestamp || foundOrder.created_at;
          rawOrderData = foundOrder;
        }
      }

      let stepProgress = 1;
      if (foundStatus) {
        stepProgress = statusMap[foundStatus] !== undefined ? statusMap[foundStatus] : 1;
      } else {
        // Fallback progress based on digits for test IDs
        const digits = formattedInput.split('-')[1];
        const lastDigit = parseInt(digits.slice(-1));
        if (lastDigit < 3) {
          stepProgress = 1; // Received
        } else if (lastDigit < 6) {
          stepProgress = 2; // Packed
        } else if (lastDigit < 8) {
          stepProgress = 3; // Dispatched
        } else {
          stepProgress = 4; // Delivered
        }
      }

      // Check if cancellation is allowed (within 6 hours of placement and status is Received)
      let canCancel = false;
      const orderTime = orderCreatedAt ? new Date(orderCreatedAt).getTime() : null;
      const now = Date.now();
      const sixHoursMs = 6 * 60 * 60 * 1000;

      if (foundStatus !== 'Cancelled' && (foundStatus === 'Received' || stepProgress === 1)) {
        if (!orderTime || (now - orderTime) <= sixHoursMs) {
          canCancel = true;
        }
      }

      setActiveOrder({
        id: formattedInput,
        status: foundStatus || (stepProgress === 1 ? 'Received' : 'In Progress'),
        currentStep: stepProgress,
        date: orderDate,
        createdAt: orderCreatedAt,
        canCancel,
        rawOrderData
      });
      setIsSearching(false);
    } else {
      setErrorMsg('Please enter a valid mock Order ID in the format KES-XXXXXX (e.g., KES-637281).');
      setActiveOrder(null);
    }
  };

  const handleCancelOrder = async () => {
    if (!activeOrder) return;
    const confirmCancel = window.confirm(`Are you sure you want to cancel order #${activeOrder.id}? This action cannot be reversed.`);
    if (!confirmCancel) return;

    setIsCancelling(true);
    setErrorMsg('');

    try {
      // 1. Update Supabase
      const { error: sbErr } = await supabase
        .from('orders')
        .update({ status: 'Cancelled' })
        .eq('id', activeOrder.id);

      if (sbErr) console.warn('Supabase order status update notice:', sbErr);

      // If order_data column exists, keep it in sync
      if (activeOrder.rawOrderData) {
        const updatedOrderData = {
          ...activeOrder.rawOrderData,
          status: 'Cancelled',
          cancelledAt: new Date().toISOString()
        };
        await supabase
          .from('orders')
          .update({ order_data: updatedOrderData })
          .eq('id', activeOrder.id);
      }
    } catch (err) {
      console.warn('Could not sync cancellation to remote DB:', err);
    }

    // 2. Update localStorage
    try {
      const savedOrders = localStorage.getItem('keshira_orders');
      if (savedOrders) {
        const orderList = JSON.parse(savedOrders);
        const updatedList = orderList.map(ord => {
          if (ord.id === activeOrder.id) {
            return { ...ord, status: 'Cancelled', cancelledAt: new Date().toISOString() };
          }
          return ord;
        });
        localStorage.setItem('keshira_orders', JSON.stringify(updatedList));
      }
    } catch (err) {
      console.error('Error updating local storage order:', err);
    }

    setActiveOrder(prev => ({
      ...prev,
      status: 'Cancelled',
      currentStep: 0,
      canCancel: false
    }));

    setCancelSuccessMsg(`Order #${activeOrder.id} has been cancelled successfully. Any payment made will be refunded within 3–5 business days as per our policy.`);
    setIsCancelling(false);
  };

  return (
    <section id="order-tracker" className="section-padding" style={{ backgroundColor: 'var(--color-bg-parchment)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="section-header text-center" style={{ marginBottom: '36px' }}>
          <span className="section-eyebrow">
            TRANSPARENT FULFILLMENT
          </span>
          <h2 className="section-title">
            Track Your Hand-Poured Batch
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Check the real-time preparation, quality control, and dispatch status of your order.
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--color-bg-parchment-light)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
          <form onSubmit={handleTrack} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Enter Order ID (e.g. KES-637281)"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              style={{ flexGrow: 1 }}
              required
            />
            <button type="submit" className="btn-primary" disabled={isSearching} style={{ height: '44px', padding: '0 24px', opacity: isSearching ? 0.7 : 1 }}>
              {isSearching ? 'Checking...' : 'Track Order'}
            </button>
          </form>

          {cancelSuccessMsg && (
            <div style={{ backgroundColor: '#E8F5E9', border: '1px solid #C8E6C9', color: '#1B5E20', padding: '14px 18px', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '20px', lineHeight: 1.5 }}>
              ✓ {cancelSuccessMsg}
            </div>
          )}

          {errorMsg && (
            <p style={{ color: '#c0392b', fontSize: '0.85rem', marginBottom: '20px' }}>{errorMsg}</p>
          )}

          {!activeOrder && !errorMsg && !cancelSuccessMsg && (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              Enter your Order ID (from your confirmation receipt or SMS/email) to track current batch status.
            </p>
          )}

          {activeOrder && (
            <div style={{ animation: 'fadeIn 0.5s ease-out', marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: '24px' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>Order ID: <span style={{ color: 'var(--color-primary)' }}>{activeOrder.id}</span></span>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Status As Of: {activeOrder.date}
                  </div>
                </div>

                <div>
                  {activeOrder.status === 'Cancelled' ? (
                    <span style={{ backgroundColor: '#FFEBEE', color: '#C62828', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, border: '1px solid #FFCDD2' }}>
                      ✖ Order Cancelled
                    </span>
                  ) : (
                    <span style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, border: '1px solid #C8E6C9' }}>
                      ● {activeOrder.status || 'Active'}
                    </span>
                  )}
                </div>
              </div>

              {activeOrder.status === 'Cancelled' ? (
                <div style={{ backgroundColor: '#FFF5F5', border: '1px solid #FED7D7', borderRadius: '8px', padding: '20px', textAlign: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 8px', color: '#C53030', fontSize: '1.05rem' }}>This order has been cancelled</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#742A2A', lineHeight: 1.5 }}>
                    Your order was cancelled before batch dispatch. If any payment was captured, your refund is being processed to your original payment method.
                  </p>
                </div>
              ) : (
                <>
                  {/* Status Timeline */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', paddingLeft: '32px', marginBottom: '32px' }}>
                    {/* Timeline vertical bar */}
                    <div 
                      style={{ 
                        position: 'absolute', 
                        top: '12px', 
                        left: '11px', 
                        width: '2px', 
                        height: 'calc(100% - 24px)', 
                        backgroundColor: 'var(--color-border)',
                        zIndex: 1 
                      }}
                    >
                      <div 
                        style={{ 
                          width: '100%', 
                          height: `${((activeOrder.currentStep - 1) / (TRACKING_STEPS.length - 1)) * 100}%`, 
                          backgroundColor: 'var(--color-accent-gold)', 
                          transition: 'height 0.5s ease' 
                        }}
                      ></div>
                    </div>

                    {TRACKING_STEPS.map((step, idx) => {
                      const stepNum = idx + 1;
                      const isCompleted = stepNum < activeOrder.currentStep;
                      const isActive = stepNum === activeOrder.currentStep;
                      
                      let dotBg = 'var(--color-bg-parchment-light)';
                      let dotBorder = '2px solid var(--color-border)';
                      let titleColor = 'var(--color-text-muted)';
                      
                      if (isCompleted) {
                        dotBg = 'var(--color-accent-gold)';
                        dotBorder = '2px solid var(--color-accent-gold)';
                        titleColor = 'var(--color-accent-gold-dark)';
                      } else if (isActive) {
                        dotBg = 'var(--color-primary)';
                        dotBorder = '2px solid var(--color-primary)';
                        titleColor = 'var(--color-primary)';
                      }

                      return (
                        <div key={idx} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {/* Timeline dot */}
                          <div 
                            style={{ 
                              position: 'absolute', 
                              left: '-32px', 
                              top: '4px', 
                              width: '24px', 
                              height: '24px', 
                              borderRadius: '50%', 
                              backgroundColor: dotBg, 
                              border: dotBorder, 
                              zIndex: 2, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              transition: 'var(--transition)'
                            }}
                          >
                            {isCompleted && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FAF5EB" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                            {isActive && (
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FAF5EB' }}></div>
                            )}
                          </div>

                          <h4 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: isActive || isCompleted ? 700 : 500, color: titleColor }}>
                            {step.name} {isActive && '(Active Step)'}
                          </h4>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: isActive ? 'var(--color-text-dark)' : 'var(--color-text-muted)' }}>
                            {step.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Customer Order Cancellation Action Area */}
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px', marginTop: '10px' }}>
                    {activeOrder.canCancel ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', backgroundColor: '#FFFDF9', border: '1px solid #EFE4D6', borderRadius: '8px', padding: '14px 18px' }}>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#4A3B2C' }}>
                            Need to cancel this order?
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#7A6B5C', marginTop: '2px' }}>
                            Orders can be cancelled self-serve within 6 hours before dispatch preparation starts.
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleCancelOrder}
                          disabled={isCancelling}
                          style={{
                            padding: '8px 18px',
                            backgroundColor: '#FFFFFF',
                            color: '#C53030',
                            border: '1.5px solid #E53E3E',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            opacity: isCancelling ? 0.6 : 1
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFF5F5'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                        >
                          {isCancelling ? 'Processing...' : 'Cancel Order'}
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                        ℹ️ As per our policy, orders can be cancelled within 6 hours of placement before batch dispatch. For urgent inquiries, please contact <strong>keshira.care@gmail.com</strong>.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
