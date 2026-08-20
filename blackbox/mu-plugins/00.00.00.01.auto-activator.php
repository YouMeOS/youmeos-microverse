<?php
/**
 * Plugin Name: YouMeOS Microverse Auto-Activator
 * Description: Automatically ensures required YouMeOS plugins (xophz-compass, xophz-compass-event-horizon) are active and YouMeOS defaults to homepage on every install.
 * Version: 1.0.0
 * Author: Hall of the Gods, Inc.
 * Author URI: https://www.hallofthegods.com/
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function microverse_ensure_active_plugins() {
	if ( ! function_exists( 'is_blog_installed' ) || ! is_blog_installed() ) {
		return;
	}
	if ( function_exists( 'wp_installing' ) && wp_installing() ) {
		return;
	}

	$required_plugins = [
		'xophz-compass/xophz-compass.php',
		'xophz-compass-event-horizon/xophz-compass-event-horizon.php',
	];

	$active_plugins = (array) get_option( 'active_plugins', [] );
	$needs_update = false;

	foreach ( $required_plugins as $plugin ) {
		if ( file_exists( WP_PLUGIN_DIR . '/' . $plugin ) && ! in_array( $plugin, $active_plugins, true ) ) {
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

// Auto-activate on plugins_loaded
add_action( 'plugins_loaded', 'microverse_ensure_active_plugins', 1 );

// Auto-activate immediately upon fresh WordPress installation
add_action( 'wp_install', 'microverse_ensure_active_plugins', 10 );

// Auto-activate on admin initialization
add_action( 'admin_init', 'microverse_ensure_active_plugins', 1 );
