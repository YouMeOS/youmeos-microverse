#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${REPO_ROOT}"

echo "==> Fetching and updating latest YouMeOS plugins via Composer..."

if command -v composer &> /dev/null; then
    composer update --prefer-dist --no-interaction
elif command -v docker &> /dev/null; then
    echo "==> Running Composer via Docker container..."
    docker run --rm \
        --env COMPOSER_ALLOW_SUPERUSER=1 \
        -v "${REPO_ROOT}:/app" \
        -w /app \
        composer:2 sh -c "git config --global --add safe.directory /app && composer update --prefer-dist --no-interaction --ignore-platform-reqs"
else
    echo "Error: Neither composer nor docker is available to update plugins."
    exit 1
fi

echo "==> Plugins successfully updated to latest versions in blackbox/plugins/"
