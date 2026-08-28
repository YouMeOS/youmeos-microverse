FROM dunglas/frankenphp:1-php8.3-bookworm

# Build-time environment optimizations
ENV MAKEFLAGS="-j$(nproc)" \
    IPE_ICU_EN_ONLY=1

# Install system packages & PHP extensions with BuildKit cache mounts
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    git \
    unzip \
    bash \
    && install-php-extensions \
    mysqli \
    pdo_mysql \
    pdo_sqlite \
    sqlite3 \
    gd \
    intl \
    zip \
    opcache \
    exif \
    bcmath \
    && rm -rf /var/lib/apt/lists/*

# Install Composer binary
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
