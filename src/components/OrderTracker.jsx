import React, { useState } from 'react';

const TRACKING_STEPS = [
  { name: 'Order Received', desc: 'Order logged and added to the hand-pouring queue.' },
  { name: 'Hand-Pouring in Batch', desc: 'Apothecary blending fresh Neem, Amla, and Shikakai in micro batches.' },
  { name: 'Curing & Quality Check', desc: 'Curing the natural formula and verifying purity and bottle seals.' },
  { name: 'Dispatched', desc: 'Handed over to courier partner. Tracking details SMS sent.' },
  { name: 'Delivered', desc: 'At your doorstep. Open and remember to shake well before use!' }
];

export default function OrderTracker() {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [activeOrder, setActiveOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTrack = (e) => {
    e.preventDefault();
    const formattedInput = orderIdInput.trim().toUpperCase();

    // Regex check for KES-XXXXXX
    const regex = /^KES-\d{6}$/;
    if (regex.test(formattedInput)) {
      setErrorMsg('');
      
      // Look up in localStorage first
      const savedOrders = localStorage.getItem('keshira_orders');
      const orderList = savedOrders ? JSON.parse(savedOrders) : [];
      const foundOrder = orderList.find(order => order.id === formattedInput);

      let stepProgress = 1;
      let orderDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      if (foundOrder) {
        orderDate = foundOrder.date;
        const statusMap = {
          'Order Received': 1,
          'Hand-Pouring in Batch': 2,
          'Curing & Quality Check': 3,
          'Dispatched': 4,
          'Delivered': 5
        };
        stepProgress = statusMap[foundOrder.status] || 1;
      } else {
        // Calculate dynamic step based on digits as fallback for testing
        const digits = formattedInput.split('-')[1];
        const lastDigit = parseInt(digits.slice(-1));
        
        if (lastDigit < 2) {
          stepProgress = 1; // Received
        } else if (lastDigit < 4) {
          stepProgress = 2; // Pouring
        } else if (lastDigit < 6) {
          stepProgress = 3; // Curing
        } else if (lastDigit < 8) {
          stepProgress = 4; // Dispatched
        } else {
          stepProgress = 5; // Delivered
        }
      }

      setActiveOrder({
        id: formattedInput,
        currentStep: stepProgress,
        date: orderDate
      });
    } else {
      setErrorMsg('Please enter a valid mock Order ID in the format KES-XXXXXX (e.g., KES-637281).');
      setActiveOrder(null);
    }
  };

  return (
    <section id="order-tracker" className="section-padding" style={{ backgroundColor: 'var(--color-bg-parchment)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="section-header">
          <span className="badge">Order Tracking</span>
          <h2>Track Your Hand-Poured Batch</h2>
          <p className="section-subtitle">Real-time status of your Ayurvedic formula</p>
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
            <button type="submit" className="btn-primary" style={{ height: '44px', padding: '0 24px' }}>
              Track Order
            </button>
          </form>

          {errorMsg && (
            <p style={{ color: '#c0392b', fontSize: '0.85rem', marginBottom: '20px' }}>{errorMsg}</p>
          )}

          {!activeOrder && !errorMsg && (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              Tip: Complete a mock checkout purchase to receive an Order ID, or enter <strong>KES-637281</strong> to test.
            </p>
          )}

          {activeOrder && (
            <div style={{ animation: 'fadeIn 0.5s ease-out', marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: '24px' }}>
                <span style={{ fontWeight: 600 }}>Order ID: <span style={{ color: 'var(--color-primary)' }}>{activeOrder.id}</span></span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Status As Of: {activeOrder.date}</span>
              </div>

              {/* Status Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', paddingLeft: '32px' }}>
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

            </div>
          )}
        </div>
      </div>
    </section>
  );
}
