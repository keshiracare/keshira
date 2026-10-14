import React, { useState, useEffect } from 'react';
import { supabase, normalizeEmail } from '../supabase';
import { useToast } from '../context/ToastContext';

export default function CheckoutModal({ isOpen, onClose, orderSummary, cart, onClearCart, prefilledEmail, setIsFirstTime }) {
  const { showToast } = useToast();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Processing, 4: Success
  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    email: prefilledEmail || '',
    phone: '',
    address: '',
    city: '',
    pinCode: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isEditingEmail, setIsEditingEmail] = useState(!prefilledEmail);

  // Sync prefilled email and reset step when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      if (prefilledEmail) {
        setShippingForm(prev => ({ ...prev, email: prefilledEmail }));
        setIsEditingEmail(false);
      } else {
        setIsEditingEmail(true);
      }
    }
  }, [isOpen, prefilledEmail]);

  useEffect(() => {
    if (isOpen) {
      // Allow Escape key to close modal
      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && step < 3) {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, step, onClose]);

  const [paymentForm, setPaymentForm] = useState({
    utr: '',
    screenshot: ''
  });
  const [paymentError, setPaymentError] = useState('');
  const [paymentTouched, setPaymentTouched] = useState(false);
  const [showUtrHelp, setShowUtrHelp] = useState(false);

  const [orderId, setOrderId] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  const KESHIRA_UPI_ID = 'kapatel190-2@okaxis'; // User's custom UPI ID

  // --- Real-time Field Validation Rules ---
  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 3) return 'Please enter at least 3 characters';
        if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) return 'Name should contain letters only';
        return '';

      case 'email':
        if (!value.trim()) return 'Email address is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Please enter a valid email (e.g. name@domain.com)';
        return '';

      case 'phone': {
        const cleanedPhone = value.replace(/\D/g, '');
        if (!cleanedPhone) return 'Phone number is required for dispatch updates';
        if (!/^[6-9]\d{9}$/.test(cleanedPhone)) return 'Enter valid 10-digit mobile number starting with 6, 7, 8, or 9';
        return '';
      }

      case 'address':
        if (!value.trim()) return 'Delivery address is required';
        if (value.trim().length < 8) return 'Please provide complete house/flat no., building and street';
        return '';

      case 'city':
        if (!value.trim()) return 'City is required';
        if (value.trim().length < 2) return 'Please enter a valid city name';
        return '';

      case 'pinCode': {
        const cleanedPin = value.replace(/\D/g, '');
        if (!cleanedPin) return 'PIN code is required';
        if (!/^[1-9][0-9]{5}$/.test(cleanedPin)) return 'Please enter a valid 6-digit PIN code (e.g. 400001)';
        return '';
      }

      default:
        return '';
    }
  };

  const validateAllShipping = () => {
    const newErrors = {};
    Object.keys(shippingForm).forEach(key => {
      const err = validateField(key, shippingForm[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    // Mark all as touched so errors render immediately
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      pinCode: true
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    let sanitizedVal = value;

    // Numerical filtering for phone and pincode
    if (name === 'phone') {
      sanitizedVal = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'pinCode') {
      sanitizedVal = value.replace(/\D/g, '').slice(0, 6);
    }

    setShippingForm(prev => ({ ...prev, [name]: sanitizedVal }));

    // Real-time validation if already touched
    if (touched[name]) {
      const err = validateField(name, sanitizedVal);
      setErrors(prev => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    const isValid = validateAllShipping();
    if (!isValid) {
      // Focus first error field for accessibility
      return;
    }

    // Generate Order ID if not already generated
    if (!orderId) {
      const randomId = 'KES-' + Math.floor(100000 + Math.random() * 900000);
      setOrderId(randomId);
    }
    setStep(2);
  };

  const validateUtr = (utrValue) => {
    const cleaned = (utrValue || '').replace(/\D/g, '');
    if (!cleaned) return ''; // Optional: No error if left blank
    if (cleaned.length !== 12) return `UTR must be exactly 12 numeric digits (currently ${cleaned.length}/12)`;
    return '';
  };

  const handlePaymentChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 12);
    setPaymentForm(prev => ({ ...prev, utr: cleaned }));
    if (paymentTouched) {
      setPaymentError(validateUtr(cleaned));
    }
  };

  const handlePaymentBlur = () => {
    setPaymentTouched(true);
    setPaymentError(validateUtr(paymentForm.utr));
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setPaymentTouched(true);
    const err = validateUtr(paymentForm.utr);
    if (err) {
      setPaymentError(err);
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
        subtotal: orderSummary.subtotal || cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        discount: orderSummary.discount || 0,
        couponDiscount: orderSummary.couponDiscount || 0,
        couponCode: orderSummary.couponCode || '',
        shipping: orderSummary.shipping !== undefined ? orderSummary.shipping : 0,
        total: orderSummary.total,
        utr: paymentForm.utr.trim() || 'Pending Verification',
        screenshot: paymentForm.screenshot || '',
        status: 'Received',
        adminNotes: ''
      };

      // Save to Supabase Database
      try {
        const { error } = await supabase.from('orders').upsert({
          id: orderId,
          order_data: newOrder,
          email: shippingForm.email.trim().toLowerCase(),
          normalized_email: normalizeEmail(shippingForm.email),
          status: 'Received',
          admin_notes: ''
        });
        if (error) {
          console.error('Error saving order to Supabase:', error);
        } else {
          console.log('Order saved to Supabase successfully.');
        }
      } catch (err) {
        console.error('Error saving order to Supabase:', err);
      }

      // Save to localStorage (Local cache backup)
      const savedOrders = localStorage.getItem('keshira_orders');
      const orderList = savedOrders ? JSON.parse(savedOrders) : [];
      orderList.unshift(newOrder);
      localStorage.setItem('keshira_orders', JSON.stringify(orderList));

      // Trigger automated email notification (Free via EmailJS API)
      sendOrderEmail(newOrder);
      sendAdminNotifications(newOrder);

      // Dispatch event to recalculate live ratings & order stories across the app
      window.dispatchEvent(new CustomEvent('keshira:order-placed', { detail: newOrder }));

      onClearCart(); // successful purchase clears cart
      setIsFirstTime(false); // No longer a first-time user
      setStep(4); // Success step
      showToast(`🎉 Order #${orderId} confirmed successfully! Confirmation sent to ${shippingForm.email}.`, 'success', 5000);
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
                    ${item.purchaseType === 'bundle' ? `Set: ${item.variant}` : `Size: ${item.variant}`} | QTY: ${item.quantity} ${item.purchaseType === 'subscribe' ? '🔄 (Auto-Delivery)' : ''}
                  </div>
                  ${item.bundleItems && item.bundleItems.length > 0 ? `
                    <div style="font-size: 11px; color: #555; margin-top: 6px; background-color: #f7f9f7; padding: 6px 8px; border-radius: 4px; border: 1px solid #e2e8e2;">
                      <strong style="color: #132E1B; display: block; margin-bottom: 2px;">Includes:</strong>
                      ${item.bundleItems.map(p => `• ${p}`).join('<br/>')}
                    </div>
                  ` : ''}
                </td>
                <td style="padding: 16px 4px 0 0; white-space: nowrap; text-align: right; width: 100px;">
                  <strong style="font-size: 15px; color: #132E1B; font-family: system-ui, -apple-system, sans-serif;">₹${item.price * item.quantity}</strong>
                </td>
              </tr>
            </table>
          `;
        }).join('')
      : '';

    // Send the complimentary Ayurvedic Hair Transition Guide to all customers
    const guideHtmlCard = `
      <div style="margin-top: 20px; margin-bottom: 20px; background-color: #FAF7F2; border: 1px solid #E8DFD0; border-radius: 8px; padding: 16px 20px;">
        <div style="font-size: 11px; font-weight: 800; color: #5C4426; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px;">
          🎁 YOUR COMPLIMENTARY DIGITAL GIFT
        </div>
        <div style="font-size: 16px; font-weight: bold; color: #132E1B; margin-bottom: 6px; font-family: system-ui, -apple-system, sans-serif;">
          Ayurvedic Hair Transition Guide (Digital PDF Edition)
        </div>
        <p style="font-size: 13px; color: #555; line-height: 1.5; margin: 0 0 12px 0;">
          Your 21-day botanical detox protocol, authentic warm oil Champi massage ritual, and non-stripping lather guide is ready for you:
        </p>
        <a href="https://keshira.vercel.app/ayurvedic-hair-transition-guide" target="_blank" style="display: inline-block; background-color: #132E1B; color: #FFFFFF; font-size: 13px; font-weight: bold; text-decoration: none; padding: 10px 18px; border-radius: 6px;">
          📖 Read & Download Digital Guide →
        </a>
      </div>
    `;

    const fullItemsHtml = `${itemsHtml}${guideHtmlCard}`;

    // 2. Pricing calculations
    const subtotalVal = order.items ? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0;
    const discountAmount = orderSummary.discount || 0;
    const shippingVal = orderSummary.shipping || 0;

    const discountLabel = order.couponCode 
      ? `Discount Applied (${order.couponCode})` 
      : 'Discount / Promotional Savings';

    const discountRowHtml = discountAmount > 0 
      ? `<tr>
          <td style="width: 50%"></td>
          <td style="padding: 6px 0; color: #27ae60;">${discountLabel}</td>
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
      items_html: fullItemsHtml,
      guide_link: 'https://keshira.vercel.app/ayurvedic-hair-transition-guide',
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
                    ${item.purchaseType === 'bundle' ? `Set: ${item.variant}` : `Size: ${item.variant}`} | QTY: ${item.quantity} ${item.purchaseType === 'subscribe' ? '🔄 (Auto-Delivery)' : ''}
                  </div>
                  ${item.bundleItems && item.bundleItems.length > 0 ? `
                    <div style="font-size: 11px; color: #555; margin-top: 6px; background-color: #f7f9f7; padding: 6px 8px; border-radius: 4px; border: 1px solid #e2e8e2;">
                      <strong style="color: #132E1B; display: block; margin-bottom: 2px;">Includes:</strong>
                      ${item.bundleItems.map(p => `• ${p}`).join('<br/>')}
                    </div>
                  ` : ''}
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

    const discountLabel = order.couponCode 
      ? `Discount Applied (${order.couponCode})` 
      : 'Discount / Promotional Savings';

    const discountRowHtml = discountAmount > 0 
      ? `<tr>
          <td style="width: 50%"></td>
          <td style="padding: 6px 0; color: #27ae60;">${discountLabel}</td>
          <td style="padding: 6px 0 6px 12px; white-space: nowrap; color: #27ae60;">-₹${discountAmount}</td>
         </tr>`
      : '';

    const shippingCostText = shippingVal === 0 ? 'FREE' : `₹${shippingVal}`;
    const shippingColorHex = shippingVal === 0 ? '#27ae60' : '#444';

    const itemsTextList = order.items
      ? order.items.map(item => {
          const bundleBreakdown = item.bundleItems && item.bundleItems.length > 0
            ? `\n    └ Includes: ${item.bundleItems.join(' + ')}`
            : '';
          return `- ${item.title} (${item.variant}) x ${item.quantity} [${item.purchaseType === 'subscribe' ? '🔄 Subscription' : item.purchaseType === 'bundle' ? '📦 Curated Bundle' : 'One-Time'}] - ₹${item.price * item.quantity}${bundleBreakdown}`;
        }).join('\n')
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
    showToast(`✓ UPI ID copied: ${KESHIRA_UPI_ID}`, 'success');
    setTimeout(() => setCopied(false), 2000);
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

  const totalCartItemsCount = cart ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const upiDeepLink = `upi://pay?pa=${KESHIRA_UPI_ID}&pn=Keshira%20Apothecary&am=${orderSummary.total}&cu=INR&tn=Keshira_${orderId}`;

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={step < 3 ? onClose : undefined}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Deconstruct / GoKwik Clean Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid #EDEDED',
          backgroundColor: '#FFFFFF',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#111827'
                }}
                aria-label="Back to Shipping"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            ) : null}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.04em', color: '#132E1B' }}>
                KESHIRA
              </span>
              <span style={{ fontSize: '0.62rem', letterSpacing: '0.12em', color: '#888', fontWeight: 700, textTransform: 'uppercase' }}>
                AYURVEDA
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 600, color: '#16a34a' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              100% Secured Payment
            </span>
            {step < 3 && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close checkout"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Deconstruct Address Verification Notice Banner */}
        <div style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          fontSize: '0.75rem',
          fontWeight: 600,
          textAlign: 'center',
          padding: '8px 14px',
          letterSpacing: '0.01em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          <span>📍</span> Please verify your delivery address before placing order!
        </div>

        <div className="checkout-wizard">
          {/* Collapsible Deconstruct Order Summary Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            marginBottom: '18px',
            overflow: 'hidden'
          }}>
            <button
              type="button"
              onClick={() => setIsSummaryExpanded(prev => !prev)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: '#FAFAFA',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>
                  Order Summary ({totalCartItemsCount} {totalCartItemsCount === 1 ? 'item' : 'items'})
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  backgroundColor: '#DCFCE7',
                  color: '#15803D',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}>
                  🎁 Free Gift Added
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#111827' }}>
                  ₹{orderSummary.total}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: isSummaryExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    color: '#6B7280'
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </button>

            {isSummaryExpanded && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid #F3F4F6' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                  {cart && cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #EEEEEE' }} 
                        />
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111827' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                            {item.variant} • Qty {item.quantity}
                            {item.isFreeBogoItem && (
                              <span style={{ marginLeft: '6px', color: '#16a34a', fontWeight: 700 }}>[B1G1 Free]</span>
                            )}
                            {item.isFreeGiftItem && (
                              <span style={{ marginLeft: '6px', color: '#b45309', fontWeight: 700 }}>[Free Gift]</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827' }}>
                        {item.price === 0 ? (
                          <span style={{ color: '#16a34a' }}>FREE</span>
                        ) : (
                          `₹${item.price * item.quantity}`
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #E5E7EB', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280' }}>
                    <span>Subtotal</span>
                    <span>₹{orderSummary.subtotal}</span>
                  </div>
                  {orderSummary.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 600 }}>
                      <span>{orderSummary.bogoDiscount > 0 ? 'B1G1 / Promotional Savings' : 'Promotional Coupon Savings'}</span>
                      <span>-₹{orderSummary.discount}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280' }}>
                    <span>Express Delivery</span>
                    <span>{orderSummary.shipping === 0 ? <strong style={{ color: '#16a34a' }}>FREE</strong> : `₹${orderSummary.shipping}`}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

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
            <form onSubmit={handleShippingSubmit} noValidate>

              {/* Row 1: Full Name & Mobile Number */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="checkout-fullName">
                    <span>Full Name <span className="form-label-required">*</span></span>
                    {touched.fullName && !errors.fullName && <span style={{ color: '#27ae60', fontSize: '0.72rem' }}>✓ Looks good</span>}
                  </label>
                  <div className="form-input-container">
                    <input 
                      id="checkout-fullName"
                      type="text" 
                      name="fullName" 
                      className={`form-input ${touched.fullName ? (errors.fullName ? 'is-invalid' : 'is-valid') : ''}`}
                      placeholder="e.g. Aarav Sharma"
                      value={shippingForm.fullName}
                      onChange={handleShippingChange}
                      onBlur={handleBlur}
                      autoComplete="name"
                      required
                    />
                    {touched.fullName && (
                      <span className="form-input-icon">
                        {errors.fullName ? <span style={{ color: '#e74c3c' }}>✕</span> : <span style={{ color: '#27ae60' }}>✓</span>}
                      </span>
                    )}
                  </div>
                  {touched.fullName && errors.fullName && (
                    <span className="field-error-msg">⚠️ {errors.fullName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="checkout-phone">
                    <span>Mobile Number <span className="form-label-required">*</span></span>
                    {touched.phone && !errors.phone && <span style={{ color: '#27ae60', fontSize: '0.72rem' }}>✓ 10 Digits</span>}
                  </label>
                  <div className="form-input-container">
                    <input 
                      id="checkout-phone"
                      type="tel" 
                      name="phone" 
                      maxLength="10"
                      className={`form-input ${touched.phone ? (errors.phone ? 'is-invalid' : 'is-valid') : ''}`}
                      placeholder="e.g. 9876543210"
                      value={shippingForm.phone}
                      onChange={handleShippingChange}
                      onBlur={handleBlur}
                      autoComplete="tel"
                      required
                    />
                    {touched.phone && (
                      <span className="form-input-icon">
                        {errors.phone ? <span style={{ color: '#e74c3c' }}>✕</span> : <span style={{ color: '#27ae60' }}>✓</span>}
                      </span>
                    )}
                  </div>
                  {touched.phone && errors.phone && (
                    <span className="field-error-msg">⚠️ {errors.phone}</span>
                  )}
                </div>
              </div>

              {/* Row 2: Email Address (Span full or side-by-side with Address) */}
              <div className="form-group">
                <label className="form-label" htmlFor="checkout-email">
                  <span>Email Address <span className="form-label-required">*</span></span>
                  {prefilledEmail && !isEditingEmail && (
                    <button 
                      type="button" 
                      onClick={() => setIsEditingEmail(true)} 
                      style={{ fontSize: '0.7rem', color: 'var(--color-accent-gold-dark)', textDecoration: 'underline', padding: 0 }}
                    >
                      Change
                    </button>
                  )}
                </label>
                <div className="form-input-container">
                  <input 
                    id="checkout-email"
                    type="email" 
                    name="email" 
                    className={`form-input ${touched.email ? (errors.email ? 'is-invalid' : 'is-valid') : ''}`}
                    placeholder="e.g. aarav@gmail.com"
                    value={shippingForm.email}
                    onChange={handleShippingChange}
                    onBlur={handleBlur}
                    readOnly={!isEditingEmail && Boolean(prefilledEmail)}
                    style={!isEditingEmail && Boolean(prefilledEmail) ? { backgroundColor: 'rgba(250, 245, 235, 0.4)', cursor: 'default' } : {}}
                    autoComplete="email"
                    required
                  />
                  {touched.email && (
                    <span className="form-input-icon">
                      {errors.email ? <span style={{ color: '#e74c3c' }}>✕</span> : <span style={{ color: '#27ae60' }}>✓</span>}
                    </span>
                  )}
                </div>
                {touched.email && errors.email && (
                  <span className="field-error-msg">⚠️ {errors.email}</span>
                )}
              </div>

              {/* Row 3: Street Delivery Address */}
              <div className="form-group">
                <label className="form-label" htmlFor="checkout-address">
                  <span>Street / Flat / Delivery Address <span className="form-label-required">*</span></span>
                  {touched.address && !errors.address && <span style={{ color: '#27ae60', fontSize: '0.72rem' }}>✓ Verified</span>}
                </label>
                <div className="form-input-container">
                  <input 
                    id="checkout-address"
                    type="text" 
                    name="address" 
                    className={`form-input ${touched.address ? (errors.address ? 'is-invalid' : 'is-valid') : ''}`}
                    placeholder="Flat/House No., Building Name, Street, Landmark"
                    value={shippingForm.address}
                    onChange={handleShippingChange}
                    onBlur={handleBlur}
                    autoComplete="street-address"
                    required
                  />
                  {touched.address && (
                    <span className="form-input-icon">
                      {errors.address ? <span style={{ color: '#e74c3c' }}>✕</span> : <span style={{ color: '#27ae60' }}>✓</span>}
                    </span>
                  )}
                </div>
                {touched.address && errors.address && (
                  <span className="field-error-msg">⚠️ {errors.address}</span>
                )}
              </div>

              {/* Row 4: City & PIN Code Row */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="checkout-city">
                    <span>City <span className="form-label-required">*</span></span>
                  </label>
                  <div className="form-input-container">
                    <input 
                      id="checkout-city"
                      type="text" 
                      name="city" 
                      className={`form-input ${touched.city ? (errors.city ? 'is-invalid' : 'is-valid') : ''}`}
                      placeholder="e.g. Mumbai"
                      value={shippingForm.city}
                      onChange={handleShippingChange}
                      onBlur={handleBlur}
                      autoComplete="address-level2"
                      required
                    />
                    {touched.city && (
                      <span className="form-input-icon">
                        {errors.city ? <span style={{ color: '#e74c3c' }}>✕</span> : <span style={{ color: '#27ae60' }}>✓</span>}
                      </span>
                    )}
                  </div>
                  {touched.city && errors.city && (
                    <span className="field-error-msg">⚠️ {errors.city}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="checkout-pinCode">
                    <span>Postal PIN Code <span className="form-label-required">*</span></span>
                    {touched.pinCode && !errors.pinCode && <span style={{ color: '#27ae60', fontSize: '0.72rem' }}>✓ 6 Digits</span>}
                  </label>
                  <div className="form-input-container">
                    <input 
                      id="checkout-pinCode"
                      type="text" 
                      name="pinCode" 
                      maxLength="6"
                      className={`form-input ${touched.pinCode ? (errors.pinCode ? 'is-invalid' : 'is-valid') : ''}`}
                      placeholder="e.g. 400001"
                      value={shippingForm.pinCode}
                      onChange={handleShippingChange}
                      onBlur={handleBlur}
                      autoComplete="postal-code"
                      required
                    />
                    {touched.pinCode && (
                      <span className="form-input-icon">
                        {errors.pinCode ? <span style={{ color: '#e74c3c' }}>✕</span> : <span style={{ color: '#27ae60' }}>✓</span>}
                      </span>
                    )}
                  </div>
                  {touched.pinCode && errors.pinCode && (
                    <span className="field-error-msg">⚠️ {errors.pinCode}</span>
                  )}
                </div>
              </div>

              {/* Trust badges footer */}
              <div className="checkout-trust-bar">
                <div className="checkout-trust-item">
                  <span>🌿</span> Fresh Handcrafted Batch
                </div>
                <div className="checkout-trust-item">
                  <span>🛡️</span> 100% Transit Safe Guarantee
                </div>
                <div className="checkout-trust-item">
                  <span>⚡</span> Dispatch Within 24 Hrs
                </div>
              </div>

              <div className="checkout-actions">
                <button type="button" className="btn-back" onClick={onClose}>
                  ← Back to Bag
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', fontSize: '0.95rem' }}
                >
                  Continue to Payment →
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handlePaymentSubmit} noValidate>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '8px', textAlign: 'center', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
                Instant UPI Payment
              </h3>
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '18px' }}>
                Pay securely via Google Pay, PhonePe, Paytm, or any banking UPI app. Zero convenience fees.
              </p>
              
              <div style={{ 
                backgroundColor: 'rgba(19, 46, 27, 0.03)', 
                border: '1px solid var(--color-border)', 
                borderRadius: '16px', 
                padding: '20px', 
                marginBottom: '20px', 
                textAlign: 'center' 
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                  Total Payable Amount
                </span>
                <h4 style={{ fontSize: '2.4rem', color: 'var(--color-primary)', margin: '4px 0 14px 0', fontWeight: 'bold' }}>
                  ₹{orderSummary.total}
                </h4>

                {/* 1-Tap Mobile UPI Intent Button */}
                <div style={{ maxWidth: '340px', margin: '0 auto 16px' }}>
                  <a 
                    href={upiDeepLink} 
                    className="upi-intent-btn"
                  >
                    <span>⚡ Pay ₹{orderSummary.total} via Any UPI App</span>
                  </a>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>
                    (Tap above on mobile to open GPay, PhonePe, or Paytm automatically)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0', gap: '12px' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }}></div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>OR SCAN QR CODE</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }}></div>
                </div>
                
                {/* Dynamic UPI QR Code */}
                <div style={{ 
                  backgroundColor: '#FFFFFF', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  display: 'inline-block', 
                  boxShadow: 'var(--shadow-sm)',
                  border: '2px solid var(--color-accent-gold)',
                  marginBottom: '12px'
                }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(
                      `upi://pay?pa=${KESHIRA_UPI_ID}&pn=Keshira&am=${orderSummary.total}&cu=INR&tn=Keshira_Order_${orderId}`
                    )}`} 
                    alt="Scan to Pay via UPI" 
                    style={{ display: 'block', width: '170px', height: '170px' }}
                  />
                </div>
                
                {/* UPI ID copy option */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', padding: '6px 14px', borderRadius: '50px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
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
                      {copied ? '✓ Copied!' : 'Copy UPI'}
                    </button>
                  </div>
                </div>
              </div>

              {/* UTR Input with inline validation */}
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" htmlFor="checkout-utr" style={{ fontWeight: 600 }}>
                  <span>UPI Ref No. / UTR <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>(Optional)</span></span>
                  <span style={{ fontSize: '0.72rem', color: paymentForm.utr.length === 12 ? '#27ae60' : 'var(--color-text-muted)' }}>
                    {paymentForm.utr.length > 0 ? `${paymentForm.utr.length}/12 Digits` : 'Can skip if unknown'}
                  </span>
                </label>
                <div className="form-input-container">
                  <input 
                    id="checkout-utr"
                    type="text" 
                    name="utr" 
                    className={`form-input ${paymentTouched ? (paymentError ? 'is-invalid' : paymentForm.utr.length === 12 ? 'is-valid' : '') : ''}`}
                    placeholder="e.g. 312345678901 (optional)"
                    maxLength="12"
                    value={paymentForm.utr}
                    onChange={handlePaymentChange}
                    onBlur={handlePaymentBlur}
                    style={{ textAlign: 'center', fontSize: '1.15rem', letterSpacing: '0.12em', fontWeight: 'bold' }}
                  />
                  {paymentTouched && paymentForm.utr.length > 0 && (
                    <span className="form-input-icon">
                      {paymentError ? <span style={{ color: '#e74c3c' }}>✕</span> : <span style={{ color: '#27ae60' }}>✓</span>}
                    </span>
                  )}
                </div>
                {paymentTouched && paymentError ? (
                  <span className="field-error-msg">⚠️ {paymentError}</span>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      💡 Don't know your UTR? You can skip this and upload a receipt screenshot above!
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setShowUtrHelp(!showUtrHelp)}
                      style={{ fontSize: '0.75rem', color: 'var(--color-accent-gold-dark)', textDecoration: 'underline', padding: 0 }}
                    >
                      {showUtrHelp ? 'Hide Guide' : 'Where to find UTR?'}
                    </button>
                  </div>
                )}

                {/* Collapsible UTR Guide */}
                {showUtrHelp && (
                  <div style={{ marginTop: '10px', padding: '12px', borderRadius: '8px', backgroundColor: '#FFFDF9', border: '1px solid var(--color-border)', fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                    <div><strong>Google Pay:</strong> Tap transaction → Look for <em>UPI transaction ID</em> (12 digits)</div>
                    <div><strong>PhonePe:</strong> Tap transaction details → Look for <em>UTR number</em> (12 digits)</div>
                    <div><strong>Paytm:</strong> Tap payment details → Look for <em>UPI Ref No.</em> (12 digits)</div>
                  </div>
                )}
              </div>

              {/* Screenshot Upload Input */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>
                  <span>Attach Payment Receipt / Screenshot (Optional)</span>
                  <span style={{ fontSize: '0.7rem', color: '#27ae60' }}>⚡ Faster Verification</span>
                </label>
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
                {paymentForm.screenshot ? (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#27ae60', fontWeight: 'bold' }}>✓ Receipt image attached and compressed successfully!</span>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
                    Attach your receipt image for quick payment verification. (Max 1.5MB)
                  </span>
                )}
              </div>

              <div className="checkout-actions">
                <button type="button" className="btn-back" onClick={() => setStep(1)}>
                  ← Back to Shipping
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', fontSize: '0.95rem' }}
                >
                  Confirm & Place Order ✓
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
                Registering your UPI UTR ref for order verification... Please wait.
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

                {/* Instant Access to Free Ayurvedic Hair Transition Guide */}
                <div style={{
                  marginTop: '16px',
                  padding: '14px',
                  borderRadius: '8px',
                  backgroundColor: '#FAF7F2',
                  border: '1px solid #E8DFD0',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1.1rem' }}>🎁</span>
                    <strong style={{ fontSize: '0.85rem', color: '#132E1B' }}>Your Free Digital Guide is Ready</strong>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#555', margin: '0 0 10px', lineHeight: 1.4 }}>
                    We also sent this to your email ({shippingForm.email}). You can read or print your 21-Day Transition Guide right now:
                  </p>
                  <a
                    href="/ayurvedic-hair-transition-guide"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'var(--color-primary, #132E1B)',
                      color: '#FFFFFF',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      padding: '8px 14px',
                      borderRadius: '6px',
                      textDecoration: 'none'
                    }}
                  >
                    <span>📖 Open & Download Guide</span>
                    <span>→</span>
                  </a>
                </div>

                {/* WhatsApp Priority Dispatch Confirmation Button (Temporarily commented out until business WhatsApp number is connected) */}
                {/* 
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <a
                    href={`https://wa.me/919998887776?text=${encodeURIComponent(
                      `Hello Keshira Apothecary! I just placed Order #${orderId} for ₹${orderSummary.total}. Please confirm my fresh batch dispatch priority. Name: ${shippingForm.fullName}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      backgroundColor: '#25D366',
                      color: '#FFFFFF',
                      padding: '12px 18px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>💬 Confirm Order via WhatsApp</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>(Instant Dispatch Priority)</span>
                  </a>
                </div>
                */}
              </div>

              <button className="btn-primary" onClick={onClose} style={{ marginTop: '16px', width: '100%' }}>
                Continue Exploring Formulations
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
