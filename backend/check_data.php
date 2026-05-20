<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

// Check database counts
echo "Products count: " . App\Models\Product::count() . PHP_EOL;
echo "Categories count: " . App\Models\Category::count() . PHP_EOL;
echo "Fabric Types count: " . App\Models\FabricType::count() . PHP_EOL;
echo "Time Slots count: " . App\Models\TimeSlot::count() . PHP_EOL;

// Check if products have data
$products = App\Models\Product::take(3)->get();
echo "\nSample products:\n";
foreach ($products as $product) {
    echo "- " . $product->name . " (ID: " . $product->id . ")\n";
}

// Check categories
$categories = App\Models\Category::take(3)->get();
echo "\nSample categories:\n";
foreach ($categories as $category) {
    echo "- " . $category->name . " (ID: " . $category->id . ")\n";
}
