export default async function handler(req, res) {
  // Only allow requests from cron or manual triggers
  const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID;
  const TELEGRAM_BOT_TOKEN = process.env.VITE_TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.VITE_TELEGRAM_CHAT_ID;

  if (!PROJECT_ID || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return res.status(500).json({ error: 'Missing environment variables.' });
  }

  try {
    // 1. Fetch orders from Firestore REST API
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/orders`;
    const response = await fetch(firestoreUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch orders from Firestore: ${response.statusText}`);
    }
    const data = await response.json();
    const documents = data.documents || [];

    // Helper to calculate next ship date matching frontend formatting
    function calculateNextShipDate(orderDateStr, freqStr) {
      const orderDate = new Date(orderDateStr);
      if (isNaN(orderDate.getTime())) return '';
      const days = freqStr.includes('45') ? 45 : 30;
      orderDate.setDate(orderDate.getDate() + days);
      return orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    // Determine target notification date (3 days from now)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    const targetDateStr = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    let alertsSent = 0;
    const alertDetails = [];

    // 2. Scan documents for matching upcoming subscriptions
    for (const doc of documents) {
      const fields = doc.fields;
      if (!fields) continue;

      // Extract order fields from Firestore JSON structure
      const orderId = fields.id?.stringValue || '';
      const orderDateStr = fields.date?.stringValue || '';
      const subscriptionStatus = fields.subscriptionStatus?.stringValue || 'Active';
      const shippingAddressVal = fields.shippingAddress?.mapValue?.fields || {};
      
      const customerName = shippingAddressVal.fullName?.stringValue || 'Customer';
      const customerPhone = shippingAddressVal.phone?.stringValue || '';
      const customerEmail = shippingAddressVal.email?.stringValue || '';
      const customerAddress = shippingAddressVal.address?.stringValue || '';
      const customerCity = shippingAddressVal.city?.stringValue || '';
      const customerPin = shippingAddressVal.pinCode?.stringValue || '';

      // Skip paused subscriptions
      if (subscriptionStatus === 'Paused') continue;

      const itemsArray = fields.items?.arrayValue?.values || [];
      const subscriptionItems = [];

      for (const itemObj of itemsArray) {
        const itemFields = itemObj.mapValue?.fields || {};
        const purchaseType = itemFields.purchaseType?.stringValue || '';
        if (purchaseType === 'subscribe') {
          const title = itemFields.title?.stringValue || '';
          const variant = itemFields.variant?.stringValue || '';
          const quantity = parseInt(itemFields.quantity?.integerValue || '1', 10);
          const frequency = itemFields.frequency?.stringValue || '30 Days';
          const price = parseInt(itemFields.price?.integerValue || '0', 10);
          
          const nextShipDate = fields.nextShipment?.stringValue || calculateNextShipDate(orderDateStr, frequency);

          // Check if it matches our target date (exactly 3 days from now)
          if (nextShipDate === targetDateStr) {
            subscriptionItems.push({ title, variant, quantity, frequency, price, nextShipDate });
          }
        }
      }

      // 3. Dispatch Telegram alert if matches found
      if (subscriptionItems.length > 0) {
        const itemsText = subscriptionItems
          .map(item => `• ${item.title} (${item.variant}) x ${item.quantity} [🔄 Every ${item.frequency}] - ₹${item.price * item.quantity}`)
          .join('\n');

        const telegramMessage = `
<b>🔔 Upcoming Auto-Delivery Reminder (3 Days Away)</b>
---------------------------------------
<b>Order ID:</b> ${orderId}
<b>Customer:</b> ${customerName}
<b>Phone:</b> ${customerPhone}
<b>Email:</b> ${customerEmail}
<b>Address:</b> ${customerAddress}, ${customerCity} - ${customerPin}

<b>Subscription Items:</b>
${itemsText}

<b>Next Shipment Date:</b> <b>${targetDateStr}</b>
<i>Please prepare and package this batch! 🌿</i>
`.trim();

        // Send to Telegram API
        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: telegramMessage,
            parse_mode: 'HTML'
          })
        });

        alertsSent++;
        alertDetails.push({ orderId, customerName, targetDateStr });
      }
    }

    return res.status(200).json({ success: true, alertsSent, alertDetails });
  } catch (error) {
    console.error('Cron job error:', error);
    return res.status(500).json({ error: error.message });
  }
}
