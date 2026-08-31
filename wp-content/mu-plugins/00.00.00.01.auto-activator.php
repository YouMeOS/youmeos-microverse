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

// 2. Bypass theme validation in headless/app mode to prevent wp_die if theme directory is absent
add_filter( 'validate_current_theme', '__return_false' );

/**
 * Resolves OS homepage mode override from constants or environment variables.
 * Returns null if not explicitly overridden.
 */
function microverse_get_os_homepage_mode() {
	if ( defined( 'OS_HOMEPAGE_MODE' ) && OS_HOMEPAGE_MODE !== '' ) {
		return OS_HOMEPAGE_MODE;
	}
	$env_mode = getenv( 'OS_HOMEPAGE_MODE' );
	if ( false !== $env_mode && '' !== $env_mode ) {
		return $env_mode;
	}
	if ( defined( 'YOUMEOS_LOAD_MODE' ) && YOUMEOS_LOAD_MODE !== '' ) {
		return YOUMEOS_LOAD_MODE;
	}
	$env_youmeos_mode = getenv( 'YOUMEOS_LOAD_MODE' );
	if ( false !== $env_youmeos_mode && '' !== $env_youmeos_mode ) {
		return $env_youmeos_mode;
	}
	return null;
}

// 3. Override youmeos_load_mode option if OS_HOMEPAGE_MODE or YOUMEOS_LOAD_MODE is defined in env/constants
add_filter( 'pre_option_youmeos_load_mode', function( $pre_value ) {
	$override = microverse_get_os_homepage_mode();
	if ( null !== $override ) {
		return $override;
	}
	return $pre_value;
} );

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

	// Ensure YouMeOS portal load mode is configured (defaults to 'homepage' unless OS_HOMEPAGE_MODE is set)
	$current_load_mode = get_option( 'youmeos_load_mode' );
	$configured_override = microverse_get_os_homepage_mode();
	if ( false === $current_load_mode ) {
		$default_mode = ( null !== $configured_override ) ? $configured_override : 'homepage';
		update_option( 'youmeos_load_mode', $default_mode );
		delete_option( 'rewrite_rules' );
	}

	// Ensure Compass redirect dashboard is enabled by default
	if ( false === get_option( 'xophz_compass_redirect_dashboard' ) ) {
		update_option( 'xophz_compass_redirect_dashboard', true );
	}

	// Ensure pretty permalinks are enabled so /wp-json/ REST routes function out of the box
	$current_permalinks = get_option( 'permalink_structure' );
	if ( empty( $current_permalinks ) ) {
		update_option( 'permalink_structure', '/%postname%/' );
		flush_rewrite_rules();
	}

	// Ensure xophz-magic-hat is set as the active theme
	$theme_dir = defined( 'WP_CONTENT_DIR' ) ? WP_CONTENT_DIR . '/themes' : ABSPATH . 'wp-content/themes';
	if ( file_exists( $theme_dir . '/xophz-magic-hat' ) ) {
		$current_theme = get_option( 'stylesheet' );
		if ( 'xophz-magic-hat' !== $current_theme ) {
			update_option( 'template', 'xophz-magic-hat' );
			update_option( 'stylesheet', 'xophz-magic-hat' );
			update_option( 'current_theme', 'Xophz Magic Hat' );
		}
	}
}

// Ensure active_plugins option is updated during various hooks
add_action( 'plugins_loaded', 'microverse_ensure_active_plugins', 1 );
add_action( 'wp_install', 'microverse_ensure_active_plugins', 10 );
add_action( 'admin_init', 'microverse_ensure_active_plugins', 1 );

