<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;

class PaymentController extends Controller
{
    public function createOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric|min:1',
            'currency' => 'sometimes|string|in:INR,USD',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $order = \App\Models\Order::where('id', $request->order_id)
                                 ->where('user_id', auth()->id())
                                 ->where('payment_status', 'pending')
                                 ->firstOrFail();

        $key = env('RAZORPAY_KEY');
        $secret = env('RAZORPAY_SECRET');

        if (!$key || !$secret) {
            return response()->json(['success' => false, 'message' => 'Razorpay credentials not set in .env'], 500);
        }

        // Call REAL Razorpay API to generate an Order ID
        $response = Http::withBasicAuth($key, $secret)
            ->post('https://api.razorpay.com/v1/orders', [
                'amount' => round($request->amount * 100), // Convert to paise
                'currency' => $request->currency ?? 'INR',
                'receipt' => 'rcpt_ord_' . $order->id,
            ]);

        if ($response->failed()) {
            return response()->json(['success' => false, 'message' => 'Payment Gateway Error', 'error' => $response->json()], 500);
        }

        return response()->json([
            'success' => true,
            'data' => $response->json() // Frontend needs the REAL 'id' from here
        ]);
    }

    public function verify(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'razorpay_payment_id' => 'required|string',
            'razorpay_order_id' => 'required|string',
            'razorpay_signature' => 'required|string',
            'order_id' => 'required|exists:orders,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Verify Signature Cryptographically 
        $expectedSignature = hash_hmac('sha256', $request->razorpay_order_id . '|' . $request->razorpay_payment_id, env('RAZORPAY_SECRET'));

        if (!hash_equals($expectedSignature, $request->razorpay_signature)) {
            return response()->json(['success' => false, 'message' => 'Payment signature verification failed.'], 400);
        }

        $order = \App\Models\Order::where('id', $request->order_id)
                                 ->where('user_id', auth()->id())
                                 ->firstOrFail();

        $order->update([
            'payment_status' => 'paid',
            'payment_id' => $request->razorpay_payment_id,
            'paid_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payment verified successfully.',
            'data' => $order
        ]);
    }

    public function history()
    {
        $payments = \App\Models\Order::where('user_id', auth()->id())
                                   ->where('payment_status', 'paid')
                                   ->select('id', 'order_number', 'total', 'payment_method', 'paid_at', 'created_at')
                                   ->latest('paid_at')
                                   ->paginate(20);

        return response()->json(['success' => true, 'data' => $payments]);
    }

    public function methods()
    {
        $methods = [
            [
                'id' => 'razorpay',
                'name' => 'Razorpay',
                'description' => 'Pay using UPI, Credit Card, Debit Card, or Net Banking',
                'icon' => 'razorpay-icon',
                'enabled' => true,
                'currencies' => ['INR'],
            ],
            [
                'id' => 'stripe',
                'name' => 'Stripe',
                'description' => 'Pay using Credit Card, Debit Card, or other international methods',
                'icon' => 'stripe-icon',
                'enabled' => true,
                'currencies' => ['USD', 'INR'],
            ],
            [
                'id' => 'upi',
                'name' => 'UPI',
                'description' => 'Pay using any UPI app',
                'icon' => 'upi-icon',
                'enabled' => true,
                'currencies' => ['INR'],
            ],
            [
                'id' => 'bank_transfer',
                'name' => 'Bank Transfer',
                'description' => 'Transfer directly to our bank account',
                'icon' => 'bank-icon',
                'enabled' => true,
                'currencies' => ['INR'],
            ],
            [
                'id' => 'cod',
                'name' => 'Cash on Delivery',
                'description' => 'Pay when you receive your order',
                'icon' => 'cod-icon',
                'enabled' => true,
                'currencies' => ['INR'],
            ],
        ];

        return response()->json(['success' => true, 'data' => $methods]);
    }

    public function initiateRefund(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'reason' => 'required|string|max:500',
            'amount' => 'nullable|numeric|min:1|max:',
        ]);

        $order = \App\Models\Order::where('id', $request->order_id)
                                 ->where('user_id', auth()->id())
                                 ->where('payment_status', 'paid')
                                 ->firstOrFail();

        $refundAmount = $request->amount ?? $order->total;

        if ($refundAmount > $order->total) {
            return response()->json([
                'success' => false,
                'message' => 'Refund amount cannot exceed order total.'
            ], 422);
        }

        // Create refund request (this would typically go to a refunds table)
        $refund = [
            'id' => 'refund_' . uniqid(),
            'order_id' => $order->id,
            'amount' => $refundAmount,
            'reason' => $request->reason,
            'status' => 'pending',
            'created_at' => now()->toISOString(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Refund request submitted successfully.',
            'data' => $refund
        ]);
    }

    public function refundStatus($refundId)
    {
        // This would typically check the refunds table
        // For now, return mock data
        $refund = [
            'id' => $refundId,
            'status' => 'processing',
            'amount' => 1000,
            'created_at' => now()->subHours(2)->toISOString(),
            'updated_at' => now()->subMinutes(30)->toISOString(),
        ];

        return response()->json(['success' => true, 'data' => $refund]);
    }
}
