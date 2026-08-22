import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const binDir = path.join(rootDir, 'bin');

async function downloadFile(url, dest) {
  console.log(`[download-binaries] Downloading ${url} -> ${dest}`);
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.statusText}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(arrayBuffer));
}

async function main() {
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  const platform = process.platform;
  const arch = process.arch;

  if (platform === 'win32') {
    const exePath = path.join(binDir, 'frankenphp.exe');
    if (!fs.existsSync(exePath)) {
      const zipPath = path.join(binDir, 'frankenphp.zip');
      const url = 'https://github.com/php/frankenphp/releases/latest/download/frankenphp-windows-x86_64.zip';
      await downloadFile(url, zipPath);
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(binDir, true);
      try {
        fs.rmSync(zipPath, { force: true });
      } catch {}
      console.log(`[download-binaries] FrankenPHP Windows binary ready at ${exePath}`);
    } else {
      console.log(`[download-binaries] FrankenPHP Windows binary already exists at ${exePath}`);
    }
  } else if (platform === 'darwin') {
    const binPath = path.join(binDir, 'frankenphp');
    if (!fs.existsSync(binPath)) {
      const url = arch === 'arm64'
        ? 'https://github.com/php/frankenphp/releases/latest/download/frankenphp-mac-arm64'
        : 'https://github.com/php/frankenphp/releases/latest/download/frankenphp-mac-x86_64';
      await downloadFile(url, binPath);
      fs.chmodSync(binPath, 0o755);
      console.log(`[download-binaries] FrankenPHP Mac binary ready at ${binPath}`);
    } else {
      console.log(`[download-binaries] FrankenPHP Mac binary already exists at ${binPath}`);
    }
  } else if (platform === 'linux') {
    const binPath = path.join(binDir, 'frankenphp');
    if (!fs.existsSync(binPath)) {
      const url = arch === 'arm64'
        ? 'https://github.com/php/frankenphp/releases/latest/download/frankenphp-linux-aarch64'
        : 'https://github.com/php/frankenphp/releases/latest/download/frankenphp-linux-x86_64';
      await downloadFile(url, binPath);
      fs.chmodSync(binPath, 0o755);
      console.log(`[download-binaries] FrankenPHP Linux binary ready at ${binPath}`);
    } else {
      console.log(`[download-binaries] FrankenPHP Linux binary already exists at ${binPath}`);
    }
  }
}

main().catch((err) => {
  console.error('[download-binaries] Error:', err);
  process.exit(1);
});
