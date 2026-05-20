<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $fabricCat   = Category::where('slug', 'fabric-thaan')->first();
        $readyCat    = Category::where('slug', 'ready-made')->first();
        $accessCat   = Category::where('slug', 'accessories')->first();

        if (!$fabricCat || !$readyCat) {
            echo "⚠️  Categories not found — run CategorySeeder first\n";
            return;
        }

        $products = [
            // ── Fabrics ────────────────────────────────────
            [
                'category_id'    => $fabricCat->id,
                'name'           => 'Pure Khadi Cotton Thaan — White',
                'slug'           => 'pure-khadi-cotton-thaan-white',
                'sku'            => 'FAB-KHD-001',
                'description'    => 'Handwoven pure khadi cotton in pristine white. Breathable, eco-friendly, perfect for summer kurtas. Sold per metre.',
                'price'          => 280,
                'sale_price'     => 240,
                'cost_price'     => 120,
                'stock'          => 500,
                'low_stock_alert'=> 50,
                'unit'           => 'metre',
                'is_active'      => true,
                'is_featured'    => true,
                'tags'           => json_encode(['khadi', 'cotton', 'white', 'fabric']),
            ],
            [
                'category_id'    => $fabricCat->id,
                'name'           => 'Handloom Khadi Silk Blend — Ivory',
                'slug'           => 'handloom-khadi-silk-blend-ivory',
                'sku'            => 'FAB-KHD-002',
                'description'    => 'Luxurious khadi-silk blend with a subtle sheen. Ideal for sherwanis, indo-western wear and formal kurtas.',
                'price'          => 650,
                'sale_price'     => 580,
                'cost_price'     => 300,
                'stock'          => 200,
                'low_stock_alert'=> 20,
                'unit'           => 'metre',
                'is_active'      => true,
                'is_featured'    => true,
                'tags'           => json_encode(['silk', 'khadi', 'blend', 'formal']),
            ],
            [
                'category_id'    => $fabricCat->id,
                'name'           => 'Organic Cotton Linen — Navy Blue',
                'slug'           => 'organic-cotton-linen-navy-blue',
                'sku'            => 'FAB-LNN-003',
                'description'    => 'Organic cotton-linen blend in rich navy blue. Wrinkle-resistant and easy to maintain. Perfect for trousers and shirts.',
                'price'          => 420,
                'sale_price'     => null,
                'cost_price'     => 190,
                'stock'          => 350,
                'low_stock_alert'=> 30,
                'unit'           => 'metre',
                'is_active'      => true,
                'is_featured'    => false,
                'tags'           => json_encode(['linen', 'cotton', 'navy', 'organic']),
            ],
            [
                'category_id'    => $fabricCat->id,
                'name'           => 'Chanderi Silk Thaan — Golden Yellow',
                'slug'           => 'chanderi-silk-thaan-golden-yellow',
                'sku'            => 'FAB-CND-004',
                'description'    => 'Authentic Chanderi silk with traditional zari work. Woven by master artisans in Madhya Pradesh. Excellent for festive wear.',
                'price'          => 1200,
                'sale_price'     => 999,
                'cost_price'     => 550,
                'stock'          => 80,
                'low_stock_alert'=> 10,
                'unit'           => 'metre',
                'is_active'      => true,
                'is_featured'    => true,
                'tags'           => json_encode(['chanderi', 'silk', 'festive', 'zari']),
            ],

            // ── Ready-made ──────────────────────────────────
            [
                'category_id'    => $readyCat->id,
                'name'           => 'Classic Khadi Kurta — Men\'s White',
                'slug'           => 'classic-khadi-kurta-mens-white',
                'sku'            => 'RDY-KRT-001',
                'description'    => 'The evergreen men\'s khadi kurta in pristine white. Mandarin collar, full sleeves, traditional fit. Available in S-XXL.',
                'price'          => 1299,
                'sale_price'     => 999,
                'cost_price'     => 450,
                'stock'          => 150,
                'low_stock_alert'=> 15,
                'unit'           => 'piece',
                'is_active'      => true,
                'is_featured'    => true,
                'tags'           => json_encode(['kurta', 'mens', 'white', 'casual']),
            ],
            [
                'category_id'    => $readyCat->id,
                'name'           => 'Ethnic Kurta-Pajama Set — Indigo',
                'slug'           => 'ethnic-kurta-pajama-set-indigo',
                'sku'            => 'RDY-SET-002',
                'description'    => 'Complete kurta-pajama set in deep indigo blue. Block-printed hem detailing. Perfect for festivals and family functions.',
                'price'          => 2199,
                'sale_price'     => 1799,
                'cost_price'     => 800,
                'stock'          => 80,
                'low_stock_alert'=> 10,
                'unit'           => 'set',
                'is_active'      => true,
                'is_featured'    => true,
                'tags'           => json_encode(['kurta', 'pajama', 'set', 'festival']),
            ],
            [
                'category_id'    => $readyCat->id,
                'name'           => 'Linen Casual Shirt — Sky Blue',
                'slug'           => 'linen-casual-shirt-sky-blue',
                'sku'            => 'RDY-SHT-003',
                'description'    => 'Relaxed-fit linen shirt in sky blue. Breathable for summer. Spread collar with coconut shell buttons.',
                'price'          => 1599,
                'sale_price'     => null,
                'cost_price'     => 600,
                'stock'          => 120,
                'low_stock_alert'=> 12,
                'unit'           => 'piece',
                'is_active'      => true,
                'is_featured'    => false,
                'tags'           => json_encode(['shirt', 'linen', 'casual', 'summer']),
            ],
            [
                'category_id'    => $readyCat->id,
                'name'           => 'Nehru Jacket — Olive Green',
                'slug'           => 'nehru-jacket-olive-green',
                'sku'            => 'RDY-JKT-004',
                'description'    => 'Iconic Nehru collar jacket in olive green khadi. Pair with kurta or shirt for a smart indo-western look.',
                'price'          => 2499,
                'sale_price'     => 1999,
                'cost_price'     => 900,
                'stock'          => 60,
                'low_stock_alert'=> 8,
                'unit'           => 'piece',
                'is_active'      => true,
                'is_featured'    => true,
                'tags'           => json_encode(['jacket', 'nehru', 'ethnic', 'formal']),
            ],

            // ── Accessories ─────────────────────────────────
            [
                'category_id'    => $accessCat ? $accessCat->id : $readyCat->id,
                'name'           => 'Handwoven Khadi Stole — Multicolour',
                'slug'           => 'handwoven-khadi-stole-multicolour',
                'sku'            => 'ACC-STL-001',
                'description'    => 'Hand-block-printed khadi cotton stole in vibrant geometric patterns. 100×200 cm. Machine washable.',
                'price'          => 799,
                'sale_price'     => 649,
                'cost_price'     => 280,
                'stock'          => 200,
                'low_stock_alert'=> 20,
                'unit'           => 'piece',
                'is_active'      => true,
                'is_featured'    => false,
                'tags'           => json_encode(['stole', 'dupatta', 'handblock', 'gift']),
            ],
            [
                'category_id'    => $accessCat ? $accessCat->id : $readyCat->id,
                'name'           => 'Cotton Khadi Tote Bag — Natural',
                'slug'           => 'cotton-khadi-tote-bag-natural',
                'sku'            => 'ACC-BAG-002',
                'description'    => 'Sturdy khadi tote bag in natural undyed cotton. Reinforced stitching, 20L capacity. Eco-friendly alternative to plastic.',
                'price'          => 499,
                'sale_price'     => null,
                'cost_price'     => 180,
                'stock'          => 300,
                'low_stock_alert'=> 30,
                'unit'           => 'piece',
                'is_active'      => true,
                'is_featured'    => false,
                'tags'           => json_encode(['bag', 'tote', 'eco', 'cotton']),
            ],
        ];

        foreach ($products as $p) {
            Product::updateOrCreate(['sku' => $p['sku']], $p);
        }

        echo "✅ Products seeded: " . count($products) . " products (4 fabrics + 4 ready-made + 2 accessories)\n";
    }
}
