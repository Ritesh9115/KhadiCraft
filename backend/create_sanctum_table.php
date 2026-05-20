<?php
/**
 * KhadiCraft — Sanctum Table Creator
 * 
 * Run this ONCE to create the missing personal_access_tokens table:
 *   php create_sanctum_table.php
 * 
 * Place this file in your backend/ root folder.
 */

// Load Laravel
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "\n🔧 KhadiCraft — Sanctum Table Setup\n";
echo "=====================================\n";

// 1. personal_access_tokens (Laravel Sanctum)
if (!Schema::hasTable('personal_access_tokens')) {
    DB::statement("
        CREATE TABLE personal_access_tokens (
            id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            tokenable_type  VARCHAR(255)    NOT NULL,
            tokenable_id    BIGINT UNSIGNED NOT NULL,
            name            VARCHAR(255)    NOT NULL,
            token           VARCHAR(64)     NOT NULL UNIQUE,
            abilities       TEXT,
            last_used_at    TIMESTAMP       NULL,
            expires_at      TIMESTAMP       NULL,
            created_at      TIMESTAMP       NULL,
            updated_at      TIMESTAMP       NULL,
            PRIMARY KEY (id),
            INDEX personal_access_tokens_tokenable_type_tokenable_id_index (tokenable_type, tokenable_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "✅ personal_access_tokens table created!\n";
} else {
    echo "✅ personal_access_tokens already exists — skipping.\n";
}

// 2. migrations table (if missing)
if (!Schema::hasTable('migrations')) {
    DB::statement("
        CREATE TABLE migrations (
            id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
            migration VARCHAR(255) NOT NULL,
            batch     INT          NOT NULL,
            PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "✅ migrations table created!\n";
} else {
    echo "✅ migrations already exists — skipping.\n";
}

// 3. cache table (if missing)
if (!Schema::hasTable('cache')) {
    DB::statement("
        CREATE TABLE cache (
            `key`       VARCHAR(255) NOT NULL,
            value       MEDIUMTEXT   NOT NULL,
            expiration  INT          NOT NULL,
            PRIMARY KEY (`key`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "✅ cache table created!\n";
} else {
    echo "✅ cache already exists — skipping.\n";
}

// 4. jobs table (if missing)
if (!Schema::hasTable('jobs')) {
    DB::statement("
        CREATE TABLE jobs (
            id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            queue        VARCHAR(255)    NOT NULL,
            payload      LONGTEXT        NOT NULL,
            attempts     TINYINT UNSIGNED NOT NULL,
            reserved_at  INT UNSIGNED    NULL,
            available_at INT UNSIGNED    NOT NULL,
            created_at   INT UNSIGNED    NOT NULL,
            PRIMARY KEY (id),
            INDEX jobs_queue_index (queue)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "✅ jobs table created!\n";
} else {
    echo "✅ jobs already exists — skipping.\n";
}

echo "\n🎉 All done! Now run: php artisan serve\n\n";
