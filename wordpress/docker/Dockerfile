FROM composer:2 AS composer_build

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

COPY . .

RUN composer dump-autoload --optimize --no-dev --classmap-authoritative

FROM php:8.3-fpm-alpine

COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

RUN apk add --no-cache nginx supervisor bash \
    && install-php-extensions pdo_mysql mysqli zip gd exif intl opcache imagick

RUN echo 'opcache.memory_consumption=128' >> /usr/local/etc/php/conf.d/opcache.ini && \
    echo 'opcache.max_accelerated_files=4000' >> /usr/local/etc/php/conf.d/opcache.ini

WORKDIR /var/www/html

COPY --from=composer_build /app /var/www/html

COPY docker/nginx.prod.conf /etc/nginx/http.d/default.conf

COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN mkdir -p /var/www/html/web/app/uploads \
             /var/www/html/web/app/plugins \
             /var/www/html/web/app/upgrade \
             /var/www/html/web/app/cache \
    && chown -R www-data:www-data /var/www/html/web/app /var/run /var/log/nginx \
    && chmod -R 775 /var/www/html/web/app/uploads \
                    /var/www/html/web/app/plugins \
                    /var/www/html/web/app/upgrade \
                    /var/www/html/web/app/cache

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]