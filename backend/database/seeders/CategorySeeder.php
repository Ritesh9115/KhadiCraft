<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name'        => 'Fabric & Thaan',
                'slug'        => 'fabric-thaan',
                'description' => 'Pure handwoven khadi fabrics, cotton, silk and blended thaans sold by the metre',
                'is_active'   => true,
                'sort_order'  => 1,
            ],
            [
                'name'        => 'Ready-made',
                'slug'        => 'ready-made',
                'description' => 'Ready-to-wear kurtas, shirts, pants and ethnic wear — available in standard sizes',
                'is_active'   => true,
                'sort_order'  => 2,
            ],
            [
                'name'        => 'Custom Tailoring',
                'slug'        => 'custom-tailoring',
                'description' => 'Bespoke stitching service — your fabric or ours, your design, perfect fit',
                'is_active'   => true,
                'sort_order'  => 3,
            ],
            [
                'name'        => 'Accessories',
                'slug'        => 'accessories',
                'description' => 'Handcrafted bags, stoles, dupattas, mojris and traditional accessories',
                'is_active'   => true,
                'sort_order'  => 4,
            ],
            [
                'name'        => 'Wholesale',
                'slug'        => 'wholesale',
                'description' => 'Bulk fabric and garment orders for retailers, boutiques and institutions',
                'is_active'   => true,
                'sort_order'  => 5,
            ],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['slug' => $cat['slug']], $cat);
        }

        echo "✅ Categories seeded: " . count($categories) . " categories\n";
    }
}
