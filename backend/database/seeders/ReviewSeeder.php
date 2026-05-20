<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Product;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $customers = User::where('role', 'customer')->get();
        $products  = Product::all();

        $reviews = [
            "Excellent quality! The fabric is exactly as described. Very soft and breathable.",
            "Fast delivery and beautifully packaged. The kurta fits perfectly. Will order again!",
            "Authentic khadi — you can feel the handwoven texture. Loved it.",
            "Good product but took a little longer to arrive. Quality is great though.",
            "The fabric is perfect for summer. Light, airy, and very comfortable.",
            "Great value for money. The color didn't fade after washing. Highly recommend.",
            "The stitching quality is outstanding. Every seam is perfectly done.",
            "Ordered the custom kurta set and it fits like a dream. Excellent tailor work.",
        ];

        $count = 0;
        foreach ($customers as $ci => $customer) {
            $reviewProducts = $products->random(min(2, $products->count()));
            foreach ($reviewProducts as $product) {
                DB::table('reviews')->insert([
                    'user_id'    => $customer->id,
                    'product_id' => $product->id,
                    'order_id'   => null,
                    'rating'     => rand(4, 5),
                    'review'     => $reviews[array_rand($reviews)],
                    'is_approved'=> true,
                    'admin_reply'=> $ci % 3 === 0 ? 'Thank you for your kind words! 🙏 We are delighted you loved the product.' : null,
                    'created_at' => now()->subDays(rand(1, 60)),
                    'updated_at' => now()->subDays(rand(1, 60)),
                ]);
                $count++;
            }
        }

        echo "✅ Reviews seeded: {$count}\n";
    }
}
