<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add missing columns to categories table
        Schema::table('categories', function (Blueprint $table) {
            if (!Schema::hasColumn('categories', 'parent_id')) {
                $table->unsignedBigInteger('parent_id')->nullable()->after('id');
                $table->foreign('parent_id')->references('id')->on('categories')->onDelete('set null');
            }
            if (!Schema::hasColumn('categories', 'image')) {
                $table->string('image')->nullable()->after('description');
            }
            if (!Schema::hasColumn('categories', 'sort_order')) {
                $table->integer('sort_order')->default(0)->after('is_active');
            }
        });

        // Add missing columns to products table (soft deletes + fabric_type_id)
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'fabric_type_id')) {
                $table->unsignedBigInteger('fabric_type_id')->nullable()->after('category_id');
                $table->foreign('fabric_type_id')->references('id')->on('fabric_types')->onDelete('set null');
            }
            if (!Schema::hasColumn('products', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        // Add missing columns to inventory_logs if exist
        if (Schema::hasTable('inventory_logs')) {
            Schema::table('inventory_logs', function (Blueprint $table) {
                if (!Schema::hasColumn('inventory_logs', 'reference_type')) {
                    $table->string('reference_type')->nullable()->after('stock_after');
                }
                if (!Schema::hasColumn('inventory_logs', 'created_by')) {
                    $table->unsignedBigInteger('created_by')->nullable()->after('reference_type');
                }
            });
        }

        // Add missing columns to custom_orders if exist
        if (Schema::hasTable('custom_orders')) {
            Schema::table('custom_orders', function (Blueprint $table) {
                if (!Schema::hasColumn('custom_orders', 'assigned_tailor_id')) {
                    $table->unsignedBigInteger('assigned_tailor_id')->nullable()->after('user_id');
                }
                if (!Schema::hasColumn('custom_orders', 'style_type')) {
                    $table->string('style_type')->nullable()->after('status');
                }
                if (!Schema::hasColumn('custom_orders', 'admin_notes')) {
                    $table->text('admin_notes')->nullable();
                }
                if (!Schema::hasColumn('custom_orders', 'estimated_ready_date')) {
                    $table->date('estimated_ready_date')->nullable();
                }
                if (!Schema::hasColumn('custom_orders', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }

        // Add action_url to notifications if exists
        if (Schema::hasTable('notifications')) {
            Schema::table('notifications', function (Blueprint $table) {
                if (!Schema::hasColumn('notifications', 'action_url')) {
                    $table->string('action_url')->nullable()->after('type');
                }
            });
        }

        // Add admin_reply to reviews if exists
        if (Schema::hasTable('reviews')) {
            Schema::table('reviews', function (Blueprint $table) {
                if (!Schema::hasColumn('reviews', 'admin_reply')) {
                    $table->text('admin_reply')->nullable();
                }
                if (!Schema::hasColumn('reviews', 'is_approved')) {
                    $table->boolean('is_approved')->default(false);
                }
            });
        }
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['parent_id', 'image', 'sort_order']);
        });
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['fabric_type_id', 'deleted_at']);
        });
    }
};
