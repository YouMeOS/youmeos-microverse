import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import AdmZip from 'adm-zip';
import { ProgressCallback, SimpleLogCallback } from './types';
import { downloadFile, downloadAndExtractZip, formatBytes } from './download';

const execFileAsync = promisify(execFile);

const SQLITE_PLUGIN_URL = 'https://downloads.wordpress.org/plugin/sqlite-database-integration.zip';
const WORDPRESS_CORE_URL = 'https://wordpress.org/latest.zip';

export const DEFAULT_CADDYFILE = `{
	# FrankenPHP Options
	frankenphp
	auto_https disable_redirects
	http_port {$PORT:80}
	https_port {$HTTPS_PORT:443}
}

# HTTPS Gateway
https://my.youmeos.com:{$HTTPS_PORT:443}, https://my.umeos.com:{$HTTPS_PORT:443} {
	tls {$TLS_CERT:internal} {$TLS_KEY}
	root * {$WP_ROOT}
	encode zstd br gzip
	php_server
	log {
		format json
		output stdout
	}
}

# HTTP Gateway
:{$PORT:80}, http://my.youmeos.com:{$PORT:80}, http://youmeos.localhost:{$PORT:80}, http://youmeos.local:{$PORT:80}, http://localhost:{$PORT:80}, http://127.0.0.1:{$PORT:80} {
	root * {$WP_ROOT}
	encode zstd br gzip
	php_server
	log {
		format json
		output stdout
	}
}
`;

function getFrankenPhpUrl(): string {
  const platform = process.platform;
  const arch = process.arch;

  if (platform === 'darwin') {
    return arch === 'arm64'
      ? 'https://github.com/php/frankenphp/releases/latest/download/frankenphp-mac-arm64'
      : 'https://github.com/php/frankenphp/releases/latest/download/frankenphp-mac-x86_64';
  }
  if (platform === 'linux') {
    return arch === 'arm64'
      ? 'https://github.com/php/frankenphp/releases/latest/download/frankenphp-linux-aarch64'
      : 'https://github.com/php/frankenphp/releases/latest/download/frankenphp-linux-x86_64';
  }
  if (platform === 'win32') {
    return 'https://github.com/php/frankenphp/releases/latest/download/frankenphp-windows-x86_64.zip';
  }

  throw new Error(`Unsupported OS: ${platform}`);
}

function normalizePath(targetPath: string): string {
  const clean = targetPath.replace(/^\\\\\?\\|^\\\?\?\\/, '');
  const resolved = path.resolve(clean);
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

function removePathSafe(targetPath: string): void {
  try {
    const targetStat = fs.lstatSync(targetPath, { throwIfNoEntry: false });
    if (!targetStat) {
      try { fs.unlinkSync(targetPath); } catch {}
      return;
    }
    if (process.platform === 'win32' && targetStat.isDirectory()) {
      try {
        fs.rmdirSync(targetPath);
      } catch {
        fs.rmSync(targetPath, { recursive: true, force: true });
      }
    } else if (targetStat.isSymbolicLink()) {
      try {
        fs.unlinkSync(targetPath);
      } catch {
        fs.rmSync(targetPath, { recursive: true, force: true });
      }
    } else {
      fs.rmSync(targetPath, { recursive: true, force: true });
    }
  } catch {
    try { fs.rmSync(targetPath, { recursive: true, force: true }); } catch {}
  }
}

function ensureSymlink(sourcePath: string, targetPath: string): void {
  if (!fs.existsSync(sourcePath)) {
    return;
  }

  let targetStat: fs.Stats | undefined;
  try {
    targetStat = fs.lstatSync(targetPath, { throwIfNoEntry: false });
  } catch {
    removePathSafe(targetPath);
    targetStat = undefined;
  }

  if (targetStat !== undefined) {
    const isSymlink = targetStat.isSymbolicLink();
    if (isSymlink) {
      try {
        const currentLink = fs.readlinkSync(targetPath);
        const cleanLink = currentLink.replace(/^\\\\\?\\|^\\\?\?\\/, '');
        const resolvedCurrent = normalizePath(path.isAbsolute(cleanLink) ? cleanLink : path.join(path.dirname(targetPath), cleanLink));
        const resolvedSource = normalizePath(sourcePath);
        if (resolvedCurrent === resolvedSource && fs.existsSync(sourcePath)) {
          return;
        }
      } catch {}
      removePathSafe(targetPath);
    } else {
      removePathSafe(targetPath);
    }
  }

  let sourceStat: fs.Stats;
  try {
    sourceStat = fs.statSync(sourcePath);
  } catch {
    return;
  }

  const isDirectory = sourceStat.isDirectory();
  if (process.platform === 'win32') {
    if (isDirectory) {
      try {
        fs.symlinkSync(sourcePath, targetPath, 'junction');
      } catch {
        try {
          fs.symlinkSync(sourcePath, targetPath, 'dir');
        } catch {
          try {
            fs.cpSync(sourcePath, targetPath, { recursive: true });
          } catch {}
        }
      }
    } else {
      try {
        fs.symlinkSync(sourcePath, targetPath, 'file');
      } catch {
        try {
          fs.linkSync(sourcePath, targetPath);
        } catch {
          fs.copyFileSync(sourcePath, targetPath);
        }
      }
    }
  } else {
    try {
      fs.symlinkSync(sourcePath, targetPath, isDirectory ? 'dir' : 'file');
    } catch {}
  }
}

export async function setupEmbeddedEnvironment(
  projectDir: string,
  onProgress: SimpleLogCallback,
  onDownloadProgress?: ProgressCallback,
  resourcesDir?: string
): Promise<string> {
  const dataDir = path.join(projectDir, 'data');
  const binDir = path.join(dataDir, 'bin');
  const embeddedDir = path.join(dataDir, 'embedded');
  const wpCoreDir = path.join(embeddedDir, 'wp-core');
  const wpContentDir = path.join(wpCoreDir, 'wp-content');

  if (!fs.existsSync(binDir)) fs.mkdirSync(binDir, { recursive: true });
  if (!fs.existsSync(embeddedDir)) fs.mkdirSync(embeddedDir, { recursive: true });

  const hostWpDir = path.join(projectDir, 'blackbox');
  if (!fs.existsSync(hostWpDir)) {
    fs.mkdirSync(hostWpDir, { recursive: true });
  }

  if (resourcesDir && resourcesDir !== projectDir) {
    const bundledBlackbox = path.join(resourcesDir, 'blackbox');
    if (fs.existsSync(bundledBlackbox)) {
      try {
        fs.cpSync(bundledBlackbox, hostWpDir, { recursive: true, errorOnExist: false });
        onProgress('Initialized blackbox workspace from bundled resources.');
      } catch {}
    }

    const bundledDocker = path.join(resourcesDir, 'docker');
    const hostDocker = path.join(projectDir, 'docker');
    if (fs.existsSync(bundledDocker) && !fs.existsSync(hostDocker)) {
      try {
        fs.cpSync(bundledDocker, hostDocker, { recursive: true, errorOnExist: false });
        onProgress('Initialized certificates from bundled resources.');
      } catch {}
    }
  }

  const targetCaddyfile = path.join(embeddedDir, 'Caddyfile');
  if (!fs.existsSync(targetCaddyfile)) {
    let caddyContent = DEFAULT_CADDYFILE;
    const candidates = [
      path.join(__dirname, 'Caddyfile'),
      path.join(__dirname, '..', 'engine', 'Caddyfile'),
      resourcesDir ? path.join(resourcesDir, 'desktop', 'dist', 'main', 'engine', 'Caddyfile') : '',
      resourcesDir ? path.join(resourcesDir, 'Caddyfile') : '',
      path.join(projectDir, 'Caddyfile'),
      path.join(__dirname, '..', '..', 'src', 'main', 'engine', 'Caddyfile'),
      path.join(projectDir, 'desktop', 'src', 'main', 'engine', 'Caddyfile')
    ].filter(Boolean);

    for (const c of candidates) {
      if (fs.existsSync(c)) {
        try {
          caddyContent = fs.readFileSync(c, 'utf8');
          break;
        } catch {}
      }
    }

    try {
      fs.writeFileSync(targetCaddyfile, caddyContent, 'utf8');
      onProgress('Caddyfile configured in embedded runtime.');
    } catch {}
  }

  const frankenBinaryName = process.platform === 'win32' ? 'frankenphp.exe' : 'frankenphp';
  const frankenPath = path.join(binDir, frankenBinaryName);

  // 1. Check if FrankenPHP is already bundled in resources or root bin directory
  if (!fs.existsSync(frankenPath)) {
    const candidateBundledPaths = [
      resourcesDir ? path.join(resourcesDir, 'bin', frankenBinaryName) : '',
      path.join(projectDir, 'bin', frankenBinaryName),
      path.join(__dirname, '..', '..', '..', 'bin', frankenBinaryName)
    ].filter(Boolean);

    for (const bundledCandidate of candidateBundledPaths) {
      if (fs.existsSync(bundledCandidate)) {
        try {
          fs.copyFileSync(bundledCandidate, frankenPath);
          if (process.platform !== 'win32') {
            fs.chmodSync(frankenPath, 0o755);
          }
          onProgress(`Initialized ${frankenBinaryName} from bundled resources.`);
          break;
        } catch {}
      }
    }
  }

  // 2. Download FrankenPHP binary if missing from bundle
  if (!fs.existsSync(frankenPath)) {
    const url = getFrankenPhpUrl();
    if (process.platform === 'win32') {
      const frankenZipPath = path.join(embeddedDir, 'frankenphp.zip');
      await downloadAndExtractZip(
        url,
        frankenZipPath,
        binDir,
        'FrankenPHP binary',
        onProgress,
        onDownloadProgress
      );
      onProgress('FrankenPHP binary extracted.');
    } else {
      onProgress('Downloading FrankenPHP binary...');
      const handleFrankenProgress = (loaded: number, total: number, speed: number) => {
        const percent = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
        const detail = total > 0 ? `${formatBytes(loaded)} / ${formatBytes(total)}` : formatBytes(loaded);
        onDownloadProgress?.({
          item: 'FrankenPHP binary',
          loaded,
          total,
          percent,
          speed,
          detail,
          stage: 'downloading'
        });
      };

      await downloadFile(url, frankenPath, handleFrankenProgress);
      fs.chmodSync(frankenPath, 0o755);
      onProgress('FrankenPHP downloaded and made executable.');
      onDownloadProgress?.({
        item: 'FrankenPHP binary',
        loaded: 1,
        total: 1,
        percent: 100,
        speed: 0,
        stage: 'complete'
      });
    }
  }

  // 2. Download WordPress Core if missing
  if (!fs.existsSync(path.join(wpCoreDir, 'wp-includes'))) {
    const wpZipPath = path.join(embeddedDir, 'wordpress.zip');
    await downloadAndExtractZip(
      WORDPRESS_CORE_URL,
      wpZipPath,
      embeddedDir,
      'WordPress core',
      onProgress,
      onDownloadProgress
    );

    const extractedWp = path.join(embeddedDir, 'wordpress');
    if (fs.existsSync(extractedWp)) {
      if (fs.existsSync(wpCoreDir)) {
        fs.rmSync(wpCoreDir, { recursive: true, force: true });
      }
      fs.renameSync(extractedWp, wpCoreDir);

      // Clean default bloatware (Akismet, Hello Dolly, default themes)
      const defaultPlugins = ['akismet', 'hello.php'];
      for (const dp of defaultPlugins) {
        const p = path.join(wpCoreDir, 'wp-content', 'plugins', dp);
        if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
      }
      const defaultThemes = ['twentytwentythree', 'twentytwentyfour', 'twentytwentyfive'];
      for (const dt of defaultThemes) {
        const t = path.join(wpCoreDir, 'wp-content', 'themes', dt);
        if (fs.existsSync(t)) fs.rmSync(t, { recursive: true, force: true });
      }
    }
    onProgress('WordPress core extracted and configured.');
  }

  // 3. Setup SQLite Database Integration plugin
  const hostPluginsDir = path.join(hostWpDir, 'plugins');
  if (!fs.existsSync(hostPluginsDir)) {
    fs.mkdirSync(hostPluginsDir, { recursive: true });
  }

  const hostSqlitePluginDir = path.join(hostPluginsDir, 'sqlite-database-integration');
  if (!fs.existsSync(hostSqlitePluginDir)) {
    const sqliteZipPath = path.join(embeddedDir, 'sqlite.zip');
    await downloadAndExtractZip(
      SQLITE_PLUGIN_URL,
      sqliteZipPath,
      hostPluginsDir,
      'SQLite Database Integration',
      onProgress,
      onDownloadProgress
    );
  }

  const hostDbCopy = path.join(hostSqlitePluginDir, 'db.copy');
  const hostDbDest = path.join(hostWpDir, 'db.php');
  if (fs.existsSync(hostDbCopy) && !fs.existsSync(hostDbDest)) {
    try {
      fs.copyFileSync(hostDbCopy, hostDbDest);
    } catch {}
  }

  const wpContentDb = path.join(wpContentDir, 'db.php');
  if (fs.existsSync(hostDbDest)) {
    try {
      fs.copyFileSync(hostDbDest, wpContentDb);
    } catch {}
  } else if (fs.existsSync(hostDbCopy)) {
    try {
      fs.copyFileSync(hostDbCopy, wpContentDb);
    } catch {}
  }
  onProgress('SQLite integration configured.');

  // 4. Setup wp-config.php for SQLite pointing to shared blackbox/ database
  const sharedDb = path.join(hostWpDir, 'database.sqlite');
  const oldDb = path.join(embeddedDir, 'database.sqlite');
  if (fs.existsSync(oldDb) && !fs.existsSync(sharedDb)) {
    try {
      fs.copyFileSync(oldDb, sharedDb);
      onProgress('Migrated existing database to shared blackbox/ directory.');
    } catch {}
  }

  const wpConfigPath = path.join(wpCoreDir, 'wp-config.php');
  if (!fs.existsSync(wpConfigPath)) {
    onProgress('Generating wp-config.php...');
    const configContent = `<?php
define( 'DB_NAME', 'wordpress' );
define( 'DB_USER', 'root' );
define( 'DB_PASSWORD', '' );
define( 'DB_HOST', 'localhost' );
define( 'DB_CHARSET', 'utf8mb4' );
define( 'DB_COLLATE', '' );

$table_prefix = 'wp_';

define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
define( 'WP_DEBUG_DISPLAY', false );

define('DB_FILE', 'database.sqlite');
define('DB_DIR', '${hostWpDir.replace(/\\/g, '/')}');

$is_https = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') || 
            (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') ||
            (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443) ||
            (isset($_SERVER['HTTP_HOST']) && (strpos($_SERVER['HTTP_HOST'], 'my.youmeos.com') !== false || strpos($_SERVER['HTTP_HOST'], 'my.umeos.com') !== false));
$proto = $is_https ? 'https://' : 'http://';
$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'my.youmeos.com';
define('WP_HOME', $proto . $host);
define('WP_SITEURL', $proto . $host);

if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}
require_once ABSPATH . 'wp-settings.php';
`;
    fs.writeFileSync(wpConfigPath, configContent);
    onProgress('wp-config.php generated.');
  } else {
    try {
      let existingConfig = fs.readFileSync(wpConfigPath, 'utf8');
      const targetDbDirLine = `define('DB_DIR', '${hostWpDir.replace(/\\/g, '/')}');`;
      if (!existingConfig.includes(targetDbDirLine)) {
        existingConfig = existingConfig.replace(
          /define\s*\(\s*['"]DB_DIR['"]\s*,\s*['"][^'"]*['"]\s*\);/,
          targetDbDirLine
        );
        fs.writeFileSync(wpConfigPath, existingConfig);
      }
    } catch {}
  }

  // 5. Setup symlinks to host blackbox directory
  const dirsToLink = ['plugins', 'mu-plugins', 'themes', 'uploads'];
  for (const dir of dirsToLink) {
    const hostDir = path.join(hostWpDir, dir);
    const targetDir = path.join(wpContentDir, dir);

    const hasHostDir = fs.existsSync(hostDir);
    if (!hasHostDir) {
      fs.mkdirSync(hostDir, { recursive: true });
    }

    const isDirectSymlinkDir = dir === 'mu-plugins' || dir === 'uploads' || dir === 'themes';
    if (isDirectSymlinkDir) {
      ensureSymlink(hostDir, targetDir);
    } else if (dir === 'plugins') {
      const hasTargetDir = fs.existsSync(targetDir);
      if (!hasTargetDir) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const existingPluginEntries = fs.readdirSync(targetDir);
      for (const entry of existingPluginEntries) {
        const tpPath = path.join(targetDir, entry);
        let entryStat: fs.Stats | undefined;
        try {
          entryStat = fs.lstatSync(tpPath, { throwIfNoEntry: false });
        } catch {
          removePathSafe(tpPath);
          continue;
        }

        const isSymlink = entryStat?.isSymbolicLink() ?? false;
        if (isSymlink) {
          try {
            const currentLink = fs.readlinkSync(tpPath);
            const cleanLink = currentLink.replace(/^\\\\\?\\|^\\\?\?\\/, '');
            const resolvedTarget = path.isAbsolute(cleanLink) ? cleanLink : path.resolve(path.dirname(tpPath), cleanLink);
            const isMissingTarget = !fs.existsSync(resolvedTarget);
            if (isMissingTarget) {
              removePathSafe(tpPath);
            }
          } catch {
            removePathSafe(tpPath);
          }
        }
      }

      const hostPlugins = fs.readdirSync(hostDir);
      for (const pluginName of hostPlugins) {
        const isIndexFile = pluginName === 'index.php';
        if (isIndexFile) {
          continue;
        }
        const hpPath = path.join(hostDir, pluginName);
        const tpPath = path.join(targetDir, pluginName);
        ensureSymlink(hpPath, tpPath);
      }
    }
  }

  // 6. Ensure FrankenPHP has port 80 binding privileges on Linux
  await ensurePort80Privilege(frankenPath, onProgress);

  onProgress('Embedded setup complete.');
  onDownloadProgress?.(null);
  return frankenPath;
}

export async function ensurePort80Privilege(
  frankenPath: string,
  onProgress?: SimpleLogCallback
): Promise<boolean> {
  if (process.platform === 'linux') {
    try {
      const { stdout } = await execFileAsync('getcap', [frankenPath]);
      if (stdout.includes('cap_net_bind_service')) {
        return true;
      }
    } catch {}

    onProgress?.('Prompting for admin privileges to bind port 80 (setcap)...');
    try {
      await execFileAsync('pkexec', ['setcap', 'cap_net_bind_service=+ep', frankenPath]);
      onProgress?.('Port 80 binding privileges configured successfully.');
      return true;
    } catch (err: any) {
      onProgress?.(`Admin privilege prompt failed: ${err.message}`);
      return false;
    }
  }
  return true;
}
