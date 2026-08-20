# YouMeOS Microverse

Powering your digital footprint with a self-contained, single-tenant mini-verse. (Yes, it is bigger on the inside.)

## Quick Start: Docker Only

```bash
# Launch directly from the root directory
cp docker/.env.example .env
# Edit .env with your preferred credentials
docker compose up -d
```

Visit `https://my.youmeos.com` (or `http://youmeos.localhost` / `http://youmeos.local`) to complete WordPress setup.

## Quick Start: Desktop App

```bash
cd desktop
npm install
npm run build
npm run dev
```

The system tray icon and desktop control panel provide Start / Stop / Restart / Open Browser / Update Plugins controls.

## Plugin Management (Composer)

Plugins are managed via standard Composer (`composer.json`):

```bash
# Update all YouMeOS plugins to their latest versions
bash scripts/update-plugins.sh
# or from desktop/ directory:
npm run update:plugins
```

If Composer is not installed on your host, `scripts/update-plugins.sh` automatically runs Composer inside a Docker container without requiring local PHP or Composer installations.

## Project Structure

```
youmeos-microverse/
├── composer.json               # Root Composer config (WPackagist + YouMeOS plugins)
├── composer.lock               # Pinned package lockfile
├── docker-compose.yml          # Root Docker Compose (MariaDB + WP-FPM + Nginx)
├── .env.example                # Environment variable template
├── scripts/
│   └── update-plugins.sh       # Composer update runner (Host / Docker hybrid)
├── docker/                     # Docker assets & configurations
│   └── nginx/
│       ├── default.conf        # Nginx reverse proxy & SSL config
│       └── certs/              # SSL certificates
├── desktop/                    # Electron desktop app
│   ├── src/
│   │   ├── main/               # Main process
│   │   │   ├── index.ts        # App lifecycle, IPC handlers
│   │   │   ├── tray.ts         # System tray management
│   │   │   └── engine/         # Engine abstraction
│   │   │       ├── types.ts    # MicroverseEngine interface
│   │   │       └── docker.ts   # Docker Compose implementation
│   │   ├── preload/index.ts    # IPC bridge (contextBridge)
│   │   └── renderer/           # Control panel UI
│   │       ├── index.html
│   │       ├── app.ts
│   │       └── styles.css
│   ├── package.json
│   ├── tsconfig.json
│   └── electron-builder.yml
├── blackbox/                   # BlackBOX node payload & userland storage (volume mount)
└── data/                       # MariaDB data / engine binaries (volume mount)
```

## Architecture

The desktop app uses an **Engine abstraction** (`MicroverseEngine` interface) that decouples the UI from the stack management layer. The current implementation (`DockerEngine`) wraps Docker Compose commands. A future `EmbeddedEngine` can bundle portable binaries for zero-dependency installs.

## Packaging

```bash
cd desktop
pnpm build
pnpm package
```

Outputs platform installers via `electron-builder`:
- **Windows**: `.exe` (NSIS Wizard), `.msi` (Windows Installer)
- **Mac**: `.dmg`
- **Linux**: `.AppImage`, `.deb`
