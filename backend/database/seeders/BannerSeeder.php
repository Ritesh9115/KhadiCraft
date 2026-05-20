<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        $banners = [
            [
                'title'       => 'Pure Khadi — Straight From the Loom',
                'subtitle'    => 'Handwoven fabrics celebrating India\'s textile heritage. Shop the latest collection.',
                'image'       => null,
                'link'        => '/shop',
                'button_text' => 'Shop Now',
                'position'    => 'home',
                'sort_order'  => 1,
                'is_active'   => true,
                'start_date'  => null,
                'end_date'    => null,
            ],
            [
                'title'       => 'Custom Tailoring — Your Fit, Your Design',
                'subtitle'    => 'Get your garments stitched by expert artisans. 100% custom. 100% you.',
                'image'       => null,
                'link'        => '/custom-tailoring',
                'button_text' => 'Book Now',
                'position'    => 'home',
                'sort_order'  => 2,
                'is_active'   => true,
                'start_date'  => null,
                'end_date'    => null,
            ],
            [
                'title'       => 'Fabric Sale — Up to 30% Off',
                'subtitle'    => 'Limited stock on premium Chanderi, Kosa Silk and Handloom Cotton fabrics.',
                'image'       => null,
                'link'        => '/shop?category=fabric-thaan',
                'button_text' => 'Grab Offer',
                'position'    => 'home',
                'sort_order'  => 3,
                'is_active'   => true,
                'start_date'  => null,
                'end_date'    => null,
            ],
            [
                'title'       => 'Wholesale Partnership',
                'subtitle'    => 'Competitive bulk pricing for retailers, boutiques and institutions.',
                'image'       => null,
                'link'        => '/wholesale',
                'button_text' => 'Apply Now',
                'position'    => 'shop',
                'sort_order'  => 1,
                'is_active'   => true,
                'start_date'  => null,
                'end_date'    => null,
            ],
        ];

        foreach ($banners as $b) {
            DB::table('banners')->updateOrInsert(['title' => $b['title']], array_merge($b, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        echo "✅ Banners seeded: " . count($banners) . "\n";
    }
}
