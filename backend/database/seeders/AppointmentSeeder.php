<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class AppointmentSeeder extends Seeder
{
    public function run(): void
    {
        $customers = User::where('role', 'customer')->get();
        $staff     = User::where('role', 'staff')->first();

        $types    = ['shop_visit', 'home_visit', 'measurement', 'consultation'];
        $statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        $purposes = [
            'Kurta measurement for wedding function',
            'Fabric selection for office wear',
            'Sherwani fitting consultation',
            'Custom suit measurement',
            'Dupatta and stole selection',
            'Fabric for casual wear',
            'Blazer fitting and measurement',
            'General inquiry about custom tailoring',
        ];
        $slots = [
            '10:00 AM - 10:30 AM', '11:00 AM - 11:30 AM',
            '02:00 PM - 02:30 PM', '03:30 PM - 04:00 PM',
            '05:00 PM - 05:30 PM',
        ];

        $count = 0;
        foreach ($customers as $ci => $customer) {
            // 2–3 appointments per customer
            $numApts = rand(2, 3);
            for ($ai = 0; $ai < $numApts; $ai++) {
                $daysAgo  = rand(-7, 60);   // some future, some past
                $aptDate  = now()->subDays($daysAgo)->format('Y-m-d');
                $status   = $daysAgo < 0 ? 'pending' : $statuses[array_rand($statuses)];
                $createdAt= now()->subDays(max(0, $daysAgo) + rand(1, 5));

                DB::table('appointments')->insert([
                    'user_id'          => $customer->id,
                    'type'             => $types[array_rand($types)],
                    'purpose'          => $purposes[array_rand($purposes)],
                    'appointment_date' => $aptDate,
                    'time_slot'        => $slots[array_rand($slots)],
                    'status'           => $status,
                    'notes'            => $ai % 2 === 0 ? 'Please bring fabric samples if available.' : null,
                    'admin_notes'      => $status === 'confirmed' ? 'Confirmed by Priya.' : null,
                    'assigned_staff_id'=> $status === 'confirmed' ? ($staff?->id) : null,
                    'created_at'       => $createdAt,
                    'updated_at'       => $createdAt,
                ]);
                $count++;
            }
        }

        echo "✅ Appointments seeded: {$count}\n";
    }
}
