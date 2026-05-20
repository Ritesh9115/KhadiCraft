<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\CustomOrder;
use App\Models\CustomOrderStage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CustomOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = CustomOrder::where('user_id', auth()->id());

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $orders = $query->latest()->paginate(10);

        return response()->json(['success' => true, 'data' => $orders]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'style_type'             => 'required|string|max:255',
            'fabric_product_id'      => 'nullable|integer',
            'fabric_name'            => 'nullable|string|max:255',
            'fabric_preference'      => 'nullable|string|max:500',
            'measurement_profile_id' => 'nullable|integer',
            'special_instructions'   => 'nullable|string|max:2000',
            'notes'                  => 'nullable|string|max:2000',
            'estimated_ready_date'   => 'nullable|date|after:today',
            // Individual measurement fields
            'chest'          => 'nullable|numeric|min:0|max:100',
            'waist'          => 'nullable|numeric|min:0|max:100',
            'hips'           => 'nullable|numeric|min:0|max:100',
            'shoulder'       => 'nullable|numeric|min:0|max:100',
            'shirt_length'   => 'nullable|numeric|min:0|max:100',
            'pant_length'    => 'nullable|numeric|min:0|max:100',
            'sleeve_length'  => 'nullable|numeric|min:0|max:100',
            'neck'           => 'nullable|numeric|min:0|max:100',
            'thigh'          => 'nullable|numeric|min:0|max:100',
            'inseam'         => 'nullable|numeric|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $orderNumber = 'CUST-' . strtoupper(uniqid());

            // Build measurements JSON from individual fields
            $measureFields = ['chest','waist','hips','shoulder','shirt_length','pant_length','sleeve_length','neck','thigh','inseam'];
            $measurementsJson = [];
            foreach ($measureFields as $field) {
                if ($request->filled($field)) {
                    $measurementsJson[$field] = (float) $request->$field;
                }
            }

            $order = CustomOrder::create([
                'user_id'                => auth()->id(),
                'custom_order_number'    => $orderNumber,
                'style_type'             => $request->style_type,
                'fabric_product_id'      => $request->fabric_product_id,
                'fabric_name'            => $request->fabric_name,
                'fabric_preference'      => $request->fabric_preference,
                'measurement_profile_id' => $request->measurement_profile_id,
                'measurements'           => !empty($measurementsJson) ? json_encode($measurementsJson) : null,
                // Individual measurement columns
                'chest'         => $request->chest,
                'waist'         => $request->waist,
                'hips'          => $request->hips,
                'shoulder'      => $request->shoulder,
                'shirt_length'  => $request->shirt_length,
                'pant_length'   => $request->pant_length,
                'sleeve_length' => $request->sleeve_length,
                'neck'          => $request->neck,
                'thigh'         => $request->thigh,
                'inseam'        => $request->inseam,
                'special_instructions' => $request->special_instructions,
                'notes'                => $request->notes,
                'estimated_ready_date' => $request->estimated_ready_date,
                'status'               => 'pending',
            ]);

            // Handle reference images upload
            if ($request->hasFile('reference_images')) {
                $images = [];
                foreach ($request->file('reference_images') as $image) {
                    $path = $image->store('custom-orders/references', 'public');
                    $images[] = ['path' => $path, 'original_name' => $image->getClientOriginalName()];
                }
                $order->update(['reference_images' => $images]); // cast handles JSON
            } elseif ($request->hasFile('image')) {
                // Single image fallback
                $path = $request->file('image')->store('custom-orders/references', 'public');
                $order->update(['reference_images' => [['path' => $path, 'original_name' => $request->file('image')->getClientOriginalName()]]]);
            }

            // Create initial stage record (only columns that exist in DB)
            CustomOrderStage::create([
                'custom_order_id' => $order->id,
                'stage'           => 'pending',
                'status'          => 'completed',
                'completed_at'    => now(),
                'notes'           => 'Order placed successfully',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Custom order placed successfully.',
                'data'    => $order
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to place custom order: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($number)
    {
        $order = CustomOrder::where('user_id', auth()->id())
                          ->where('custom_order_number', $number)
                          ->with(['assignedTailor', 'stages', 'measurementProfile'])
                          ->firstOrFail();

        return response()->json(['success' => true, 'data' => $order]);
    }

    public function cancel($id)
    {
        $order = CustomOrder::where('user_id', auth()->id())->findOrFail($id);

        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Order cannot be cancelled at this stage.'
            ], 422);
        }

        $order->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Custom order cancelled successfully.'
        ]);
    }

    public function uploadReference(Request $request, $id)
    {
        $order = CustomOrder::where('user_id', auth()->id())->findOrFail($id);

        if (!in_array($order->status, ['pending', 'confirmed', 'fabric_selected'])) {
            return response()->json([
                'success' => false,
                'message' => 'Reference images cannot be uploaded at this stage.'
            ], 422);
        }

        $request->validate([
            'reference_images' => 'required|array|max:3',
            'reference_images.*' => 'image|max:2048',
        ]);

        try {
            $existingImages = json_decode($order->reference_images ?? '[]', true) ?? [];
            $newImages = [];

            foreach ($request->file('reference_images') as $image) {
                $path = $image->store('custom-orders/references', 'public');
                $newImages[] = [
                    'path' => $path,
                    'original_name' => $image->getClientOriginalName(),
                    'uploaded_at' => now()->toISOString(),
                ];
            }

            $allImages = array_merge($existingImages, $newImages);
            $order->update(['reference_images' => json_encode($allImages)]);

            return response()->json([
                'success' => true,
                'message' => 'Reference images uploaded successfully.',
                'data' => $newImages
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload reference images: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateMeasurements(Request $request, $id)
    {
        $order = CustomOrder::where('user_id', auth()->id())->findOrFail($id);

        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Measurements cannot be updated at this stage.'
            ], 422);
        }

        $request->validate([
            'measurements' => 'required|array|min:1',
            'measurements.*.type' => 'required|string',
            'measurements.*.value' => 'required|numeric|min:0',
        ]);

        $order->update(['measurements' => json_encode($request->measurements)]);

        return response()->json([
            'success' => true,
            'message' => 'Measurements updated successfully.'
        ]);
    }

    public function getStages($id)
    {
        $order = CustomOrder::where('user_id', auth()->id())->findOrFail($id);

        $stages = [
            'pending' => ['label' => 'Order Pending', 'description' => 'Your order has been received and is under review.'],
            'confirmed' => ['label' => 'Order Confirmed', 'description' => 'Your order has been confirmed and is being processed.'],
            'fabric_selected' => ['label' => 'Fabric Selected', 'description' => 'Fabric has been selected for your order.'],
            'measurement_received' => ['label' => 'Measurements Received', 'description' => 'Your measurements have been received and verified.'],
            'cutting' => ['label' => 'Cutting', 'description' => 'Your garment is being cut according to measurements.'],
            'stitching' => ['label' => 'Stitching', 'description' => 'Your garment is being stitched.'],
            'finishing' => ['label' => 'Finishing', 'description' => 'Final finishing touches are being applied.'],
            'quality_check' => ['label' => 'Quality Check', 'description' => 'Your garment is undergoing quality inspection.'],
            'ready' => ['label' => 'Ready for Dispatch', 'description' => 'Your garment is ready and will be dispatched soon.'],
            'dispatched' => ['label' => 'Dispatched', 'description' => 'Your order has been dispatched.'],
            'delivered' => ['label' => 'Delivered', 'description' => 'Your order has been delivered successfully.'],
        ];

        $completedStages = CustomOrderStage::where('custom_order_id', $order->id)
                                         ->pluck('status', 'stage')
                                         ->toArray();

        $stageProgress = [];
        foreach ($stages as $stageKey => $stageInfo) {
            $stageProgress[] = [
                'stage' => $stageKey,
                'label' => $stageInfo['label'],
                'description' => $stageInfo['description'],
                'status' => $completedStages[$stageKey] ?? 'pending',
                'is_current' => $order->status === $stageKey,
                'completed_at' => CustomOrderStage::where('custom_order_id', $order->id)
                                             ->where('stage', $stageKey)
                                             ->value('completed_at'),
            ];
        }

        return response()->json(['success' => true, 'data' => $stageProgress]);
    }
}
