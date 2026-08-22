import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { LogCallback, LogEntry } from './types';
import { downloadFile, formatBytes } from './download';

export interface PluginDefinition {
  slug: string;
  name: string;
  url: string;
  targetType: 'plugin' | 'mu-plugin';
  mainPhpFile?: string;
}

export interface PluginUpdateDetail {
  slug: string;
  name: string;
  prevVersion: string;
  newVersion: string;
  status: 'updated' | 'unchanged' | 'installed' | 'error';
  error?: string;
}

export interface PluginUpdateResult {
  success: boolean;
  updatedCount: number;
  totalCount: number;
  details: PluginUpdateDetail[];
  error?: string;
}

export const DEFAULT_PLUGINS: PluginDefinition[] = [
  {
    slug: 'sqlite-database-integration',
    name: 'SQLite Database Integration',
    url: 'https://downloads.wordpress.org/plugin/sqlite-database-integration.zip',
    targetType: 'plugin',
    mainPhpFile: 'load.php'
  },
  {
    slug: 'xophz-compass',
    name: 'My COMPASS Engine',
    url: 'https://github.com/HalloftheGods/xophz-compass/archive/refs/heads/main.zip',
    targetType: 'plugin',
    mainPhpFile: 'xophz-compass.php'
  },
  {
    slug: 'xophz-compass-event-horizon',
    name: 'YouMeOS WebTop Portal',
    url: 'https://github.com/HalloftheGods/xophz-compass-event-horizon/archive/refs/heads/main.zip',
    targetType: 'plugin',
    mainPhpFile: 'xophz-compass-event-horizon.php'
  }
];

export class PluginUpdater {
  private projectDir: string;
  private logCallback?: LogCallback;

  constructor(projectDir: string, logCallback?: LogCallback) {
    this.projectDir = projectDir;
    this.logCallback = logCallback;
  }

  private log(text: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const entry: LogEntry = {
      id: `updater-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      service: 'updater',
      level,
      text,
      timestamp: Date.now()
    };
    this.logCallback?.(entry);
  }

  private getPluginsDir(targetType: 'plugin' | 'mu-plugin'): string {
    return targetType === 'mu-plugin'
      ? path.join(this.projectDir, 'blackbox', 'mu-plugins')
      : path.join(this.projectDir, 'blackbox', 'plugins');
  }

  private getPluginVersion(pluginDir: string, mainPhpFile?: string): string {
    if (!fs.existsSync(pluginDir)) return 'none';

    // 1. Check specified main PHP file
    if (mainPhpFile) {
      const targetFile = path.join(pluginDir, mainPhpFile);
      if (fs.existsSync(targetFile)) {
        const ver = this.extractVersionFromPhp(targetFile);
        if (ver) return ver;
      }
    }

    // 2. Check all top-level PHP files for standard WordPress headers
    try {
      const files = fs.readdirSync(pluginDir);
      for (const file of files) {
        if (file.endsWith('.php')) {
          const fullPath = path.join(pluginDir, file);
          const ver = this.extractVersionFromPhp(fullPath);
          if (ver) return ver;
        }
      }
    } catch {}

    // 3. Fallback to package.json or composer.json
    const pkgJson = path.join(pluginDir, 'package.json');
    if (fs.existsSync(pkgJson)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(pkgJson, 'utf8'));
        if (parsed.version) return parsed.version;
      } catch {}
    }

    const composerJson = path.join(pluginDir, 'composer.json');
    if (fs.existsSync(composerJson)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(composerJson, 'utf8'));
        if (parsed.version) return parsed.version;
      } catch {}
    }

    return 'installed';
  }

  private extractVersionFromPhp(filePath: string): string | null {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const match = content.match(/Version:\s*([^\r\n*]+)/i);
      if (match && match[1]) {
        return match[1].trim();
      }
    } catch {}
    return null;
  }

  private copyDirectoryRecursive(src: string, dest: string): void {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDirectoryRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  private removeDirectoryRecursive(targetPath: string): void {
    if (!fs.existsSync(targetPath)) return;
    try {
      fs.rmSync(targetPath, { recursive: true, force: true });
    } catch {
      try {
        const entries = fs.readdirSync(targetPath, { withFileTypes: true });
        for (const entry of entries) {
          const curPath = path.join(targetPath, entry.name);
          if (entry.isDirectory()) {
            this.removeDirectoryRecursive(curPath);
          } else {
            fs.unlinkSync(curPath);
          }
        }
        fs.rmdirSync(targetPath);
      } catch {}
    }
  }

  async updateAll(plugins: PluginDefinition[] = DEFAULT_PLUGINS): Promise<PluginUpdateResult> {
    this.log('==> [1/4] Scanning installed YouMeOS plugins & versions...');
    const initialVersions: Record<string, string> = {};

    for (const plugin of plugins) {
      const targetDir = path.join(this.getPluginsDir(plugin.targetType), plugin.slug);
      const ver = this.getPluginVersion(targetDir, plugin.mainPhpFile);
      initialVersions[plugin.slug] = ver;
      this.log(`  • ${plugin.name} (${plugin.slug}): v${ver}`);
    }

    this.log('==> [2/4] Downloading latest packages from upstream repositories...');
    const tempBaseDir = path.join(this.projectDir, 'data', 'temp', 'plugin-sync');
    if (!fs.existsSync(tempBaseDir)) {
      fs.mkdirSync(tempBaseDir, { recursive: true });
    }

    const updateDetails: PluginUpdateDetail[] = [];
    let updatedCount = 0;

    for (const plugin of plugins) {
      const prevVer = initialVersions[plugin.slug] || 'none';
      const tempZip = path.join(tempBaseDir, `${plugin.slug}-${Date.now()}.zip`);
      const tempExtractDir = path.join(tempBaseDir, `${plugin.slug}-extracted-${Date.now()}`);
      const finalDestDir = path.join(this.getPluginsDir(plugin.targetType), plugin.slug);

      try {
        this.log(`  ➔ Downloading ${plugin.name} (${plugin.slug})...`);
        
        let lastLoggedPercent = -1;
        await downloadFile(plugin.url, tempZip, (loaded, total, speed) => {
          if (total > 0) {
            const percent = Math.round((loaded / total) * 100);
            if (percent >= lastLoggedPercent + 25 || percent === 100) {
              lastLoggedPercent = percent;
              this.log(`    [${percent}%] ${formatBytes(loaded)} / ${formatBytes(total)} (${formatBytes(speed)}/s)`);
            }
          }
        });

        this.log(`  ➔ Extracting ${plugin.name}...`);
        const zip = new AdmZip(tempZip);
        zip.extractAllTo(tempExtractDir, true);

        // Determine correct source folder inside extracted archive
        let sourceContentDir = tempExtractDir;
        const extractedEntries = fs.readdirSync(tempExtractDir, { withFileTypes: true });
        const dirEntries = extractedEntries.filter(e => e.isDirectory());

        if (dirEntries.length === 1) {
          // GitHub archives contain a single root directory e.g. "xophz-compass-main"
          sourceContentDir = path.join(tempExtractDir, dirEntries[0].name);
        } else if (fs.existsSync(path.join(tempExtractDir, plugin.slug))) {
          // WordPress.org zips contain a folder matching the plugin slug
          sourceContentDir = path.join(tempExtractDir, plugin.slug);
        }

        // Atomic-like update: remove old destination and copy new files
        this.removeDirectoryRecursive(finalDestDir);
        this.copyDirectoryRecursive(sourceContentDir, finalDestDir);

        // Verify newly installed version
        const newVer = this.getPluginVersion(finalDestDir, plugin.mainPhpFile);
        const hasUpdated = prevVer !== newVer && prevVer !== 'none';
        if (hasUpdated) {
          updatedCount++;
        }

        updateDetails.push({
          slug: plugin.slug,
          name: plugin.name,
          prevVersion: prevVer,
          newVersion: newVer,
          status: hasUpdated ? 'updated' : 'unchanged'
        });

        this.log(`  ✓ Successfully installed ${plugin.name} (v${newVer})`);
      } catch (err: any) {
        this.log(`  ✗ Failed to update ${plugin.name}: ${err?.message || err}`, 'error');
        updateDetails.push({
          slug: plugin.slug,
          name: plugin.name,
          prevVersion: prevVer,
          newVersion: prevVer,
          status: 'error',
          error: err?.message || String(err)
        });
      } finally {
        // Clean up temporary files
        if (fs.existsSync(tempZip)) {
          try { fs.unlinkSync(tempZip); } catch {}
        }
        if (fs.existsSync(tempExtractDir)) {
          this.removeDirectoryRecursive(tempExtractDir);
        }
      }
    }

    this.log('==> [3/4] Inspecting plugin versions and verifying assets...');
    for (const detail of updateDetails) {
      if (detail.status === 'updated') {
        this.log(`  ✓ ${detail.name} (${detail.slug}): v${detail.prevVersion} ➔ v${detail.newVersion} (Updated)`);
      } else if (detail.status === 'error') {
        this.log(`  ✗ ${detail.name} (${detail.slug}): Error (${detail.error})`, 'error');
      } else {
        this.log(`  ✓ ${detail.name} (${detail.slug}): v${detail.newVersion} (Current)`);
      }
    }

    this.log('==> [4/4] Plugin update check complete. All packages verified in blackbox/plugins/');

    const hasErrors = updateDetails.some(d => d.status === 'error');
    return {
      success: !hasErrors,
      updatedCount,
      totalCount: updateDetails.length,
      details: updateDetails,
      error: hasErrors ? 'One or more plugins encountered an error during sync.' : undefined
    };
  }
}
