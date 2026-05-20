<?php
// ========================================================
// AdminDashboardController.php
// ========================================================
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\{Order, CustomOrder, User, Product, Appointment};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        $month = Carbon::now()->startOfMonth();

        return response()->json(['success' => true, 'data' => [
            'today_orders'       => Order::whereDate('created_at', $today)->count(),
            'today_revenue'      => Order::whereDate('created_at', $today)->where('payment_status','paid')->sum('total'),
            'month_revenue'      => Order::where('created_at','>=',$month)->where('payment_status','paid')->sum('total'),
            'total_orders'       => Order::count(),
            'pending_orders'     => Order::where('status','pending')->count(),
            'custom_orders'      => CustomOrder::whereIn('status',['pending','confirmed','cutting','stitching','finishing'])->count(),
            'today_appointments' => Appointment::whereDate('appointment_date', $today)->count(),
            'pending_appointments'=> Appointment::where('status','pending')->count(),
            'total_customers'    => User::where('role','customer')->count(),
            'new_customers_month'=> User::where('role','customer')->where('created_at','>=',$month)->count(),
            'low_stock_products' => Product::whereRaw('stock <= low_stock_alert AND stock > 0')->count(),
            'out_of_stock'       => Product::where('stock',0)->count(),
            'total_products'     => Product::where('is_active',true)->count(),
            'recent_orders'      => Order::with('user')->latest()->limit(8)->get(),
            'recent_custom'      => CustomOrder::with('user')->latest()->limit(5)->get(),
            'upcoming_appointments'=> Appointment::with('user')
                ->where('appointment_date','>=',Carbon::today())
                ->where('status','confirmed')
                ->orderBy('appointment_date')->orderBy('time_slot')
                ->limit(5)->get(),
            'monthly_revenue'    => $this->monthlyRevenue(),
            'order_status_breakdown' => $this->orderStatusBreakdown(),
        ]]);
    }

    public function stats(Request $request)
    {
        $range = $request->range ?? '30';
        $start = Carbon::now()->subDays((int)$range);

        $revenue = Order::where('created_at','>=',$start)
            ->where('payment_status','paid')
            ->selectRaw('DATE(created_at) as date, SUM(total) as total, COUNT(*) as count')
            ->groupBy('date')->orderBy('date')->get();

        return response()->json(['success'=>true, 'data' => $revenue]);
    }

    private function monthlyRevenue(): array
    {
        $data = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $revenue = Order::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->where('payment_status','paid')->sum('total');
            $data[] = ['month' => $month->format('M Y'), 'revenue' => $revenue];
        }
        return $data;
    }

    private function orderStatusBreakdown(): array
    {
        return Order::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')->pluck('count','status')->toArray();
    }
}
