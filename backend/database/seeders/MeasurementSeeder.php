<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class MeasurementSeeder extends Seeder
{
    public function run(): void
    {
        $customers = User::where('role', 'customer')->get();

        $profiles = [
            ['profile_name' => 'My Measurements', 'chest' => 40, 'waist' => 34, 'hips' => 40, 'shoulder' => 17, 'shirt_length' => 42, 'pant_length' => 40, 'sleeve_length' => 25, 'neck' => 15.5, 'thigh' => 22, 'inseam' => 32, 'notes' => 'Regular fit preferred'],
            ['profile_name' => 'Party Wear',       'chest' => 38, 'waist' => 32, 'hips' => 38, 'shoulder' => 16.5, 'shirt_length' => 43, 'pant_length' => 41, 'sleeve_length' => 24.5, 'neck' => 15, 'thigh' => 21, 'inseam' => 31, 'notes' => 'Slim fit'],
            ['profile_name' => 'Formal Wear',      'chest' => 42, 'waist' => 36, 'hips' => 42, 'shoulder' => 17.5, 'shirt_length' => 44, 'pant_length' => 41, 'sleeve_length' => 25.5, 'neck' => 16, 'thigh' => 23, 'inseam' => 33, 'notes' => 'Comfort fit'],
            ['profile_name' => 'Casual Daily',     'chest' => 36, 'waist' => 30, 'hips' => 36, 'shoulder' => 16, 'shirt_length' => 41, 'pant_length' => 39, 'sleeve_length' => 24, 'neck' => 14.5, 'thigh' => 20, 'inseam' => 30, 'notes' => 'Loose fit'],
            ['profile_name' => 'Festival Wear',    'chest' => 44, 'waist' => 38, 'hips' => 44, 'shoulder' => 18, 'shirt_length' => 45, 'pant_length' => 42, 'sleeve_length' => 26, 'neck' => 16.5, 'thigh' => 24, 'inseam' => 34, 'notes' => 'Relaxed fit'],
        ];

        foreach ($customers as $i => $customer) {
            if (!isset($profiles[$i])) break;
            $p = $profiles[$i];
            DB::table('measurement_profiles')->updateOrInsert(
                ['user_id' => $customer->id, 'profile_name' => $p['profile_name']],
                array_merge($p, ['user_id' => $customer->id, 'is_default' => true, 'created_at' => now(), 'updated_at' => now()])
            );
        }
        echo "✅ Measurement profiles: " . $customers->count() . "\n";
    }
}
