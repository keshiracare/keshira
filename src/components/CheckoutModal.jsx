import React, { useState } from 'react';
import { db, normalizeEmail } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function CheckoutModal({ isOpen, onClose, orderSummary, cart, onClearCart, prefilledEmail, setIsFirstTime }) {
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Processing, 4: Success
  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    email: prefilledEmail || '',
    phone: '',
    address: '',
    city: '',
    pinCode: ''
  });

  // Sync prefilled email from shopping cart
  React.useEffect(() => {
    if (isOpen && prefilledEmail) {
      setShippingForm(prev => ({ ...prev, email: prefilledEmail }));
    }
  }, [isOpen, prefilledEmail]);
  const [paymentForm, setPaymentForm] = useState({
    utr: '',
    screenshot: ''
  });
  const [orderId, setOrderId] = useState('');
  const [copied, setCopied] = useState(false);

  const KESHIRA_UPI_ID = 'kapatel190-2@okaxis'; // User's custom UPI ID

  if (!isOpen) return null;

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (Object.values(shippingForm).some(x => x === '')) {
      alert('Please fill in all shipping fields.');
      return;
    }
    // Generate Order ID here so it can be encoded in the UPI QR code
    if (!orderId) {
      const randomId = 'KES-' + Math.floor(100000 + Math.random() * 900000);
      setOrderId(randomId);
    }
    setStep(2);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!paymentForm.utr || paymentForm.utr.trim().length !== 12) {
      alert('Please enter a valid 12-digit UPI Ref No. (UTR) number.');
      return;
    }
    setStep(3); // Go to processing spinner

    // Simulate order registry and payment verification
    setTimeout(async () => {
      // Create new order record
      const now = new Date();
      const newOrder = {
        id: orderId,
        date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: now.getTime(),
        shippingAddress: shippingForm,
        normalizedEmail: normalizeEmail(shippingForm.email),
        items: cart,
        total: orderSummary.total,
        utr: paymentForm.utr,
        screenshot: paymentForm.screenshot || '',
        status: 'Received',
        adminNotes: ''
      };

      // Save to Cloud Firestore
      try {
        const orderRef = doc(db, 'orders', orderId);
        await setDoc(orderRef, newOrder);
        console.log('Order saved to Firestore successfully.');
      } catch (err) {
        console.error('Error saving order to Firestore:', err);
      }

      // Save to localStorage (Local cache backup)
      const savedOrders = localStorage.getItem('keshira_orders');
      const orderList = savedOrders ? JSON.parse(savedOrders) : [];
      orderList.unshift(newOrder);
      localStorage.setItem('keshira_orders', JSON.stringify(orderList));

      // Trigger automated email notification (Free via EmailJS API)
      sendOrderEmail(newOrder);
      sendAdminNotifications(newOrder);

      onClearCart(); // successful purchase clears cart
      setIsFirstTime(false); // No longer a first-time user
      setStep(4); // Success step
    }, 2000);
  };

  const sendOrderEmail = (order) => {
    // These values can be populated directly or loaded via Vite environment variables
    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_ez47q6c';
    const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_felpos2';
    const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'dUvyAAVmDEHvYT4Nb';

    // If template keys aren't configured, skip request
    if (PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY') {
      console.log('EmailJS Public Key is not configured yet. Set VITE_EMAILJS_PUBLIC_KEY environment variable.');
      return;
    }

    // 1. Generate items HTML list matching the customized email layout
    const itemsHtml = order.items
      ? order.items.map(item => {
          const cleanImgPath = item.image.startsWith('/') ? item.image.slice(1) : item.image;
          const itemImgUrl = item.image.startsWith('http') 
            ? item.image 
            : `https://keshira.vercel.app/${cleanImgPath}`;
          return `
            <table style="width: 100%; border-collapse: collapse; border-bottom: 1px solid #eee; margin-bottom: 12px;">
              <tr style="vertical-align: top">
                <td style="padding: 16px 8px 16px 4px; display: inline-block; width: max-content">
                  <img style="height: 64px; width: 64px; object-fit: cover; border-radius: 8px; border: 1px solid #eee;" height="64px" src="${itemImgUrl}" alt="${item.title}" />
                </td>
                <td style="padding: 16px 8px; width: 100%">
                  <div style="font-size: 15px; font-weight: bold; color: #132E1B; font-family: system-ui, -apple-system, sans-serif;">${item.title}</div>
                  <div style="font-size: 13px; color: #666; padding-top: 4px; font-family: system-ui, -apple-system, sans-serif;">
                    Size: ${item.variant} | QTY: ${item.quantity} ${item.purchaseType === 'subscribe' ? '🔄 (Auto-Delivery)' : ''}
                  </div>
                </td>
                <td style="padding: 16px 4px 0 0; white-space: nowrap; text-align: right; width: 100px;">
                  <strong style="font-size: 15px; color: #132E1B; font-family: system-ui, -apple-system, sans-serif;">₹${item.price * item.quantity}</strong>
                </td>
              </tr>
            </table>
          `;
        }).join('')
      : '';

    // 2. Pricing calculations
    const subtotalVal = order.items ? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0;
    const discountAmount = orderSummary.discount || 0;
    const shippingVal = orderSummary.shipping || 0;

    const discountRowHtml = discountAmount > 0 
      ? `<tr>
          <td style="width: 50%"></td>
          <td style="padding: 6px 0; color: #27ae60;">Discount Applied</td>
          <td style="padding: 6px 0 6px 12px; white-space: nowrap; color: #27ae60;">-₹${discountAmount}</td>
         </tr>`
      : '';

    const shippingCostText = shippingVal === 0 ? 'FREE' : `₹${shippingVal}`;
    const shippingColorHex = shippingVal === 0 ? '#27ae60' : '#444';

    const templateParams = {
      customer_name: order.shippingAddress.fullName,
      customer_email: order.shippingAddress.email,
      customer_phone: order.shippingAddress.phone,
      delivery_address: `${order.shippingAddress.address}, ${order.shippingAddress.city} - ${order.shippingAddress.pinCode}`,
      order_id: order.id,
      utr_ref: order.utr,
      items_html: itemsHtml,
      subtotal: subtotalVal,
      discount_row: discountRowHtml,
      shipping_cost: shippingCostText,
      shipping_color: shippingColorHex,
      order_total: order.total
    };

    fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        template_params: templateParams
      })
    })
    .then(async (res) => {
      if (res.ok) {
        console.log('Order notification email sent successfully!');
      } else {
        const errorText = await res.text();
        console.error('EmailJS returned an error status:', res.status, errorText);
      }
    })
    .catch((err) => {
      console.error('Error calling EmailJS API:', err);
    });
  };

  const sendAdminNotifications = (order) => {
    // 1. EmailJS Admin Notification
    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_ez47q6c';
    const ADMIN_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID;
    const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'dUvyAAVmDEHvYT4Nb';

    // Rich items HTML table
    const itemsHtml = order.items
      ? order.items.map(item => {
          const cleanImgPath = item.image.startsWith('/') ? item.image.slice(1) : item.image;
          const itemImgUrl = item.image.startsWith('http') 
            ? item.image 
            : `https://keshira.vercel.app/${cleanImgPath}`;
          return `
            <table style="width: 100%; border-collapse: collapse; border-bottom: 1px solid #eee; margin-bottom: 12px;">
              <tr style="vertical-align: top">
                <td style="padding: 16px 8px 16px 4px; display: inline-block; width: max-content">
                  <img style="height: 64px; width: 64px; object-fit: cover; border-radius: 8px; border: 1px solid #eee;" height="64px" src="${itemImgUrl}" alt="${item.title}" />
                </td>
                <td style="padding: 16px 8px; width: 100%">
                  <div style="font-size: 15px; font-weight: bold; color: #132E1B; font-family: system-ui, -apple-system, sans-serif;">${item.title}</div>
                  <div style="font-size: 13px; color: #666; padding-top: 4px; font-family: system-ui, -apple-system, sans-serif;">
                    Size: ${item.variant} | QTY: ${item.quantity} ${item.purchaseType === 'subscribe' ? '🔄 (Auto-Delivery)' : ''}
                  </div>
                </td>
                <td style="padding: 16px 4px 0 0; white-space: nowrap; text-align: right; width: 100px;">
                  <strong style="font-size: 15px; color: #132E1B; font-family: system-ui, -apple-system, sans-serif;">₹${item.price * item.quantity}</strong>
                </td>
              </tr>
            </table>
          `;
        }).join('')
      : '';

    const subtotalVal = order.items ? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0;
    const discountAmount = orderSummary.discount || 0;
    const shippingVal = orderSummary.shipping || 0;

    const discountRowHtml = discountAmount > 0 
      ? `<tr>
          <td style="width: 50%"></td>
          <td style="padding: 6px 0; color: #27ae60;">Discount Applied</td>
          <td style="padding: 6px 0 6px 12px; white-space: nowrap; color: #27ae60;">-₹${discountAmount}</td>
         </tr>`
      : '';

    const shippingCostText = shippingVal === 0 ? 'FREE' : `₹${shippingVal}`;
    const shippingColorHex = shippingVal === 0 ? '#27ae60' : '#444';

    const itemsTextList = order.items
      ? order.items.map(item => `- ${item.title} (${item.variant}) x ${item.quantity} [${item.purchaseType === 'subscribe' ? '🔄 Subscription' : 'One-Time'}] - ₹${item.price * item.quantity}`).join('\n')
      : '';

    // If an Admin Template ID is configured, send the notification email
    if (ADMIN_TEMPLATE_ID && PUBLIC_KEY && PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY' && ADMIN_TEMPLATE_ID !== 'your_emailjs_admin_template_id') {
      const adminTemplateParams = {
        order_id: order.id,
        customer_name: order.shippingAddress.fullName,
        customer_email: order.shippingAddress.email,
        customer_phone: order.shippingAddress.phone,
        delivery_address: `${order.shippingAddress.address}, ${order.shippingAddress.city} - ${order.shippingAddress.pinCode}`,
        utr_ref: order.utr,
        subtotal: subtotalVal,
        discount_row: discountRowHtml,
        shipping_cost: shippingCostText,
        shipping_color: shippingColorHex,
        order_total: order.total,
        items_html: itemsHtml
      };

      fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_id: SERVICE_ID,
          template_id: ADMIN_TEMPLATE_ID,
          user_id: PUBLIC_KEY,
          template_params: adminTemplateParams
        })
      })
      .then(async (res) => {
        if (res.ok) {
          console.log('Admin notification email sent successfully!');
        } else {
          const errorText = await res.text();
          console.error('EmailJS Admin Template error:', res.status, errorText);
        }
      })
      .catch((err) => {
        console.error('Error sending Admin EmailJS notification:', err);
      });
    }

    // 2. Discord Webhook Notification
    const DISCORD_WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
    if (DISCORD_WEBHOOK_URL && DISCORD_WEBHOOK_URL !== 'your_discord_webhook_url') {
      const discordPayload = {
        username: "Keshira Apothecary Bot",
        avatar_url: "https://keshira.vercel.app/logo.png",
        embeds: [{
          title: `🟢 New Order Received: ${order.id}`,
          color: 1257003, // Hex #132E1B (Keshira brand dark green)
          fields: [
            { name: "Customer Name", value: order.shippingAddress.fullName, inline: true },
            { name: "Phone", value: order.shippingAddress.phone, inline: true },
            { name: "Email", value: order.shippingAddress.email, inline: true },
            { name: "Delivery Address", value: `${order.shippingAddress.address}, ${order.shippingAddress.city} - ${order.shippingAddress.pinCode}` },
            { name: "Payment UTR (UPI Ref No.)", value: `\`${order.utr}\``, inline: true },
            { name: "Total Amount", value: `**₹${order.total}**`, inline: true },
            { name: "Items Ordered", value: itemsTextList || "No items details" }
          ],
          timestamp: new Date().toISOString()
        }]
      };

      fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(discordPayload)
      })
      .then((res) => {
        if (res.ok) console.log('Discord webhook alert sent successfully!');
        else console.error('Discord webhook failed with status:', res.status);
      })
      .catch((err) => {
        console.error('Error sending Discord alert:', err);
      });
    }

    // 3. Telegram Bot Notification
    const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID && 
        TELEGRAM_BOT_TOKEN !== 'your_telegram_bot_token' && 
        TELEGRAM_CHAT_ID !== 'your_telegram_chat_id') {
      
      const telegramMessage = `
<b>🟢 New Order Received: ${order.id}</b>
---------------------------------------
<b>Customer:</b> ${order.shippingAddress.fullName}
<b>Phone:</b> ${order.shippingAddress.phone}
<b>Email:</b> ${order.shippingAddress.email}
<b>Address:</b> ${order.shippingAddress.address}, ${order.shippingAddress.city} - ${order.shippingAddress.pinCode}

<b>Items:</b>
${order.items ? order.items.map(item => `• ${item.title} (${item.variant}) x ${item.quantity} [${item.purchaseType === 'subscribe' ? '🔄 Subscription' : 'One-Time'}] - ₹${item.price * item.quantity}`).join('\n') : ''}

<b>Payment UTR:</b> <code>${order.utr}</code>
<b>Total Amount:</b> <b>₹${order.total}</b>
`.trim();

      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: telegramMessage,
          parse_mode: 'HTML'
        })
      })
      .then((res) => {
        if (res.ok) console.log('Telegram bot alert sent successfully!');
        else console.error('Telegram bot failed with status:', res.status);
      })
      .catch((err) => {
        console.error('Error sending Telegram alert:', err);
      });
    }
  };

  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Export as compressed JPEG (60% quality, very small size but clear)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        callback(compressedBase64);
      };
    };
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      compressImage(file, (compressedBase64) => {
        setPaymentForm(prev => ({ ...prev, screenshot: compressedBase64 }));
      });
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(KESHIRA_UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShippingChange = (e) => {
    setShippingForm({ ...shippingForm, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value });
  };

  const getEstimatedDeliveryDate = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() + 3);
    const end = new Date(today);
    end.setDate(today.getDate() + 5);

    const options = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  // Check if order contains a subscription
  const hasSubscription = cart && cart.some(item => item.purchaseType === 'subscribe');
  const subscriptionItem = cart && cart.find(item => item.purchaseType === 'subscribe');

  return (
    <div className="modal-overlay" onClick={step < 3 ? onClose : undefined}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {step < 3 && (
          <button className="modal-close" onClick={onClose} aria-label="Close checkout">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        <div className="checkout-wizard">
          {step < 3 && (
            <div className="checkout-steps">
              <div className={`step-node ${step >= 1 ? (step > 1 ? 'completed' : 'active') : ''}`}>
                <div className="step-number">1</div>
                <span>Shipping</span>
              </div>
              <div className={`step-node ${step >= 2 ? (step > 2 ? 'completed' : 'active') : ''}`}>
                <div className="step-number">2</div>
                <span>Payment</span>
              </div>
              <div className={`step-node`}>
                <div className="step-number">3</div>
                <span>Confirmation</span>
              </div>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleShippingSubmit}>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '20px' }}>Shipping Information</h3>
              
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  name="fullName" 
                  className="form-input" 
                  placeholder="e.g. Aarav Sharma"
                  value={shippingForm.fullName}
                  onChange={handleShippingChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    className="form-input" 
                    placeholder="e.g. aarav@gmail.com"
                    value={shippingForm.email}
                    onChange={handleShippingChange}
                    required
                    readOnly
                    style={{ backgroundColor: 'rgba(250, 245, 235, 0.05)', cursor: 'not-allowed', opacity: 0.85 }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#27ae60', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>✓ Verified in Shopping Bag</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    className="form-input" 
                    placeholder="e.g. 9876543210"
                    value={shippingForm.phone}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Address</label>
                <input 
                  type="text" 
                  name="address" 
                  className="form-input" 
                  placeholder="Street Address, Apartment, Suite"
                  value={shippingForm.address}
                  onChange={handleShippingChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input 
                    type="text" 
                    name="city" 
                    className="form-input" 
                    placeholder="e.g. Mumbai"
                    value={shippingForm.city}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Postal Code (PIN)</label>
                  <input 
                    type="text" 
                    name="pinCode" 
                    className="form-input" 
                    placeholder="e.g. 400001"
                    value={shippingForm.pinCode}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
              </div>

              <div className="checkout-actions">
                <button type="button" className="btn-back" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Continue to Payment
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handlePaymentSubmit}>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '16px', textAlign: 'center' }}>UPI Payment (GPay/PhonePe/Paytm)</h3>
              
              <div style={{ 
                backgroundColor: 'rgba(19, 46, 27, 0.03)', 
                border: '1px solid var(--color-border)', 
                borderRadius: '12px', 
                padding: '20px', 
                marginBottom: '20px', 
                textAlign: 'center' 
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Amount to Pay
                </span>
                <h4 style={{ fontSize: '2.2rem', color: 'var(--color-primary)', margin: '6px 0 12px 0', fontWeight: 'bold' }}>
                  ₹{orderSummary.total}
                </h4>
                
                {/* Dynamic UPI QR Code */}
                <div style={{ 
                  backgroundColor: '#FFFFFF', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  display: 'inline-block', 
                  boxShadow: 'var(--shadow-sm)',
                  border: '2px solid var(--color-accent-gold)',
                  marginBottom: '16px'
                }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      `upi://pay?pa=${KESHIRA_UPI_ID}&pn=Keshira&am=${orderSummary.total}&cu=INR&tn=Keshira_Order_${orderId}`
                    )}`} 
                    alt="Scan to Pay via UPI" 
                    style={{ display: 'block', width: '180px', height: '180px' }}
                  />
                </div>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0 0 12px 0' }}>
                  Scan QR with GPay, PhonePe, Paytm, or BHIM
                </p>
                
                {/* UPI ID copy option */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', padding: '6px 12px', borderRadius: '50px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-dark)' }}>{KESHIRA_UPI_ID}</span>
                  <button 
                    type="button" 
                    onClick={handleCopyUpi} 
                    style={{ 
                      color: 'var(--color-accent-gold-dark)', 
                      fontSize: '0.8rem', 
                      fontWeight: 'bold', 
                      borderLeft: '1px solid var(--color-border)', 
                      paddingLeft: '8px' 
                    }}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* UTR Input */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>UPI Ref No. / Transaction ID (UTR)</label>
                <input 
                  type="text" 
                  name="utr" 
                  className="form-input" 
                  placeholder="Enter 12-digit UTR No. (e.g. 312345678901)"
                  maxLength="12"
                  pattern="\d{12}"
                  value={paymentForm.utr}
                  onChange={handlePaymentChange}
                  style={{ textAlign: 'center', fontSize: '1.1rem', letterSpacing: '0.1em' }}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '6px', textAlign: 'center' }}>
                  💡 Make the payment on your UPI app, then copy & paste the 12-digit UTR/Ref No. here.
                </span>
              </div>

              {/* Screenshot Upload Input */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Attach Payment Screenshot (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  style={{ 
                    display: 'block', 
                    width: '100%', 
                    padding: '8px 12px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--color-border)', 
                    backgroundColor: '#FFFFFF',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit'
                  }} 
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '6px', textAlign: 'center' }}>
                  📸 Upload your transaction receipt for faster verification. (Max 1.5MB)
                </span>
                {paymentForm.screenshot && (
                  <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#27ae60', fontWeight: 'bold' }}>✓ Screenshot attached successfully!</span>
                  </div>
                )}
              </div>

              <div className="checkout-actions">
                <button type="button" className="btn-back" onClick={() => setStep(1)}>
                  Back
                </button>
                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  Submit Order
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="processing-overlay">
              <div className="spinner"></div>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '8px' }}>
                Submitting Order Details
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                Registering your UPI UTR ref for apothecary verification... Please wait.
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="success-screen">
              <div className="success-icon-wrapper">
                <svg className="success-icon" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="success-title">Order Confirmed!</h2>
              <p className="success-msg">
                Thank you for your purchase, {shippingForm.fullName}. We have received your order and are preparing your hand-poured batch!
              </p>

              <div className="order-receipt-card">
                <h4>Order Summary</h4>
                <div className="receipt-row">
                  <span>Order Reference</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{orderId}</span>
                </div>
                {paymentForm.utr && (
                  <div className="receipt-row">
                    <span>Payment Ref (UTR)</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{paymentForm.utr}</span>
                  </div>
                )}
                <div className="receipt-row">
                  <span>Subtotal</span>
                  <span>₹{orderSummary.subtotal}</span>
                </div>
                {orderSummary.discount > 0 && (
                  <div className="receipt-row" style={{ color: '#27ae60' }}>
                    <span>Discount Applied</span>
                    <span>-₹{orderSummary.discount}</span>
                  </div>
                )}
                <div className="receipt-row">
                  <span>Shipping</span>
                  <span>{orderSummary.shipping === 0 ? 'FREE' : `₹${orderSummary.shipping}`}</span>
                </div>
                <div className="receipt-row total">
                  <span>Total Amount Paid</span>
                  <span>₹{orderSummary.total}</span>
                </div>
                <div className="receipt-row" style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '12px', marginTop: '12px' }}>
                  <span>Estimated Delivery</span>
                  <span style={{ fontWeight: 600 }}>{getEstimatedDeliveryDate()}</span>
                </div>

                {hasSubscription && subscriptionItem && (
                  <div style={{ marginTop: '16px', padding: '12px', borderRadius: '6px', backgroundColor: 'rgba(39, 174, 96, 0.08)', border: '1px solid rgba(39, 174, 96, 0.2)', fontSize: '0.8rem', color: '#1e7e34', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontWeight: 'bold' }}>🔄 Active Auto-Delivery Subscription:</span>
                    <span>We will prepare and ship a fresh micro-batch of your {subscriptionItem.variant} shampoo **every {subscriptionItem.frequency}**. You will receive an SMS reminder before each dispatch. Cancel anytime!</span>
                  </div>
                )}
              </div>

              <button className="btn-primary" onClick={onClose}>
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
