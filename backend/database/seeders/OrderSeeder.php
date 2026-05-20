<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Product;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $customers = User::where('role', 'customer')->get();
        $products  = Product::all();

        if ($customers->isEmpty() || $products->isEmpty()) {
            echo "⚠️  No customers or products found — skipping orders\n";
            return;
        }

        $statuses      = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        $payMethods    = ['cod', 'upi', 'card'];
        $payStatuses   = ['pending', 'paid', 'paid', 'paid'];   // mostly paid
        $couriers      = ['Delhivery', 'BlueDart', 'Ekart', 'XpressBees', 'DTDC'];
        $stateMap      = ['Chandigarh' => '160022', 'Punjab' => '140001', 'Haryana' => '134001', 'Delhi' => '110001'];

        $orderCount = 0;
        foreach ($customers as $ci => $customer) {
            // Give each customer 2–4 orders
            $numOrders = rand(2, 4);
            for ($oi = 0; $oi < $numOrders; $oi++) {
                $status     = $statuses[array_rand($statuses)];
                $payMethod  = $payMethods[array_rand($payMethods)];
                $payStatus  = $status === 'delivered' ? 'paid' : ($payMethod === 'cod' ? ($status === 'delivered' ? 'paid' : 'pending') : 'paid');
                $daysAgo    = rand(1, 120);
                $createdAt  = now()->subDays($daysAgo);
                $orderNum   = 'KC-' . strtoupper(substr(md5(uniqid()), 0, 8));

                // Pick 1–3 random products
                $pickedProducts = $products->random(rand(1, min(3, $products->count())));
                $subtotal = 0;
                $lineItems = [];

                foreach ($pickedProducts as $product) {
                    $qty   = rand(1, 3);
                    $price = $product->sale_price ?? $product->price;
                    $lineTotal = $price * $qty;
                    $subtotal += $lineTotal;
                    $lineItems[] = [
                        'product_id'   => $product->id,
                        'product_name' => $product->name,
                        'variant_info' => null,
                        'thumbnail'    => $product->thumbnail,
                        'quantity'     => $qty,
                        'price'        => $price,
                        'total'        => $lineTotal,
                        'created_at'   => $createdAt,
                        'updated_at'   => $createdAt,
                    ];
                }

                $shipping = $subtotal >= 1000 ? 0 : 80;
                $tax      = round($subtotal * 0.18, 2);
                $total    = round($subtotal + $shipping + $tax, 2);

                // Get customer's address
                $address = DB::table('addresses')->where('user_id', $customer->id)->first();
                $addrId  = $address?->id;

                $orderId = DB::table('orders')->insertGetId([
                    'user_id'             => $customer->id,
                    'shipping_address_id' => $addrId,
                    'order_number'        => $orderNum,
                    'payment_method'      => $payMethod,
                    'payment_status'      => $payStatus,
                    'status'              => $status,
                    'subtotal'            => $subtotal,
                    'shipping_cost'       => $shipping,
                    'tax'                 => $tax,
                    'total'               => $total,
                    'tracking_number'     => in_array($status, ['shipped', 'delivered']) ? 'TRK' . strtoupper(substr(md5(uniqid()), 0, 10)) : null,
                    'courier'             => in_array($status, ['shipped', 'delivered']) ? $couriers[array_rand($couriers)] : null,
                    'paid_at'             => $payStatus === 'paid' ? $createdAt->addHours(1) : null,
                    'created_at'          => $createdAt,
                    'updated_at'          => $createdAt,
                ]);

                // Insert order items
                foreach ($lineItems as $item) {
                    DB::table('order_items')->insert(array_merge($item, ['order_id' => $orderId]));
                }

                $orderCount++;
            }
        }

        echo "✅ Orders seeded: {$orderCount} orders with items\n";
    }
}
