FROM dunglas/frankenphp:1-php8.3-alpine

# Install system packages & PHP extensions
RUN apk add --no-cache git unzip bash \
    && install-php-extensions \
    mysqli \
    pdo_mysql \
    pdo_sqlite \
    sqlite3 \
    gd \
    intl \
    zip \
    opcache \
    exif \
    bcmath

# Install Composer binary
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Download WordPress Core
ENV WP_VERSION=latest
RUN curl -o /tmp/wordpress.tar.gz -fSL "https://wordpress.org/${WP_VERSION}.tar.gz" \
    && tar -xzf /tmp/wordpress.tar.gz -C /tmp/ \
    && rm -rf /var/www/html/* \
    && cp -r /tmp/wordpress/* /var/www/html/ \
    && rm -rf /tmp/wordpress /tmp/wordpress.tar.gz \
    && chown -R www-data:www-data /var/www/html

# Copy Composer config and core mu-plugins
COPY composer.json composer.lock* /var/www/html/
COPY --chown=www-data:www-data wp-content/mu-plugins/ /var/www/html/wp-content/mu-plugins/
COPY --chown=www-data:www-data wp-content/db.php /var/www/html/wp-content/db.php

# Copy Caddyfile configuration
COPY src/main/engine/Caddyfile /etc/caddy/Caddyfile

# Copy and setup entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Configure environment defaults
ENV PORT=80
ENV HTTPS_PORT=443
ENV WP_ROOT=/var/www/html
ENV SERVER_NAME=":80"

WORKDIR /var/www/html

EXPOSE 80 443

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]
