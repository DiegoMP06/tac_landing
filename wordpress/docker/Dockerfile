FROM composer:2 AS composer_build

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

COPY . .

RUN composer dump-autoload --optimize --no-dev --classmap-authoritative

FROM php:8.3-fpm-alpine

RUN apk add --no-cache nginx supervisor bash freetype-dev libjpeg-turbo-dev libpng-dev libwebp-dev libzip-dev icu-dev $PHPIZE_DEPS \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install pdo pdo_mysql mysqli zip gd exif intl opcache \
    && pecl install imagick && docker-php-ext-enable imagick && apk del $PHPIZE_DEPS

RUN echo 'opcache.memory_consumption=128' >> /usr/local/etc/php/conf.d/opcache.ini && \
    echo 'opcache.max_accelerated_files=4000' >> /usr/local/etc/php/conf.d/opcache.ini

WORKDIR /var/www/html

COPY --from=composer_build /app /var/www/html

COPY docker/nginx.prod.conf /etc/nginx/http.d/default.conf

COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf


RUN mkdir -p /var/www/html/web/app/uploads \
    && chown -R www-data:www-data /var/www/html/web/app/uploads /var/run /var/log/nginx \
    && chmod -R 755 /var/www/html/web/app/uploads

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]