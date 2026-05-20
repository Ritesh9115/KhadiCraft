#!/bin/bash
# ============================================================
# docker/entrypoint.sh
# KhadiCraft Backend — Docker entrypoint
# Runs Laravel setup tasks before starting supervisord
# ============================================================

set -e

echo "=== KhadiCraft Backend Startup ==="

# ── Wait for env vars ────────────────────────────────────────
echo "[1/6] Checking environment..."
: "${APP_KEY:?APP_KEY is required. Run: php artisan key:generate}"
: "${DB_HOST:?DB_HOST is required}"

# ── Ensure storage directories exist ────────────────────────
echo "[2/6] Preparing storage directories..."
mkdir -p storage/framework/{cache/data,sessions,views} storage/logs bootstrap/cache
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# ── Create storage symlink ───────────────────────────────────
echo "[3/6] Linking storage..."
php artisan storage:link --force 2>/dev/null || true

# ── Cache config & routes ────────────────────────────────────
echo "[4/6] Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# ── Run migrations ────────────────────────────────────────────
echo "[5/6] Running database migrations..."
php artisan migrate --force --no-interaction

# ── Clear stale application cache ───────────────────────────
echo "[6/6] Clearing application cache..."
php artisan cache:clear 2>/dev/null || true

echo "=== Startup complete. Starting services... ==="

exec "$@"
