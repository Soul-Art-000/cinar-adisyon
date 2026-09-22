FROM php:8.2-apache

# Install dependencies and extensions
RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev libzip-dev unzip libicu-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo pdo_mysql zip intl bcmath exif \
    && a2enmod rewrite

# Setup permissions
RUN chown -R www-data:www-data /var/www/html




