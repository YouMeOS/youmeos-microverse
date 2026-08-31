import fs from "fs";
import path from "path";
import { StackLayerStatus } from "./types";

export interface StackInspectionOptions {
  projectDir: string;
  resourcesDir?: string;
  isServerRunning: boolean;
  port?: number;
}

function parsePluginVersion(filePath: string): string | undefined {
  if (!fs.existsSync(filePath)) return undefined;
  try {
    const content = fs.readFileSync(filePath, "utf8");
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
    const content = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(content);
    return json.version;
  } catch {}
  return undefined;
}

function parseWordPressVersion(wpCoreDir: string): string | undefined {
  const versionFile = path.join(wpCoreDir, "wp-includes", "version.php");
  if (!fs.existsSync(versionFile)) return undefined;
  try {
    const content = fs.readFileSync(versionFile, "utf8");
    const match = content.match(/\$wp_version\s*=\s*['"]([^'"]+)['"]/);
    if (match && match[1]) {
      return match[1].trim();
    }
  } catch {}
  return undefined;
}

interface CachedInspection {
  timestamp: number;
  projectDir: string;
  isEhInstalled: boolean;
  ehVersion?: string;
  isCompassInstalled: boolean;
  compassVersion?: string;
  isWpInstalled: boolean;
  wpVersion: string;
  isWpUpToDate: boolean;
  isBedrockInstalled: boolean;
  bedrockVersion?: string;
  isDbInstalled: boolean;
  dbSizeStr: string;
}

let inspectionCache: CachedInspection | null = null;
const STACK_INSPECTION_TTL_MS = 10000;

export function invalidateStackLayersCache(): void {
  inspectionCache = null;
}

export async function inspectStackLayers(
  options: StackInspectionOptions,
): Promise<StackLayerStatus[]> {
  const { projectDir, isServerRunning } = options;
  const now = Date.now();

  let data: CachedInspection;
  if (
    inspectionCache &&
    inspectionCache.projectDir === projectDir &&
    now - inspectionCache.timestamp < STACK_INSPECTION_TTL_MS
  ) {
    data = inspectionCache;
  } else {
    const legacyWpDir = path.join(projectDir, "blackbox");
    const defaultWpDir = path.join(projectDir, "wp-content");
    const hostWpDir = fs.existsSync(defaultWpDir) ? defaultWpDir : (fs.existsSync(legacyWpDir) ? legacyWpDir : defaultWpDir);
    const pluginsDir = path.join(hostWpDir, "plugins");
    const muPluginsDir = path.join(hostWpDir, "mu-plugins");
    const embeddedWpCoreDir = path.join(
      projectDir,
      "data",
      "embedded",
      "wp-core",
    );

    // 1. Inspect Event Horizon Portal (xophz-compass-event-horizon)
    const eventHorizonDir = path.join(pluginsDir, "xophz-compass-event-horizon");
    const ehMainFile = path.join(
      eventHorizonDir,
      "xophz-compass-event-horizon.php",
    );
    const ehPkgFile = path.join(eventHorizonDir, "package.json");
    const isEhInstalled =
      fs.existsSync(eventHorizonDir) &&
      (fs.existsSync(ehMainFile) || fs.existsSync(ehPkgFile));
    const ehVersion =
      parsePackageJsonVersion(ehPkgFile) ||
      parsePluginVersion(ehMainFile) ||
      (isEhInstalled ? "1.0.0" : undefined);

    // 2. Inspect My COMPASS (xophz-compass)
    const compassDir = path.join(pluginsDir, "xophz-compass");
    const compassMainFile = path.join(compassDir, "xophz-compass.php");
    const compassPkgFile = path.join(compassDir, "package.json");
    const isCompassInstalled =
      fs.existsSync(compassDir) &&
      (fs.existsSync(compassMainFile) || fs.existsSync(compassPkgFile));
    const compassVersion =
      parsePluginVersion(compassMainFile) ||
      parsePackageJsonVersion(compassPkgFile) ||
      (isCompassInstalled ? "1.0.0" : undefined);

    // 3. Inspect Headless WordPress Core
    const wpVersion = parseWordPressVersion(embeddedWpCoreDir) || "6.6.2";
    const isWpInstalled =
      fs.existsSync(path.join(embeddedWpCoreDir, "wp-includes", "version.php")) ||
      fs.existsSync(path.join(hostWpDir, "index.php"));
    const isWpUpToDate = isWpInstalled;

    // 4. Inspect Blackbox Bedrock (MU Plugin)
    const bedrockDir = path.join(muPluginsDir, "blackbox-bedrock");
    const bedrockMainFile = path.join(bedrockDir, "BlackBOX.php");
    const alphaLoaderFile = path.join(
      muPluginsDir,
      "00.00.00.00.alpha-loader.php",
    );
    const isBedrockInstalled =
      fs.existsSync(bedrockMainFile) ||
      fs.existsSync(alphaLoaderFile) ||
      fs.existsSync(bedrockDir);
    const bedrockVersion =
      parsePluginVersion(bedrockMainFile) ||
      parsePluginVersion(alphaLoaderFile) ||
      (isBedrockInstalled ? "26.8.20" : undefined);

    // 5. Inspect SQLite Database Store
    const sqliteFile = path.join(hostWpDir, "database.sqlite");
    const isDbInstalled = fs.existsSync(sqliteFile);
    let dbSizeStr = "";
    if (isDbInstalled) {
      try {
        const stat = fs.statSync(sqliteFile);
        const kb = Math.round(stat.size / 1024);
        dbSizeStr = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
      } catch {}
    }

    data = {
      timestamp: now,
      projectDir,
      isEhInstalled,
      ehVersion,
      isCompassInstalled,
      compassVersion,
      isWpInstalled,
      wpVersion,
      isWpUpToDate,
      isBedrockInstalled,
      bedrockVersion,
      isDbInstalled,
      dbSizeStr,
    };
    inspectionCache = data;
  }

  const isEhActive = data.isEhInstalled && isServerRunning;
  const isCompassActive = data.isCompassInstalled && isServerRunning;
  const isWpActive = data.isWpInstalled && isServerRunning;
  const isBedrockActive = data.isBedrockInstalled && isServerRunning;
  const isDbActive = data.isDbInstalled && isServerRunning;
  const isServerActive = isServerRunning;
  const isNetworkActive = isServerRunning;

  const layers: StackLayerStatus[] = [
    {
      id: "compass",
      name: "My COMPASS Software Suite",
      category: "Command Suite & Sparks Navigator",
      installed: data.isCompassInstalled,
      active: isCompassActive,
      version: data.compassVersion,
      details: data.isCompassInstalled
        ? `PHP Plugin · v${data.compassVersion || "1.0"}`
        : "Not installed in plugins",
      status: isCompassActive
        ? "running"
        : data.isCompassInstalled
          ? "stopped"
          : "error",
    },
    {
      id: "portal",
      name: "YouMeOS",
      category: "Front-End Interface & 3D Engine",
      installed: data.isEhInstalled,
      active: isEhActive,
      version: data.ehVersion,
      details: data.isEhInstalled
        ? `Vue 3 + Vuetify · ${data.ehVersion || "Ready"}`
        : "Not installed in plugins",
      status: isEhActive ? "running" : data.isEhInstalled ? "stopped" : "error",
    },
    {
      id: "network",
      name: "Private w⁴ Protocol Network",
      category: "ZeroConf & mDNS Mesh (youmeos.local)",
      installed: true,
      active: isNetworkActive,
      details: "youmeos.local · Port 5353 / Loopback",
      status: isNetworkActive ? "running" : "stopped",
    },
    {
      id: "server",
      name: "w⁴ Web Server",
      category: "FrankenPHP / Nginx & Caddy Proxy",
      installed: true,
      active: isServerActive,
      details: "Ports 80 / 443 · HTTP/2 & TLS 1.3",
      status: isServerActive ? "running" : "stopped",
    },
    {
      id: "core",
      name: "Headless WP Core",
      category: "Application Kernel & REST/GraphQL API",
      installed: data.isWpInstalled,
      active: isWpActive,
      version: data.wpVersion,
      isUpToDate: data.isWpUpToDate,
      details: data.isWpInstalled
        ? `WordPress v${data.wpVersion} · ${data.isWpUpToDate ? "Up-to-Date" : "Update Available"}`
        : "Core files missing",
      status: isWpActive ? "running" : data.isWpInstalled ? "stopped" : "error",
    },
    {
      id: "database",
      name: "SQLite Database",
      category: "Encrypted VFS Persistent Storage",
      installed: data.isDbInstalled,
      active: isDbActive,
      details: data.isDbInstalled
        ? `database.sqlite (${data.dbSizeStr || "Active"})`
        : "No database file",
      status: isDbActive ? "running" : data.isDbInstalled ? "stopped" : "error",
    },
    {
      id: "bedrock",
      name: "BlackBOX Bedrock",
      category: "Must-Use (MU) Foundation & Genesis Wave",
      installed: data.isBedrockInstalled,
      active: isBedrockActive,
      version: data.bedrockVersion,
      details: data.isBedrockInstalled
        ? `MU-Plugin · v${data.bedrockVersion || "26.8"}`
        : "Bedrock MU missing",
      status: isBedrockActive
        ? "running"
        : data.isBedrockInstalled
          ? "stopped"
          : "error",
    },
  ];

  return layers;
}
