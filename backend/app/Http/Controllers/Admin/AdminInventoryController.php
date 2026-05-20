<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AdminInventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'fabricType']);

        // Filters
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('sku', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->stock === 'low') {
            $query->whereRaw('stock <= low_stock_alert AND stock > 0');
        } elseif ($request->stock === 'out') {
            $query->where('stock', 0);
        } elseif ($request->stock === 'normal') {
            $query->whereRaw('stock > low_stock_alert');
        }

        if ($request->fabric_type_id) {
            $query->where('fabric_type_id', $request->fabric_type_id);
        }

        $products = $query->orderBy('name')->paginate(20);

        // Summary statistics
        $summary = [
            'total_products' => Product::count(),
            'low_stock' => Product::whereRaw('stock <= low_stock_alert AND stock > 0')->count(),
            'out_of_stock' => Product::where('stock', 0)->count(),
            'total_stock_value' => Product::selectRaw('SUM(stock * cost_price) as value')->first()->value ?? 0,
        ];

        return response()->json([
            'success' => true,
            'data' => $products,
            'summary' => $summary
        ]);
    }

    public function lowStock()
    {
        $products = Product::with(['category', 'fabricType'])
            ->whereRaw('stock <= low_stock_alert AND stock > 0')
            ->orderBy('stock')
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $products]);
    }

    public function adjust(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'adjustments' => 'required|array|min:1',
            'adjustments.*.product_id' => 'required|exists:products,id',
            'adjustments.*.type' => 'required|in:stock_in,stock_out,adjustment,damage',
            'adjustments.*.quantity' => 'required|integer|min:1',
            'adjustments.*.notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $results = [];
        $errors = [];

        foreach ($request->adjustments as $adjustment) {
            try {
                $product = Product::findOrFail($adjustment['product_id']);
                $before = $product->stock;

                // Calculate new stock based on adjustment type
                if ($adjustment['type'] === 'stock_out' || $adjustment['type'] === 'damage') {
                    if ($product->stock < $adjustment['quantity']) {
                        $errors[] = "Insufficient stock for product: {$product->name}. Available: {$product->stock}, Requested: {$adjustment['quantity']}";
                        continue;
                    }
                    $after = $product->stock - $adjustment['quantity'];
                } elseif ($adjustment['type'] === 'adjustment') {
                    $after = $adjustment['quantity']; // Set absolute value
                } else { // stock_in
                    $after = $product->stock + $adjustment['quantity'];
                }

                // Update product stock
                $product->update(['stock' => $after]);

                // Create inventory log
                InventoryLog::create([
                    'product_id' => $product->id,
                    'type' => $adjustment['type'],
                    'quantity' => $adjustment['quantity'],
                    'stock_before' => $before,
                    'stock_after' => $after,
                    'reference_type' => 'manual',
                    'notes' => $adjustment['notes'] ?? 'Manual inventory adjustment',
                    'created_by' => auth()->id(),
                ]);

                $results[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'before' => $before,
                    'after' => $after,
                    'adjustment' => $adjustment['quantity'],
                    'type' => $adjustment['type'],
                ];
            } catch (\Exception $e) {
                $errors[] = "Error adjusting product ID {$adjustment['product_id']}: " . $e->getMessage();
            }
        }

        return response()->json([
            'success' => count($errors) === 0,
            'message' => count($errors) === 0 ? 'Inventory adjusted successfully.' : 'Some adjustments failed.',
            'data' => $results,
            'errors' => $errors
        ]);
    }

    public function logs(Request $request)
    {
        $query = InventoryLog::with(['product']);

        if ($request->product_id) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->type) {
            $query->where('type', $request->type);
        }

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->latest()->paginate(20);

        return response()->json(['success' => true, 'data' => $logs]);
    }

    public function productLogs($productId)
    {
        $product = Product::findOrFail($productId);
        
        $logs = InventoryLog::where('product_id', $productId)
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $logs,
            'product' => $product
        ]);
    }

    public function stockReport(Request $request)
    {
        $query = Product::with(['category']);

        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->get();

        $report = [
            'categories' => [],
            'summary' => [
                'total_products' => $products->count(),
                'total_stock' => $products->sum('stock'),
                'total_value' => $products->sum(function($p) { return $p->stock * ($p->cost_price ?? $p->price); }),
                'low_stock_count' => $products->where('stock', '<=', function($p) { return $p->low_stock_alert; })->where('stock', '>', 0)->count(),
                'out_of_stock_count' => $products->where('stock', 0)->count(),
            ]
        ];

        // Group by category
        $grouped = $products->groupBy('category_id');
        foreach ($grouped as $categoryId => $categoryProducts) {
            $category = $categoryProducts->first()->category;
            $report['categories'][] = [
                'category' => $category,
                'product_count' => $categoryProducts->count(),
                'total_stock' => $categoryProducts->sum('stock'),
                'total_value' => $categoryProducts->sum(function($p) { return $p->stock * ($p->cost_price ?? $p->price); }),
                'low_stock_count' => $categoryProducts->where('stock', '<=', function($p) { return $p->low_stock_alert; })->where('stock', '>', 0)->count(),
                'out_of_stock_count' => $categoryProducts->where('stock', 0)->count(),
            ];
        }

        return response()->json(['success' => true, 'data' => $report]);
    }

    public function export(Request $request)
    {
        $query = Product::with(['category', 'fabricType']);

        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->orderBy('name')->get();

        $csvData = [
            ['Product Name', 'SKU', 'Category', 'Fabric Type', 'Current Stock', 'Low Stock Alert', 'Cost Price', 'Total Value', 'Status']
        ];

        foreach ($products as $product) {
            $status = 'Normal';
            if ($product->stock == 0) {
                $status = 'Out of Stock';
            } elseif ($product->stock <= $product->low_stock_alert) {
                $status = 'Low Stock';
            }

            $csvData[] = [
                $product->name,
                $product->sku,
                $product->category->name ?? 'N/A',
                $product->fabricType->name ?? 'N/A',
                $product->stock,
                $product->low_stock_alert,
                $product->cost_price ?? 0,
                $product->stock * ($product->cost_price ?? $product->price),
                $status
            ];
        }

        $filename = 'inventory_report_' . date('Y-m-d') . '.csv';
        
        // Generate CSV content
        $csv = '';
        foreach ($csvData as $row) {
            $csv .= implode(',', array_map(function($field) {
                return '"' . str_replace('"', '""', $field) . '"';
            }, $row)) . "\n";
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }
}
