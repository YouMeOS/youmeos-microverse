<?php
/**
 * Plugin Name: Local Dev Symlink Fixer
 * Description: Automatically fixes plugin and mu-plugin URLs when they are symlinked outside of the WordPress core directory (e.g. in Embedded or Docker setups).
 * Version: 1.0.0
 * Author: YouMeOS
 */

// Fix for plugins_url() generating paths with the host OS absolute path
add_filter( 'plugins_url', function( $url, $path, $plugin ) {
	// Check if the generated URL accidentally leaked the host absolute path
	// This happens when plugin_basename() fails to strip the base directory because of symlinks.
	if ( strpos( $url, '/wp-content/plugins/home/' ) !== false || strpos( $url, '/wp-content/plugins/var/www/' ) !== false ) {
		// Extract the actual relative path after 'plugins/' or 'mu-plugins/'
		if ( preg_match( '/(?:plugins|mu-plugins)\/.*?(?:plugins|mu-plugins)\/(.*)$/', $url, $matches ) ) {
			// We need to determine if it was originally an mu-plugin or a standard plugin.
			// If the original $plugin path contained 'mu-plugins', route it there.
			if ( strpos( $plugin, 'mu-plugins' ) !== false ) {
				$url = content_url( 'mu-plugins/' . $matches[1] );
			} else {
				$url = content_url( 'plugins/' . $matches[1] );
			}
		}
	}
	return $url;
}, 10, 3 );
