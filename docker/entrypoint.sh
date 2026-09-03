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

define( 'FS_METHOD', getenv('FS_METHOD') ?: 'direct' );

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

$os_homepage_mode = getenv('OS_HOMEPAGE_MODE') ?: getenv('YOUMEOS_LOAD_MODE');
if ( $os_homepage_mode && ! defined( 'OS_HOMEPAGE_MODE' ) ) {
    define( 'OS_HOMEPAGE_MODE', $os_homepage_mode );
    define( 'YOUMEOS_LOAD_MODE', $os_homepage_mode );
}

if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', __DIR__ . '/' );
}
require_once ABSPATH . 'wp-settings.php';
EOF
fi

# Ensure existing wp-config.php has FS_METHOD defined
if [ -f "${WP_DIR}/wp-config.php" ] && ! grep -q "FS_METHOD" "${WP_DIR}/wp-config.php"; then
  sed -i "/<\?php/a define( 'FS_METHOD', getenv('FS_METHOD') ?: 'direct' );" "${WP_DIR}/wp-config.php"
fi

# 2. Ensure SQLite drop-in db.php exists and SQLite WAL mode is configured
if [ ! -f "${CONTENT_DIR}/db.php" ] && [ -f "${CONTENT_DIR}/plugins/sqlite-database-integration/db.copy" ]; then
  cp "${CONTENT_DIR}/plugins/sqlite-database-integration/db.copy" "${CONTENT_DIR}/db.php"
fi

if [ -f "${CONTENT_DIR}/database.sqlite" ] && command -v sqlite3 >/dev/null 2>&1; then
  sqlite3 "${CONTENT_DIR}/database.sqlite" "PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL; PRAGMA mmap_size = 268435456; PRAGMA busy_timeout = 5000;" 2>/dev/null || true
fi

# 3. Ensure persistent object cache drop-in exists
if [ ! -f "${CONTENT_DIR}/object-cache.php" ] && [ -f "/var/www/html/wp-content/object-cache.php" ]; then
  cp "/var/www/html/wp-content/object-cache.php" "${CONTENT_DIR}/object-cache.php"
fi

# 4. Symlink custom plugins if mounted
if [ -d "/var/www/custom-plugins" ]; then
  for plugin in /var/www/custom-plugins/*; do
    if [ -d "$plugin" ] && [ "$(basename "$plugin")" != ".gitkeep" ]; then
      ln -sfn "$plugin" "${CONTENT_DIR}/plugins/$(basename "$plugin")"
    fi
  done
fi

# 4. Fix permissions (Optimized: Avoid recursive chown on every startup)
mkdir -p "${CONTENT_DIR}/uploads" "${CONTENT_DIR}/upgrade" "${CONTENT_DIR}/plugins" "${CONTENT_DIR}/themes"
chown www-data:www-data "${CONTENT_DIR}" "${CONTENT_DIR}/uploads" "${CONTENT_DIR}/upgrade" "${CONTENT_DIR}/plugins" "${CONTENT_DIR}/themes" 2>/dev/null || true

exec "$@"
