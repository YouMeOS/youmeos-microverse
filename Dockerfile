ARG BASE_IMAGE=xengenie/youmeos-base:latest
FROM ${BASE_IMAGE}

# WordPress Core from pre-compiled official image layer
COPY --from=wordpress:php8.3 --chown=www-data:www-data /usr/src/wordpress /var/www/html/

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

