FROM php:8.5-fpm-alpine

USER root

RUN addgroup -g 1000 -S lomi && \
    adduser -u 1000 -S lomi -G lomi -h /home/lomi -s /bin/bash

RUN mkdir -p /var/www/html \
    /home/lomi/.vscode-server \
    /home/lomi/.code-server \
    /home/lomi/.composer && \
    chown -R lomi:lomi /var/www/html /home/lomi

WORKDIR /var/www/html

RUN apk add --no-cache \
    unzip \
    zip \
    libzip-dev \
    postgresql-dev \
    git \
    bash \
    libstdc++ \
    libc6-compat \
    gcompat \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    libwebp-dev \
    imagemagick-dev \
    icu-dev \
    $PHPIZE_DEPS \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install pdo pdo_mysql zip mysqli gd exif intl \
    && pecl install imagick \
    && docker-php-ext-enable imagick \
    && apk del $PHPIZE_DEPS

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

EXPOSE 9000

USER lomi

CMD ["php-fpm", "-F"]