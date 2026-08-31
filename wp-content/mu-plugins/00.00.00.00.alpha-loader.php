<?php
/** Plugin Name: Genesis Wave
 * Description: Reveal the top X cards of your library. You may put any number of permanent cards with mana value X or less from among them onto the battlefield. Then put all cards revealed this way that weren't put onto the battlefield into your graveyard.
 * Version: 26.4.14
 * Author: Hall of the Gods, Inc.
 * Author URI: https://www.hallofthegods.com/
 * Plugin URI: https://github.com/HalloftheGods/Xophz-COMPASS
 */

function genesisWave( $library = __DIR__ ) {
	$topXCards = $library . '/*/*.php';
	$revealedCards = glob( $topXCards );

	$isPermanent = function( $cardX ) {
		if ( basename( $cardX ) === 'index.php' || basename( $cardX ) === basename( __FILE__ ) ) {
			return false;
		}
		
		// A card is only a permanent if it has a Plugin Name header
		$fp = @fopen( $cardX, 'r' );
		if ( ! $fp ) return false;
		$header = fread( $fp, 8192 );
		fclose( $fp );
		
		return strpos( $header, 'Plugin Name:' ) !== false;
	};

	// 1. Reveal Permanent Cards
	$permanents = [];
	if ( is_array( $revealedCards ) ) {
		foreach ( $revealedCards as $cardX ) {
			if ( $isPermanent( $cardX ) ) {
				$permanents[] = $cardX;
			}
		}
	}

	// 2. Exile old tokens (cleanup removed plugins or forced refresh)
	$forceRefresh = isset($_GET['genesis_refresh']) && $_GET['genesis_refresh'] === '1';
	$existingTokens = glob( $library . '/_token_*.php' );
	if ( is_array( $existingTokens ) ) {
		foreach ( $existingTokens as $token ) {
			$found = false;
			if ( ! $forceRefresh ) {
				foreach ( $permanents as $cardX ) {
					$expectedToken = $library . '/_token_' . basename( dirname( $cardX ) ) . '.php';
					if ( $token === $expectedToken ) {
						$found = true;
						break;
					}
				}
			}
			if ( ! $found ) {
				@unlink( $token );
			}
		}
	}

	// 3. Put permanents onto the battlefield (create proxy tokens)
	$tokens = [];
	foreach ( $permanents as $cardX ) {
		$pluginDir = basename( dirname( $cardX ) );
		$tokenFile = $library . '/_token_' . $pluginDir . '.php';
		
		// Conjure the token if it doesn't exist, is outdated, or forced refresh
		if ( $forceRefresh || ! file_exists( $tokenFile ) || filemtime( $tokenFile ) < filemtime( $cardX ) ) {
			$fp = @fopen( $cardX, 'r' );
			$header = fread( $fp, 8192 );
			fclose( $fp );
			
			// Extract original docblock
			preg_match( '/\/\*\*.*?\*\//s', $header, $matches );
			$docblock = isset( $matches[0] ) ? $matches[0] : "/**\n * Plugin Name: " . basename( $cardX ) . "\n */";
			
			$relativePath = $pluginDir . '/' . basename( $cardX );
			$tokenContent = "<?php\n" . $docblock . "\n\n// Conjured by Genesis Wave\nrequire_once __DIR__ . '/" . $relativePath . "';\n";
			
			$created = @file_put_contents( $tokenFile, $tokenContent );
			if ( $created === false ) {
				error_log( "Genesis Wave Error: Failed to create proxy token $tokenFile. Please check write permissions on the mu-plugins directory." );
			}
		}
		
		if ( file_exists( $tokenFile ) ) {
			$tokens[] = $tokenFile;
		} else {
			// Fallback: put the card directly onto the battlefield
			$tokens[] = $cardX;
		}
	}

	// 4. Resolve abilities
	foreach ( $tokens as $token ) {
		require_once $token;
	}

	// 5. Add UI control for forced refresh
	if ( is_admin() ) {
		add_action( 'admin_notices', function() use ( $revealedCards, $tokens ) {
			$screen = get_current_screen();
			if ( $screen && ( $screen->id === 'plugins' || $screen->id === 'plugins-network' ) ) {
				$status = isset( $_GET['plugin_status'] ) ? $_GET['plugin_status'] : '';
				if ( $status === 'mustuse' ) {
					$refreshUrl = add_query_arg( 'genesis_refresh', '1' );
					
					$revealed_count = is_array( $revealedCards ) ? count( $revealedCards ) : 0;
					$token_count = count( $tokens );

					if ( isset( $_GET['genesis_refresh'] ) ) {
						echo '<div class="notice notice-success is-dismissible"><p><strong>Genesis Wave:</strong> All tokens have been exiled and re-conjured!</p></div>';
					}
					echo '<div class="notice notice-info"><p><strong>Genesis Wave</strong> has revealed ' . $revealed_count . ' cards from your library, and placed ' . $token_count . ' permanent tokens onto the battlefield. <a href="' . esc_url( $refreshUrl ) . '" class="button button-secondary" style="margin-left: 10px;">Refresh Tokens</a></p></div>';
				}
			}
		});
	}
}

genesisWave();

/**
 * ┌────────────────────────────────────────────────────────┐
 * │ Genesis Wave                              {X}{G}{G}{G} │
 * ├────────────────────────────────────────────────────────┤
 * │                                                        │
 * │ "The beginning of the codebase was an untamed surge of │
 * │  creative energy. It has not been seen since..."       │
 * │                                                        │
 * ├────────────────────────────────────────────────────────┤
 * │ Sorcery                                                │
 * ├────────────────────────────────────────────────────────┤
 * │ Reveal the top X cards of your library. You may put    │
 * │ any number of permanent cards with mana value X or     │
 * │ less from among them onto the battlefield. Then put    │
 * │ all cards revealed this way that weren't put onto      │
 * │ the battlefield into your graveyard.                   │
 * │                                                        │
 * └────────────────────────────────────────────────────────┘
 */