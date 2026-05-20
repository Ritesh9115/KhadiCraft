<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomOrder;
use App\Models\CustomOrderStage;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;

class AdminCustomOrderController extends Controller
{
    private const STAGES = [
        'order_placed','fabric_selected','measurement_received',
        'cutting','stitching','finishing','quality_check','ready','dispatched','delivered'
    ];

    public function index(Request $request)
    {
        $query = CustomOrder::with(['user','assignedTailor']);

        if ($request->search) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('custom_order_number','like',"%$s%")
                  ->orWhereHas('user', fn($u) => $u->where('name','like',"%$s%"));
            });
        }
        if ($request->status)      $query->where('status', $request->status);
        if ($request->tailor_id)   $query->where('assigned_tailor_id', $request->tailor_id);
        if ($request->style_type)  $query->where('style_type', $request->style_type);
        if ($request->date_from)   $query->whereDate('created_at','>=',$request->date_from);
        if ($request->date_to)     $query->whereDate('created_at','<=',$request->date_to);

        return response()->json(['success' => true, 'data' => $query->latest()->paginate(20)]);
    }

    public function show($id)
    {
        $order = CustomOrder::with(['user','assignedTailor','stages'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $order]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,fabric_selected,measurement_received,cutting,stitching,finishing,quality_check,ready,dispatched,delivered,cancelled'
        ]);

        $order = CustomOrder::findOrFail($id);
        $order->update(['status' => $request->status]);

        // Auto-create stage record
        CustomOrderStage::updateOrCreate(
            ['custom_order_id' => $order->id, 'stage' => $request->status],
            ['status' => 'completed', 'completed_at' => now(), 'notes' => $request->notes]
        );

        Notification::create([
            'user_id'    => $order->user_id,
            'title'      => 'Custom Order Update',
            'message'    => "Your custom order #{$order->custom_order_number} is now: " . str_replace('_',' ', ucfirst($request->status)),
            'type'       => 'custom',
            'action_url' => "/custom-orders/{$order->custom_order_number}",
        ]);

        return response()->json(['success' => true, 'message' => 'Custom order status updated.']);
    }

    public function assignTailor(Request $request, $id)
    {
        $request->validate(['tailor_id' => 'required|exists:users,id']);
        $tailor = User::where('id', $request->tailor_id)->where('role','tailor')->firstOrFail();
        $order  = CustomOrder::findOrFail($id);
        $order->update(['assigned_tailor_id' => $tailor->id]);

        Notification::create([
            'user_id' => $tailor->id,
            'title'   => 'New Order Assigned',
            'message' => "Custom order #{$order->custom_order_number} has been assigned to you.",
            'type'    => 'order',
        ]);

        return response()->json(['success' => true, 'message' => "Order assigned to {$tailor->name}."]);
    }

    public function setPrice(Request $request, $id)
    {
        $request->validate(['final_price' => 'required|numeric|min:0', 'estimated_ready_date' => 'nullable|date']);
        $order = CustomOrder::findOrFail($id);
        $order->update([
            'final_price'          => $request->final_price,
            'estimated_ready_date' => $request->estimated_ready_date,
        ]);

        Notification::create([
            'user_id' => $order->user_id,
            'title'   => 'Custom Order Priced',
            'message' => "Your custom order #{$order->custom_order_number} has been priced at ₹{$request->final_price}",
            'type'    => 'custom',
        ]);

        return response()->json(['success' => true, 'message' => 'Price set successfully.']);
    }

    public function addNote(Request $request, $id)
    {
        $request->validate(['note' => 'required|string']);
        CustomOrder::findOrFail($id)->update(['admin_notes' => $request->note]);
        return response()->json(['success' => true]);
    }

    public function getStages($id)
    {
        $order     = CustomOrder::findOrFail($id);
        $completed = CustomOrderStage::where('custom_order_id', $id)->pluck('status','stage');

        $stages = collect(self::STAGES)->map(fn($stage) => [
            'stage'      => $stage,
            'label'      => str_replace('_',' ', ucfirst($stage)),
            'status'     => $completed[$stage] ?? 'pending',
            'is_current' => $order->status === $stage,
        ]);

        return response()->json(['success' => true, 'data' => $stages]);
    }
}
