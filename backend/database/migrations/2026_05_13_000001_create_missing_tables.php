<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Appointments table
        if (!Schema::hasTable('appointments')) {
            Schema::create('appointments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('purpose');
                $table->string('type')->default('in_store'); // in_store, home_visit, virtual
                $table->date('appointment_date');
                $table->string('time_slot');
                $table->string('status')->default('pending'); // pending, confirmed, completed, cancelled
                $table->text('notes')->nullable();
                $table->text('admin_notes')->nullable();
                $table->unsignedBigInteger('assigned_staff_id')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }

        // Measurement profiles table
        if (!Schema::hasTable('measurement_profiles')) {
            Schema::create('measurement_profiles', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('profile_name')->default('My Measurements');
                $table->boolean('is_default')->default(false);
                $table->decimal('chest', 5, 1)->nullable();
                $table->decimal('waist', 5, 1)->nullable();
                $table->decimal('hips', 5, 1)->nullable();
                $table->decimal('shoulder', 5, 1)->nullable();
                $table->decimal('shirt_length', 5, 1)->nullable();
                $table->decimal('pant_length', 5, 1)->nullable();
                $table->decimal('sleeve_length', 5, 1)->nullable();
                $table->decimal('neck', 5, 1)->nullable();
                $table->decimal('thigh', 5, 1)->nullable();
                $table->decimal('inseam', 5, 1)->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // Reviews table
        if (!Schema::hasTable('reviews')) {
            Schema::create('reviews', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
                $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('set null');
                $table->tinyInteger('rating');
                $table->text('review')->nullable();
                $table->boolean('is_approved')->default(false);
                $table->text('admin_reply')->nullable();
                $table->timestamps();
            });
        }

        // Notifications table
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('title');
                $table->text('message');
                $table->string('type')->default('general');
                $table->string('action_url')->nullable();
                $table->boolean('is_read')->default(false);
                $table->timestamps();
            });
        }

        // User addresses table (if missing)
        if (!Schema::hasTable('user_addresses')) {
            Schema::create('user_addresses', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('name');
                $table->string('phone');
                $table->string('address_line1');
                $table->string('address_line2')->nullable();
                $table->string('city');
                $table->string('state');
                $table->string('pincode');
                $table->string('type')->default('home');
                $table->boolean('is_default')->default(false);
                $table->timestamps();
            });
        }

        // Wholesale quotes
        if (!Schema::hasTable('wholesale_quotes')) {
            Schema::create('wholesale_quotes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('buyer_id')->constrained('wholesale_buyers')->onDelete('cascade');
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('quote_number')->unique();
                $table->string('status')->default('pending');
                $table->decimal('total', 10, 2)->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // Custom order stages
        if (!Schema::hasTable('custom_order_stages')) {
            Schema::create('custom_order_stages', function (Blueprint $table) {
                $table->id();
                $table->foreignId('custom_order_id')->constrained('custom_orders')->onDelete('cascade');
                $table->string('stage');
                $table->string('status')->default('pending');
                $table->timestamp('completed_at')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_order_stages');
        Schema::dropIfExists('wholesale_quotes');
        Schema::dropIfExists('user_addresses');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('measurement_profiles');
        Schema::dropIfExists('appointments');
    }
};
