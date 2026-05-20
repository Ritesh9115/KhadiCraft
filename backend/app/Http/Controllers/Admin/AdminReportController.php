<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Order, CustomOrder, User, Product, Category, InventoryLog};
use Illuminate\Http\Request;
use Carbon\Carbon;
use DB;

class AdminReportController extends Controller
{
    public function sales(Request $request)
    {
        $startDate = $request->date_from ?? Carbon::now()->subDays(30);
        $endDate = $request->date_to ?? Carbon::now();
        $groupBy = $request->group_by ?? 'day'; // day, week, month

        $query = Order::whereBetween('created_at', [$startDate, $endDate])
                     ->where('payment_status', 'paid');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Build date-grouped data using PostgreSQL-compatible functions
        $data = match ($groupBy) {
            'day'   => $query->selectRaw("DATE(created_at) as period, COUNT(*) as orders, SUM(total) as revenue, AVG(total) as avg_order")
                            ->groupBy('period')->orderBy('period')->get(),
            'week'  => $query->selectRaw("TO_CHAR(created_at, 'IYYY-IW') as period, COUNT(*) as orders, SUM(total) as revenue, AVG(total) as avg_order")
                            ->groupBy('period')->orderBy('period')->get(),
            'month' => $query->selectRaw("TO_CHAR(created_at, 'YYYY-MM') as period, COUNT(*) as orders, SUM(total) as revenue, AVG(total) as avg_order")
                            ->groupBy('period')->orderBy('period')->get(),
            default => collect()
        };

        // Re-query for summary (avoid re-using modified builder)
        $summaryQuery = Order::whereBetween('created_at', [$startDate, $endDate])->where('payment_status', 'paid');
        if ($request->status) $summaryQuery->where('status', $request->status);

        $summary = [
            'total_orders'    => $summaryQuery->count(),
            'total_revenue'   => $summaryQuery->sum('total'),
            'avg_order_value' => $summaryQuery->avg('total'),
            'period'          => $groupBy,
            'date_range'      => [
                'start' => Carbon::parse($startDate)->format('Y-m-d'),
                'end'   => Carbon::parse($endDate)->format('Y-m-d'),
            ]
        ];

        return response()->json(['success' => true, 'data' => $data, 'summary' => $summary]);
    }

    public function orders(Request $request)
    {
        $startDate = $request->date_from ?? Carbon::now()->subDays(30);
        $endDate = $request->date_to ?? Carbon::now();

        $orders = Order::whereBetween('created_at', [$startDate, $endDate])
                      ->with(['user', 'items.product']);

        if ($request->status) {
            $orders->where('status', $request->status);
        }

        if ($request->payment_status) {
            $orders->where('payment_status', $request->payment_status);
        }

        $orders = $orders->latest()->paginate(50);

        // Status breakdown
        $statusBreakdown = Order::whereBetween('created_at', [$startDate, $endDate])
                               ->selectRaw('status, COUNT(*) as count, SUM(total) as total')
                               ->groupBy('status')
                               ->get();

        // Payment method breakdown
        $paymentBreakdown = Order::whereBetween('created_at', [$startDate, $endDate])
                                 ->where('payment_status', 'paid')
                                 ->selectRaw('payment_method, COUNT(*) as count, SUM(total) as total')
                                 ->groupBy('payment_method')
                                 ->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
            'status_breakdown' => $statusBreakdown,
            'payment_breakdown' => $paymentBreakdown
        ]);
    }

    public function products(Request $request)
    {
        $startDate = $request->date_from ?? Carbon::now()->subDays(30);
        $endDate = $request->date_to ?? Carbon::now();

        // Top selling products
        $topProducts = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.payment_status', 'paid')
            ->selectRaw('products.name, products.sku, SUM(order_items.quantity) as total_sold, SUM(order_items.total) as revenue, COUNT(DISTINCT orders.id) as orders')
            ->groupBy('products.id', 'products.name', 'products.sku')
            ->orderBy('total_sold', 'desc')
            ->limit(20)
            ->get();

        // Low stock products
        $lowStock = Product::whereRaw('stock <= low_stock_alert AND stock > 0')
                           ->with(['category'])
                           ->orderBy('stock')
                           ->limit(20)
                           ->get();

        // Out of stock products
        $outOfStock = Product::where('stock', 0)
                            ->with(['category'])
                            ->orderBy('updated_at', 'desc')
                            ->limit(20)
                            ->get();

        // Category performance
        $categoryPerformance = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.payment_status', 'paid')
            ->selectRaw('categories.name, SUM(order_items.quantity) as total_sold, SUM(order_items.total) as revenue, COUNT(DISTINCT orders.id) as orders')
            ->groupBy('categories.id', 'categories.name')
            ->orderBy('revenue', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'top_products' => $topProducts,
            'low_stock' => $lowStock,
            'out_of_stock' => $outOfStock,
            'category_performance' => $categoryPerformance
        ]);
    }

    public function customers(Request $request)
    {
        $startDate = $request->date_from ?? Carbon::now()->subDays(30);
        $endDate = $request->date_to ?? Carbon::now();

        // New customers
        $newCustomers = User::where('role', 'customer')
                           ->whereBetween('created_at', [$startDate, $endDate])
                           ->count();

        // Customer orders
        $customerOrders = DB::table('users')
            ->join('orders', 'users.id', '=', 'orders.user_id')
            ->where('users.role', 'customer')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->selectRaw('users.name, users.email, COUNT(orders.id) as order_count, SUM(orders.total) as total_spent, AVG(orders.total) as avg_order, MAX(orders.created_at) as last_order')
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderBy('total_spent', 'desc')
            ->limit(50)
            ->get();

        // Customer by location (if addresses are stored)
        $customerLocations = User::where('role', 'customer')
                               ->whereHas('addresses')
                               ->with(['addresses' => fn($q) => $q->where('is_default', true)])
                               ->get()
                               ->groupBy(fn($user) => $user->addresses->first()?->city ?? 'Unknown')
                               ->map(fn($users, $city) => [
                                   'city' => $city,
                                   'count' => $users->count()
                               ])
                               ->values()
                               ->sortByDesc('count')
                               ->take(20)
                               ->values();

        return response()->json([
            'success' => true,
            'new_customers' => $newCustomers,
            'customer_orders' => $customerOrders,
            'customer_locations' => $customerLocations
        ]);
    }

    public function inventory(Request $request)
    {
        $startDate = $request->date_from ?? Carbon::now()->subDays(30);
        $endDate = $request->date_to ?? Carbon::now();

        // Inventory movements
        $movements = InventoryLog::with(['product'])
                              ->whereBetween('created_at', [$startDate, $endDate])
                              ->latest()
                              ->paginate(50);

        // Movement summary by type
        $movementSummary = InventoryLog::whereBetween('created_at', [$startDate, $endDate])
                                    ->selectRaw('type, COUNT(*) as count, SUM(quantity) as total_quantity')
                                    ->groupBy('type')
                                    ->get();

        // Current inventory status
        $inventoryStatus = [
            'total_products' => Product::count(),
            'total_stock_value' => Product::selectRaw('SUM(stock * cost_price) as value')->first()->value ?? 0,
            'low_stock_count' => Product::whereRaw('stock <= low_stock_alert AND stock > 0')->count(),
            'out_of_stock_count' => Product::where('stock', 0)->count(),
            'total_stock_quantity' => Product::sum('stock'),
        ];

        return response()->json([
            'success' => true,
            'movements' => $movements,
            'movement_summary' => $movementSummary,
            'inventory_status' => $inventoryStatus
        ]);
    }

    public function customOrders(Request $request)
    {
        $startDate = $request->date_from ?? Carbon::now()->subDays(30);
        $endDate = $request->date_to ?? Carbon::now();

        $query = CustomOrder::whereBetween('created_at', [$startDate, $endDate]);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $orders = $query->with(['user', 'assignedTailor'])
                       ->latest()
                       ->paginate(50);

        // Status breakdown
        $statusBreakdown = CustomOrder::whereBetween('created_at', [$startDate, $endDate])
                                    ->selectRaw('status, COUNT(*) as count')
                                    ->groupBy('status')
                                    ->get();

        // Style type breakdown
        $styleBreakdown = CustomOrder::whereBetween('created_at', [$startDate, $endDate])
                                   ->selectRaw('style_type, COUNT(*) as count')
                                   ->groupBy('style_type')
                                   ->orderBy('count', 'desc')
                                   ->get();

        // Tailor performance
        $tailorPerformance = DB::table('custom_orders')
            ->join('users', 'custom_orders.assigned_tailor_id', '=', 'users.id')
            ->whereBetween('custom_orders.created_at', [$startDate, $endDate])
            ->whereNotNull('custom_orders.assigned_tailor_id')
            ->selectRaw('users.name as tailor_name, COUNT(custom_orders.id) as orders_count, AVG(custom_orders.final_price) as avg_price')
            ->groupBy('users.id', 'users.name')
            ->orderBy('orders_count', 'desc')
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
            'status_breakdown' => $statusBreakdown,
            'style_breakdown' => $styleBreakdown,
            'tailor_performance' => $tailorPerformance
        ]);
    }

    public function tailorPerformance(Request $request)
    {
        $startDate = $request->date_from ?? Carbon::now()->subDays(30);
        $endDate = $request->date_to ?? Carbon::now();

        $query = DB::table('users')
            ->leftJoin('custom_orders', 'users.id', '=', 'custom_orders.assigned_tailor_id')
            ->where('users.role', 'tailor')
            ->where('users.is_active', true);

        if ($startDate && $endDate) {
            $query->where(function($q) use ($startDate, $endDate) {
                $q->whereNull('custom_orders.id')
                  ->orWhereBetween('custom_orders.created_at', [$startDate, $endDate]);
            });
        }

        $tailors = $query->selectRaw('
                users.id,
                users.name,
                users.email,
                COUNT(custom_orders.id) as total_orders,
                SUM(CASE WHEN custom_orders.status = "delivered" THEN 1 ELSE 0 END) as completed_orders,
                SUM(CASE WHEN custom_orders.status IN ("cutting","stitching","finishing","quality_check") THEN 1 ELSE 0 END) as in_progress_orders,
                AVG(custom_orders.final_price) as avg_order_value,
                SUM(custom_orders.final_price) as total_value,
                AVG(TIMESTAMPDIFF(DAY, custom_orders.created_at, COALESCE(custom_orders.delivered_at, NOW()))) as avg_completion_days
            ')
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderBy('completed_orders', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $tailors]);
    }

    public function export($type, Request $request)
    {
        $startDate = $request->date_from ?? Carbon::now()->subDays(30);
        $endDate = $request->date_to ?? Carbon::now();

        $data = match ($type) {
            'sales' => $this->getSalesData($startDate, $endDate),
            'orders' => $this->getOrdersData($startDate, $endDate),
            'products' => $this->getProductsData(),
            'customers' => $this->getCustomersData($startDate, $endDate),
            'inventory' => $this->getInventoryData(),
            'custom_orders' => $this->getCustomOrdersData($startDate, $endDate),
            default => []
        };

        $filename = "{$type}_report_" . date('Y-m-d') . '.csv';
        
        // Generate CSV
        $csv = '';
        if (!empty($data)) {
            $headers = array_keys($data[0]);
            $csv .= implode(',', $headers) . "\n";
            
            foreach ($data as $row) {
                $csvRow = [];
                foreach ($headers as $header) {
                    $value = $row[$header] ?? '';
                    $csvRow[] = '"' . str_replace('"', '""', $value) . '"';
                }
                $csv .= implode(',', $csvRow) . "\n";
            }
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    private function getSalesData($startDate, $endDate)
    {
        return Order::whereBetween('created_at', [$startDate, $endDate])
                   ->where('payment_status', 'paid')
                   ->selectRaw('
                       DATE(created_at) as date,
                       order_number,
                       status,
                       payment_method,
                       total as amount,
                       created_at
                   ')
                   ->orderBy('date')
                   ->get()
                   ->toArray();
    }

    private function getOrdersData($startDate, $endDate)
    {
        return Order::whereBetween('created_at', [$startDate, $endDate])
                   ->with(['user:id,name,email'])
                   ->get()
                   ->map(fn($order) => [
                       'order_number' => $order->order_number,
                       'customer_name' => $order->user->name,
                       'customer_email' => $order->user->email,
                       'status' => $order->status,
                       'payment_status' => $order->payment_status,
                       'payment_method' => $order->payment_method,
                       'total' => $order->total,
                       'created_at' => $order->created_at->format('Y-m-d H:i:s')
                   ])
                   ->toArray();
    }

    private function getProductsData()
    {
        return Product::with(['category:name'])
                   ->get()
                   ->map(fn($product) => [
                       'name' => $product->name,
                       'sku' => $product->sku,
                       'category' => $product->category->name,
                       'price' => $product->price,
                       'sale_price' => $product->sale_price,
                       'stock' => $product->stock,
                       'low_stock_alert' => $product->low_stock_alert,
                       'is_active' => $product->is_active ? 'Yes' : 'No',
                       'created_at' => $product->created_at->format('Y-m-d H:i:s')
                   ])
                   ->toArray();
    }

    private function getCustomersData($startDate, $endDate)
    {
        return User::where('role', 'customer')
                   ->whereBetween('created_at', [$startDate, $endDate])
                   ->get()
                   ->map(fn($user) => [
                       'name' => $user->name,
                       'email' => $user->email,
                       'phone' => $user->phone,
                       'email_verified' => $user->email_verified ? 'Yes' : 'No',
                       'is_active' => $user->is_active ? 'Yes' : 'No',
                       'created_at' => $user->created_at->format('Y-m-d H:i:s')
                   ])
                   ->toArray();
    }

    private function getInventoryData()
    {
        return Product::with(['category:name'])
                   ->get()
                   ->map(fn($product) => [
                       'name' => $product->name,
                       'sku' => $product->sku,
                       'category' => $product->category->name,
                       'current_stock' => $product->stock,
                       'low_stock_alert' => $product->low_stock_alert,
                       'cost_price' => $product->cost_price,
                       'total_value' => $product->stock * ($product->cost_price ?? $product->price),
                       'status' => $product->stock == 0 ? 'Out of Stock' : ($product->stock <= $product->low_stock_alert ? 'Low Stock' : 'Normal')
                   ])
                   ->toArray();
    }

    private function getCustomOrdersData($startDate, $endDate)
    {
        return CustomOrder::whereBetween('created_at', [$startDate, $endDate])
                   ->with(['user:id,name,email', 'assignedTailor:id,name'])
                   ->get()
                   ->map(fn($order) => [
                       'custom_order_number' => $order->custom_order_number,
                       'customer_name' => $order->user->name,
                       'customer_email' => $order->user->email,
                       'assigned_tailor' => $order->assignedTailor?->name,
                       'style_type' => $order->style_type,
                       'status' => $order->status,
                       'final_price' => $order->final_price,
                       'estimated_ready_date' => $order->estimated_ready_date,
                       'created_at' => $order->created_at->format('Y-m-d H:i:s')
                   ])
                   ->toArray();
    }
}
