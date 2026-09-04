import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { session } from 'electron';
import { downloadFile } from './download';

const execFileAsync = promisify(execFile);

export interface WpUser {
  id: number;
  login: string;
  email: string;
  displayName: string;
}

export interface PasswordResetResult {
  success: boolean;
  userLogin: string;
  newPassword: string;
  error?: string;
}

export interface AutoLoginResult {
  success: boolean;
  url: string;
  userLogin: string;
  error?: string;
}

export interface DbHealthResult {
  status: 'ok' | 'error';
  integrity: string;
  userCount: number;
  sizeBytes: number;
  error?: string;
}

export interface DbResetResult {
  success: boolean;
  message: string;
  error?: string;
}

export interface DbManagerResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface DbManagerStatus {
  active: boolean;
  url?: string;
}

export class DiagnosticsManager {
  private projectDir: string;

  constructor(projectDir: string) {
    this.projectDir = projectDir;
  }

  private getFrankenPhpPath(): string {
    const isWin = process.platform === 'win32';
    const binName = isWin ? 'frankenphp.exe' : 'frankenphp';
    const candidate = path.join(this.projectDir, 'data', 'bin', binName);
    if (fs.existsSync(candidate)) return candidate;
    return binName;
  }

  private getDbPath(): string {
    const candidatePaths = [
      path.join(this.projectDir, 'wp-content', 'database', '.ht.sqlite'),
      path.join(this.projectDir, 'wp-content', 'database.sqlite'),
      path.join(this.projectDir, 'blackbox', 'database.sqlite'),
      path.join(this.projectDir, 'data', 'database.sqlite')
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) return p;
    }
    return candidatePaths[0];
  }

  async listUsers(): Promise<WpUser[]> {
    const dbPath = this.getDbPath();
    if (!fs.existsSync(dbPath)) return [];

    const frankenPath = this.getFrankenPhpPath();
    const phpCode = `
      try {
        $db = new PDO('sqlite:${dbPath.replace(/\\/g, '/')}');
        $stmt = $db->query('SELECT ID as id, user_login as login, user_email as email, display_name as displayName FROM wp_users ORDER BY ID ASC');
        if ($stmt) {
          echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } else {
          echo json_encode([]);
        }
      } catch (Exception $e) {
        echo json_encode([]);
      }
    `;

    try {
      const { stdout } = await execFileAsync(frankenPath, ['php-cli', '-r', phpCode]);
      return JSON.parse(stdout.trim() || '[]');
    } catch {
      return [];
    }
  }

  async resetPassword(userId: number, customPassword?: string): Promise<PasswordResetResult> {
    const dbPath = this.getDbPath();
    if (!fs.existsSync(dbPath)) {
      return { success: false, userLogin: '', newPassword: '', error: 'Database not initialized yet.' };
    }

    const newPassword = customPassword && customPassword.trim()
      ? customPassword.trim()
      : `youmeos-${Math.random().toString(36).substring(2, 8)}`;
    const frankenPath = this.getFrankenPhpPath();
    const phpCode = `
      try {
        $db = new PDO('sqlite:${dbPath.replace(/\\/g, '/')}');
        $passHash = md5(${JSON.stringify(newPassword)});
        $stmt = $db->prepare('UPDATE wp_users SET user_pass = :pass WHERE ID = :id');
        $stmt->execute([':pass' => $passHash, ':id' => ${userId}]);
        $userStmt = $db->prepare('SELECT user_login FROM wp_users WHERE ID = :id');
        $userStmt->execute([':id' => ${userId}]);
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode([
          'success' => true,
          'userLogin' => $user ? $user['user_login'] : 'admin',
          'newPassword' => ${JSON.stringify(newPassword)}
        ]);
      } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
      }
    `;

    try {
      const { stdout } = await execFileAsync(frankenPath, ['php-cli', '-r', phpCode]);
      const result = JSON.parse(stdout.trim() || '{}');
      return result;
    } catch (e: any) {
      return { success: false, userLogin: '', newPassword: '', error: e?.message || 'Failed to execute password reset' };
    }
  }

  async generateAutoLoginUrl(userId: number = 1, redirectTo: string = '/wp-admin/admin.php?page=xophz-compass#', port: number = 80): Promise<AutoLoginResult> {
    const dbPath = this.getDbPath();
    if (!fs.existsSync(dbPath)) {
      return { success: false, url: '', userLogin: '', error: 'Database not initialized' };
    }

    const frankenPath = this.getFrankenPhpPath();
    const phpCode = `
      try {
        $db = new PDO('sqlite:${dbPath.replace(/\\/g, '/')}');
        $token = bin2hex(random_bytes(24));
        $transientKey = '_transient_youmeos_autologin_${userId}';
        $timeoutKey = '_transient_timeout_youmeos_autologin_${userId}';
        $timeoutVal = time() + 300;

        $stmt = $db->prepare('INSERT INTO wp_options (option_name, option_value, autoload) VALUES (:name, :val, "no") ON CONFLICT(option_name) DO UPDATE SET option_value = :val');
        $stmt->execute([':name' => $transientKey, ':val' => $token]);
        $stmt->execute([':name' => $timeoutKey, ':val' => (string)$timeoutVal]);

        $userStmt = $db->prepare('SELECT user_login FROM wp_users WHERE ID = :id');
        $userStmt->execute([':id' => ${userId}]);
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
          'success' => true,
          'token' => $token,
          'userLogin' => $user ? $user['user_login'] : 'admin'
        ]);
      } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
      }
    `;

    try {
      const { stdout } = await execFileAsync(frankenPath, ['php-cli', '-r', phpCode]);
      const res = JSON.parse(stdout.trim() || '{}');
      if (res.success && res.token) {
        const baseUrl = port && port !== 80 ? `http://localhost:${port}` : 'https://my.youmeos.com';
        const url = `${baseUrl}/?youmeos_autologin_token=${res.token}&user_id=${userId}&redirect_to=${encodeURIComponent(redirectTo)}`;
        return { success: true, url, userLogin: res.userLogin };
      }
      return { success: false, url: '', userLogin: '', error: res.error || 'Token generation failed' };
    } catch (e: any) {
      return { success: false, url: '', userLogin: '', error: e?.message || 'Execution error' };
    }
  }

  async flushPortalSession(): Promise<boolean> {
    try {
      const portalSession = session.fromPartition('persist:youmeos');
      await portalSession.clearStorageData();
      return true;
    } catch {
      return false;
    }
  }

  async checkDatabaseHealth(): Promise<DbHealthResult> {
    const dbPath = this.getDbPath();
    if (!fs.existsSync(dbPath)) {
      return { status: 'error', integrity: 'Missing database.sqlite', userCount: 0, sizeBytes: 0, error: 'Database not initialized' };
    }

    const stat = fs.statSync(dbPath);
    const frankenPath = this.getFrankenPhpPath();
    const phpCode = `
      try {
        $db = new PDO('sqlite:${dbPath.replace(/\\/g, '/')}');
        $checkStmt = $db->query('PRAGMA integrity_check');
        $integrity = $checkStmt ? $checkStmt->fetchColumn() : 'unknown';
        $userStmt = $db->query('SELECT COUNT(*) FROM wp_users');
        $userCount = $userStmt ? (int)$userStmt->fetchColumn() : 0;
        echo json_encode([
          'status' => 'ok',
          'integrity' => $integrity,
          'userCount' => $userCount
        ]);
      } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'error' => $e->getMessage()]);
      }
    `;

    try {
      const { stdout } = await execFileAsync(frankenPath, ['php-cli', '-r', phpCode]);
      const res = JSON.parse(stdout.trim() || '{}');
      return {
        status: res.status || 'ok',
        integrity: res.integrity || 'ok',
        userCount: res.userCount || 0,
        sizeBytes: stat.size,
        error: res.error
      };
    } catch (e: any) {
      return { status: 'error', integrity: 'Error', userCount: 0, sizeBytes: stat.size, error: e?.message };
    }
  }

  async resetDatabase(): Promise<DbResetResult> {
    try {
      const dbPath = this.getDbPath();
      const blackboxDir = path.dirname(dbPath);
      const shmPath = `${dbPath}-shm`;
      const walPath = `${dbPath}-wal`;

      if (fs.existsSync(dbPath)) {
        try {
          fs.unlinkSync(dbPath);
        } catch {
          fs.rmSync(dbPath, { force: true });
        }
      }
      if (fs.existsSync(shmPath)) {
        try {
          fs.unlinkSync(shmPath);
        } catch {}
      }
      if (fs.existsSync(walPath)) {
        try {
          fs.unlinkSync(walPath);
        } catch {}
      }

      const muPluginsDir = path.join(blackboxDir, 'mu-plugins');
      if (fs.existsSync(muPluginsDir)) {
        try {
          const files = fs.readdirSync(muPluginsDir);
          for (const file of files) {
            if (file.startsWith('_token_') && file.endsWith('.php')) {
              try {
                fs.unlinkSync(path.join(muPluginsDir, file));
              } catch {}
            }
          }
        } catch {}
      }

      await this.flushPortalSession();

      return {
        success: true,
        message: 'Database files wiped. A fresh instance will provision on next boot.'
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Failed to reset database',
        error: err?.message || String(err)
      };
    }
  }

  private getAdminerDir(): string {
    return path.join(this.projectDir, 'wp-content', 'plugins', 'microverse-adminer');
  }

  private getAdminerSessionFile(): string {
    return path.join(this.getAdminerDir(), '.session.json');
  }

  private ensureAdminerFiles(): void {
    const adminerDir = this.getAdminerDir();
    if (!fs.existsSync(adminerDir)) {
      fs.mkdirSync(adminerDir, { recursive: true });
    }

    const indexPhpPath = path.join(adminerDir, 'index.php');
    const adminerCssPath = path.join(adminerDir, 'adminer.css');

    fs.writeFileSync(indexPhpPath, ADMINER_INDEX_PHP_CONTENT, 'utf8');

    const hydraCssSource = path.join(this.projectDir, 'assets', 'adminer-hydra.css');
    if (fs.existsSync(hydraCssSource)) {
      try {
        fs.copyFileSync(hydraCssSource, adminerCssPath);
      } catch {}
    }
  }

  private async ensureAdminerBinary(): Promise<void> {
    const adminerDir = this.getAdminerDir();
    const adminerBinPath = path.join(adminerDir, 'adminer.php');

    if (fs.existsSync(adminerBinPath) && fs.statSync(adminerBinPath).size > 10000) {
      return;
    }

    const primaryUrl = 'https://github.com/vrana/adminer/releases/download/v4.8.1/adminer-4.8.1.php';
    const fallbackUrl = 'https://www.adminer.org/static/download/4.8.1/adminer-4.8.1.php';

    try {
      await downloadFile(primaryUrl, adminerBinPath);
    } catch {
      await downloadFile(fallbackUrl, adminerBinPath);
    }
  }

  async launchDbManager(port: number = 80, customGatewayUrl?: string): Promise<DbManagerResult> {
    try {
      this.ensureAdminerFiles();
      await this.ensureAdminerBinary();

      const token = crypto.randomBytes(24).toString('hex');
      const now = Date.now();
      const expiresAt = now + 2 * 60 * 60 * 1000;

      const sessionData = {
        token,
        createdAt: now,
        expiresAt: Math.floor(expiresAt / 1000)
      };

      fs.writeFileSync(this.getAdminerSessionFile(), JSON.stringify(sessionData, null, 2), 'utf8');

      const baseUrl = customGatewayUrl || (port && port !== 80 ? `http://localhost:${port}` : 'https://my.youmeos.com');
      const url = `${baseUrl}/wp-content/plugins/microverse-adminer/?token=${token}&sqlite=&username=`;

      return {
        success: true,
        url
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to initialize database manager'
      };
    }
  }

  async stopDbManager(): Promise<boolean> {
    try {
      const sessionFile = this.getAdminerSessionFile();
      if (fs.existsSync(sessionFile)) {
        fs.unlinkSync(sessionFile);
      }
      return true;
    } catch {
      return false;
    }
  }

  async getDbManagerStatus(port: number = 80, customGatewayUrl?: string): Promise<DbManagerStatus> {
    try {
      const sessionFile = this.getAdminerSessionFile();
      if (!fs.existsSync(sessionFile)) {
        return { active: false };
      }

      const raw = fs.readFileSync(sessionFile, 'utf8');
      const data = JSON.parse(raw);
      const currentTimeSec = Math.floor(Date.now() / 1000);

      if (!data.token || !data.expiresAt || data.expiresAt <= currentTimeSec) {
        return { active: false };
      }

      const baseUrl = customGatewayUrl || (port && port !== 80 ? `http://localhost:${port}` : 'https://my.youmeos.com');
      const url = `${baseUrl}/wp-content/plugins/microverse-adminer/?token=${data.token}&sqlite=&username=`;

      return {
        active: true,
        url
      };
    } catch {
      return { active: false };
    }
  }
}

const ADMINER_INDEX_PHP_CONTENT = `<?php
/**
 * YouMeOS Microverse - SQLite Adminer Diagnostic Bridge
 */
error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED & ~E_NOTICE);
@ini_set('display_errors', '0');

session_start();

$sessionFile = __DIR__ . '/.session.json';
$isAuthenticated = false;

if (file_exists($sessionFile)) {
    $raw = file_get_contents($sessionFile);
    $sessionData = json_decode($raw, true);
    $validToken = $sessionData['token'] ?? '';
    $expiresAt = $sessionData['expiresAt'] ?? 0;

    if ($expiresAt > time()) {
        if (!empty($_GET['token']) && hash_equals((string)$validToken, (string)$_GET['token'])) {
            $_SESSION['microverse_adminer_authed'] = true;
            $_SESSION['microverse_adminer_token'] = $validToken;
            $isAuthenticated = true;
        } elseif (!empty($_SESSION['microverse_adminer_authed']) &&
                  !empty($_SESSION['microverse_adminer_token']) &&
                  hash_equals((string)$validToken, (string)$_SESSION['microverse_adminer_token'])) {
            $isAuthenticated = true;
        }
    }
}

if (!$isAuthenticated) {
    http_response_code(403);
    echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Session Inactive</title><style>body{background:#0a0e17;color:#e2e8f0;font-family:-apple-system,BlinkMacSystemFont,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}.card{background:#111827;border:1px solid rgba(98,201,255,0.25);border-radius:10px;padding:32px;max-width:440px;text-align:center;}h2{color:#62c9ff;margin-top:0;}p{color:#94a3b8;font-size:14px;line-height:1.6;}</style></head><body><div class="card"><h2>Database Session Inactive</h2><p>The SQLite database management session is inactive. Please open the Microverse Desktop app, navigate to <strong>Tools</strong>, and click <strong>Launch Database Manager</strong>.</p></div></body></html>';
    exit;
}

$activeDbPath = '';
$searchPaths = [
    __DIR__ . '/../../database.sqlite',
    dirname(__DIR__, 2) . '/blackbox/database.sqlite',
    dirname(__DIR__, 2) . '/data/embedded/database.sqlite',
    '/var/www/html/wp-content/database.sqlite',
    '/var/www/html/blackbox/database.sqlite',
    __DIR__ . '/../../database/.ht.sqlite',
    '/var/www/html/wp-content/database/.ht.sqlite'
];

foreach ($searchPaths as $path) {
    if (file_exists($path) && filesize($path) > 200000) {
        $activeDbPath = realpath($path) ?: $path;
        break;
    }
}
if (empty($activeDbPath)) {
    foreach ($searchPaths as $path) {
        if (file_exists($path)) {
            $activeDbPath = realpath($path) ?: $path;
            break;
        }
    }
}

if (!isset($_GET['sqlite'])) {
    $_GET['sqlite'] = '';
}
if (!isset($_GET['username'])) {
    $_GET['username'] = '';
}
if (!isset($_GET['db']) && !empty($activeDbPath)) {
    $_GET['db'] = $activeDbPath;
}

function adminer_object() {
    global $activeDbPath;

    class AdminerCustom extends Adminer {
        private $sqlitePath;

        public function __construct($path) {
            $this->sqlitePath = $path;
        }

        public function name() {
            return 'SQLite DB Manager';
        }

        public function head() {
            echo '<style>#version, .version { display: none !important; }</style>';
            return true;
        }

        public function credentials() {
            return array('', '', '');
        }

        public function database() {
            return $this->sqlitePath;
        }

        public function login($login, $password) {
            return true;
        }

        public function permanentLogin($i = false) {
            return 'youmeos_adminer_session';
        }

        public function databases($flush = true) {
            return array($this->sqlitePath);
        }
    }

    return new AdminerCustom($activeDbPath);
}

if (file_exists(__DIR__ . '/adminer.php')) {
    include __DIR__ . '/adminer.php';
} else {
    http_response_code(503);
    echo 'Adminer engine missing. Please re-launch from Microverse desktop tools.';
}
`;
