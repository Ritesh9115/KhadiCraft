<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Fix wholesale_buyers ─────────────────────────────────────
        Schema::table('wholesale_buyers', function (Blueprint $table) {
            if (!Schema::hasColumn('wholesale_buyers', 'gst_number'))
                $table->string('gst_number')->nullable()->after('business_name');
            if (!Schema::hasColumn('wholesale_buyers', 'business_type'))
                $table->string('business_type')->nullable()->after('gst_number');
            if (!Schema::hasColumn('wholesale_buyers', 'contact_name'))
                $table->string('contact_name')->nullable()->after('business_type');
            if (!Schema::hasColumn('wholesale_buyers', 'phone'))
                $table->string('phone')->nullable()->after('contact_name');
            if (!Schema::hasColumn('wholesale_buyers', 'email'))
                $table->string('email')->nullable()->after('phone');
            if (!Schema::hasColumn('wholesale_buyers', 'address'))
                $table->text('address')->nullable()->after('email');
            if (!Schema::hasColumn('wholesale_buyers', 'city'))
                $table->string('city')->nullable()->after('address');
            if (!Schema::hasColumn('wholesale_buyers', 'state'))
                $table->string('state')->nullable()->after('city');
            if (!Schema::hasColumn('wholesale_buyers', 'pincode'))
                $table->string('pincode')->nullable()->after('state');
            if (!Schema::hasColumn('wholesale_buyers', 'expected_monthly_value'))
                $table->decimal('expected_monthly_value', 12, 2)->nullable()->after('pincode');
            if (!Schema::hasColumn('wholesale_buyers', 'discount_percentage'))
                $table->decimal('discount_percentage', 5, 2)->default(15)->after('expected_monthly_value');
            if (!Schema::hasColumn('wholesale_buyers', 'products_interested'))
                $table->text('products_interested')->nullable()->after('discount_percentage');
            if (!Schema::hasColumn('wholesale_buyers', 'notes'))
                $table->text('notes')->nullable()->after('products_interested');
            if (!Schema::hasColumn('wholesale_buyers', 'approved_at'))
                $table->timestamp('approved_at')->nullable()->after('notes');
        });

        // ── Fix wholesale_quotes ────────────────────────────────────
        Schema::table('wholesale_quotes', function (Blueprint $table) {
            if (!Schema::hasColumn('wholesale_quotes', 'delivery_location'))
                $table->string('delivery_location')->nullable()->after('quote_number');
            if (!Schema::hasColumn('wholesale_quotes', 'delivery_date'))
                $table->date('delivery_date')->nullable()->after('delivery_location');
            if (!Schema::hasColumn('wholesale_quotes', 'total_amount'))
                $table->decimal('total_amount', 12, 2)->default(0)->after('total');
            if (!Schema::hasColumn('wholesale_quotes', 'valid_until'))
                $table->timestamp('valid_until')->nullable()->after('total_amount');
            if (!Schema::hasColumn('wholesale_quotes', 'items'))
                $table->text('items')->nullable()->comment('JSON encoded items array');
        });

        // ── Fix banners ────────────────────────────────────────────
        Schema::table('banners', function (Blueprint $table) {
            if (!Schema::hasColumn('banners', 'subtitle'))
                $table->string('subtitle', 500)->nullable()->after('title');
            if (!Schema::hasColumn('banners', 'link'))
                $table->string('link')->nullable()->after('image');
            if (!Schema::hasColumn('banners', 'button_text'))
                $table->string('button_text', 100)->nullable()->after('link');
            if (!Schema::hasColumn('banners', 'position'))
                $table->string('position')->default('home')->after('button_text');
            if (!Schema::hasColumn('banners', 'sort_order'))
                $table->integer('sort_order')->default(0)->after('position');
            if (!Schema::hasColumn('banners', 'start_date'))
                $table->date('start_date')->nullable()->after('sort_order');
            if (!Schema::hasColumn('banners', 'end_date'))
                $table->date('end_date')->nullable()->after('start_date');
        });

        // ── Fix custom_orders — add missing columns ─────────────────
        Schema::table('custom_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('custom_orders', 'tailor_notes'))
                $table->text('tailor_notes')->nullable();
            if (!Schema::hasColumn('custom_orders', 'actual_ready_date'))
                $table->date('actual_ready_date')->nullable();
        });
    }

    public function down(): void {}
};
