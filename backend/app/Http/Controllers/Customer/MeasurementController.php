<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Measurement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MeasurementController extends Controller
{
    public function index()
    {
        $measurements = auth()->user()->measurements()
                                  ->orderBy('is_default', 'desc')
                                  ->orderBy('created_at', 'desc')
                                  ->get();

        return response()->json(['success' => true, 'data' => $measurements]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'chest' => 'required|numeric|min:20|max:200',
            'waist' => 'required|numeric|min:20|max:200',
            'hips' => 'required|numeric|min:20|max:200',
            'shoulder' => 'required|numeric|min:10|max:100',
            'shirt_length' => 'required|numeric|min:20|max:150',
            'pant_length' => 'required|numeric|min:20|max:150',
            'sleeve_length' => 'required|numeric|min:10|max:100',
            'neck' => 'required|numeric|min:10|max:50',
            'thigh' => 'required|numeric|min:10|max:100',
            'inseam' => 'required|numeric|min:10|max:100',
            'notes' => 'nullable|string|max:500',
            'is_default' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = auth()->user();

        // If setting as default, unset other default measurements
        if ($request->boolean('is_default')) {
            $user->measurements()->update(['is_default' => false]);
        }

        $measurement = $user->measurements()->create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Measurement profile created successfully.',
            'data' => $measurement
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'chest' => 'sometimes|numeric|min:20|max:200',
            'waist' => 'sometimes|numeric|min:20|max:200',
            'hips' => 'sometimes|numeric|min:20|max:200',
            'shoulder' => 'sometimes|numeric|min:10|max:100',
            'shirt_length' => 'sometimes|numeric|min:20|max:150',
            'pant_length' => 'sometimes|numeric|min:20|max:150',
            'sleeve_length' => 'sometimes|numeric|min:10|max:100',
            'neck' => 'sometimes|numeric|min:10|max:50',
            'thigh' => 'sometimes|numeric|min:10|max:100',
            'inseam' => 'sometimes|numeric|min:10|max:100',
            'notes' => 'nullable|string|max:500',
            'is_default' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = auth()->user();
        $measurement = $user->measurements()->findOrFail($id);

        // If setting as default, unset other default measurements
        if ($request->boolean('is_default')) {
            $user->measurements()->where('id', '!=', $id)->update(['is_default' => false]);
        }

        $measurement->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Measurement profile updated successfully.',
            'data' => $measurement
        ]);
    }

    public function destroy($id)
    {
        $user = auth()->user();
        $measurement = $user->measurements()->findOrFail($id);

        // Check if measurement is being used in any active custom orders
        $activeOrders = \App\Models\CustomOrder::where('user_id', $user->id)
                                             ->where('measurement_profile_id', $id)
                                             ->whereIn('status', ['pending', 'confirmed', 'fabric_selected'])
                                             ->count();

        if ($activeOrders > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete measurement profile that is being used in active orders.'
            ], 422);
        }

        $measurement->delete();

        return response()->json(['success' => true, 'message' => 'Measurement profile deleted successfully.']);
    }

    public function setDefault($id)
    {
        $user = auth()->user();
        $measurement = $user->measurements()->findOrFail($id);

        // Unset all other default measurements
        $user->measurements()->where('id', '!=', $id)->update(['is_default' => false]);
        
        // Set this as default
        $measurement->update(['is_default' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Default measurement profile updated successfully.',
            'data' => $measurement
        ]);
    }

    public function show($id)
    {
        $measurement = auth()->user()->measurements()->findOrFail($id);
        return response()->json(['success' => true, 'data' => $measurement]);
    }

    public function templates()
    {
        // Return standard measurement templates
        $templates = [
            [
                'id' => 'men_regular',
                'name' => 'Men Regular Fit',
                'gender' => 'male',
                'measurements' => [
                    'chest' => 40,
                    'waist' => 34,
                    'hips' => 38,
                    'shoulder' => 18,
                    'shirt_length' => 28,
                    'pant_length' => 40,
                    'sleeve_length' => 24,
                    'neck' => 16,
                    'thigh' => 22,
                    'inseam' => 30,
                ]
            ],
            [
                'id' => 'men_slim',
                'name' => 'Men Slim Fit',
                'gender' => 'male',
                'measurements' => [
                    'chest' => 38,
                    'waist' => 32,
                    'hips' => 36,
                    'shoulder' => 17,
                    'shirt_length' => 27,
                    'pant_length' => 40,
                    'sleeve_length' => 23,
                    'neck' => 15,
                    'thigh' => 20,
                    'inseam' => 30,
                ]
            ],
            [
                'id' => 'women_regular',
                'name' => 'Women Regular Fit',
                'gender' => 'female',
                'measurements' => [
                    'chest' => 36,
                    'waist' => 30,
                    'hips' => 38,
                    'shoulder' => 15,
                    'shirt_length' => 26,
                    'pant_length' => 38,
                    'sleeve_length' => 22,
                    'neck' => 14,
                    'thigh' => 22,
                    'inseam' => 28,
                ]
            ],
            [
                'id' => 'women_a_line',
                'name' => 'Women A-Line Fit',
                'gender' => 'female',
                'measurements' => [
                    'chest' => 36,
                    'waist' => 28,
                    'hips' => 42,
                    'shoulder' => 15,
                    'shirt_length' => 26,
                    'pant_length' => 38,
                    'sleeve_length' => 22,
                    'neck' => 14,
                    'thigh' => 24,
                    'inseam' => 28,
                ]
            ],
        ];

        return response()->json(['success' => true, 'data' => $templates]);
    }

    public function fromTemplate(Request $request)
    {
        $request->validate([
            'template_id' => 'required|string|in:men_regular,men_slim,women_regular,women_a_line',
            'name' => 'required|string|max:255',
            'adjustments' => 'nullable|array',
            'adjustments.*.field' => 'required|string|in:chest,waist,hips,shoulder,shirt_length,pant_length,sleeve_length,neck,thigh,inseam',
            'adjustments.*.value' => 'required|numeric|min:-10|max:10',
        ]);

        $templates = $this->templates()->original['data'];
        $template = collect($templates)->firstWhere('id', $request->template_id);

        if (!$template) {
            return response()->json(['success' => false, 'message' => 'Template not found.'], 404);
        }

        $measurements = $template['measurements'];

        // Apply adjustments
        if ($request->has('adjustments')) {
            foreach ($request->adjustments as $adjustment) {
                if (isset($measurements[$adjustment['field']])) {
                    $measurements[$adjustment['field']] += $adjustment['value'];
                }
            }
        }

        $user = auth()->user();

        // If setting as default, unset other default measurements
        if ($request->boolean('is_default')) {
            $user->measurements()->update(['is_default' => false]);
        }

        $measurement = $user->measurements()->create([
            'name' => $request->name,
            'is_default' => $request->boolean('is_default', false),
            ...$measurements
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Measurement profile created from template successfully.',
            'data' => $measurement
        ], 201);
    }

    public function compare(Request $request)
    {
        $request->validate([
            'profile1_id' => 'required|exists:measurements,id',
            'profile2_id' => 'required|exists:measurements,id',
        ]);

        $user = auth()->user();
        $profile1 = $user->measurements()->findOrFail($request->profile1_id);
        $profile2 = $user->measurements()->findOrFail($request->profile2_id);

        $fields = ['chest', 'waist', 'hips', 'shoulder', 'shirt_length', 'pant_length', 'sleeve_length', 'neck', 'thigh', 'inseam'];
        $comparison = [];

        foreach ($fields as $field) {
            $value1 = $profile1->$field ?? 0;
            $value2 = $profile2->$field ?? 0;
            $difference = $value1 - $value2;

            $comparison[] = [
                'field' => $field,
                'profile1' => $value1,
                'profile2' => $value2,
                'difference' => $difference,
                'percentage_change' => $value2 != 0 ? round(($difference / $value2) * 100, 2) : 0,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'profile1' => $profile1,
                'profile2' => $profile2,
                'comparison' => $comparison
            ]
        ]);
    }
}
