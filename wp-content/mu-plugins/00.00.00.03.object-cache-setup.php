<?php
/**
 * Plugin Name: YouMeOS Object Cache Engine Bridge
 * Description: Ensures persistent object-cache drop-in presence and runtime health.
 * Version: 1.0.0
 * Author: Hall of the Gods, Inc.
 */

defined('ABSPATH') || exit;

add_action('admin_init', function () {
    $target = WP_CONTENT_DIR . '/object-cache.php';
    $source = __DIR__ . '/../object-cache.php';

    if (!file_exists($target) && file_exists($source)) {
        @copy($source, $target);
    }
});
