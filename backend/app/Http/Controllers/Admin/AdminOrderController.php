<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Order, OrderItem, CustomOrder, CustomOrderStage, User, Notification};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class AdminOrderController extends Controller
{
    // ─── LIST ORDERS ──────────────────────────────────────
    public function index(Request $request)
    {
        $query = Order::with(['user','items']);

        if ($request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('order_number','like',"%$s%")
                  ->orWhereHas('user', fn($u) => $u->where('name','like',"%$s%")->orWhere('email','like',"%$s%"));
            });
        }
        if ($request->status)         $query->where('status', $request->status);
        if ($request->payment_status) $query->where('payment_status', $request->payment_status);
        if ($request->payment_method) $query->where('payment_method', $request->payment_method);
        if ($request->date_from)      $query->whereDate('created_at', '>=', $request->date_from);
        if ($request->date_to)        $query->whereDate('created_at', '<=', $request->date_to);

        $orders = $query->latest()->paginate($request->per_page ?? 20);
        return response()->json(['success' => true, 'data' => $orders]);
    }

    public function show($id)
    {
        $order = Order::with(['user','items.product','items.variant'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $order]);
    }

    // ─── UPDATE ORDER STATUS ──────────────────────────────
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,processing,ready,dispatched,delivered,cancelled,returned',
        ]);

        $order = Order::findOrFail($id);
        $old = $order->status;
        $order->update(['status' => $request->status]);

        if ($request->status === 'delivered') {
            $order->update(['delivered_at' => now()]);
        }

        // Notify customer
        Notification::create([
            'user_id'    => $order->user_id,
            'title'      => 'Order Status Updated',
            'message'    => "Your order #{$order->order_number} status changed to: " . ucfirst($request->status),
            'type'       => 'order',
            'action_url' => "/orders/{$order->order_number}",
        ]);

        return response()->json([
            'success' => true,
            'message' => "Order status updated from $old to {$request->status}.",
        ]);
    }

    public function updatePaymentStatus(Request $request, $id)
    {
        $request->validate(['payment_status' => 'required|in:pending,paid,partial,failed,refunded']);
        $order = Order::findOrFail($id);
        $order->update(['payment_status' => $request->payment_status]);
        return response()->json(['success' => true, 'message' => 'Payment status updated.']);
    }

    public function updateTracking(Request $request, $id)
    {
        $request->validate(['tracking_number' => 'required|string', 'courier' => 'nullable|string']);
        $order = Order::findOrFail($id);
        $order->update(['tracking_number' => $request->tracking_number, 'courier' => $request->courier]);

        Notification::create([
            'user_id'    => $order->user_id,
            'title'      => 'Order Dispatched',
            'message'    => "Your order #{$order->order_number} has been dispatched via {$request->courier}. Tracking: {$request->tracking_number}",
            'type'       => 'order',
        ]);

        return response()->json(['success' => true, 'message' => 'Tracking info updated.']);
    }

    public function addNote(Request $request, $id)
    {
        $request->validate(['note' => 'required|string']);
        $order = Order::findOrFail($id);
        $order->update(['admin_notes' => $request->note]);
        return response()->json(['success' => true, 'message' => 'Note saved.']);
    }

    public function generateInvoice($id)
    {
        $order = Order::with(['user','items.product'])->findOrFail($id);
        // Using barryvdh/laravel-dompdf
        $pdf = Pdf::loadView('invoices.order', compact('order'));
        return $pdf->download("invoice-{$order->order_number}.pdf");
    }

    // ─── REVIEWS ──────────────────────────────────────────
    public function reviews(Request $request)
    {
        $reviews = \App\Models\Review::with(['user','product'])
            ->when($request->approved, fn($q) => $q->where('is_approved', true))
            ->when($request->pending,  fn($q) => $q->where('is_approved', false))
            ->latest()->paginate(20);
        return response()->json(['success' => true, 'data' => $reviews]);
    }

    public function approveReview($id)
    {
        $review = \App\Models\Review::findOrFail($id);
        $review->update(['is_approved' => !$review->is_approved]);
        return response()->json(['success' => true, 'is_approved' => $review->is_approved]);
    }

    public function replyReview(Request $request, $id)
    {
        $request->validate(['reply' => 'required|string']);
        \App\Models\Review::findOrFail($id)->update(['admin_reply' => $request->reply]);
        return response()->json(['success' => true, 'message' => 'Reply saved.']);
    }

    public function deleteReview($id)
    {
        \App\Models\Review::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Review deleted.']);
    }
}
