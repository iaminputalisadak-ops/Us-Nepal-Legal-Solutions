<?php
// getallheaders() fallback for PHP-CGI (e.g. some cPanel setups)
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

// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'us_nepal_legal_db');
// MySQL port 3308 (XAMPP)
define('DB_PORT', 3308);

// Session configuration
define('SESSION_LIFETIME', 3600 * 24); // 24 hours

// CORS headers for React app (dev + production)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = $_SERVER['HTTP_HOST'] ?? '';
$allowed = [
    'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175',
    'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178',
    'https://usnepallegalsolutions.com', 'https://www.usnepallegalsolutions.com',
    'http://usnepallegalsolutions.com', 'http://www.usnepallegalsolutions.com',
];
// Allow if in list, or if origin matches this host (same-origin on cPanel)
if ($origin && (in_array($origin, $allowed) || preg_match('#^https?://(www\.)?' . preg_quote($host, '#') . '$#', $origin))) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handle preflight requests
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection - MySQL port 3308, Apache port 8080
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
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database connection failed (MySQL port 3308). Error: ' . $e->getMessage() . '. Start MySQL in XAMPP.'
        ]);
        exit();
    }
}

// Ensure admin tables exist (creates or repairs them - fixes "Table admins doesn't exist" / "doesn't exist in engine")
function ensureAdminTables($conn) {
    $needCreate = false;
    // Use information_schema to avoid throwing when table is corrupted ("doesn't exist in engine")
    $db = $conn->real_escape_string(DB_NAME);
    $res = @$conn->query("SELECT 1 FROM information_schema.tables WHERE table_schema = '$db' AND table_name = 'admins'");
    if (!$res || $res->num_rows === 0) {
        $needCreate = true;
    } else {
        // Table exists in schema - verify it's usable (not corrupted)
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

        $sql1 = "CREATE TABLE admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP NULL,
            is_active TINYINT(1) DEFAULT 1
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        if (!$conn->query($sql1)) {
            throw new Exception("Failed to create admins table: " . $conn->error);
        }

        $sql2 = "CREATE TABLE admin_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            admin_id INT NOT NULL,
            session_token VARCHAR(255) NOT NULL UNIQUE,
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME NOT NULL,
            FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
            INDEX idx_token (session_token),
            INDEX idx_admin (admin_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        if (!$conn->query($sql2)) {
            throw new Exception("Failed to create admin_sessions table: " . $conn->error);
        }

        $res = $conn->query("SELECT COUNT(*) as n FROM admins");
        if ($res && (int)$res->fetch_assoc()['n'] === 0) {
            insertDefaultAdmin($conn);
        }
    } else {
        // Tables exist but may be empty - ensure default admin exists
        $res = $conn->query("SELECT COUNT(*) as n FROM admins");
        if ($res && (int)$res->fetch_assoc()['n'] === 0) {
            insertDefaultAdmin($conn);
        }
    }
}

function insertDefaultAdmin($conn) {
    $hash = '$2y$10$eqF05ovfu/oqXjr.Rqqi6.jHoVC90PibiLvUV/P1BKJWlL5AodB2K'; // admin123
    $stmt = $conn->prepare("INSERT INTO admins (username, email, password, full_name) VALUES (?, ?, ?, ?)");
    $u = 'admin';
    $e = 'admin@usnepallegal.com';
    $fn = 'Administrator';
    $stmt->bind_param("ssss", $u, $e, $hash, $fn);
    $stmt->execute();
}

// Response helper function
function sendResponse($success, $message, $data = null) {
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response);
    exit();
}
