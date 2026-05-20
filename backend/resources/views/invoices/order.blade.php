<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: DejaVu Sans, Arial, sans-serif; color: #1a1a18; font-size: 13px; }
  .header { background: #1B4332; color: #fff; padding: 28px 32px; display: flex; justify-content: space-between; align-items: flex-start; }
  .logo-text { font-size: 22px; font-weight: bold; margin-bottom: 3px; }
  .logo-sub { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #C5933A; }
  .header-right { text-align: right; font-size: 11px; color: rgba(255,255,255,0.75); line-height: 1.7; }
  .invoice-title { background: #C5933A; color: #fff; padding: 12px 32px; display: flex; justify-content: space-between; align-items: center; }
  .invoice-title h1 { font-size: 16px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; }
  .invoice-title .inv-num { font-size: 12px; }
  .body { padding: 28px 32px; }
  .two-col { display: flex; gap: 40px; margin-bottom: 24px; }
  .col { flex: 1; }
  .col-title { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; margin-bottom: 8px; font-weight: bold; }
  .col p { font-size: 12px; line-height: 1.7; color: #374151; }
  .col strong { color: #111827; display: block; font-size: 13px; margin-bottom: 2px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th { background: #f3f4f6; padding: 10px 14px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; font-weight: 600; }
  td { padding: 12px 14px; border-bottom: 1px solid #f3f4f6; font-size: 12px; color: #374151; }
  tr:last-child td { border-bottom: none; }
  .text-right { text-align: right; }
  .totals { margin-left: auto; width: 280px; }
  .totals-row { display: flex; justify-content: space-between; padding: 7px 0; font-size: 12px; color: #6b7280; border-bottom: 1px solid #f3f4f6; }
  .totals-row.total { font-size: 14px; font-weight: bold; color: #111827; border-bottom: none; padding-top: 12px; }
  .totals-row.total span:last-child { color: #1B4332; }
  .footer { background: #f9fafb; border-top: 2px solid #e5e7eb; padding: 18px 32px; display: flex; justify-content: space-between; align-items: center; }
  .footer p { font-size: 11px; color: #9ca3af; line-height: 1.7; }
  .stamp { width: 80px; height: 80px; border: 2px solid #1B4332; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-direction: column; color: #1B4332; text-align: center; }
  .stamp .s1 { font-size: 8px; text-transform: uppercase; letter-spacing: 1px; }
  .stamp .s2 { font-size: 11px; font-weight: bold; }
  .status-paid { display: inline-block; padding: 4px 12px; background: #dcfce7; color: #166534; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
  .status-pending { display: inline-block; padding: 4px 12px; background: #fef3c7; color: #92400e; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
  .gst-note { background: #f0fdf4; border-left: 3px solid #1B4332; padding: 10px 14px; margin-bottom: 20px; font-size: 11px; color: #166534; line-height: 1.6; }
</style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div>
      <div class="logo-text">KhadiCraft</div>
      <div class="logo-sub">by Goldy</div>
    </div>
    <div class="header-right">
      <div>📍 Sector 22, Chandigarh, Punjab 160022</div>
      <div>📞 +91 98765 43210</div>
      <div>✉️ hello@khadicraft.in</div>
      <div>🌐 www.khadicraft.in</div>
    </div>
  </div>

  <!-- INVOICE TITLE -->
  <div class="invoice-title">
    <h1>Tax Invoice</h1>
    <div class="inv-num">
      <div>Invoice #: KC-{{ strtoupper(substr(md5($order->order_number), 0, 8)) }}</div>
      <div>Order #: {{ $order->order_number }}</div>
      <div>Date: {{ $order->created_at->format('d M Y') }}</div>
    </div>
  </div>

  <div class="body">

    <!-- BILLED TO / FROM -->
    <div class="two-col">
      <div class="col">
        <div class="col-title">Billed To</div>
        <strong>{{ $order->ship_name }}</strong>
        <p>
          {{ $order->ship_address }}<br>
          {{ $order->ship_city }}, {{ $order->ship_state }} - {{ $order->ship_pincode }}<br>
          📞 {{ $order->ship_phone }}<br>
          ✉️ {{ $order->user->email }}
        </p>
      </div>
      <div class="col">
        <div class="col-title">Sold By</div>
        <strong>KhadiCraft by Goldy</strong>
        <p>
          Sector 22, Chandigarh, Punjab 160022<br>
          GSTIN: 03ABCDE1234F1Z5<br>
          📞 +91 98765 43210<br>
          ✉️ hello@khadicraft.in
        </p>
      </div>
      <div class="col">
        <div class="col-title">Payment Info</div>
        <p>
          <strong>Method: {{ strtoupper($order->payment_method) }}</strong>
          Status:
          @if($order->payment_status === 'paid')
            <span class="status-paid">✓ Paid</span>
          @else
            <span class="status-pending">{{ ucfirst($order->payment_status) }}</span>
          @endif<br>
          Amount Paid: ₹{{ number_format($order->paid_amount, 2) }}<br>
          Order Status: {{ ucfirst($order->status) }}
        </p>
      </div>
    </div>

    <!-- GST NOTE -->
    @if($order->gst_amount > 0)
    <div class="gst-note">
      This invoice includes GST of ₹{{ number_format($order->gst_amount, 2) }} (5% on taxable value ₹{{ number_format($order->subtotal, 2) }}).
      GSTIN: 03ABCDE1234F1Z5 | HSN Code: 5208 (Cotton Fabrics), 6211 (Garments)
    </div>
    @endif

    <!-- ITEMS TABLE -->
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Product</th>
          <th>Variant</th>
          <th class="text-right">Unit Price</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        @foreach($order->items as $i => $item)
        <tr>
          <td>{{ $i + 1 }}</td>
          <td>{{ $item->product_name }}</td>
          <td>{{ $item->variant_info ?? '—' }}</td>
          <td class="text-right">₹{{ number_format($item->price, 2) }}</td>
          <td class="text-right">{{ $item->quantity }}</td>
          <td class="text-right">₹{{ number_format($item->total, 2) }}</td>
        </tr>
        @endforeach
      </tbody>
    </table>

    <!-- TOTALS -->
    <div class="totals">
      <div class="totals-row"><span>Subtotal</span><span>₹{{ number_format($order->subtotal, 2) }}</span></div>
      <div class="totals-row"><span>Shipping</span><span>{{ $order->shipping_charge > 0 ? '₹'.number_format($order->shipping_charge, 2) : 'FREE' }}</span></div>
      @if($order->discount > 0)
      <div class="totals-row"><span>Discount</span><span>-₹{{ number_format($order->discount, 2) }}</span></div>
      @endif
      @if($order->gst_amount > 0)
      <div class="totals-row"><span>GST (5%)</span><span>₹{{ number_format($order->gst_amount, 2) }}</span></div>
      @endif
      <div class="totals-row total"><span>Total Amount</span><span>₹{{ number_format($order->total, 2) }}</span></div>
    </div>

    <!-- NOTES -->
    @if($order->notes)
    <div style="margin-top: 20px; padding: 12px; background: #fffbeb; border-radius: 6px; font-size: 11px; color: #78350f;">
      <strong>Customer Notes:</strong> {{ $order->notes }}
    </div>
    @endif

  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div>
      <p><strong>Thank you for shopping with KhadiCraft by Goldy!</strong></p>
      <p>For queries: hello@khadicraft.in | +91 98765 43210 | Mon–Sat: 10am–7pm</p>
      <p>Return policy: Ready-made items within 7 days of delivery in original condition.</p>
      <p>This is a computer-generated invoice and does not require a physical signature.</p>
    </div>
    <div class="stamp">
      <div class="s1">Verified</div>
      <div class="s2">✓</div>
      <div class="s1">KhadiCraft</div>
    </div>
  </div>

</body>
</html>
