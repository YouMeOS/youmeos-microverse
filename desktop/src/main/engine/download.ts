import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import AdmZip from 'adm-zip';
import { DownloadProgress, ProgressCallback, SimpleLogCallback } from './types';

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(1)} ${units[index]}`;
}

export function downloadFile(
  url: string,
  dest: string,
  onProgress?: (loaded: number, total: number, speed: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https:');

    const handleResponse = (response: http.IncomingMessage) => {
      const isRedirect = response.statusCode === 301 ||
        response.statusCode === 302 ||
        response.statusCode === 307 ||
        response.statusCode === 308;

      if (isRedirect) {
        const redirectUrl = response.headers.location;
        if (!redirectUrl) return reject(new Error('Redirect with no location'));
        const resolvedUrl = new URL(redirectUrl, url).toString();
        return downloadFile(resolvedUrl, dest, onProgress).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download: ${response.statusCode}`));
      }

      const totalBytes = parseInt(response.headers['content-length'] || '0', 10);
      let loadedBytes = 0;
      let lastTimestamp = Date.now();
      let lastBytes = 0;
      let currentSpeed = 0;

      const fileStream = fs.createWriteStream(dest);

      const handleDataChunk = (chunk: Buffer) => {
        loadedBytes += chunk.length;
        const now = Date.now();
        const timeElapsedMs = now - lastTimestamp;

        if (timeElapsedMs >= 150 || (totalBytes > 0 && loadedBytes === totalBytes)) {
          if (timeElapsedMs > 0) {
            currentSpeed = Math.round(((loadedBytes - lastBytes) / timeElapsedMs) * 1000);
          }
          lastTimestamp = now;
          lastBytes = loadedBytes;

          if (onProgress) {
            onProgress(loadedBytes, totalBytes, currentSpeed);
          }
        }
      };

      const handleStreamFinish = () => {
        fileStream.close(() => {
          if (onProgress && totalBytes > 0) {
            onProgress(totalBytes, totalBytes, 0);
          }
          resolve();
        });
      };

      const handleStreamError = (err: Error) => {
        fileStream.close(() => {
          if (fs.existsSync(dest)) {
            try { fs.unlinkSync(dest); } catch {}
          }
          reject(err);
        });
      };

      response.on('data', handleDataChunk);
      response.pipe(fileStream);
      fileStream.on('finish', handleStreamFinish);
      fileStream.on('error', handleStreamError);
    };

    const handleReqError = (err: Error) => {
      if (fs.existsSync(dest)) {
        try { fs.unlinkSync(dest); } catch {}
      }
      reject(err);
    };

    const req = isHttps ? https.get(url, handleResponse) : http.get(url, handleResponse);
    req.on('error', handleReqError);
  });
}

export async function downloadAndExtractZip(
  url: string,
  tempZipPath: string,
  targetExtractDir: string,
  itemName: string,
  onLog: SimpleLogCallback,
  onDownloadProgress?: ProgressCallback
): Promise<void> {
  const tempDir = path.dirname(tempZipPath);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const handleProgress = (loaded: number, total: number, speed: number) => {
    const percent = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
    const detail = total > 0 ? `${formatBytes(loaded)} / ${formatBytes(total)}` : formatBytes(loaded);
    onDownloadProgress?.({
      item: itemName,
      loaded,
      total,
      percent,
      speed,
      detail,
      stage: 'downloading'
    });
  };

  onLog(`Downloading ${itemName}...`);
  await downloadFile(url, tempZipPath, handleProgress);

  onLog(`Extracting ${itemName}...`);
  onDownloadProgress?.({
    item: itemName,
    loaded: 0,
    total: 0,
    percent: 100,
    speed: 0,
    stage: 'extracting',
    detail: `Extracting ${itemName} files...`
  });

  const zip = new AdmZip(tempZipPath);
  zip.extractAllTo(targetExtractDir, true);
  if (fs.existsSync(tempZipPath)) {
    try { fs.unlinkSync(tempZipPath); } catch {}
  }

  onDownloadProgress?.({
    item: itemName,
    loaded: 1,
    total: 1,
    percent: 100,
    speed: 0,
    stage: 'complete'
  });
}
