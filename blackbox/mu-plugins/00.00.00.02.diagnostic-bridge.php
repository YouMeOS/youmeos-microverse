<?php
/**
 * Plugin Name: YouMeOS Microverse Diagnostic Bridge
 * Description: Secure diagnostic bridge for local desktop environment (1-click auto-login, emergency password reset, database health).
 * Version: 1.0.0
 * Author: YouMeOS
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// 1. One-Time Auto-Login Token Handler
add_action( 'init', function() {
	if ( ! isset( $_GET['youmeos_autologin_token'] ) || empty( $_GET['youmeos_autologin_token'] ) ) {
		return;
	}

	$token = sanitize_text_field( wp_unslash( $_GET['youmeos_autologin_token'] ) );
	$user_id = isset( $_GET['user_id'] ) ? absint( $_GET['user_id'] ) : 1;

	// Check transient token
	$stored_token = get_transient( 'youmeos_autologin_' . $user_id );
	if ( ! $stored_token || ! hash_equals( (string) $stored_token, $token ) ) {
		wp_die( '<h1>Authentication Error</h1><p>The auto-login link has expired or is invalid. Please generate a new link from the Microverse desktop app.</p>', 'Invalid Token', [ 'response' => 403 ] );
	}

	// Invalidate token immediately
	delete_transient( 'youmeos_autologin_' . $user_id );

	// Authenticate user
	$user = get_user_by( 'id', $user_id );
	if ( ! $user ) {
		wp_die( 'User not found.', 'User Error', [ 'response' => 404 ] );
	}

	wp_clear_auth_cookie();
	wp_set_current_user( $user->ID, $user->user_login );
	wp_set_auth_cookie( $user->ID, true, is_ssl() );
	do_action( 'wp_login', $user->user_login, $user );

	$redirect_to = isset( $_GET['redirect_to'] ) ? esc_url_raw( wp_unslash( $_GET['redirect_to'] ) ) : home_url( '/' );
	wp_safe_redirect( $redirect_to );
	exit;
}, 1 );
