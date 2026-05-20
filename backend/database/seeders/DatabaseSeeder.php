<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            FabricTypeSeeder::class,
            ProductSeeder::class,
            TimeSlotsSeeder::class,
            AddressSeeder::class,
            MeasurementSeeder::class,
            OrderSeeder::class,
            AppointmentSeeder::class,
            CustomOrderSeeder::class,
            ReviewSeeder::class,
            NotificationSeeder::class,
        ]);
    }
}
