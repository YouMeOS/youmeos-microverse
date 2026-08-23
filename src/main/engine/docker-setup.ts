import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { ProgressCallback, SimpleLogCallback } from './types';
import { downloadAndExtractZip } from './download';

const execFileAsync = promisify(execFile);

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
  onDownloadProgress?: ProgressCallback,
  resourcesDir?: string
): Promise<void> {
  if (resourcesDir && resourcesDir !== projectDir) {
    const filesToCopy = ['docker-compose.yml', '.env.example'];
    for (const f of filesToCopy) {
      const src = path.join(resourcesDir, f);
      const dest = path.join(projectDir, f);
      if (fs.existsSync(src) && !fs.existsSync(dest)) {
        try { fs.copyFileSync(src, dest); } catch {}
      }
    }
    const dirsToCopy = ['docker', 'blackbox'];
    for (const d of dirsToCopy) {
      const src = path.join(resourcesDir, d);
      const dest = path.join(projectDir, d);
      if (fs.existsSync(src)) {
        try {
          fs.cpSync(src, dest, {
            recursive: true,
            errorOnExist: false,
            filter: (sourcePath) => {
              if (d === 'blackbox') {
                const rel = path.relative(src, sourcePath);
                if (rel === 'database.sqlite' || rel.startsWith('database.sqlite-')) {
                  const destFile = path.join(dest, rel);
                  return !fs.existsSync(destFile);
                }
              }
              return true;
            }
          });
        } catch {}
      }
    }
  }

  // Ensure SSL certificates exist for Nginx gateway
  const certsDir = path.join(projectDir, 'docker', 'nginx', 'certs');
  const certFile = path.join(certsDir, 'cert.pem');
  const keyFile = path.join(certsDir, 'key.pem');

  if (!fs.existsSync(certFile) || !fs.existsSync(keyFile)) {
    const candidateCertDirs = [
      resourcesDir ? path.join(resourcesDir, 'docker', 'nginx', 'certs') : '',
      path.join(__dirname, '..', '..', 'docker', 'nginx', 'certs'),
      path.join(__dirname, '..', '..', '..', 'docker', 'nginx', 'certs')
    ].filter(Boolean);

    for (const candDir of candidateCertDirs) {
      const candCert = path.join(candDir, 'cert.pem');
      const candKey = path.join(candDir, 'key.pem');
      if (fs.existsSync(candCert) && fs.existsSync(candKey)) {
        try {
          if (!fs.existsSync(certsDir)) fs.mkdirSync(certsDir, { recursive: true });
          fs.copyFileSync(candCert, certFile);
          fs.copyFileSync(candKey, keyFile);
          onProgress('Initialized SSL certificates for Nginx gateway.');
          break;
        } catch {}
      }
    }

    // Auto-generate self-signed SSL certificate if missing from bundle
    if (!fs.existsSync(certFile) || !fs.existsSync(keyFile)) {
      try {
        if (!fs.existsSync(certsDir)) fs.mkdirSync(certsDir, { recursive: true });
        const san = 'subjectAltName=DNS:my.youmeos.com,DNS:*.my.youmeos.com,DNS:my.umeos.com,DNS:*.my.umeos.com,DNS:microverse.youmeos.com,DNS:localhost,DNS:youmeos.local,IP:127.0.0.1';
        await execFileAsync('openssl', [
          'req',
          '-x509',
          '-newkey', 'rsa:2048',
          '-nodes',
          '-keyout', keyFile,
          '-out', certFile,
          '-days', '3650',
          '-subj', '/CN=my.youmeos.com',
          '-addext', san
        ]);
        onProgress('Generated self-signed SSL certificates for Nginx gateway.');
      } catch {
        try {
          await execFileAsync('openssl', [
            'req',
            '-x509',
            '-newkey', 'rsa:2048',
            '-nodes',
            '-keyout', keyFile,
            '-out', certFile,
            '-days', '3650',
            '-subj', '/CN=my.youmeos.com'
          ]);
          onProgress('Generated standard SSL certificates for Nginx gateway.');
        } catch (err: any) {
          console.warn('Failed to auto-generate SSL certificates via openssl:', err?.message || err);
        }
      }
    }
  }

  const hostWpDir = path.join(projectDir, 'blackbox');
  const pluginsDir = path.join(hostWpDir, 'plugins');
  const dbDest = path.join(hostWpDir, 'db.php');

  const envPath = path.join(projectDir, '.env');
  const envExamplePath = path.join(projectDir, '.env.example');
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    try {
      fs.copyFileSync(envExamplePath, envPath);
      onProgress('Initialized .env from .env.example.');
    } catch {}
  }

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
