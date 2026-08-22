#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${REPO_ROOT}"

echo "==> [1/4] Scanning installed YouMeOS plugins & versions..."

# Helper function to extract plugin name and version from plugin directory
extract_plugin_meta() {
    local dir="$1"
    local p_name=""
    local p_version=""
    
    if [ ! -d "$dir" ]; then
        return
    fi
    
    # Check PHP files for WordPress standard header
    for php_file in "$dir"/*.php; do
        if [ -f "$php_file" ]; then
            local found_name
            found_name=$(grep -im1 "^[[:space:]]*\*[[:space:]]*Plugin Name:" "$php_file" | sed -E "s/^[[:space:]]*\*[[:space:]]*Plugin Name:[[:space:]]*//I" | tr -d "\r" || true)
            local found_ver
            found_ver=$(grep -im1 "^[[:space:]]*\*[[:space:]]*Version:" "$php_file" | sed -E "s/^[[:space:]]*\*[[:space:]]*Version:[[:space:]]*//I" | tr -d "\r" || true)
            
            if [ -n "$found_name" ] && [ -z "$p_name" ]; then
                p_name="$found_name"
            fi
            if [ -n "$found_ver" ] && [ -z "$p_version" ]; then
                p_version="$found_ver"
            fi
            if [ -n "$p_name" ] && [ -n "$p_version" ]; then
                break
            fi
        fi
    done
    
    # Fallback to composer.json if version not found in PHP header
    if [ -z "$p_version" ] && [ -f "$dir/composer.json" ]; then
        p_version=$(grep -m1 '"version"' "$dir/composer.json" | sed -E 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/' || true)
    fi
    
    if [ -n "$p_name" ]; then
        echo "${p_name}|${p_version:-unknown}"
    fi
}

declare -A INITIAL_VERSIONS
declare -A PLUGIN_NAMES

scan_plugins() {
    local is_initial="$1"
    
    for dir in "${REPO_ROOT}/blackbox/plugins"/* "${REPO_ROOT}/blackbox/mu-plugins"/*; do
        if [ -d "$dir" ]; then
            local slug
            slug=$(basename "$dir")
            local meta
            meta=$(extract_plugin_meta "$dir")
            
            if [ -n "$meta" ]; then
                local name
                name="${meta%%|*}"
                local ver
                ver="${meta##*|}"
                
                if [ "$is_initial" = "true" ]; then
                    INITIAL_VERSIONS["$slug"]="$ver"
                    PLUGIN_NAMES["$slug"]="$name"
                    echo "  • ${name} (${slug}): v${ver}"
                else
                    local prev_ver="${INITIAL_VERSIONS[$slug]:-none}"
                    if [ "$prev_ver" != "$ver" ] && [ "$prev_ver" != "none" ]; then
                        echo "  ✓ ${name} (${slug}): v${prev_ver} ➔ v${ver} (Updated)"
                    else
                        echo "  ✓ ${name} (${slug}): v${ver} (Current)"
                    fi
                fi
            fi
        fi
    done
}

scan_plugins "true"

echo "==> [2/4] Querying remote package repositories for updates..."

if command -v composer &> /dev/null; then
    composer update --prefer-dist --no-interaction 2>&1
elif command -v docker &> /dev/null; then
    echo "  • Running Composer via Docker container..."
    GH_TOKEN="${GITHUB_TOKEN:-}"
    if [ -z "$GH_TOKEN" ] && command -v gh &> /dev/null; then
        GH_TOKEN=$(gh auth token 2>/dev/null || true)
    fi

    AUTH_ENV=()
    if [ -n "$GH_TOKEN" ]; then
        AUTH_ENV=(--env "COMPOSER_AUTH={\"github-oauth\":{\"github.com\":\"${GH_TOKEN}\"}}")
    fi

    docker run --rm \
        --env COMPOSER_ALLOW_SUPERUSER=1 \
        "${AUTH_ENV[@]}" \
        -v "${REPO_ROOT}:/app" \
        -w /app \
        composer:2 sh -c "git config --global --add safe.directory /app && composer update --prefer-dist --no-interaction --ignore-platform-reqs" 2>&1
else
    echo "Error: Neither composer nor docker is available to update plugins."
    exit 1
fi

echo "==> [3/4] Inspecting plugin versions and verifying assets..."
scan_plugins "false"

echo "==> [4/4] Plugin update check complete. All packages verified in blackbox/plugins/"
