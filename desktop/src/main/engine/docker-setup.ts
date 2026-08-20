import fs from 'fs';
import path from 'path';
import { ProgressCallback, SimpleLogCallback } from './types';
import { downloadAndExtractZip } from './download';

const SQLITE_PLUGIN_URL = 'https://downloads.wordpress.org/plugin/sqlite-database-integration.zip';

function ensureWritableRecursive(dir: string): void {
  try { fs.chmodSync(dir, 0o777); } catch {}
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    try {
      if (entry.isDirectory()) {
        ensureWritableRecursive(full);
      } else {
        fs.chmodSync(full, 0o666);
      }
    } catch {}
  }
}

export async function setupDockerEnvironment(
  projectDir: string,
  onProgress: SimpleLogCallback,
  onDownloadProgress?: ProgressCallback
): Promise<void> {
  const hostWpDir = path.join(projectDir, 'blackbox');
  const pluginsDir = path.join(hostWpDir, 'plugins');
  const dbDest = path.join(hostWpDir, 'db.php');

  try {
    ensureWritableRecursive(hostWpDir);
  } catch {}

  const requiredDirs = ['plugins', 'mu-plugins', 'themes', 'uploads'];
  for (const d of requiredDirs) {
    const target = path.join(hostWpDir, d);
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
      try { fs.chmodSync(target, 0o777); } catch {}
    }
  }

  const sqlitePluginDir = path.join(pluginsDir, 'sqlite-database-integration');
  if (!fs.existsSync(sqlitePluginDir)) {
    const sqliteZipPath = path.join(projectDir, 'data', 'sqlite.zip');
    await downloadAndExtractZip(
      SQLITE_PLUGIN_URL,
      sqliteZipPath,
      pluginsDir,
      'SQLite Database Integration',
      onProgress,
      onDownloadProgress
    );
  }

  const dbCopy = path.join(sqlitePluginDir, 'db.copy');
  if (fs.existsSync(dbCopy) && !fs.existsSync(dbDest)) {
    fs.copyFileSync(dbCopy, dbDest);
    try { fs.chmodSync(dbDest, 0o666); } catch {}
    onProgress('SQLite drop-in (db.php) active in blackbox/ for shared Docker/Embedded database.');
  }

  const sqliteFiles = ['database.sqlite', 'database.sqlite-shm', 'database.sqlite-wal'];
  for (const sf of sqliteFiles) {
    const sPath = path.join(hostWpDir, sf);
    if (fs.existsSync(sPath)) {
      try { fs.chmodSync(sPath, 0o666); } catch {}
    }
  }

  onProgress('Unified SQLite database environment configured for Docker.');
  onDownloadProgress?.(null);
}
