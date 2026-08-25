<?php
/**
 * Plugin Name: YouMeOS Microverse Auto-Activator
 * Description: Automatically ensures required YouMeOS plugins (xophz-compass, xophz-compass-event-horizon) are executed unconditionally on all lifecycles (including fresh install / wp_installing) and active in WordPress options.
 * Version: 1.1.0
 * Author: Hall of the Gods, Inc.
 * Author URI: https://www.hallofthegods.com/
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'MICROVERSE_REQUIRED_PLUGINS' ) ) {
	define( 'MICROVERSE_REQUIRED_PLUGINS', [
		'xophz-compass/xophz-compass.php',
		'xophz-compass-event-horizon/xophz-compass-event-horizon.php',
	] );
}

/**
 * Unconditionally boots required plugins so they execute even when WordPress
 * is not installed, during initial setup, or when wp_installing() is active.
 */
function microverse_boot_required_plugins() {
	$plugin_dir = defined( 'WP_PLUGIN_DIR' ) ? WP_PLUGIN_DIR : ABSPATH . 'wp-content/plugins';

	foreach ( MICROVERSE_REQUIRED_PLUGINS as $plugin_rel ) {
		$plugin_path = $plugin_dir . '/' . $plugin_rel;
		if ( file_exists( $plugin_path ) ) {
			require_once $plugin_path;
		}
	}
}

// 1. Immediately boot plugins during early MU-plugin loading (runs on all requests, install wizard, CLI, etc.)
microverse_boot_required_plugins();

/**
 * Synchronizes active_plugins and default options in the database
 * once the database and blog are installed.
 */
function microverse_ensure_active_plugins() {
	if ( ! function_exists( 'is_blog_installed' ) || ! is_blog_installed() ) {
		return;
	}

	$plugin_dir = defined( 'WP_PLUGIN_DIR' ) ? WP_PLUGIN_DIR : ABSPATH . 'wp-content/plugins';
	$active_plugins = (array) get_option( 'active_plugins', [] );
	$needs_update = false;

	foreach ( MICROVERSE_REQUIRED_PLUGINS as $plugin ) {
		if ( file_exists( $plugin_dir . '/' . $plugin ) && ! in_array( $plugin, $active_plugins, true ) ) {
			$active_plugins[] = $plugin;
			$needs_update = true;
		}
	}

	if ( $needs_update ) {
		update_option( 'active_plugins', array_values( array_unique( $active_plugins ) ) );
	}

	// Ensure YouMeOS portal is set to load on Homepage by default
	$current_load_mode = get_option( 'youmeos_load_mode' );
	if ( false === $current_load_mode || 'routes_only' === $current_load_mode ) {
		update_option( 'youmeos_load_mode', 'homepage' );
		delete_option( 'rewrite_rules' );
	}

	// Ensure Compass redirect dashboard is enabled by default
	if ( false === get_option( 'xophz_compass_redirect_dashboard' ) ) {
		update_option( 'xophz_compass_redirect_dashboard', true );
	}
}

// Ensure active_plugins option is updated during various hooks
add_action( 'plugins_loaded', 'microverse_ensure_active_plugins', 1 );
add_action( 'wp_install', 'microverse_ensure_active_plugins', 10 );
add_action( 'admin_init', 'microverse_ensure_active_plugins', 1 );

