<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\WholesaleBuyer;
use App\Models\WholesaleQuote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WholesaleController extends Controller
{
    // ── Public: Apply for wholesale account ──────────────────────
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'business_name'          => 'required|string|max:255',
            'gst_number'             => 'nullable|string|max:20',
            'business_type'          => 'nullable|string|max:100',
            'contact_name'           => 'required|string|max:255',
            'phone'                  => 'required|string|max:15',
            'email'                  => 'required|email',
            'expected_monthly_value' => 'nullable|string|max:100',
            'products_interested'    => 'nullable|array',
            'notes'                  => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // If user is logged in, link to their account; otherwise store contact info directly
        $userId = auth()->id();

        // Check if this user already applied
        if ($userId && WholesaleBuyer::where('user_id', $userId)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'You have already submitted a wholesale application.'
            ], 422);
        }

        $buyer = WholesaleBuyer::create([
            'user_id'                => $userId,
            'business_name'          => $request->business_name,
            'gst_number'             => $request->gst_number,
            'business_type'          => $request->business_type,
            'contact_name'           => $request->contact_name,
            'phone'                  => $request->phone,
            'email'                  => $request->email,
            'expected_monthly_value' => $request->expected_monthly_value,
            'products_interested'    => json_encode($request->products_interested ?? []),
            'notes'                  => $request->notes,
            'status'                 => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Wholesale application submitted! We will contact you within 48 hours.',
            'data'    => $buyer
        ], 201);
    }

    // ── Get current user's wholesale status ──────────────────────
    public function status()
    {
        $buyer = WholesaleBuyer::where('user_id', auth()->id())->first();

        if (!$buyer) {
            return response()->json(['success' => false, 'message' => 'No wholesale account found.'], 404);
        }

        return response()->json(['success' => true, 'data' => $buyer]);
    }

    // ── Request a quote (authenticated wholesale buyer) ──────────
    public function requestQuote(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'products'              => 'required|array|min:1',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.quantity'   => 'required|integer|min:1',
            'products.*.notes'      => 'nullable|string|max:500',
            'delivery_location'     => 'nullable|string|max:500',
            'notes'                 => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $buyer = WholesaleBuyer::where('user_id', auth()->id())->first();
        if (!$buyer) {
            return response()->json(['success' => false, 'message' => 'No wholesale account found.'], 403);
        }

        $quoteNumber = 'WSQ-' . strtoupper(Str::random(8));

        // Build items JSON
        $items = [];
        $total = 0;
        foreach ($request->products as $p) {
            $product   = \App\Models\Product::findOrFail($p['product_id']);
            $unitPrice = $product->wholesale_price ?? round($product->price * 0.80, 2); // 20% wholesale discount
            $lineTotal = $unitPrice * $p['quantity'];
            $total    += $lineTotal;
            $items[]   = [
                'product_id'   => $p['product_id'],
                'product_name' => $product->name,
                'quantity'     => $p['quantity'],
                'unit_price'   => $unitPrice,
                'total'        => $lineTotal,
                'notes'        => $p['notes'] ?? null,
            ];
        }

        $quote = WholesaleQuote::create([
            'buyer_id'          => $buyer->id,
            'user_id'           => auth()->id(),
            'quote_number'      => $quoteNumber,
            'status'            => 'pending',
            'total'             => $total,
            'total_amount'      => $total,
            'items'             => json_encode($items),
            'delivery_location' => $request->delivery_location,
            'notes'             => $request->notes,
            'valid_until'       => now()->addDays(7),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Quote request submitted. You will receive a quotation within 24–48 hours.',
            'data'    => $quote
        ], 201);
    }

    // ── List user's quotes ───────────────────────────────────────
    public function myQuotes()
    {
        $buyer = WholesaleBuyer::where('user_id', auth()->id())->first();

        if (!$buyer) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $quotes = WholesaleQuote::where('buyer_id', $buyer->id)
                               ->latest()
                               ->paginate(10);

        return response()->json(['success' => true, 'data' => $quotes]);
    }

    // ── Product catalog ──────────────────────────────────────────
    public function catalog()
    {
        $products = \App\Models\Product::where('is_active', true)
                                      ->with('category')
                                      ->paginate(20);

        return response()->json(['success' => true, 'data' => $products]);
    }

    // ── Wholesale apply (alias for register, used by frontend) ───
    public function apply(Request $request)
    {
        return $this->register($request);
    }
}
