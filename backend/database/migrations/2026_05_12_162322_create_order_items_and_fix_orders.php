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
        // 1. Add missing columns to the existing 'orders' table
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'payment_id')) $table->string('payment_id')->nullable();
            if (!Schema::hasColumn('orders', 'paid_at')) $table->timestamp('paid_at')->nullable();
            if (!Schema::hasColumn('orders', 'tracking_number')) $table->string('tracking_number')->nullable();
            if (!Schema::hasColumn('orders', 'courier')) $table->string('courier')->nullable();
            if (!Schema::hasColumn('orders', 'estimated_delivery')) $table->timestamp('estimated_delivery')->nullable();
            if (!Schema::hasColumn('orders', 'delivered_at')) $table->timestamp('delivered_at')->nullable();
        });

        // 2. Create the completely missing 'order_items' table
        if (!Schema::hasTable('order_items')) {
            Schema::create('order_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained()->onDelete('cascade');
                $table->foreignId('product_id')->constrained()->onDelete('cascade');
                $table->unsignedBigInteger('variant_id')->nullable();
                $table->string('product_name')->nullable();
                $table->string('variant_info')->nullable();
                $table->string('thumbnail')->nullable();
                $table->integer('quantity');
                $table->decimal('price', 10, 2);
                $table->decimal('total', 10, 2);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items_and_fix_orders');
    }
};
