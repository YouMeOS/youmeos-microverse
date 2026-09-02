ARG BASE_IMAGE=xengenie/youmeos-base:latest
FROM ${BASE_IMAGE}

WORKDIR /var/www/html

# WordPress Core from pre-compiled official image layer
COPY --from=wordpress:php8.3 --chown=www-data:www-data /usr/src/wordpress /var/www/html/

# Copy Composer config
COPY composer.json composer.lock* /var/www/html/

# Cache busting argument to invalidate cached layers when new plugin versions are released
ARG CACHE_BUST=1

# Install / update plugins, themes, and dependencies via Composer during build
RUN --mount=type=secret,id=GITHUB_TOKEN,required=false \
    --mount=type=cache,target=/root/.composer/cache \
    if [ -f /run/secrets/GITHUB_TOKEN ]; then \
        export COMPOSER_AUTH="{\"github-oauth\": {\"github.com\": \"$(cat /run/secrets/GITHUB_TOKEN)\"}}"; \
    fi; \
    COMPOSER_ALLOW_SUPERUSER=1 composer update --no-dev --prefer-dist --no-interaction --optimize-autoloader

# Copy core mu-plugins
COPY --chown=www-data:www-data wp-content/mu-plugins/ /var/www/html/wp-content/mu-plugins/

RUN chown -R www-data:www-data /var/www/html/wp-content

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

EXPOSE 80 443

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]

