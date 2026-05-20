<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Custom Orders (Required for Dashboard & Custom Orders Tab)
        if (!Schema::hasTable('custom_orders')) {
            Schema::create('custom_orders', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('custom_order_number')->unique();
                $table->string('status')->default('pending');
                $table->decimal('estimated_price', 10, 2)->nullable();
                $table->decimal('final_price', 10, 2)->nullable();
                $table->timestamps();
            });
        }

        // 2. Inventory Logs (Required for Inventory Tab)
        if (!Schema::hasTable('inventory_logs')) {
            Schema::create('inventory_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
                $table->string('type')->default('stock_in');
                $table->integer('quantity');
                $table->integer('stock_before');
                $table->integer('stock_after');
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // 3. Wholesale Buyers (Required for Wholesale Tab)
        if (!Schema::hasTable('wholesale_buyers')) {
            Schema::create('wholesale_buyers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('business_name');
                $table->string('status')->default('pending');
                $table->timestamps();
            });
        }

        // 4. Banners (Required for Banners Tab)
        if (!Schema::hasTable('banners')) {
            Schema::create('banners', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('image')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // 5. Payments (Required for Reports/Finance)
        if (!Schema::hasTable('payments')) {
            Schema::create('payments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('set null');
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('payment_reference')->unique();
                $table->decimal('amount', 10, 2);
                $table->string('status')->default('pending');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_panel_tables');
    }
};
