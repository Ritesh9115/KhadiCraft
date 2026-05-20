# ============================================================
# backend/Dockerfile
# KhadiCraft — Laravel 11 / PHP 8.2 FPM
# ============================================================

# ── Stage 1: Composer dependencies ──────────────────────────
FROM composer:2.7 AS composer_deps

WORKDIR /app

COPY composer.json composer.lock ./
# Install production deps only (no dev) for a leaner image
RUN composer install \
      --no-dev \
      --no-scripts \
      --no-autoloader \
      --ignore-platform-reqs \
      --prefer-dist

COPY . .
RUN composer dump-autoload --no-dev --classmap-authoritative

# ── Stage 2: Runtime image ───────────────────────────────────
FROM php:8.2-fpm-alpine

LABEL maintainer="KhadiCraft by Goldy <hello@khadicraft.in>"

# ── System dependencies ──────────────────────────────────────
RUN apk add --no-cache \
      bash \
      curl \
      libpng-dev \
      libjpeg-turbo-dev \
      libwebp-dev \
      freetype-dev \
      libzip-dev \
      oniguruma-dev \
      postgresql-dev \
      icu-dev \
      shadow \
      supervisor

# ── PHP extensions ───────────────────────────────────────────
RUN docker-php-ext-configure gd \
      --with-freetype \
      --with-jpeg \
      --with-webp \
 && docker-php-ext-install -j$(nproc) \
      pdo \
      pdo_pgsql \
      pgsql \
      gd \
      zip \
      mbstring \
      exif \
      bcmath \
      pcntl \
      opcache \
      intl

# ── OPcache tuning for production ────────────────────────────
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY docker/php/php.ini     /usr/local/etc/php/conf.d/custom.ini

# ── PHP-FPM pool config ──────────────────────────────────────
COPY docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf

# ── Supervisor config (runs php-fpm + queue worker) ─────────
COPY docker/supervisor/supervisord.conf /etc/supervisord.conf

WORKDIR /var/www/html

# ── Copy app + compiled vendor from composer stage ──────────
COPY --from=composer_deps /app .

# ── Storage & bootstrap cache directories ────────────────────
RUN mkdir -p \
      storage/framework/cache/data \
      storage/framework/sessions \
      storage/framework/views \
      storage/logs \
      bootstrap/cache \
 && chmod -R 775 storage bootstrap/cache \
 && chown -R www-data:www-data storage bootstrap/cache

# ── Entrypoint script ────────────────────────────────────────
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]