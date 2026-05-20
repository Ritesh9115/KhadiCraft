<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class AddressSeeder extends Seeder
{
    public function run(): void
    {
        $customers = User::where('role', 'customer')->get();

        $addressData = [
            [
                'full_name'    => 'Rahul Verma',
                'phone'        => '9811111111',
                'address_line1'=> 'House No. 45, Sector 22-B',
                'address_line2'=> 'Near PGI Hospital',
                'city'         => 'Chandigarh',
                'state'        => 'Chandigarh',
                'pincode'      => '160022',
                'is_default'   => true,
            ],
            [
                'full_name'    => 'Anjali Gupta',
                'phone'        => '9822222222',
                'address_line1'=> 'Flat 12, Shiv Puri Apartments',
                'address_line2'=> 'Phase 2, Mohali',
                'city'         => 'Mohali',
                'state'        => 'Punjab',
                'pincode'      => '160055',
                'is_default'   => true,
            ],
            [
                'full_name'    => 'Vikram Mehta',
                'phone'        => '9833333333',
                'address_line1'=> 'Plot 7, Panchkula Extension',
                'address_line2'=> 'Sector 20',
                'city'         => 'Panchkula',
                'state'        => 'Haryana',
                'pincode'      => '134116',
                'is_default'   => true,
            ],
            [
                'full_name'    => 'Sneha Kapoor',
                'phone'        => '9844444444',
                'address_line1'=> 'B-42, Model Town',
                'address_line2'=> null,
                'city'         => 'Delhi',
                'state'        => 'Delhi',
                'pincode'      => '110009',
                'is_default'   => true,
            ],
            [
                'full_name'    => 'Arjun Nair',
                'phone'        => '9855555555',
                'address_line1'=> '21, MG Road, Sector 8',
                'address_line2'=> 'Opposite Elante Mall',
                'city'         => 'Chandigarh',
                'state'        => 'Chandigarh',
                'pincode'      => '160009',
                'is_default'   => true,
            ],
        ];

        foreach ($customers as $i => $customer) {
            if (!isset($addressData[$i])) break;
            $addr = $addressData[$i];
            DB::table('addresses')->updateOrInsert(
                ['user_id' => $customer->id, 'pincode' => $addr['pincode']],
                array_merge($addr, ['user_id' => $customer->id, 'created_at' => now(), 'updated_at' => now()])
            );
        }
        echo "✅ Addresses seeded for " . $customers->count() . " customers\n";
    }
}
