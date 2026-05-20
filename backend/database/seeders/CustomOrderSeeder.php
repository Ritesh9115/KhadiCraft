<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class CustomOrderSeeder extends Seeder
{
    public function run(): void
    {
        $customers = User::where('role', 'customer')->get();
        $tailors   = User::where('role', 'tailor')->get();

        $styles   = ['kurta', 'kurta_set', 'shirt', 'pant', 'coat_pant', 'blazer', 'pajama'];
        $statuses = ['pending', 'confirmed', 'cutting', 'stitching', 'finishing', 'ready', 'delivered'];
        $fabrics  = ['Pure Khadi Cotton', 'Khadi Silk Blend', 'Cotton Linen', 'Chanderi Silk'];
        $stages   = ['pending', 'confirmed', 'fabric_selected', 'measurement_received', 'cutting', 'stitching', 'finishing', 'quality_check', 'ready'];

        $count = 0;
        foreach ($customers as $ci => $customer) {
            $numOrders = rand(1, 2);
            for ($oi = 0; $oi < $numOrders; $oi++) {
                $daysAgo  = rand(10, 90);
                $status   = $styles[array_rand($styles)];
                $oStatus  = $statuses[array_rand($statuses)];
                $createdAt= now()->subDays($daysAgo);
                $tailor   = $tailors->isNotEmpty() ? $tailors->random() : null;
                $orderNum = 'CUST-' . strtoupper(substr(md5(uniqid()), 0, 8));
                $fabric   = $fabrics[array_rand($fabrics)];

                $measurements = json_encode([
                    'chest'  => rand(36, 46),
                    'waist'  => rand(30, 40),
                    'hips'   => rand(36, 46),
                    'shoulder'=> rand(15, 19),
                    'shirt_length' => rand(40, 46),
                ]);

                $estPrice = rand(800, 5000);

                $orderId = DB::table('custom_orders')->insertGetId([
                    'user_id'              => $customer->id,
                    'custom_order_number'  => $orderNum,
                    'style_type'           => $status,
                    'fabric_name'          => $fabric,
                    'fabric_preference'    => "Prefer natural, breathable fabric for daily use.",
                    'measurements'         => $measurements,
                    'chest'                => rand(36, 46),
                    'waist'                => rand(30, 40),
                    'hips'                 => rand(36, 46),
                    'shoulder'             => rand(15, 19),
                    'shirt_length'         => rand(40, 46),
                    'sleeve_length'        => rand(23, 27),
                    'special_instructions' => $oi % 2 === 0 ? 'Please use button-down collar and add two front pockets.' : null,
                    'status'               => $oStatus,
                    'estimated_price'      => $estPrice,
                    'final_price'          => in_array($oStatus, ['ready', 'delivered']) ? $estPrice + rand(-200, 200) : null,
                    'assigned_tailor_id'   => !in_array($oStatus, ['pending']) ? $tailor?->id : null,
                    'estimated_ready_date' => now()->addDays(rand(3, 14))->format('Y-m-d'),
                    'admin_notes'          => $oStatus !== 'pending' ? 'Assigned to tailor. Work in progress.' : null,
                    'created_at'           => $createdAt,
                    'updated_at'           => $createdAt,
                ]);

                // Add stage records up to current status
                $stageIdx = array_search($oStatus, $stages);
                if ($stageIdx === false) $stageIdx = 0;
                for ($si = 0; $si <= $stageIdx; $si++) {
                    DB::table('custom_order_stages')->insert([
                        'custom_order_id' => $orderId,
                        'stage'           => $stages[$si],
                        'status'          => 'completed',
                        'completed_at'    => $createdAt->copy()->addDays($si + 1),
                        'notes'           => ucfirst($stages[$si]) . ' completed successfully.',
                        'created_at'      => $createdAt->copy()->addDays($si + 1),
                        'updated_at'      => $createdAt->copy()->addDays($si + 1),
                    ]);
                }
                $count++;
            }
        }

        echo "✅ Custom orders seeded: {$count} (with stage history)\n";
    }
}
