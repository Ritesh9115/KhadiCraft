<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('custom_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('custom_orders', 'fabric_product_id'))
                $table->unsignedBigInteger('fabric_product_id')->nullable()->after('user_id');
            if (!Schema::hasColumn('custom_orders', 'fabric_name'))
                $table->string('fabric_name')->nullable()->after('fabric_product_id');
            if (!Schema::hasColumn('custom_orders', 'fabric_preference'))
                $table->text('fabric_preference')->nullable()->after('fabric_name');

            // Individual measurement columns
            $measureCols = ['chest','waist','hips','shoulder','shirt_length','pant_length','sleeve_length','neck','thigh','inseam'];
            foreach ($measureCols as $col) {
                if (!Schema::hasColumn('custom_orders', $col))
                    $table->decimal($col, 5, 1)->nullable()->after('fabric_preference');
            }
            if (!Schema::hasColumn('custom_orders', 'measurement_profile_id'))
                $table->unsignedBigInteger('measurement_profile_id')->nullable();
            if (!Schema::hasColumn('custom_orders', 'measurements'))
                $table->text('measurements')->nullable(); // JSON fallback

            if (!Schema::hasColumn('custom_orders', 'special_instructions'))
                $table->text('special_instructions')->nullable();
            if (!Schema::hasColumn('custom_orders', 'notes'))
                $table->text('notes')->nullable();
            if (!Schema::hasColumn('custom_orders', 'reference_images'))
                $table->text('reference_images')->nullable(); // JSON array
        });

        // Fix custom_order_stages — remove updated_by if it causes issues
        // It doesn't exist, so just make sure fillable doesn't include it (handled in model)
    }

    public function down(): void
    {
        Schema::table('custom_orders', function (Blueprint $table) {
            $cols = ['fabric_product_id','fabric_name','fabric_preference','chest','waist','hips',
                     'shoulder','shirt_length','pant_length','sleeve_length','neck','thigh','inseam',
                     'measurement_profile_id','measurements','special_instructions','notes','reference_images'];
            $existing = array_filter($cols, fn($c) => Schema::hasColumn('custom_orders', $c));
            if ($existing) $table->dropColumn(array_values($existing));
        });
    }
};
