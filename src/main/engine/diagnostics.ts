import path from 'path';
import fs from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { session } from 'electron';

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
    return path.join(this.projectDir, 'blackbox', 'database.sqlite');
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

  async generateAutoLoginUrl(userId: number = 1, redirectTo: string = '/wp-admin/admin.php?page=xophz-compass#'): Promise<AutoLoginResult> {
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
        const url = `https://my.youmeos.com/?youmeos_autologin_token=${res.token}&user_id=${userId}&redirect_to=${encodeURIComponent(redirectTo)}`;
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
}
