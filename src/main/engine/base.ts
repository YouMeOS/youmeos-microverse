import fs from 'fs';
import path from 'path';
import {
  MicroverseEngine,
  EngineStatusInfo,
  EngineType,
  DownloadProgress,
  LogEntry,
  LogLevel,
  LogFilterOptions,
  ProgressCallback,
  LogCallback,
  StatusCallback
} from './types';

export function getDevProjectDir(startDir: string = __dirname): string {
  let cur = startDir;
  while (cur && cur !== path.dirname(cur)) {
    if (fs.existsSync(path.join(cur, 'docker-compose.yml')) || fs.existsSync(path.join(cur, 'package.json'))) {
      return cur;
    }
    cur = path.dirname(cur);
  }
  return path.resolve(startDir, '../..');
}

export abstract class BaseEngine implements MicroverseEngine {
  abstract readonly type: EngineType;
  protected logsBuffer: string[] = [];
  protected structuredLogs: LogEntry[] = [];
  protected currentDownloadProgress: DownloadProgress | null = null;
  protected progressCallback?: ProgressCallback;
  protected logCallback?: LogCallback;
  protected statusCallback?: StatusCallback;

  setProgressCallback(callback: ProgressCallback): void {
    this.progressCallback = callback;
  }

  setLogCallback(callback: LogCallback): void {
    this.logCallback = callback;
  }

  setStatusCallback(callback: StatusCallback): void {
    this.statusCallback = callback;
  }

  protected pushLog(
    service: string,
    text: string,
    level: LogLevel = 'info'
  ): void {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      service,
      text,
      level,
      timestamp: Date.now()
    };

    this.structuredLogs.push(entry);
    if (this.structuredLogs.length > 800) {
      this.structuredLogs.splice(0, this.structuredLogs.length - 800);
    }

    const formatted = `[${service}] ${text}`;
    this.logsBuffer.push(formatted);
    if (this.logsBuffer.length > 800) {
      this.logsBuffer.splice(0, this.logsBuffer.length - 800);
    }

    this.logCallback?.(entry);
  }

  clearLogs(): void {
    this.structuredLogs = [];
    this.logsBuffer = [];
  }

  async getStructuredLogs(filter?: LogFilterOptions): Promise<LogEntry[]> {
    const tail = filter?.tail ?? 200;
    const hasServiceFilter = Boolean(filter?.service && filter.service !== 'all');
    const hasLevelFilter = Boolean(filter?.level && filter.level !== 'all');
    const searchFilter = filter?.search?.trim().toLowerCase() || '';

    if (!hasServiceFilter && !hasLevelFilter && !searchFilter) {
      return this.structuredLogs.slice(-tail);
    }

    const s = hasServiceFilter ? filter!.service!.toLowerCase() : '';
    const lvl = hasLevelFilter ? filter!.level! : '';

    const results: LogEntry[] = [];
    const logs = this.structuredLogs;

    // Scan backwards from most recent logs up to tail matches
    for (let i = logs.length - 1; i >= 0; i--) {
      const item = logs[i];

      if (hasLevelFilter && item.level !== lvl) {
        continue;
      }

      if (hasServiceFilter) {
        const isvc = item.service.toLowerCase();
        let matchesService = isvc === s;
        if (!matchesService) {
          if (s === 'gateway') matchesService = isvc === 'nginx' || isvc === 'caddy' || isvc === 'frankenphp';
          else if (s === 'core') matchesService = isvc === 'wordpress' || isvc === 'php-server' || isvc === 'sqlite' || isvc === 'sqlite-store';
          else if (s === 'network') matchesService = isvc === 'avahi' || isvc === 'local-network' || isvc === 'mesh';
          else if (s === 'setup') matchesService = isvc === 'setup' || isvc === 'composer' || isvc === 'system';
        }
        if (!matchesService) continue;
      }

      if (searchFilter) {
        const textMatches = item.text.toLowerCase().includes(searchFilter) || item.service.toLowerCase().includes(searchFilter);
        if (!textMatches) continue;
      }

      results.push(item);
      if (results.length >= tail) {
        break;
      }
    }

    return results.reverse();
  }

  protected notifyStatus(): void {
    this.status().then((st) => {
      this.statusCallback?.(st);
    }).catch(() => {});
  }

  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
  abstract restart(): Promise<void>;
  abstract status(): Promise<EngineStatusInfo>;
  abstract isAvailable(): Promise<boolean>;

  async logs(service?: string, tail: number = 150): Promise<string> {
    if (!service || service === 'all') {
      return this.logsBuffer.slice(-tail).join('\n') || '[Engine] No logs recorded yet.';
    }
    const filtered = await this.getStructuredLogs({ service, tail });
    return filtered.map((e) => `[${e.service}] ${e.text}`).join('\n') || `[Engine] No logs recorded for ${service}.`;
  }
}
