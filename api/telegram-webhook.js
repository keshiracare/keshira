// api/telegram-webhook.js
// Vercel Serverless Function to handle Telegram Bot interactive Inline Button clicks
import { supabase } from './_supabase.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Support GET check for webhook status
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', message: 'Telegram Webhook Endpoint is Active' });
  }

  const TELEGRAM_BOT_TOKEN = process.env.VITE_TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  const SERVICE_ID = process.env.VITE_EMAILJS_SERVICE_ID || 'service_ez47q6c';
  const TEMPLATE_ID = process.env.VITE_EMAILJS_TEMPLATE_ID || 'template_felpos2';
  const PUBLIC_KEY = process.env.VITE_EMAILJS_PUBLIC_KEY || 'dUvyAAVmDEHvYT4Nb';

  try {
    const update = req.body;
    if (!update) {
      return res.status(200).json({ ok: true, note: 'empty body' });
    }

    // Check if this is a callback_query from an inline button
    const callbackQuery = update.callback_query;
    if (!callbackQuery) {
      // Just a standard message or command
      return res.status(200).json({ ok: true, note: 'ignored non-callback' });
    }

    const { id: callbackQueryId, data, message } = callbackQuery;
    const chatId = message?.chat?.id;
    const messageId = message?.message_id;

    if (!data) {
      return res.status(200).json({ ok: true });
    }

    // Data format: "verify:KES-XXXX" or "reject:KES-XXXX"
    const [action, orderId] = data.split(':');

    if (!orderId || (action !== 'verify' && action !== 'reject')) {
      return res.status(200).json({ ok: true, note: 'unknown action' });
    }

    const isVerified = action === 'verify';
    const newStatus = isVerified ? 'Processing' : 'Payment Failed';
    const newPaymentStatus = isVerified ? 'Verified' : 'Failed';
    const newUtr = isVerified ? 'Payment Verified' : 'Payment Not Received';

    // 1. Fetch the order from Supabase
    const { data: orderRow, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (orderErr || !orderRow) {
      await answerCallbackQuery(TELEGRAM_BOT_TOKEN, callbackQueryId, `⚠️ Order ${orderId} not found in database!`);
      return res.status(200).json({ ok: true, error: 'order not found' });
    }

    // 2. Update Supabase with verified status
    await supabase
      .from('orders')
      .update({
        status: newStatus,
        payment_status: newPaymentStatus,
        utr: newUtr
      })
      .eq('id', orderId);

    // 3. Send automated Email to customer via EmailJS REST API
    const customerEmail = orderRow.email || orderRow.normalized_email;
    const customerName = orderRow.customer_name || 'Valued Customer';
    const totalAmount = orderRow.total_amount || 0;

    if (customerEmail && PUBLIC_KEY && PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
      const subject = isVerified 
        ? `✅ Payment Received & Order Confirmed (#${orderId}) - Keshira Apothecary` 
        : `⚠️ Payment Not Received for Order #${orderId} - Keshira Apothecary`;

      const statusNoticeHtml = isVerified
        ? `<div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 8px; padding: 16px; margin: 20px 0; color: #065F46;">
             <h3 style="margin: 0 0 6px 0; font-size: 16px; color: #047857;">🎉 Payment Successfully Confirmed!</h3>
             <p style="margin: 0; font-size: 13px; line-height: 1.5;">We have verified your UPI payment in our accounts. Your fresh micro-batch botanical formulation has been assigned priority dispatch.</p>
           </div>`
        : `<div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 16px; margin: 20px 0; color: #991B1B;">
             <h3 style="margin: 0 0 6px 0; font-size: 16px; color: #B91C1C;">⚠️ Payment Not Received</h3>
             <p style="margin: 0 0 10px 0; font-size: 13px; line-height: 1.5;">We were unable to locate your payment for <strong>Order #${orderId}</strong> (Amount: ₹${totalAmount}). Your order has not been placed yet.</p>
             <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 1.5;">If funds were deducted from your bank account or you entered an incorrect UTR, please reply to this email with your payment screenshot or reach out via WhatsApp so our team can immediately assist you.</p>
             <a href="https://wa.me/919998887776?text=Help%20with%20payment%20for%20order%20${orderId}" style="display: inline-block; background-color: #122B19; color: #FFFFFF; font-size: 12px; font-weight: bold; text-decoration: none; padding: 8px 14px; border-radius: 6px;">
               Contact WhatsApp Support →
             </a>
           </div>`;

      try {
        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: SERVICE_ID,
            template_id: TEMPLATE_ID,
            user_id: PUBLIC_KEY,
            template_params: {
              subject,
              customer_name: customerName,
              customer_email: customerEmail,
              customer_phone: orderRow.phone || '',
              delivery_address: `${orderRow.shipping_address || ''}, ${orderRow.city || ''} - ${orderRow.pincode || ''}`,
              order_id: orderId,
              utr_ref: newUtr,
              items_html: statusNoticeHtml,
              guide_link: 'https://keshira.vercel.app/ayurvedic-hair-transition-guide',
              subtotal: orderRow.subtotal || totalAmount,
              discount_row: '',
              shipping_cost: 'FREE',
              shipping_color: '#27ae60',
              order_total: totalAmount
            }
          })
        });
      } catch (e) {
        console.error('Failed to trigger customer email from webhook:', e);
      }
    }

    // 4. Update the original Telegram message to show confirmation badge
    const originalText = message.text || message.caption || '';
    const cleanPhone = (orderRow.phone || '').replace(/\D/g, '');
    const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const waLink = `https://wa.me/${waPhone}?text=${encodeURIComponent(`Hello ${customerName}, thank you for your order with Keshira (#${orderId})!`)}`;

    const statusBadge = isVerified 
      ? `\n\n<b>✅ PAYMENT CONFIRMED BY ADMIN</b>\nStatus: <i>Processing • Email Sent</i>`
      : `\n\n<b>❌ PAYMENT REJECTED BY ADMIN</b>\nStatus: <i>Payment Not Received • Alert Email Sent</i>`;

    const updatedText = originalText + statusBadge;

    // Remove the verify/reject buttons and replace with an informative resolved keyboard
    const resolvedKeyboard = {
      inline_keyboard: [
        [
          { text: isVerified ? '✅ Payment Verified' : '❌ Payment Not Received', callback_data: 'resolved_noop' }
        ],
        [
          { text: '💬 Chat Customer on WhatsApp', url: waLink }
        ]
      ]
    };

    if (message.caption) {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageCaption`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          caption: updatedText,
          parse_mode: 'HTML',
          reply_markup: resolvedKeyboard
        })
      });
    } else {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text: updatedText,
          parse_mode: 'HTML',
          reply_markup: resolvedKeyboard
        })
      });
    }

    // 5. Answer the callback query toast inside Telegram
    await answerCallbackQuery(
      TELEGRAM_BOT_TOKEN, 
      callbackQueryId, 
      isVerified ? `✅ Order ${orderId} confirmed! Email sent.` : `❌ Order ${orderId} marked unpaid. Email sent.`
    );

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error handling Telegram webhook:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

async function answerCallbackQuery(token, callbackQueryId, text) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text,
        show_alert: false
      })
    });
  } catch (e) {
    console.warn('answerCallbackQuery failed:', e);
  }
}
