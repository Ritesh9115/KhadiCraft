<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Product;

class ProductVariantSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::all();
        $count = 0;

        $sizeColors = [
            // kurtas / ready-made → sizes
            ['sizes' => ['S', 'M', 'L', 'XL', 'XXL'], 'colors' => [['name' => 'White', 'hex' => '#FFFFFF'], ['name' => 'Off-White', 'hex' => '#F5F5DC']]],
            ['sizes' => ['S', 'M', 'L', 'XL'],         'colors' => [['name' => 'Indigo', 'hex' => '#4B0082'], ['name' => 'Navy', 'hex' => '#000080']]],
            ['sizes' => ['M', 'L', 'XL', 'XXL'],       'colors' => [['name' => 'Sky Blue', 'hex' => '#87CEEB'], ['name' => 'White', 'hex' => '#FFFFFF']]],
            ['sizes' => ['S', 'M', 'L', 'XL', 'XXL'], 'colors' => [['name' => 'Olive', 'hex' => '#808000'], ['name' => 'Black', 'hex' => '#1a1a1a']]],
        ];

        foreach ($products->take(8) as $i => $product) {
            $config = $sizeColors[$i % count($sizeColors)];
            foreach ($config['sizes'] as $size) {
                foreach ($config['colors'] as $color) {
                    DB::table('product_variants')->updateOrInsert(
                        ['product_id' => $product->id, 'size' => $size, 'color' => $color['name']],
                        [
                            'product_id' => $product->id,
                            'size'       => $size,
                            'color'      => $color['name'],
                            'color_hex'  => $color['hex'],
                            'sku'        => $product->sku . '-' . $size . '-' . strtoupper(substr($color['name'], 0, 3)),
                            'stock'      => rand(5, 50),
                            'price'      => null, // use base price
                            'is_active'  => true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                    $count++;
                }
            }
        }

        echo "✅ Product variants seeded: {$count}\n";
    }
}
