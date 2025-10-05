# Optomall Laravel Docker Setup

This folder contains a Docker-based development setup to run a local Laravel backend for the Optomall project.

What's included
- PHP-FPM (8.1) container with Composer
- Nginx webserver container
- MySQL 8.0 database container
- phpMyAdmin for DB browsing

Quick start
1. Ensure Docker and docker-compose are installed on your machine.
2. Open a terminal and run:

   cd backend
   docker-compose up --build -d

3. The first run will bootstrap a fresh Laravel project into `backend/app` (Composer will create the app). This can take a few minutes.
4. Visit the app at: http://localhost:8080
5. phpMyAdmin is available at http://localhost:8081 (user: root / password: root)

Notes
- The `entrypoint.sh` script will run `composer create-project laravel/laravel` if there's no Laravel app in `backend/app` yet.
- Database credentials are in `docker-compose.yml` and `backend/.env.example` (DB user: optomall / password: secret).
- To re-run migrations manually:

   docker-compose exec app php artisan migrate

- To seed sample data you can create seeders in Laravel and run:

   docker-compose exec app php artisan db:seed

Permissions
- The script attempts to fix storage and cache permissions. If you encounter permission issues on Linux, run:

   sudo chown -R $USER:$USER backend/app

If you want, I can also add migration files, seeders for sample products, and an API controller next. Tell me which models/fields you want (e.g. products: title, description, price, images[]).
