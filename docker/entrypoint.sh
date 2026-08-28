#!/bin/sh
set -e

WP_DIR="/var/www/html"
CONTENT_DIR="${WP_DIR}/wp-content"
# 1. Ensure wp-config.php is configured
if [ ! -f "${WP_DIR}/wp-config.php" ]; then
  cat << 'EOF' > "${WP_DIR}/wp-config.php"
<?php
$db_host = getenv('WORDPRESS_DB_HOST') ?: getenv('DB_HOST');

if ( $db_host ) {
    define( 'DB_NAME', getenv('WORDPRESS_DB_NAME') ?: getenv('DB_NAME') ?: 'wordpress' );
    define( 'DB_USER', getenv('WORDPRESS_DB_USER') ?: getenv('DB_USER') ?: 'root' );
    define( 'DB_PASSWORD', getenv('WORDPRESS_DB_PASSWORD') ?: getenv('DB_PASSWORD') ?: '' );
    define( 'DB_HOST', $db_host );
} else {
    define( 'DB_NAME', 'wordpress' );
    define( 'DB_USER', 'root' );
    define( 'DB_PASSWORD', '' );
    define( 'DB_HOST', 'localhost' );
    define( 'DB_FILE', 'database.sqlite' );
    define( 'DB_DIR', __DIR__ . '/wp-content' );
}

define( 'DB_CHARSET', 'utf8mb4' );
define( 'DB_COLLATE', '' );

$table_prefix = getenv('WP_TABLE_PREFIX') ?: 'wp_';

define( 'WP_DEBUG', getenv('WP_DEBUG') === 'true' );
define( 'WP_DEBUG_LOG', getenv('WP_DEBUG_LOG') === 'true' );
define( 'WP_DEBUG_DISPLAY', false );

$is_https = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ||
            (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') ||
            (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
$proto = $is_https ? 'https://' : 'http://';
$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost';

if (!defined('WP_HOME')) {
    define('WP_HOME', $proto . $host);
}
if (!defined('WP_SITEURL')) {
    define('WP_SITEURL', $proto . $host);
}

if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', __DIR__ . '/' );
}
require_once ABSPATH . 'wp-settings.php';
EOF
fi

# 2. Ensure SQLite drop-in db.php exists
if [ ! -f "${CONTENT_DIR}/db.php" ] && [ -f "${CONTENT_DIR}/plugins/sqlite-database-integration/db.copy" ]; then
  cp "${CONTENT_DIR}/plugins/sqlite-database-integration/db.copy" "${CONTENT_DIR}/db.php"
fi

# 3. Symlink custom plugins if mounted
if [ -d "/var/www/custom-plugins" ]; then
  for plugin in /var/www/custom-plugins/*; do
    if [ -d "$plugin" ] && [ "$(basename "$plugin")" != ".gitkeep" ]; then
      ln -sfn "$plugin" "${CONTENT_DIR}/plugins/$(basename "$plugin")"
    fi
  done
fi

# 4. Fix permissions
chown -R www-data:www-data "${CONTENT_DIR}" 2>/dev/null || true

exec "$@"
