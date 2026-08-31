import { EngineErrorInfo, EngineType } from './types';

export interface ClassifyErrorOptions {
  rawError?: string;
  exitCode?: number | null;
  activePort?: number;
  engineType?: EngineType;
}

export function classifyEngineError(options: ClassifyErrorOptions): EngineErrorInfo {
  const raw = (options.rawError || '').toLowerCase();
  const exitCode = options.exitCode;
  const currentPort = options.activePort || 80;
  const fallbackPort = currentPort === 80 ? 8080 : (currentPort === 8080 ? 8088 : 8080);

  // 1. Missing Windows C++ Redistributable Runtime
  if (
    exitCode === 3221225781 ||
    exitCode === -1073741515 ||
    raw.includes('vcruntime140') ||
    raw.includes('msvcp140')
  ) {
    return {
      code: 'MISSING_RUNTIME',
      title: 'Missing Microsoft Visual C++ Runtime',
      cause: 'The native FrankenPHP binary requires the Microsoft Visual C++ 2015-2022 Redistributable (x64) runtime library to run on Windows.',
      suggestedAction: 'Download & Install Visual C++ (x64)',
      actionType: 'install_runtime',
      runtimeDownloadUrl: 'https://aka.ms/vs/17/release/vc_redist.x64.exe',
      details: 'Download the official Microsoft installer and complete the setup, then restart the Microverse.',
      rawError: options.rawError
    };
  }

  // 2. Port Collision / Address In Use
  if (
    raw.includes('bind: address already in use') ||
    raw.includes('address already in use') ||
    raw.includes('port is already allocated') ||
    raw.includes('listen tcp :') ||
    raw.includes('listen tcp 0.0.0.0:') ||
    raw.includes('listen tcp 127.0.0.1:') ||
    (raw.includes('bind:') && raw.includes('failed')) ||
    (raw.includes('port') && raw.includes('in use'))
  ) {
    return {
      code: 'PORT_IN_USE',
      title: `Port ${currentPort} Already in Use`,
      cause: `Another application, web server (Apache/Nginx/IIS), or Docker container is already listening on port ${currentPort}.`,
      suggestedAction: `Switch to Port ${fallbackPort} & Restart`,
      actionType: 'switch_port',
      targetPort: fallbackPort,
      details: `You can switch the gateway port to ${fallbackPort} to run alongside existing services without port collisions.`,
      rawError: options.rawError
    };
  }

  // 3. Permission Denied / Privileged Port Binding (Linux / macOS setcap or pkexec failure)
  if (
    raw.includes('permission denied') ||
    raw.includes('operation not permitted') ||
    raw.includes('pkexec failed') ||
    raw.includes('cap_net_bind_service') ||
    (raw.includes('bind:') && raw.includes('permission'))
  ) {
    return {
      code: 'PERMISSION_DENIED',
      title: `Privilege Required for Port ${currentPort}`,
      cause: `Ports under 1024 (such as port ${currentPort}) require administrative permissions (sudo / setcap) on Linux and macOS.`,
      suggestedAction: `Switch to Unprivileged Port ${fallbackPort}`,
      actionType: 'switch_port',
      targetPort: fallbackPort,
      details: `Ports above 1024 (like port ${fallbackPort}) run without requiring admin privileges or OS authentication prompts.`,
      rawError: options.rawError
    };
  }

  // 4. Docker Daemon Not Running
  if (
    raw.includes('cannot connect to the docker daemon') ||
    raw.includes('docker daemon is not running') ||
    raw.includes('is the docker daemon running') ||
    raw.includes('docker.sock') ||
    raw.includes('connect: connection refused')
  ) {
    return {
      code: 'DOCKER_DAEMON_OFFLINE',
      title: 'Docker Daemon is Offline',
      cause: 'Docker Desktop or the Docker system daemon is not running on your computer.',
      suggestedAction: 'Switch to Embedded Engine (Zero Docker Required)',
      actionType: 'switch_engine',
      details: 'The Embedded Engine runs FrankenPHP natively as a standalone lightweight process without needing Docker.',
      rawError: options.rawError
    };
  }

  // 5. Database Lock or SQLite Corruption
  if (
    raw.includes('database is locked') ||
    raw.includes('disk i/o error') ||
    raw.includes('malformed database schema') ||
    raw.includes('sqlite3 error') ||
    raw.includes('database disk image is malformed')
  ) {
    return {
      code: 'DB_LOCKED',
      title: 'Database Sandbox Locked',
      cause: 'The SQLite database file in wp-content/ was locked by a previous process or damaged.',
      suggestedAction: 'Inspect & Reset Database',
      actionType: 'reset_db',
      details: 'You can run database diagnostics or perform a clean database reset to restore normal operation.',
      rawError: options.rawError
    };
  }

  // 6. Generic Process Spawn Error
  if (raw.includes('enoent') || raw.includes('spawn') || raw.includes('exec error')) {
    return {
      code: 'SPAWN_ERROR',
      title: 'Engine Spawn Error',
      cause: 'The server executable binary could not be started or resolved from the disk.',
      suggestedAction: 'Retry Stack Initialization',
      actionType: 'retry',
      details: 'Verify disk space and file permissions in your user data directory.',
      rawError: options.rawError
    };
  }

  // 7. Fallback Unknown Error
  return {
    code: 'UNKNOWN',
    title: 'Engine Startup Error',
    cause: options.rawError || 'The runtime process encountered an unexpected failure during initialization.',
    suggestedAction: 'Restart Engine',
    actionType: 'retry',
    details: 'Review the live console logs for detailed debugging traces.',
    rawError: options.rawError
  };
}
