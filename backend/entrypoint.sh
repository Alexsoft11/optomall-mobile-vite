#!/usr/bin/env bash
set -e

# If Laravel app not present, create a new project using composer
if [ ! -f /var/www/html/artisan ]; then
  echo "No Laravel app found in /var/www/html — creating new Laravel project..."
  composer create-project --prefer-dist laravel/laravel /var/www/html "^10.0"
  chown -R www-data:www-data /var/www/html
fi

cd /var/www/html

# Ensure vendor dependencies
if [ -f composer.json ]; then
  composer install --no-interaction --prefer-dist
fi

# Generate app key if not set
if [ ! -f .env ]; then
  cp .env.example .env
  php artisan key:generate
fi

# Wait for DB service to be available (simple retry)
if [ "$DB_HOST" != "" ]; then
  echo "Waiting for database at $DB_HOST:$DB_PORT..."
  until php -r "try{ new PDO('mysql:host=' . getenv('DB_HOST') . ';port=' . getenv('DB_PORT'), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); echo 'connected'; }catch(Exception){ echo 'waiting'; exit(1);}"; do
    sleep 2
  done
  echo "Database available"
fi

# Run migrations (safe) — will fail if no DB yet
if php artisan migrate --force; then
  echo "Migrations ran"
else
  echo "Migrations skipped or failed (DB may not be ready yet)"
fi

# Fix permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache || true

# Start php-fpm (foreground)
php-fpm
