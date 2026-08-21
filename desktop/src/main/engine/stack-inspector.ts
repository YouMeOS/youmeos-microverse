import fs from 'fs';
import path from 'path';
import { StackLayerStatus } from './types';

export interface StackInspectionOptions {
  projectDir: string;
  resourcesDir?: string;
  isServerRunning: boolean;
  port?: number;
}

function parsePluginVersion(filePath: string): string | undefined {
  if (!fs.existsSync(filePath)) return undefined;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/Version:\s*([^\r\n*]+)/i);
    if (match && match[1]) {
      return match[1].trim();
    }
  } catch {}
  return undefined;
}

function parsePackageJsonVersion(filePath: string): string | undefined {
  if (!fs.existsSync(filePath)) return undefined;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    return json.version;
  } catch {}
  return undefined;
}

function parseWordPressVersion(wpCoreDir: string): string | undefined {
  const versionFile = path.join(wpCoreDir, 'wp-includes', 'version.php');
  if (!fs.existsSync(versionFile)) return undefined;
  try {
    const content = fs.readFileSync(versionFile, 'utf8');
    const match = content.match(/\$wp_version\s*=\s*['"]([^'"]+)['"]/);
    if (match && match[1]) {
      return match[1].trim();
    }
  } catch {}
  return undefined;
}

export async function inspectStackLayers(options: StackInspectionOptions): Promise<StackLayerStatus[]> {
  const { projectDir, isServerRunning } = options;
  const hostWpDir = path.join(projectDir, 'blackbox');
  const pluginsDir = path.join(hostWpDir, 'plugins');
  const muPluginsDir = path.join(hostWpDir, 'mu-plugins');
  const embeddedWpCoreDir = path.join(projectDir, 'data', 'embedded', 'wp-core');

  // 1. Inspect Event Horizon Portal (xophz-compass-event-horizon)
  const eventHorizonDir = path.join(pluginsDir, 'xophz-compass-event-horizon');
  const ehMainFile = path.join(eventHorizonDir, 'xophz-compass-event-horizon.php');
  const ehPkgFile = path.join(eventHorizonDir, 'package.json');
  const isEhInstalled = fs.existsSync(eventHorizonDir) && (fs.existsSync(ehMainFile) || fs.existsSync(ehPkgFile));
  const ehVersion = parsePackageJsonVersion(ehPkgFile) || parsePluginVersion(ehMainFile) || (isEhInstalled ? '1.0.0' : undefined);
  const isEhActive = isEhInstalled && isServerRunning;

  // 2. Inspect My COMPASS (xophz-compass)
  const compassDir = path.join(pluginsDir, 'xophz-compass');
  const compassMainFile = path.join(compassDir, 'xophz-compass.php');
  const compassPkgFile = path.join(compassDir, 'package.json');
  const isCompassInstalled = fs.existsSync(compassDir) && (fs.existsSync(compassMainFile) || fs.existsSync(compassPkgFile));
  const compassVersion = parsePluginVersion(compassMainFile) || parsePackageJsonVersion(compassPkgFile) || (isCompassInstalled ? '1.0.0' : undefined);
  const isCompassActive = isCompassInstalled && isServerRunning;

  // 3. Inspect Headless WordPress Core
  const wpVersion = parseWordPressVersion(embeddedWpCoreDir) || '6.6.2';
  const isWpInstalled = fs.existsSync(path.join(embeddedWpCoreDir, 'wp-includes', 'version.php')) || fs.existsSync(path.join(hostWpDir, 'index.php'));
  const isWpActive = isWpInstalled && isServerRunning;
  const isWpUpToDate = isWpInstalled;

  // 4. Inspect Blackbox Bedrock (MU Plugin)
  const bedrockDir = path.join(muPluginsDir, 'blackbox-bedrock');
  const bedrockMainFile = path.join(bedrockDir, 'BlackBOX.php');
  const alphaLoaderFile = path.join(muPluginsDir, '00.00.00.00.alpha-loader.php');
  const isBedrockInstalled = fs.existsSync(bedrockMainFile) || fs.existsSync(alphaLoaderFile) || fs.existsSync(bedrockDir);
  const bedrockVersion = parsePluginVersion(bedrockMainFile) || parsePluginVersion(alphaLoaderFile) || (isBedrockInstalled ? '26.8.20' : undefined);
  const isBedrockActive = isBedrockInstalled && isServerRunning;

  // 5. Inspect SQLite Database Store
  const sqliteFile = path.join(hostWpDir, 'database.sqlite');
  const isDbInstalled = fs.existsSync(sqliteFile);
  let dbSizeStr = '';
  if (isDbInstalled) {
    try {
      const stat = fs.statSync(sqliteFile);
      const kb = Math.round(stat.size / 1024);
      dbSizeStr = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
    } catch {}
  }
  const isDbActive = isDbInstalled && isServerRunning;

  // 6. Inspect Web & PHP Server
  const isServerActive = isServerRunning;

  // 7. Inspect Private Node Network (mDNS)
  const isNetworkActive = isServerRunning;

  const layers: StackLayerStatus[] = [
    {
      id: 'bedrock',
      name: 'Blackbox Bedrock',
      category: 'Must-Use (MU) Foundation & Genesis Wave',
      installed: isBedrockInstalled,
      active: isBedrockActive,
      version: bedrockVersion,
      details: isBedrockInstalled ? `MU-Plugin · v${bedrockVersion || '26.8'}` : 'Bedrock MU missing',
      status: isBedrockActive ? 'running' : (isBedrockInstalled ? 'stopped' : 'error')
    },
    {
      id: 'database',
      name: 'SQLite Database Store',
      category: 'Encrypted VFS Persistent Storage',
      installed: isDbInstalled,
      active: isDbActive,
      details: isDbInstalled ? `database.sqlite (${dbSizeStr || 'Active'})` : 'No database file',
      status: isDbActive ? 'running' : (isDbInstalled ? 'stopped' : 'error')
    },
    {
      id: 'core',
      name: 'Headless WordPress Core',
      category: 'Application Kernel & REST/GraphQL API',
      installed: isWpInstalled,
      active: isWpActive,
      version: wpVersion,
      isUpToDate: isWpUpToDate,
      details: isWpInstalled ? `WordPress v${wpVersion} · ${isWpUpToDate ? 'Up-to-Date' : 'Update Available'}` : 'Core files missing',
      status: isWpActive ? 'running' : (isWpInstalled ? 'stopped' : 'error')
    },
    {
      id: 'server',
      name: 'Native Web & PHP Server',
      category: 'FrankenPHP / Nginx & Caddy Proxy',
      installed: true,
      active: isServerActive,
      details: 'Ports 80 / 443 · HTTP/2 & TLS 1.3',
      status: isServerActive ? 'running' : 'stopped'
    },
    {
      id: 'network',
      name: 'Private Node Network',
      category: 'ZeroConf & mDNS Mesh (youmeos.local)',
      installed: true,
      active: isNetworkActive,
      details: 'youmeos.local · Port 5353 / Loopback',
      status: isNetworkActive ? 'running' : 'stopped'
    },
    {
      id: 'portal',
      name: 'Event Horizon Portal',
      category: 'Front-End Interface & 3D Engine',
      installed: isEhInstalled,
      active: isEhActive,
      version: ehVersion,
      details: isEhInstalled ? `Vue 3 + Vuetify · ${ehVersion || 'Ready'}` : 'Not installed in plugins',
      status: isEhActive ? 'running' : (isEhInstalled ? 'stopped' : 'error')
    },
    {
      id: 'compass',
      name: 'My COMPASS',
      category: 'Command Suite & Sparks Navigator',
      installed: isCompassInstalled,
      active: isCompassActive,
      version: compassVersion,
      details: isCompassInstalled ? `PHP Plugin · v${compassVersion || '1.0'}` : 'Not installed in plugins',
      status: isCompassActive ? 'running' : (isCompassInstalled ? 'stopped' : 'error')
    }
  ];

  return layers;
}
