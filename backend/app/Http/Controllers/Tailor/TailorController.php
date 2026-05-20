<?php

namespace App\Http\Controllers\Tailor;

use App\Http\Controllers\Controller;
use App\Models\CustomOrder;
use App\Models\CustomOrderStage;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TailorController extends Controller
{
    private const STAGE_ORDER = [
        'pending', 'confirmed', 'fabric_selected',
        'measurement_received', 'cutting', 'stitching',
        'finishing', 'quality_check', 'ready', 'dispatched', 'delivered'
    ];

    // ── Dashboard ────────────────────────────────────────────
    public function dashboard()
    {
        $tailorId = auth()->id();

        $orders = CustomOrder::where('assigned_tailor_id', $tailorId)
            ->with('user')
            ->get();

        $inProgressStatuses = ['fabric_selected', 'measurement_received', 'cutting', 'stitching', 'finishing', 'quality_check'];

        // Overdue = past estimated date and not ready/delivered
        $delayed = $orders->filter(function ($o) {
            return $o->estimated_ready_date
                && Carbon::parse($o->estimated_ready_date)->isPast()
                && !in_array($o->status, ['ready', 'delivered', 'cancelled']);
        });

        // Due today
        $dueToday = $orders->filter(function ($o) {
            return $o->estimated_ready_date
                && Carbon::parse($o->estimated_ready_date)->isToday()
                && !in_array($o->status, ['delivered', 'cancelled']);
        });

        // Active (not delivered/cancelled)
        $active = $orders->whereNotIn('status', ['delivered', 'cancelled']);

        return response()->json([
            'success' => true,
            'data' => [
                'total'           => $orders->count(),
                'active'          => $active->count(),
                'in_progress'     => $orders->whereIn('status', $inProgressStatuses)->count(),
                'ready_today'     => $orders->where('status', 'ready')->count(),
                'due_today'       => $dueToday->count(),
                'delayed'         => $delayed->count(),
                'completed_month' => $orders->where('status', 'delivered')
                    ->where('updated_at', '>=', Carbon::now()->startOfMonth())->count(),
                'orders'          => $active->values(),
                'delayed_orders'  => $delayed->values(),
            ]
        ]);
    }

    // ── All Assigned Orders ──────────────────────────────────
    public function assignedOrders(Request $request)
    {
        $query = CustomOrder::where('assigned_tailor_id', auth()->id())
            ->with(['user'])
            ->whereNotIn('status', ['delivered', 'cancelled']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $orders = $query->orderByRaw("
            CASE status
                WHEN 'cutting'              THEN 1
                WHEN 'stitching'            THEN 2
                WHEN 'finishing'            THEN 3
                WHEN 'quality_check'        THEN 4
                WHEN 'ready'               THEN 5
                WHEN 'fabric_selected'     THEN 6
                WHEN 'measurement_received' THEN 7
                WHEN 'confirmed'           THEN 8
                ELSE 9
            END
        ")->get();

        return response()->json(['success' => true, 'data' => $orders]);
    }

    // ── Single Order Detail ──────────────────────────────────
    public function orderDetail($id)
    {
        $order = CustomOrder::where('assigned_tailor_id', auth()->id())
            ->with([
                'user',
                'stages' => fn($q) => $q->orderBy('created_at'),
                'measurementProfile',
            ])
            ->findOrFail($id);

        // Build stage progress
        $stageProgress = [];
        $completedStages = $order->stages->keyBy('stage');
        $currentIdx = array_search($order->status, self::STAGE_ORDER);

        foreach (self::STAGE_ORDER as $idx => $stage) {
            $stageProgress[] = [
                'stage'        => $stage,
                'label'        => $this->stageLabel($stage),
                'status'       => isset($completedStages[$stage]) ? $completedStages[$stage]->status : 'pending',
                'is_current'   => $stage === $order->status,
                'is_done'      => $idx < $currentIdx,
                'completed_at' => $completedStages[$stage]->completed_at ?? null,
                'notes'        => $completedStages[$stage]->notes ?? null,
            ];
        }

        return response()->json([
            'success'        => true,
            'data'           => $order,
            'stage_progress' => $stageProgress,
            'next_stage'     => $this->getNextStage($order->status),
        ]);
    }

    // ── Update Stage ─────────────────────────────────────────
    public function updateStage(Request $request, $id)
    {
        $request->validate([
            'stage' => 'required|string|in:' . implode(',', self::STAGE_ORDER),
            'notes' => 'nullable|string|max:500',
        ]);

        $order = CustomOrder::where('assigned_tailor_id', auth()->id())->findOrFail($id);

        // Validate forward-only progression (with exceptions for admin override)
        $currentIdx = array_search($order->status, self::STAGE_ORDER);
        $newIdx     = array_search($request->stage, self::STAGE_ORDER);

        if ($newIdx < $currentIdx) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot go back to a previous stage. Contact admin if needed.'
            ], 422);
        }

        $old = $order->status;
        $order->update(['status' => $request->stage]);

        // Log the stage
        CustomOrderStage::updateOrCreate(
            ['custom_order_id' => $order->id, 'stage' => $request->stage],
            [
                'status'       => 'completed',
                'completed_at' => now(),
                'notes'        => $request->notes,
            ]
        );

        // Set actual ready date when marking ready
        if ($request->stage === 'ready') {
            $order->update(['actual_ready_date' => now()->toDateString()]);
        }

        // Notify customer
        $stageMessages = [
            'cutting'       => 'Your order is now in the cutting stage. Our tailor has started working on your garment! ✂️',
            'stitching'     => 'Stitching has begun on your custom order! 🧵',
            'finishing'     => 'Your garment is in the finishing stage — almost done! 🎨',
            'quality_check' => 'Your order is undergoing quality check to ensure perfect fit and finish! ✅',
            'ready'         => 'Great news! Your custom order is READY! We will dispatch it soon. 🎉',
        ];

        if (isset($stageMessages[$request->stage])) {
            Notification::create([
                'user_id'    => $order->user_id,
                'title'      => 'Custom Order Update — ' . $this->stageLabel($request->stage),
                'message'    => $stageMessages[$request->stage] . " Order: #{$order->custom_order_number}",
                'type'       => 'custom',
                'action_url' => "/account/custom-orders/{$order->custom_order_number}",
            ]);
        }

        return response()->json([
            'success'    => true,
            'message'    => "Stage updated: {$this->stageLabel($old)} → {$this->stageLabel($request->stage)}",
            'old_stage'  => $old,
            'new_stage'  => $request->stage,
            'next_stage' => $this->getNextStage($request->stage),
        ]);
    }

    // ── Add Note ─────────────────────────────────────────────
    public function addNote(Request $request, $id)
    {
        $request->validate(['note' => 'required|string|max:1000']);
        $order = CustomOrder::where('assigned_tailor_id', auth()->id())->findOrFail($id);
        $existing = $order->tailor_notes ? $order->tailor_notes . "\n\n" : '';
        $order->update([
            'tailor_notes' => $existing . '[' . now()->format('d M, H:i') . '] ' . $request->note
        ]);
        return response()->json(['success' => true, 'message' => 'Note saved.']);
    }

    // ── Workload Stats ───────────────────────────────────────
    public function workload()
    {
        $tailorId = auth()->id();
        $stats = CustomOrder::where('assigned_tailor_id', $tailorId)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $completedThisMonth = CustomOrder::where('assigned_tailor_id', $tailorId)
            ->where('status', 'delivered')
            ->where('updated_at', '>=', Carbon::now()->startOfMonth())
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'by_status'            => $stats,
                'completed_this_month' => $completedThisMonth,
            ]
        ]);
    }

    // ── Helpers ──────────────────────────────────────────────
    private function stageLabel(string $stage): string
    {
        return match ($stage) {
            'pending'              => 'Order Pending',
            'confirmed'            => 'Order Confirmed',
            'fabric_selected'      => 'Fabric Selected',
            'measurement_received' => 'Measurements Received',
            'cutting'              => 'Cutting',
            'stitching'            => 'Stitching',
            'finishing'            => 'Finishing',
            'quality_check'        => 'Quality Check',
            'ready'                => 'Ready for Dispatch',
            'dispatched'           => 'Dispatched',
            'delivered'            => 'Delivered',
            default                => ucfirst(str_replace('_', ' ', $stage)),
        };
    }

    private function getNextStage(string $current): ?string
    {
        $idx = array_search($current, self::STAGE_ORDER);
        if ($idx === false || $idx >= count(self::STAGE_ORDER) - 1) return null;
        return self::STAGE_ORDER[$idx + 1];
    }
}
