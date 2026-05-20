<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        
        // 4. Create Fully Updated Products Table
        Schema::dropIfExists('products'); // Drop the outdated one
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable();
            $table->foreignId('fabric_type_id')->nullable();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sku')->nullable()->unique();
            $table->text('short_description')->nullable();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('sale_price', 10, 2)->nullable();
            $table->decimal('cost_price', 10, 2)->nullable();
            $table->integer('stock')->default(0);
            $table->integer('low_stock_alert')->default(5);
            $table->string('weight')->nullable();
            $table->string('unit')->default('piece');
            $table->string('product_type')->default('ready_made');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_custom_available')->default(false);
            $table->boolean('is_wholesale_available')->default(false);
            $table->integer('wholesale_min_qty')->default(10);
            $table->decimal('wholesale_price', 10, 2)->nullable();
            $table->string('thumbnail')->nullable();
            $table->json('tags')->nullable();
            $table->integer('views')->default(0);
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('products');
        Schema::dropIfExists('time_slots');
        Schema::dropIfExists('fabric_types');
        Schema::dropIfExists('categories');
    }
};
