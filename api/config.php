<?php
/**
 * Main config - loads database credentials from config.db.php (THE single source).
 * All backend files require this file. Do NOT put credentials here - use config.db.php only.
 */
ob_start();

// Load config.db.php - same folder as this file (use realpath for reliability)
if (!defined('DB_HOST')) {
    $base = realpath(dirname(__FILE__)) ?: __DIR__;
    $configFile = $base . DIRECTORY_SEPARATOR . 'config.db.php';
    if (file_exists($configFile)) {
        require_once $configFile;
    }
}

if (!defined('DB_HOST')) {
    define('DB_HOST', 'localhost');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('DB_NAME', 'us_nepal_legal_db');
    define('DB_PORT', 3308);
}

if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = [];
        foreach ($_SERVER as $k => $v) {
            if (strpos($k, 'HTTP_') === 0) {
                $key = str_replace('_', '-', substr($k, 5));
                $headers[$key] = $v;
            }
        }
        return $headers;
    }
}

define('SESSION_LIFETIME', 3600 * 24);

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = $_SERVER['HTTP_HOST'] ?? '';
$allowed = [
    'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175',
    'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178',
    'https://usnepallegalsolutions.com', 'https://www.usnepallegalsolutions.com',
    'http://usnepallegalsolutions.com', 'http://www.usnepallegalsolutions.com',
];
if ($origin && (in_array($origin, $allowed) || preg_match('#^https?://(www\.)?' . preg_quote($host, '#') . '$#', $origin))) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    exit();
}

function getDBConnection() {
    try {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
        if ($conn->connect_error) {
            if (strpos($conn->connect_error, 'Unknown database') !== false) {
                $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, '', DB_PORT);
                if (!$conn->connect_error) {
                    $conn->query("CREATE DATABASE IF NOT EXISTS " . DB_NAME . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                    $conn->select_db(DB_NAME);
                    $conn->set_charset("utf8mb4");
                    return $conn;
                }
            }
            throw new Exception($conn->connect_error);
        }
        $conn->set_charset("utf8mb4");
        return $conn;
    } catch (Exception $e) {
        ob_end_clean();
        $msg = 'Database connection failed. Edit api/config.db.php with your username, password, database name. Error: ' . $e->getMessage();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $msg]);
        exit();
    }
}

ob_end_flush();

function ensureAdminTables($conn) {
    $needCreate = false;
    $db = $conn->real_escape_string(DB_NAME);
    $res = @$conn->query("SELECT 1 FROM information_schema.tables WHERE table_schema = '$db' AND table_name = 'admins'");
    if (!$res || $res->num_rows === 0) {
        $needCreate = true;
    } else {
        try {
            $check = $conn->query("SELECT 1 FROM admins LIMIT 1");
            if (!$check) $needCreate = true;
        } catch (Throwable $e) {
            if (strpos($e->getMessage(), "doesn't exist") !== false || strpos($e->getMessage(), "exist in engine") !== false) {
                $needCreate = true;
            } else {
                throw $e;
            }
        }
    }
    if ($needCreate) {
        $conn->query("SET FOREIGN_KEY_CHECKS = 0");
        $conn->query("DROP TABLE IF EXISTS admin_sessions");
        $conn->query("DROP TABLE IF EXISTS admins");
        $conn->query("SET FOREIGN_KEY_CHECKS = 1");
        $sql1 = "CREATE TABLE admins (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) NOT NULL UNIQUE, email VARCHAR(100) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, full_name VARCHAR(100) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, last_login TIMESTAMP NULL, is_active TINYINT(1) DEFAULT 1) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        if (!$conn->query($sql1)) throw new Exception("Failed to create admins table: " . $conn->error);
        $sql2 = "CREATE TABLE admin_sessions (id INT AUTO_INCREMENT PRIMARY KEY, admin_id INT NOT NULL, session_token VARCHAR(255) NOT NULL UNIQUE, ip_address VARCHAR(45), user_agent TEXT, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, expires_at DATETIME NOT NULL, FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE, INDEX idx_token (session_token), INDEX idx_admin (admin_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        if (!$conn->query($sql2)) throw new Exception("Failed to create admin_sessions table: " . $conn->error);
        $res = $conn->query("SELECT COUNT(*) as n FROM admins");
        if ($res && (int)$res->fetch_assoc()['n'] === 0) {
            $hash = '$2y$10$eqF05ovfu/oqXjr.Rqqi6.jHoVC90PibiLvUV/P1BKJWlL5AodB2K';
            $stmt = $conn->prepare("INSERT INTO admins (username, email, password, full_name) VALUES (?, ?, ?, ?)");
            $u = 'admin'; $e = 'admin@usnepallegal.com'; $fn = 'Administrator';
            $stmt->bind_param("ssss", $u, $e, $hash, $fn);
            $stmt->execute();
        }
    } else {
        $res = $conn->query("SELECT COUNT(*) as n FROM admins");
        if ($res && (int)$res->fetch_assoc()['n'] === 0) {
            $hash = '$2y$10$eqF05ovfu/oqXjr.Rqqi6.jHoVC90PibiLvUV/P1BKJWlL5AodB2K';
            $stmt = $conn->prepare("INSERT INTO admins (username, email, password, full_name) VALUES (?, ?, ?, ?)");
            $u = 'admin'; $e = 'admin@usnepallegal.com'; $fn = 'Administrator';
            $stmt->bind_param("ssss", $u, $e, $hash, $fn);
            $stmt->execute();
        }
    }
}

function sendResponse($success, $message, $data = null) {
    $r = ['success' => $success, 'message' => $message];
    if ($data !== null) $r['data'] = $data;
    echo json_encode($r);
    exit();
}
