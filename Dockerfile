FROM dunglas/frankenphp:1-php8.3-alpine

# Install SQLite and required PHP extensions
RUN install-php-extensions \
    pdo_sqlite \
    sqlite3 \
    gd \
    intl \
    zip \
    opcache \
    exif \
    bcmath

# Download WordPress Core
ENV WP_VERSION=latest
RUN curl -o /tmp/wordpress.tar.gz -fSL "https://wordpress.org/${WP_VERSION}.tar.gz" \
    && tar -xzf /tmp/wordpress.tar.gz -C /tmp/ \
    && rm -rf /var/www/html/* \
    && cp -r /tmp/wordpress/* /var/www/html/ \
    && rm -rf /tmp/wordpress /tmp/wordpress.tar.gz

# Copy BlackBOX payload (mu-plugins, plugins, themes, sqlite dropin)
COPY blackbox/ /usr/src/blackbox-template/
RUN cp -r /usr/src/blackbox-template/* /var/www/html/wp-content/

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
