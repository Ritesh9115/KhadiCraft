<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{WholesaleBuyer, WholesaleQuote, User};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminWholesaleController extends Controller
{
    public function buyers(Request $request)
    {
        $query = WholesaleBuyer::with('user');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('business_name', 'like', '%' . $request->search . '%')
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', '%' . $request->search . '%')
                                             ->orWhere('email', 'like', '%' . $request->search . '%'));
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->business_type) {
            $query->where('business_type', $request->business_type);
        }

        $buyers = $query->latest()->paginate(20);

        return response()->json(['success' => true, 'data' => $buyers]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,approved,rejected,suspended'
        ]);

        $buyer = WholesaleBuyer::findOrFail($id);
        $oldStatus = $buyer->status;
        $buyer->update(['status' => $request->status]);

        // Send notification to user
        $user = User::find($buyer->user_id);
        if ($user) {
            // Create notification logic here
        }

        return response()->json([
            'success' => true,
            'message' => 'Buyer status updated successfully.',
            'data' => $buyer
        ]);
    }

    public function setDiscount(Request $request, $id)
    {
        $request->validate([
            'discount_percentage' => 'required|numeric|min:0|max:50'
        ]);

        $buyer = WholesaleBuyer::findOrFail($id);
        $buyer->update(['discount_percentage' => $request->discount_percentage]);

        return response()->json([
            'success' => true,
            'message' => 'Discount updated successfully.',
            'data' => $buyer
        ]);
    }

    public function quotes(Request $request)
    {
        $query = WholesaleQuote::with('buyer.user');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('quote_number', 'like', '%' . $request->search . '%')
                  ->orWhereHas('buyer.user', fn($u) => $u->where('name', 'like', '%' . $request->search . '%'));
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $quotes = $query->latest()->paginate(20);

        return response()->json(['success' => true, 'data' => $quotes]);
    }

    public function updateQuote(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,reviewed,quoted,accepted,rejected,expired',
            'notes' => 'nullable|string|max:1000',
            'valid_until' => 'nullable|date|after:today'
        ]);

        $quote = WholesaleQuote::findOrFail($id);
        // Update items JSON if provided
        if ($request->has('items')) {
            $data['items'] = json_encode($request->items);
            $totalAmount = collect($request->items)->sum(fn($i) => ($i['unit_price'] ?? 0) * ($i['quantity'] ?? 1));
            $data['total_amount'] = $totalAmount;
            $data['total']        = $totalAmount;
        }

        $quote->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Quote updated successfully.',
            'data'    => $quote
        ]);
    }

    public function showQuote($id)
    {
        $quote = WholesaleQuote::with('buyer.user')->findOrFail($id);
        return response()->json(['success' => true, 'data' => $quote]);
    }

    public function generateInvoice($id)
    {
        $quote = WholesaleQuote::with('buyer.user')->findOrFail($id);

        if ($quote->status !== 'accepted') {
            return response()->json([
                'success' => false,
                'message' => 'Invoice can only be generated for accepted quotes.'
            ], 422);
        }

        // Generate PDF invoice logic here
        // For now, return success
        return response()->json([
            'success' => true,
            'message' => 'Invoice generated successfully.',
            'data' => $quote
        ]);
    }

    public function createQuote(Request $request)
    {
        $request->validate([
            'buyer_id' => 'required|exists:wholesale_buyers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:1000',
            'valid_until' => 'required|date|after:today'
        ]);

        $quote = WholesaleQuote::create([
            'buyer_id' => $request->buyer_id,
            'quote_number' => 'WS-' . strtoupper(uniqid()),
            'status' => 'pending',
            'notes' => $request->notes,
            'valid_until' => $request->valid_until,
        ]);

        $totalAmount = 0;
        foreach ($request->items as $item) {
            $unitPrice = $item['unit_price'] ?? $this->getWholesalePrice($item['product_id'], $request->buyer_id);
            $totalPrice = $item['quantity'] * $unitPrice;
            
            $quote->items()->create([
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'unit_price' => $unitPrice,
                'total_price' => $totalPrice,
            ]);
            
            $totalAmount += $totalPrice;
        }

        $quote->update(['total_amount' => $totalAmount]);

        return response()->json([
            'success' => true,
            'message' => 'Quote created successfully.',
            'data' => $quote->load('items.product')
        ], 201);
    }

    private function getWholesalePrice($productId, $buyerId)
    {
        // Logic to get wholesale price based on product and buyer discount
        $product = \App\Models\Product::find($productId);
        $buyer = WholesaleBuyer::find($buyerId);
        
        $basePrice = $product->wholesale_price ?? $product->price;
        $discount = $buyer->discount_percentage ?? 0;
        
        return $basePrice * (1 - $discount / 100);
    }

    public function deleteQuote($id)
    {
        $quote = WholesaleQuote::findOrFail($id);

        if ($quote->status === 'accepted') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete an accepted quote.'
            ], 422);
        }

        $quote->delete();

        return response()->json(['success' => true, 'message' => 'Quote deleted successfully.']);
    }

    public function buyerStats()
    {
        $stats = [
            'total_buyers' => WholesaleBuyer::count(),
            'pending_buyers' => WholesaleBuyer::where('status', 'pending')->count(),
            'approved_buyers' => WholesaleBuyer::where('status', 'approved')->count(),
            'total_quotes' => WholesaleQuote::count(),
            'pending_quotes' => WholesaleQuote::where('status', 'pending')->count(),
            'accepted_quotes' => WholesaleQuote::where('status', 'accepted')->count(),
            'total_quote_value' => WholesaleQuote::where('status', 'accepted')->sum('total_amount'),
        ];

        return response()->json(['success' => true, 'data' => $stats]);
    }
}
