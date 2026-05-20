<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TimeSlotsSeeder extends Seeder
{
    public function run(): void
    {
        $slots = [
            '09:00 AM - 09:30 AM',
            '09:30 AM - 10:00 AM',
            '10:00 AM - 10:30 AM',
            '10:30 AM - 11:00 AM',
            '11:00 AM - 11:30 AM',
            '11:30 AM - 12:00 PM',
            '02:00 PM - 02:30 PM',
            '02:30 PM - 03:00 PM',
            '03:00 PM - 03:30 PM',
            '03:30 PM - 04:00 PM',
            '04:00 PM - 04:30 PM',
            '04:30 PM - 05:00 PM',
            '05:00 PM - 05:30 PM',
            '05:30 PM - 06:00 PM',
            '06:00 PM - 06:30 PM',
        ];

        foreach ($slots as $slot) {
            DB::table('time_slots')->updateOrInsert(
                ['time_range' => $slot],
                ['time_range' => $slot, 'is_active' => true]
            );
        }

        echo "✅ Time slots seeded: " . count($slots) . " slots\n";
    }
}
