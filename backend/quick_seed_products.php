<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

// Quick product seeding
$products = [
    [
        'name' => 'Traditional Khadi Kurta',
        'slug' => 'traditional-khadi-kurta',
        'description' => 'Handwoven traditional Khadi kurta made from pure cotton fabric with intricate hand embroidery work.',
        'price' => 2999.99,
        'sale_price' => 2499.99,
        'category_id' => 1,
        'fabric_type_id' => 1,
        'care_instructions' => 'Hand wash cold, dry in shade',
        'images' => json_encode(['kurta1.jpg', 'kurta2.jpg']),
        'is_active' => true,
        'is_featured' => true,
        'stock' => 50,
        'meta_title' => 'Traditional Khadi Kurta - Handwoven Cotton',
        'meta_description' => 'Pure handwoven Khadi kurta with traditional embroidery patterns',
    ],
    [
        'name' => 'Cotton Shirt',
        'slug' => 'cotton-shirt',
        'description' => 'Comfortable cotton shirt perfect for daily wear with modern fit.',
        'price' => 1299.99,
        'sale_price' => 999.99,
        'category_id' => 2,
        'fabric_type_id' => 1,
        'care_instructions' => 'Machine wash cold, tumble dry low',
        'images' => json_encode(['shirt1.jpg', 'shirt2.jpg']),
        'is_active' => true,
        'is_featured' => false,
        'stock' => 100,
        'meta_title' => 'Cotton Shirt - Modern Fit',
        'meta_description' => 'Comfortable cotton shirt for daily wear',
    ],
    [
        'name' => 'Handwoven Silk Kurta',
        'slug' => 'handwoven-silk-kurta',
        'description' => 'Elegant silk kurta with traditional handwoven patterns and gold thread embroidery.',
        'price' => 4999.99,
        'sale_price' => 3999.99,
        'category_id' => 1,
        'fabric_type_id' => 2,
        'care_instructions' => 'Dry clean only',
        'images' => json_encode(['silk_kurta1.jpg', 'silk_kurta2.jpg']),
        'is_active' => true,
        'is_featured' => true,
        'stock' => 25,
        'meta_title' => 'Handwoven Silk Kurta - Premium Quality',
        'meta_description' => 'Luxurious silk kurta with traditional craftsmanship',
    ],
    [
        'name' => 'Linen Shirt',
        'slug' => 'linen-shirt',
        'description' => 'Breathable linen shirt perfect for summer with casual elegance.',
        'price' => 1899.99,
        'sale_price' => 1499.99,
        'category_id' => 2,
        'fabric_type_id' => 3,
        'care_instructions' => 'Hand wash cold, line dry',
        'images' => json_encode(['linen_shirt1.jpg', 'linen_shirt2.jpg']),
        'is_active' => true,
        'is_featured' => false,
        'stock' => 75,
        'meta_title' => 'Linen Shirt - Summer Comfort',
        'meta_description' => 'Lightweight linen shirt for perfect summer wear',
    ],
    [
        'name' => 'Khadi Cotton Pants',
        'slug' => 'khadi-cotton-pants',
        'description' => 'Comfortable khadi cotton pants with perfect fit and traditional styling.',
        'price' => 1599.99,
        'sale_price' => 1299.99,
        'category_id' => 3,
        'fabric_type_id' => 1,
        'care_instructions' => 'Machine wash cold, tumble dry low',
        'images' => json_encode(['pants1.jpg', 'pants2.jpg']),
        'is_active' => true,
        'is_featured' => false,
        'stock' => 80,
        'meta_title' => 'Khadi Cotton Pants - Traditional Comfort',
        'meta_description' => 'Comfortable cotton pants with traditional khadi fabric',
    ],
];

echo "Creating products...\n";

foreach ($products as $productData) {
    try {
        $product = App\Models\Product::create($productData);
        echo "✅ Created: " . $product->name . " (ID: " . $product->id . ")\n";
    } catch (Exception $e) {
        echo "❌ Error creating " . $productData['name'] . ": " . $e->getMessage() . "\n";
    }
}

echo "\nDone! Total products: " . App\Models\Product::count() . "\n";
