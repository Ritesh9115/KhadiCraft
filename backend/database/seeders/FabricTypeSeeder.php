<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FabricTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Pure Khadi Cotton',        'description' => 'Hand-spun, hand-woven pure khadi cotton fabric',       'is_active' => true],
            ['name' => 'Khadi Silk',               'description' => 'Lightweight khadi silk fabric with natural sheen',     'is_active' => true],
            ['name' => 'Khadi Silk Blend',         'description' => 'Blend of khadi and silk for luxurious feel',           'is_active' => true],
            ['name' => 'Cotton Linen',             'description' => 'Breathable cotton-linen blend, easy to maintain',      'is_active' => true],
            ['name' => 'Chanderi Cotton',          'description' => 'Lightweight Chanderi cotton from Madhya Pradesh',      'is_active' => true],
            ['name' => 'Chanderi Silk',            'description' => 'Fine Chanderi silk with traditional zari work',        'is_active' => true],
            ['name' => 'Organic Cotton',           'description' => 'Certified organic cotton, chemical-free processing',  'is_active' => true],
            ['name' => 'Handloom Cotton',          'description' => 'Traditional handloom woven cotton fabric',             'is_active' => true],
            ['name' => 'Muslin',                   'description' => 'Ultra-fine muslin fabric, perfect for summer',         'is_active' => true],
            ['name' => 'Tussar Silk',              'description' => 'Wild silk from Jharkhand with earthy texture',         'is_active' => true],
        ];

        foreach ($types as $type) {
            DB::table('fabric_types')->updateOrInsert(['name' => $type['name']], $type);
        }
        echo "✅ Fabric types: " . count($types) . "\n";
    }
}
