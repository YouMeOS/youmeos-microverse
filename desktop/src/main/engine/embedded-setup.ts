import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { ProgressCallback, SimpleLogCallback } from './types';
import { downloadFile, downloadAndExtractZip, formatBytes } from './download';

const SQLITE_PLUGIN_URL = 'https://downloads.wordpress.org/plugin/sqlite-database-integration.zip';
const WORDPRESS_CORE_URL = 'https://wordpress.org/latest.zip';

function getFrankenPhpUrl(): string {
  const platform = process.platform;
  const arch = process.arch;

  if (platform === 'darwin') {
    return arch === 'arm64'
      ? 'https://github.com/dunglas/frankenphp/releases/latest/download/frankenphp-mac-aarch64'
      : 'https://github.com/dunglas/frankenphp/releases/latest/download/frankenphp-mac-x86_64';
  }
  if (platform === 'linux') {
    return arch === 'arm64'
      ? 'https://github.com/dunglas/frankenphp/releases/latest/download/frankenphp-linux-aarch64'
      : 'https://github.com/dunglas/frankenphp/releases/latest/download/frankenphp-linux-x86_64';
  }
  if (platform === 'win32') {
    return 'https://github.com/dunglas/frankenphp/releases/latest/download/frankenphp-windows-x86_64.exe';
  }

  throw new Error(`Unsupported OS: ${platform}`);
}

function ensureSymlink(sourcePath: string, targetPath: string): void {
  const targetStat = fs.lstatSync(targetPath, { throwIfNoEntry: false });
  const hasExistingTarget = targetStat !== undefined;

  if (hasExistingTarget) {
    const isSymlink = targetStat.isSymbolicLink();
    if (isSymlink) {
      try {
        const currentLink = fs.readlinkSync(targetPath);
        const resolvedCurrent = path.resolve(path.dirname(targetPath), currentLink);
        const resolvedSource = path.resolve(sourcePath);
        const isMatchingTarget = resolvedCurrent === resolvedSource;
        if (isMatchingTarget) {
          return;
        }
      } catch {}
      fs.unlinkSync(targetPath);
    } else {
      fs.rmSync(targetPath, { recursive: true, force: true });
    }
  }

  fs.symlinkSync(sourcePath, targetPath, 'junction');
}

export async function setupEmbeddedEnvironment(
  projectDir: string,
  onProgress: SimpleLogCallback,
  onDownloadProgress?: ProgressCallback
): Promise<string> {
  const dataDir = path.join(projectDir, 'data');
  const binDir = path.join(dataDir, 'bin');
  const embeddedDir = path.join(dataDir, 'embedded');
  const wpCoreDir = path.join(embeddedDir, 'wp-core');
  const wpContentDir = path.join(wpCoreDir, 'wp-content');

  if (!fs.existsSync(binDir)) fs.mkdirSync(binDir, { recursive: true });
  if (!fs.existsSync(embeddedDir)) fs.mkdirSync(embeddedDir, { recursive: true });

  const frankenBinaryName = process.platform === 'win32' ? 'frankenphp.exe' : 'frankenphp';
  const frankenPath = path.join(binDir, frankenBinaryName);

  // 1. Download FrankenPHP binary if missing
  if (!fs.existsSync(frankenPath)) {
    onProgress('Downloading FrankenPHP binary...');
    const url = getFrankenPhpUrl();
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
    if (process.platform !== 'win32') {
      fs.chmodSync(frankenPath, 0o755);
    }
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
  const sqlitePluginDir = path.join(wpContentDir, 'plugins', 'sqlite-database-integration');
  if (!fs.existsSync(sqlitePluginDir)) {
    const sqliteZipPath = path.join(embeddedDir, 'sqlite.zip');
    await downloadAndExtractZip(
      SQLITE_PLUGIN_URL,
      sqliteZipPath,
      path.join(wpContentDir, 'plugins'),
      'SQLite Database Integration',
      onProgress,
      onDownloadProgress
    );

    const dbCopy = path.join(sqlitePluginDir, 'db.copy');
    const dbDest = path.join(wpContentDir, 'db.php');
    if (fs.existsSync(dbCopy)) {
      fs.copyFileSync(dbCopy, dbDest);
    }
    onProgress('SQLite integration installed.');
  }

  // 4. Setup wp-config.php for SQLite pointing to shared blackbox/ database
  const hostWpDir = path.join(projectDir, 'blackbox');
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

$is_https = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
$proto = $is_https ? 'https://' : 'http://';
$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost';
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
        const entryStat = fs.lstatSync(tpPath, { throwIfNoEntry: false });
        const isSymlink = entryStat?.isSymbolicLink() ?? false;
        if (isSymlink) {
          try {
            const currentLink = fs.readlinkSync(tpPath);
            const resolvedTarget = path.resolve(path.dirname(tpPath), currentLink);
            const isMissingTarget = !fs.existsSync(resolvedTarget);
            if (isMissingTarget) {
              fs.unlinkSync(tpPath);
            }
          } catch {
            fs.unlinkSync(tpPath);
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

  onProgress('Embedded setup complete.');
  onDownloadProgress?.(null);
  return frankenPath;
}
