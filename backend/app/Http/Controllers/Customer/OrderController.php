<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::where('user_id', auth()->id());

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $orders = $query->latest()->paginate(10);

        return response()->json(['success' => true, 'data' => $orders]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.variant_id' => 'nullable|exists:product_variants,id',
            'shipping_address_id' => 'required|exists:addresses,id',
            'payment_method' => 'required|in:cod,online,upi,bank_transfer,razorpay',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $orderNumber = 'ORD-' . strtoupper(uniqid());
            $totalAmount = 0;

            $order = Order::create([
                'user_id' => auth()->id(),
                'order_number' => $orderNumber,
                'shipping_address_id' => $request->shipping_address_id,
                'payment_method' => $request->payment_method,
                'payment_status' => 'pending',
                'status' => 'pending',
                'notes' => $request->notes ?? '',
                'subtotal' => 0,
                'shipping_cost' => 0,
                'tax' => 0,
                'total' => 0,
            ]);

            foreach ($request->items as $item) {
                $product = \App\Models\Product::findOrFail($item['product_id']);
                
                // FIXED: Check Stock
                if ($product->stock < $item['quantity']) {
                    throw new \Exception("Product '{$product->name}' is out of stock.");
                }

                $variant = null;
                // FIXED: Prevent "Undefined Array Key" error
                if (!empty($item['variant_id'])) {
                    $variant = \App\Models\ProductVariant::findOrFail($item['variant_id']);
                    if ($variant->stock < $item['quantity']) {
                        throw new \Exception("Variant is out of stock.");
                    }
                }

                $price = $variant?->price ?? $product->sale_price ?? $product->price;
                $itemTotal = $price * $item['quantity'];
                $totalAmount += $itemTotal;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'variant_id' => $variant ? $variant->id : null,
                    'quantity' => $item['quantity'],
                    'price' => $price,
                    'total' => $itemTotal,
                ]);

                // Update stock
                $product->decrement('stock', $item['quantity']);
                if ($variant) $variant->decrement('stock', $item['quantity']);
            }

            $shippingCost = $this->calculateShipping($totalAmount);
            $tax = $totalAmount * 0.18; // 18% GST
            $finalTotal = $totalAmount + $shippingCost + $tax;

            $order->update([
                'subtotal' => $totalAmount,
                'shipping_cost' => $shippingCost,
                'tax' => $tax,
                'total' => $finalTotal,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully.',
                'data' => $order->load(['items.product', 'items.variant'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422); // Return 422 so frontend can show the error
        }
    }

    private function calculateShipping($totalAmount)
    {
        // Free shipping for orders above 999
        if ($totalAmount >= 999) {
            return 0;
        }
        
        // Standard shipping rates
        return 50; // Fixed shipping cost
    }

    public function show($orderNumber)
    {
        $order = Order::where('user_id', auth()->id())
                     ->where('order_number', $orderNumber)
                     ->with(['items.product', 'items.variant', 'shippingAddress'])
                     ->firstOrFail();

        return response()->json(['success' => true, 'data' => $order]);
    }

    public function cancel($id)
    {
        $order = Order::where('user_id', auth()->id())->findOrFail($id);

        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Order cannot be cancelled at this stage.'
            ], 422);
        }

        $order->update(['status' => 'cancelled']);

        // Restore product stock
        foreach ($order->items as $item) {
            $item->product->increment('stock', $item->quantity);
            if ($item->variant) {
                $item->variant->increment('stock', $item->quantity);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Order cancelled successfully.'
        ]);
    }

    public function invoice($id)
    {
        $order = Order::where('user_id', auth()->id())
                     ->with(['items.product', 'items.variant', 'shippingAddress'])
                     ->findOrFail($id);

        $pdf = Pdf::loadView('invoices.customer', compact('order'));
        return $pdf->download("invoice-{$order->order_number}.pdf");
    }

    public function track($orderNumber)
    {
        $order = Order::where('user_id', auth()->id())
                     ->where('order_number', $orderNumber)
                     ->firstOrFail();

        $tracking = [
            'order_number' => $order->order_number,
            'status' => $order->status,
            'payment_status' => $order->payment_status,
            'tracking_number' => $order->tracking_number,
            'courier' => $order->courier,
            'estimated_delivery' => $order->estimated_delivery,
            'delivered_at' => $order->delivered_at,
            'timeline' => $this->getOrderTimeline($order),
        ];

        return response()->json(['success' => true, 'data' => $tracking]);
    }

    
    private function getOrderTimeline($order)
    {
        $timeline = [
            [
                'status' => 'pending',
                'title' => 'Order Placed',
                'description' => 'Your order has been received.',
                'completed_at' => $order->created_at,
                'is_completed' => true,
            ]
        ];

        if ($order->status === 'confirmed' || in_array($order->status, ['processing', 'ready', 'dispatched', 'delivered'])) {
            $timeline[] = [
                'status' => 'confirmed',
                'title' => 'Order Confirmed',
                'description' => 'Your order has been confirmed and is being processed.',
                'completed_at' => $order->updated_at,
                'is_completed' => true,
            ];
        }

        if (in_array($order->status, ['processing', 'ready', 'dispatched', 'delivered'])) {
            $timeline[] = [
                'status' => 'processing',
                'title' => 'Processing',
                'description' => 'Your order is being prepared for shipment.',
                'completed_at' => $order->updated_at,
                'is_completed' => true,
            ];
        }

        if (in_array($order->status, ['ready', 'dispatched', 'delivered'])) {
            $timeline[] = [
                'status' => 'ready',
                'title' => 'Ready for Dispatch',
                'description' => 'Your order is ready and will be dispatched soon.',
                'completed_at' => $order->updated_at,
                'is_completed' => true,
            ];
        }

        if (in_array($order->status, ['dispatched', 'delivered'])) {
            $timeline[] = [
                'status' => 'dispatched',
                'title' => 'Dispatched',
                'description' => "Your order has been dispatched via {$order->courier}.",
                'completed_at' => $order->updated_at,
                'is_completed' => true,
            ];
        }

        if ($order->status === 'delivered') {
            $timeline[] = [
                'status' => 'delivered',
                'title' => 'Delivered',
                'description' => 'Your order has been delivered successfully.',
                'completed_at' => $order->delivered_at,
                'is_completed' => true,
            ];
        }

        if ($order->status === 'cancelled') {
            $timeline[] = [
                'status' => 'cancelled',
                'title' => 'Order Cancelled',
                'description' => 'Your order has been cancelled.',
                'completed_at' => $order->updated_at,
                'is_completed' => true,
            ];
        }

        return $timeline;
    }
}
