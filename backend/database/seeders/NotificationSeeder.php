<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $allUsers = User::all();
        $admin    = User::where('role', 'admin')->first();

        $customerNotifs = [
            ['title' => 'Order Confirmed!',       'message' => 'Your order has been confirmed and is being processed.',       'type' => 'order'],
            ['title' => 'Order Shipped!',         'message' => 'Your order has been shipped via Delhivery. Track: TRK123456', 'type' => 'order'],
            ['title' => 'Order Delivered',        'message' => 'Your order has been delivered. Enjoy your purchase! 🎉',      'type' => 'order'],
            ['title' => 'Appointment Confirmed',  'message' => 'Your appointment on 15 May at 10:00 AM has been confirmed.',  'type' => 'appointment'],
            ['title' => 'Custom Order Update',    'message' => 'Your custom kurta is in stitching phase. Ready in 3 days!',  'type' => 'custom_order'],
            ['title' => 'New Offer for You! 🎁',  'message' => 'Get 15% off on all fabric this weekend. Use code: KHADI15', 'type' => 'promotion'],
        ];

        $adminNotifs = [
            ['title' => 'New Order Received',     'message' => 'A new order has been placed. Review it in the orders section.', 'type' => 'order'],
            ['title' => 'New Appointment Booked', 'message' => 'Customer Rahul Verma has booked a measurement appointment.',    'type' => 'appointment'],
            ['title' => 'Low Stock Alert!',       'message' => 'Chanderi Silk Thaan stock is below threshold (8 remaining).',   'type' => 'inventory'],
            ['title' => 'New Custom Order',       'message' => 'New custom kurta order placed by Sneha Kapoor.',               'type' => 'custom_order'],
            ['title' => 'New Review',             'message' => 'Arjun Nair left a 5-star review on Classic Khadi Kurta.',     'type' => 'review'],
        ];

        $count = 0;

        // Admin notifications
        if ($admin) {
            foreach ($adminNotifs as $n) {
                DB::table('notifications')->insert([
                    'user_id'    => $admin->id,
                    'title'      => $n['title'],
                    'message'    => $n['message'],
                    'type'       => $n['type'],
                    'action_url' => '/admin/' . $n['type'] . 's',
                    'is_read'    => false,
                    'created_at' => now()->subHours(rand(1, 72)),
                    'updated_at' => now()->subHours(rand(1, 72)),
                ]);
                $count++;
            }
        }

        // Customer notifications
        $customers = User::where('role', 'customer')->get();
        foreach ($customers as $customer) {
            $selected = array_slice($customerNotifs, 0, rand(2, 4));
            foreach ($selected as $n) {
                DB::table('notifications')->insert([
                    'user_id'    => $customer->id,
                    'title'      => $n['title'],
                    'message'    => $n['message'],
                    'type'       => $n['type'],
                    'action_url' => '/account/orders',
                    'is_read'    => (bool) rand(0, 1),
                    'created_at' => now()->subDays(rand(1, 30)),
                    'updated_at' => now()->subDays(rand(1, 30)),
                ]);
                $count++;
            }
        }

        echo "✅ Notifications seeded: {$count}\n";
    }
}
