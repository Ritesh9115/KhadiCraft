<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotController extends Controller
{
    // ── Comprehensive Knowledge Base ─────────────────────────
    private const KB = [
        // Shipping
        'shipping'        => '🚚 We offer FREE shipping on orders above ₹1,000. Standard delivery takes 4–7 business days. Custom tailored orders ship 2–3 days after they are ready (7–10 working days stitching time). COD is available Pan-India!',
        'delivery'        => '📦 Delivery time: Ready-made items 4–7 days, Custom orders 7–10 working days + 2–3 days shipping. We use Delhivery, DTDC, and Speed Post.',
        'cod'             => '💵 Yes! Cash on Delivery (COD) is available across India for all orders. You pay when your order arrives at your door.',
        'track'           => '🔍 Track your order by logging into your Account → Orders section. You can see real-time status. For custom orders, there are 10 detailed stages from fabric selection to delivery.',
        // Returns
        'return'          => '↩️ Ready-made items can be returned within 7 days of delivery if unused and in original condition. Custom stitched garments are non-refundable (made to your measurements), but we guarantee quality and will fix any stitching issues free of charge.',
        'refund'          => '💰 Refunds for eligible returns are processed within 5–7 business days to your original payment method. COD orders are refunded via bank transfer.',
        'exchange'        => '🔄 We offer size exchanges for ready-made items within 7 days. Just contact us with your order number and we will arrange a pickup.',
        // Custom tailoring
        'custom'          => '✂️ Our custom tailoring service lets you choose your fabric, design, and provide your exact measurements. Ready in 7–10 working days. Styles available: Kurta, Pajama, Shirt, Pant, Blazer, Coat, Jacket, Coat-Pant suit and more!',
        'custom order'    => '✂️ Place a custom order in 5 easy steps: 1) Choose style 2) Select fabric 3) Enter measurements 4) Add instructions 5) Confirm. We confirm your order within 4 hours with final price.',
        'tailoring'       => '🧵 Our master tailors have 30+ years of experience. Each garment is hand-crafted with precision. Custom orders take 7–10 working days from measurement confirmation.',
        'stitching'       => '🪡 Our stitching quality is guaranteed. If you are not satisfied with the fit, we will alter it free of charge. Standard allowance for alterations is included in all custom orders.',
        // Measurements
        'measurement'     => '📏 For measurements, you have 3 options: (1) Enter them yourself online (we have a detailed guide), (2) Use a saved measurement profile if you have ordered before, (3) Book a FREE home visit or shop visit — our tailor comes to your doorstep!',
        'size'            => '📐 Check our size chart on any product page. For the most accurate fit we recommend booking a free measurement appointment. Sizes available: XS to XXL and custom sizes.',
        'fit'             => '👔 We offer 3 fit types: Slim Fit, Regular Fit, and Relaxed/Loose Fit. Mention your preference in the special instructions when placing a custom order.',
        // Appointment
        'appointment'     => '📅 Book a FREE measurement appointment from the Appointments page. Choose Shop Visit (come to our store in Rampur Maniharan, Saharanpur) or Home Visit (we come to you). Available Mon–Sat, 10am–7pm.',
        'home visit'      => '🏠 Yes! We offer FREE home measurement visits in Saharanpur and nearby areas. Book from the Appointments page — select "Home Visit" and enter your address.',
        'shop'            => '🏪 Our shop is located at Rampur Maniharan, Saharanpur, Uttar Pradesh. Open Mon–Sat, 10am to 7pm. Closed on Sundays.',
        // Fabrics
        'fabric'          => '🧶 We carry: Pure Cotton Khadi, Silk-Cotton Blend, Pure Linen, Woolen Khadi, Handspun Cotton, Chanderi, and seasonal collections. All fabrics are sourced directly from certified artisans.',
        'khadi'           => '🌿 Khadi is hand-spun, hand-woven fabric — a symbol of Indian heritage. It is breathable, eco-friendly, and gets softer with every wash. We source directly from certified Khadi artisans, supporting cottage industries.',
        'cotton'          => '🌱 Our Pure Cotton Khadi is 100% natural, hand-spun and hand-woven. Perfect for all seasons, especially summer. Breathable and hypoallergenic.',
        'linen'           => '🌾 Our Linen Khadi is premium quality, perfect for hot and humid weather. Lightweight, quick-drying, and gets better with age.',
        'silk'            => '✨ Our Silk-Cotton blend combines the sheen of silk with the comfort of cotton. Great for festive and formal occasions.',
        'summer fabric'   => '☀️ For summer we recommend: Pure Cotton Khadi (most breathable), Linen Khadi (lightweight), Handspun Cotton. Avoid Woolen Khadi and heavy Silk blends in peak summer.',
        'winter fabric'   => '❄️ For winter: Woolen Khadi (warm and traditional), Silk-Cotton Blend (adds warmth), Heavy Cotton Khadi. Our Woolen Khadi jackets and coats are very popular in winter!',
        // Products
        'kurta'           => '👘 We have a wide range of Khadi Kurtas — traditional, angrakha, mandarin collar, nehru collar, and more. Available in ready-made (S to XXL) and custom stitched.',
        'blazer'          => '🧥 Our Khadi Blazers come in Cotton, Linen, and Silk-blend fabrics. Available ready-made or custom stitched to your exact measurements.',
        'suit'            => '🎩 We stitch complete Coat-Pant suits in Khadi fabric. Custom only. Takes 10–14 working days. Price starts from ₹4,999.',
        'saree'           => '🥻 We have Khadi Silk and Cotton Sarees. Also available: Khadi Dupattas and Stoles in various colors and weave patterns.',
        // Payments
        'payment'         => '💳 We accept: Cash on Delivery (COD), UPI (PhonePe/GPay/Paytm), Debit Card, Credit Card, and Net Banking. Custom orders require 50% advance payment.',
        'upi'             => '📱 Yes, UPI payments accepted — PhonePe, Google Pay, Paytm, BHIM, and all UPI apps. Instant confirmation after payment.',
        'advance'         => '💰 For custom orders, we collect 50% advance at the time of placing the order. Remaining 50% is due when your order is ready for dispatch.',
        'price'           => '🏷️ Our prices start at ₹280/meter for raw Khadi fabric, ₹599 for ready-made kurtas, ₹899 for custom stitching. Bulk and wholesale pricing available for orders above 10 units.',
        // Wholesale
        'wholesale'       => '🏭 We welcome wholesale buyers! MOQ starts at 10 units. You get: special bulk pricing, GST invoicing, dedicated account manager. Register as a Wholesale Buyer on our website to get started.',
        'bulk'            => '📦 Bulk orders welcome! Register as a Wholesale Buyer for bulk pricing. We supply to boutiques, designers, and retailers across India.',
        'gst'             => '🧾 Yes! We provide proper GST invoices for all orders. Our GSTIN: 09EXYPS2910C1Z1. GST is charged at 5% on garments and fabrics.',
        // Care instructions
        'care'            => '🫧 Khadi Care Tips: (1) Hand wash in cold water with mild detergent, (2) No machine wash for delicate weaves, (3) Dry in shade — direct sunlight fades colors, (4) Iron on medium heat while slightly damp, (5) Store folded, not on hangers.',
        'wash'            => '🧺 Hand wash Khadi in cold or lukewarm water. Use mild detergent. Do not wring — gently squeeze water out. Dry flat in shade. First wash may have slight color bleeding — wash separately.',
        // Contact
        'contact'         => '📞 Contact us: Phone/WhatsApp: +91 78300 57297 | Email: hello@khadicraft.in | Shop: Rampur Maniharan, Saharanpur | Timings: Mon–Sat 10am–7pm',
        'whatsapp'        => '💬 You can reach us on WhatsApp at +91 78300 57297. We typically reply within 30 minutes during business hours (10am–7pm, Mon–Sat).',
        'phone'           => '📞 Call or WhatsApp us at +91 78300 57297. Available Mon–Sat, 10am to 7pm.',
        // Generic
        'hello'           => '🙏 Namaste! Welcome to KhadiCraft by Goldy. I am here to help you with fabric choices, custom tailoring, measurements, orders, and more. How can I assist you today?',
        'hi'              => '🙏 Namaste! Welcome to KhadiCraft by Goldy. How can I help you today?',
        'hii'             => '🙏 Namaste! Great to have you here. Ask me anything about our fabrics, custom tailoring, or orders!',
        'help'            => '🤝 I can help you with: Fabric selection, Custom tailoring process, Measurements & appointments, Order tracking, Pricing, Shipping & returns, Wholesale orders. What would you like to know?',
    ];

    public function respond(Request $request)
    {
        $request->validate(['message' => 'required|string|max:1000']);

        $userMessage = trim($request->message);
        $lower       = strtolower($userMessage);

        // ── 1. Check knowledge base first ──────────────────
        $kbAnswer = $this->searchKnowledgeBase($lower);
        if ($kbAnswer) {
            return response()->json([
                'success' => true,
                'reply'   => $kbAnswer,
                'source'  => 'knowledge_base',
            ]);
        }

        // ── 2. Try Anthropic Claude API ─────────────────────
        $apiKey = env('ANTHROPIC_API_KEY', '');
        if ($apiKey) {
            try {
                $reply = $this->callClaude($apiKey, $userMessage, $request->history ?? []);
                return response()->json(['success' => true, 'reply' => $reply, 'source' => 'ai']);
            } catch (\Exception $e) {
                Log::warning('Chatbot Claude API failed: ' . $e->getMessage());
            }
        }

        // ── 3. Smart fallback ───────────────────────────────
        return response()->json([
            'success' => true,
            'reply'   => $this->smartFallback($lower),
            'source'  => 'fallback',
        ]);
    }

    // ── Search Knowledge Base ────────────────────────────────
    private function searchKnowledgeBase(string $lower): ?string
    {
        // Exact keyword match
        foreach (self::KB as $keyword => $answer) {
            if (str_contains($lower, $keyword)) {
                return $answer;
            }
        }

        // Fuzzy matching for common patterns
        if (preg_match('/\b(deliver|ship|dispatch)\b/', $lower))  return self::KB['delivery'];
        if (preg_match('/\b(return|refund|exchange|back)\b/', $lower)) return self::KB['return'];
        if (preg_match('/\b(custom|tailor|stitch|sew)\b/', $lower)) return self::KB['custom order'];
        if (preg_match('/\b(measure|inch|size|chest|waist)\b/', $lower)) return self::KB['measurement'];
        if (preg_match('/\b(appoint|book|visit|slot)\b/', $lower)) return self::KB['appointment'];
        if (preg_match('/\b(pay|payment|upi|cod|cash|card)\b/', $lower)) return self::KB['payment'];
        if (preg_match('/\b(fabric|cloth|material|vastra)\b/', $lower)) return self::KB['fabric'];
        if (preg_match('/\b(price|cost|rate|kitna|amount)\b/', $lower)) return self::KB['price'];
        if (preg_match('/\b(cotton|kapas)\b/', $lower))  return self::KB['cotton'];
        if (preg_match('/\b(linen|flax)\b/', $lower))    return self::KB['linen'];
        if (preg_match('/\b(silk|reshmi)\b/', $lower))   return self::KB['silk'];
        if (preg_match('/\b(winter|garmi|summer|garam|thanda)\b/', $lower)) {
            return str_contains($lower, 'summer') || str_contains($lower, 'garmi')
                ? self::KB['summer fabric']
                : self::KB['winter fabric'];
        }
        if (preg_match('/\b(kurta|kurti)\b/', $lower))   return self::KB['kurta'];
        if (preg_match('/\b(blazer|jacket|coat)\b/', $lower)) return self::KB['blazer'];
        if (preg_match('/\b(track|status|order kahan)\b/', $lower)) return self::KB['track'];
        if (preg_match('/\b(wholesale|bulk|retail)\b/', $lower)) return self::KB['wholesale'];
        if (preg_match('/\b(gst|invoice|bill|receipt)\b/', $lower)) return self::KB['gst'];
        if (preg_match('/\b(contact|phone|call|whatsapp|number)\b/', $lower)) return self::KB['contact'];
        if (preg_match('/\b(care|wash|iron|clean)\b/', $lower)) return self::KB['care'];
        if (preg_match('/\b(khadi|khaddar|handloom)\b/', $lower)) return self::KB['khadi'];

        return null;
    }

    // ── Call Claude API ──────────────────────────────────────
    private function callClaude(string $apiKey, string $message, array $history): string
    {
        $system = "You are a friendly customer service assistant for KhadiCraft by Goldy — a premium khadi fabric and custom tailoring shop in Rampur Maniharan, Saharanpur, Uttar Pradesh, India. "
            . "Help customers with: fabric selection, custom tailoring, measurements, appointments, order tracking, pricing, shipping, returns, and wholesale. "
            . "Keep answers concise (under 80 words). Be warm and helpful. "
            . "If asked about pricing: fabrics from ₹280/m, ready-made from ₹599, custom stitching from ₹899. "
            . "Contact: +91 78300 57297 | hello@khadicraft.in | Mon-Sat 10am-7pm. GSTIN: 09EXYPS2910C1Z1. "
            . "Respond in the same language the customer uses (Hindi or English or Hinglish).";

        $messages = [];
        foreach (array_slice($history, -6) as $h) {
            if (!empty($h['role']) && !empty($h['content'])) {
                $messages[] = ['role' => $h['role'], 'content' => (string)$h['content']];
            }
        }
        $messages[] = ['role' => 'user', 'content' => $message];

        $response = Http::withHeaders([
            'x-api-key'         => $apiKey,
            'anthropic-version' => '2023-06-01',
            'content-type'      => 'application/json',
        ])->timeout(10)->post('https://api.anthropic.com/v1/messages', [
            'model'      => 'claude-haiku-4-5-20251001',
            'max_tokens' => 250,
            'system'     => $system,
            'messages'   => $messages,
        ]);

        if (!$response->successful()) {
            throw new \Exception('Claude API error: ' . $response->status());
        }

        return $response->json('content.0.text', '');
    }

    // ── Smart Fallback ───────────────────────────────────────
    private function smartFallback(string $lower): string
    {
        $phone = Setting::get('site_phone', '+91 78300 57297');

        // Greeting
        if (preg_match('/\b(hello|hi|hii|hey|namaste|namaskar)\b/', $lower)) {
            return "🙏 Namaste! Welcome to KhadiCraft by Goldy. I can help you with fabric choices, custom tailoring, measurements, appointments, and orders. What would you like to know?";
        }

        // Thank you
        if (preg_match('/\b(thanks|thank|shukriya|dhanyawad)\b/', $lower)) {
            return "😊 You're most welcome! Is there anything else I can help you with? Feel free to ask about our products or services anytime!";
        }

        // Complaint/issue
        if (preg_match('/\b(problem|issue|complaint|wrong|broken|damaged)\b/', $lower)) {
            return "😔 We're sorry to hear that! Please contact us directly so we can resolve this quickly:\n📞 {$phone}\n✉️ hello@khadicraft.in\nWe respond within 2 hours during business hours!";
        }

        return "🤔 I'm not sure about that specific question. For personalized help, please:\n📞 Call/WhatsApp: {$phone}\n✉️ Email: hello@khadicraft.in\n🕘 Available Mon–Sat, 10am–7pm\n\nOr ask me about: fabrics, custom tailoring, measurements, appointments, or orders!";
    }
}
