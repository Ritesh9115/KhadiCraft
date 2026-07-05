// src/controllers/chatbot.controller.js — Google Gemini powered
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Setting = require('../models/Setting');

// ─── Knowledge Base ──────────────────────────────────────
const KB = {
  'shipping':       '🚚 We offer FREE shipping on orders above ₹1,000. Standard delivery takes 4–7 business days. Custom tailored orders ship 2–3 days after they are ready (7–10 working days stitching time). COD is available Pan-India!',
  'delivery':       '📦 Delivery time: Ready-made items 4–7 days, Custom orders 7–10 working days + 2–3 days shipping. We use Delhivery, DTDC, and Speed Post.',
  'cod':            '💵 Yes! Cash on Delivery (COD) is available across India for all orders. You pay when your order arrives at your door.',
  'track':          '🔍 Track your order by logging into your Account → Orders section. You can see real-time status. For custom orders, there are 10 detailed stages from fabric selection to delivery.',
  'return':         '↩️ Ready-made items can be returned within 7 days of delivery if unused and in original condition. Custom stitched garments are non-refundable (made to your measurements), but we guarantee quality and will fix any stitching issues free of charge.',
  'refund':         '💰 Refunds for eligible returns are processed within 5–7 business days to your original payment method. COD orders are refunded via bank transfer.',
  'exchange':       '🔄 We offer size exchanges for ready-made items within 7 days. Just contact us with your order number and we will arrange a pickup.',
  'custom':         '✂️ Our custom tailoring service lets you choose your fabric, design, and provide your exact measurements. Ready in 7–10 working days. Styles: Kurta, Pajama, Shirt, Pant, Blazer, Coat, Jacket, and more!',
  'custom order':   '✂️ Place a custom order in 5 easy steps: 1) Choose style 2) Select fabric 3) Enter measurements 4) Add instructions 5) Confirm. We confirm your order within 4 hours with final price.',
  'tailoring':      '🧵 Our master tailors have 30+ years of experience. Each garment is hand-crafted with precision. Custom orders take 7–10 working days from measurement confirmation.',
  'stitching':      '🪡 Our stitching quality is guaranteed. If you are not satisfied with the fit, we will alter it free of charge.',
  'measurement':    '📏 For measurements, you have 3 options: (1) Enter them yourself online (we have a detailed guide), (2) Use a saved measurement profile, (3) Book a FREE home visit — our tailor comes to your doorstep!',
  'size':           '📐 Check our size chart on any product page. For the most accurate fit we recommend booking a free measurement appointment. Sizes: XS to XXL and custom.',
  'fit':            '👔 We offer 3 fit types: Slim Fit, Regular Fit, and Relaxed/Loose Fit. Mention your preference in special instructions when placing a custom order.',
  'appointment':    '📅 Book a FREE measurement appointment from the Appointments page. Choose Shop Visit or Home Visit (we come to you). Available Mon–Sat, 10am–7pm.',
  'home visit':     '🏠 Yes! We offer FREE home measurement visits in Saharanpur and nearby areas. Book from the Appointments page — select "Home Visit".',
  'shop':           '🏪 Our shop is located at Rampur Maniharan, Saharanpur, Uttar Pradesh. Open Mon–Sat, 10am to 7pm. Closed on Sundays.',
  'fabric':         '🧶 We carry: Pure Cotton Khadi, Silk-Cotton Blend, Pure Linen, Woolen Khadi, Handspun Cotton, Chanderi, and seasonal collections. All fabrics are sourced directly from certified artisans.',
  'khadi':          '🌿 Khadi is hand-spun, hand-woven fabric — a symbol of Indian heritage. It is breathable, eco-friendly, and gets softer with every wash.',
  'cotton':         '🌱 Our Pure Cotton Khadi is 100% natural, hand-spun and hand-woven. Perfect for all seasons, especially summer.',
  'linen':          '🌾 Our Linen Khadi is premium quality, perfect for hot and humid weather. Lightweight, quick-drying, and gets better with age.',
  'silk':           '✨ Our Silk-Cotton blend combines the sheen of silk with the comfort of cotton. Great for festive and formal occasions.',
  'summer fabric':  '☀️ For summer: Pure Cotton Khadi (most breathable), Linen Khadi (lightweight), Handspun Cotton.',
  'winter fabric':  '❄️ For winter: Woolen Khadi (warm), Silk-Cotton Blend, Heavy Cotton Khadi. Our Woolen Khadi jackets are very popular!',
  'kurta':          '👘 Wide range of Khadi Kurtas — traditional, angrakha, mandarin collar, nehru collar, and more. Ready-made (S to XXL) and custom stitched.',
  'blazer':         '🧥 Our Khadi Blazers come in Cotton, Linen, and Silk-blend fabrics. Available ready-made or custom stitched.',
  'suit':           '🎩 We stitch complete Coat-Pant suits in Khadi fabric. Custom only. Takes 10–14 working days. Price starts from ₹4,999.',
  'saree':          '🥻 We have Khadi Silk and Cotton Sarees. Also available: Khadi Dupattas and Stoles in various colors.',
  'payment':        '💳 We accept: Cash on Delivery (COD), UPI (PhonePe/GPay/Paytm), Debit Card, Credit Card, and Net Banking. Custom orders require 50% advance.',
  'upi':            '📱 Yes, UPI payments accepted — PhonePe, Google Pay, Paytm, BHIM, and all UPI apps.',
  'advance':        '💰 For custom orders, 50% advance at time of placing the order. Remaining 50% is due when your order is ready for dispatch.',
  'price':          '🏷️ Prices start at ₹280/meter for raw Khadi fabric, ₹599 for ready-made kurtas, ₹899 for custom stitching. Bulk pricing available.',
  'wholesale':      '🏭 We welcome wholesale buyers! MOQ starts at 10 units. Special bulk pricing, GST invoicing, dedicated account manager. Register as a Wholesale Buyer to get started.',
  'bulk':           '📦 Bulk orders welcome! Register as a Wholesale Buyer for bulk pricing. We supply to boutiques, designers, and retailers across India.',
  'gst':            '🧾 Yes! We provide proper GST invoices for all orders. GST is charged at 5% on garments and fabrics.',
  'care':           '🫧 Khadi Care: (1) Hand wash in cold water, (2) No machine wash for delicate weaves, (3) Dry in shade, (4) Iron on medium heat while slightly damp.',
  'wash':           '🧺 Hand wash Khadi in cold water. Use mild detergent. Do not wring. Dry flat in shade. First wash may have slight color bleeding.',
  'contact':        '📞 Contact: Phone/WhatsApp: +91 78300 57297 | Email: hello@khadicraft.in | Shop: Rampur Maniharan, Saharanpur | Mon–Sat 10am–7pm',
  'hello':          '🙏 Namaste! Welcome to KhadiCraft by Goldy. I am here to help you with fabric choices, custom tailoring, measurements, and orders. How can I assist you?',
  'hi':             '🙏 Namaste! Welcome to KhadiCraft by Goldy. How can I help you today?',
  'help':           '🤝 I can help you with: Fabric selection, Custom tailoring, Measurements & appointments, Order tracking, Pricing, Shipping & returns, Wholesale orders.',
};

const searchKB = (lower) => {
  for (const [kw, ans] of Object.entries(KB)) {
    if (lower.includes(kw)) return ans;
  }
  if (/\b(deliver|ship|dispatch)\b/.test(lower))       return KB['delivery'];
  if (/\b(return|refund|exchange|back)\b/.test(lower)) return KB['return'];
  if (/\b(custom|tailor|stitch|sew)\b/.test(lower))    return KB['custom order'];
  if (/\b(measure|inch|size|chest|waist)\b/.test(lower)) return KB['measurement'];
  if (/\b(appoint|book|visit|slot)\b/.test(lower))     return KB['appointment'];
  if (/\b(pay|payment|upi|cod|cash|card)\b/.test(lower)) return KB['payment'];
  if (/\b(fabric|cloth|material)\b/.test(lower))       return KB['fabric'];
  if (/\b(price|cost|rate|kitna|amount)\b/.test(lower))return KB['price'];
  if (/\b(cotton|kapas)\b/.test(lower))                return KB['cotton'];
  if (/\b(linen|flax)\b/.test(lower))                  return KB['linen'];
  if (/\b(silk|reshmi)\b/.test(lower))                 return KB['silk'];
  if (/\b(winter|garmi|summer|garam|thanda)\b/.test(lower)) {
    return lower.includes('summer') || lower.includes('garmi') ? KB['summer fabric'] : KB['winter fabric'];
  }
  if (/\b(kurta|kurti)\b/.test(lower))                 return KB['kurta'];
  if (/\b(blazer|jacket|coat)\b/.test(lower))          return KB['blazer'];
  if (/\b(track|status|order kahan)\b/.test(lower))    return KB['track'];
  if (/\b(wholesale|bulk|retail)\b/.test(lower))       return KB['wholesale'];
  if (/\b(gst|invoice|bill|receipt)\b/.test(lower))    return KB['gst'];
  if (/\b(contact|phone|call|whatsapp|number)\b/.test(lower)) return KB['contact'];
  if (/\b(care|wash|iron|clean)\b/.test(lower))        return KB['care'];
  if (/\b(khadi|khaddar|handloom)\b/.test(lower))      return KB['khadi'];
  return null;
};

const smartFallback = async (lower) => {
  const phone = await Setting.get('site_phone', '+91 78300 57297');
  if (/\b(hello|hi|hii|hey|namaste|namaskar)\b/.test(lower))
    return '🙏 Namaste! Welcome to KhadiCraft by Goldy. I can help you with fabric choices, custom tailoring, measurements, appointments, and orders. What would you like to know?';
  if (/\b(thanks|thank|shukriya|dhanyawad)\b/.test(lower))
    return "😊 You're most welcome! Is there anything else I can help you with?";
  if (/\b(problem|issue|complaint|wrong|broken|damaged)\b/.test(lower))
    return `😔 We're sorry to hear that! Please contact us directly:\n📞 ${phone}\n✉️ hello@khadicraft.in\nWe respond within 2 hours during business hours!`;
  return `🤔 I'm not sure about that specific question. For personalized help:\n📞 Call/WhatsApp: ${phone}\n✉️ Email: hello@khadicraft.in\n🕘 Mon–Sat, 10am–7pm`;
};

// ─── Main Handler ─────────────────────────────────────────
exports.respond = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(422).json({ success: false, message: 'Message is required.' });

    const lower = message.trim().toLowerCase();

    // 1. Knowledge Base (instant, no API cost)
    const kbAnswer = searchKB(lower);
    if (kbAnswer) return res.json({ success: true, reply: kbAnswer, source: 'knowledge_base' });

    // 2. Google Gemini AI
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const systemContext = `You are a friendly customer service assistant for KhadiCraft by Goldy — a premium khadi fabric and custom tailoring shop in Rampur Maniharan, Saharanpur, Uttar Pradesh, India.
Help customers with: fabric selection, custom tailoring, measurements, appointments, order tracking, pricing, shipping, returns, and wholesale.
Keep answers concise (under 100 words). Be warm, helpful, and professional.
Pricing: fabrics from ₹280/m, ready-made from ₹599, custom stitching from ₹899.
Contact: +91 78300 57297 | hello@khadicraft.in | Mon-Sat 10am-7pm.
Respond in the same language the customer uses (Hindi, English, or Hinglish).`;

        // Build chat history
        const chatHistory = (history || []).slice(-8).filter(h => h.role && h.content).map(h => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(h.content) }],
        }));

        const chat = model.startChat({
          history: chatHistory,
          generationConfig: { maxOutputTokens: 200, temperature: 0.7 },
        });

        const result = await chat.sendMessage(`${systemContext}\n\nCustomer: ${message}`);
        const reply = result.response.text();
        return res.json({ success: true, reply, source: 'gemini' });
      } catch (e) {
        console.warn('Gemini API failed:', e.message);
      }
    }

    // 3. Smart fallback
    const fallback = await smartFallback(lower);
    res.json({ success: true, reply: fallback, source: 'fallback' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
