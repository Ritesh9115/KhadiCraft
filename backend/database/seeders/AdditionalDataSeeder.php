<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class AdditionalDataSeeder extends Seeder
{
    public function run()
    {
        // Read the additional SQL file
        $sqlFile = database_path('khadicraft_additional_seed.sql');
        
        if (File::exists($sqlFile)) {
            $sql = File::get($sqlFile);
            
            // Split SQL into individual statements
            $statements = array_filter(array_map('trim', explode(';', $sql)));
            
            foreach ($statements as $statement) {
                if (!empty($statement)) {
                    try {
                        DB::statement($statement);
                    } catch (\Exception $e) {
                        $this->command->warn("Warning: " . $e->getMessage());
                    }
                }
            }
            
            $this->command->info('✅ Additional data seeded successfully from khadicraft_additional_seed.sql!');
        } else {
            $this->command->error('❌ khadicraft_additional_seed.sql file not found!');
        }
    }
}
