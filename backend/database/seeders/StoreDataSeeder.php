<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\FabricType;
use App\Models\TimeSlot;
use App\Models\Product;
use Illuminate\Support\Str;

class StoreDataSeeder extends Seeder
{
    public function run()
    {
        // ---------------------------------------------------------
        // 1. EXACTLY 5 DUMMY CATEGORIES
        // ---------------------------------------------------------
        $categories = [
            ['name' => 'Men\'s Wear', 'description' => 'Traditional and modern Khadi clothing for men.'],
            ['name' => 'Women\'s Wear', 'description' => 'Handwoven sarees, kurtis, and dresses for women.'],
            ['name' => 'Accessories', 'description' => 'Handmade Khadi bags, wallets, and accessories.'],
            ['name' => 'Home Decor', 'description' => 'Curtains, bedsheets, and aesthetic home items.'],
            ['name' => 'Winter Collection', 'description' => 'Warm woolen Khadi jackets, shawls, and coats.']
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(
                ['slug' => Str::slug($cat['name'])],
                [
                    'name' => $cat['name'],
                    'description' => $cat['description'],
                    'is_active' => true
                ]
            );
        }

        // ---------------------------------------------------------
        // 2. EXACTLY 5 DUMMY FABRICS
        // ---------------------------------------------------------
        $fabrics = [
            ['name' => 'Pure Khadi', 'description' => '100% handspun and handwoven cotton, perfectly breathable.'],
            ['name' => 'Khadi Silk', 'description' => 'A luxurious blend of Khadi and Silk for special occasions.'],
            ['name' => 'Muslin', 'description' => 'Ultra-lightweight, fine breathable cotton.'],
            ['name' => 'Linen', 'description' => 'Cool, highly absorbent fabric, perfect for summer wear.'],
            ['name' => 'Khadi Wool', 'description' => 'Warm, handwoven woolen fabric for harsh winters.']
        ];

        foreach ($fabrics as $fabric) {
            FabricType::firstOrCreate(
                ['name' => $fabric['name']],
                ['description' => $fabric['description'], 'is_active' => true]
            );
        }

        // ---------------------------------------------------------
        // 3. EXACTLY 5 DUMMY TIME SLOTS (For Appointments)
        // ---------------------------------------------------------
        $slots = [
            '10:00 AM - 11:00 AM',
            '11:30 AM - 12:30 PM',
            '01:00 PM - 02:00 PM',
            '02:30 PM - 03:30 PM',
            '04:00 PM - 05:00 PM',
        ];

        foreach ($slots as $slot) {
            TimeSlot::firstOrCreate(
                ['time_range' => $slot],
                ['is_active' => true]
            );
        }

        // ---------------------------------------------------------
        // 4. EXACTLY 5 DUMMY PRODUCTS
        // ---------------------------------------------------------
        $products = [
            [
                'name' => 'Classic White Khadi Kurta',
                'price' => 1499.00,
                'category' => 'Men\'s Wear', // Matches category seeded above
                'fabric' => 'Pure Khadi'
            ],
            [
                'name' => 'Elegant Khadi Silk Saree',
                'price' => 4599.00,
                'category' => 'Women\'s Wear',
                'fabric' => 'Khadi Silk'
            ],
            [
                'name' => 'Handcrafted Khadi Tote Bag',
                'price' => 899.00,
                'category' => 'Accessories',
                'fabric' => 'Linen'
            ],
            [
                'name' => 'Summer Muslin Daily Shirt',
                'price' => 1299.00,
                'category' => 'Men\'s Wear',
                'fabric' => 'Muslin'
            ],
            [
                'name' => 'Handwoven Winter Shawl',
                'price' => 2199.00,
                'category' => 'Winter Collection',
                'fabric' => 'Khadi Wool'
            ]
        ];

        foreach ($products as $index => $prod) {
            Product::firstOrCreate(
                ['slug' => Str::slug($prod['name'])],
                [
                    'name' => $prod['name'],
                    'description' => 'A high-quality ' . $prod['fabric'] . ' item from our ' . $prod['category'] . ' collection. Sustainably sourced and handmade.',
                    'price' => $prod['price'],
                    'sale_price' => $prod['price'] - 200, // Just a dummy 200 rupees discount
                    'category_id' => 1, // Will be set after categories are created
                    'fabric_type_id' => 1, // Will be set after fabric types are created
                    'care_instructions' => 'Hand wash cold, dry in shade.',
                    'images' => json_encode(['placeholder1.jpg', 'placeholder2.jpg']),
                    'is_active' => true,
                    'is_featured' => ($index < 2), // Makes the first 2 products "Featured"
                    'stock' => rand(20, 100), // Random stock between 20 and 100
                    'meta_title' => $prod['name'] . ' - KhadiCraft',
                    'meta_description' => 'Premium ' . $prod['fabric'] . ' ' . $prod['category'] . ' from KhadiCraft'
                ]
            );
        }

        $this->command->info('✅ Seeded exactly 5 Categories, 5 Fabrics, 5 Time Slots, and 5 Products successfully!');
    }
}
