<?php
/**
 * One-time database setup script.
 * Run this in your browser if you get "Table admins doesn't exist" error.
 * URL: http://localhost:8080/backend/setup.php
 *
 * Add ?reset=1 to drop and recreate the database (fixes "Tablespace exists" / corrupted tables).
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'usneppal');
define('DB_PORT', 3308);

try {
    $conn = @new mysqli(DB_HOST, DB_USER, DB_PASS, '', DB_PORT);
    if ($conn->connect_error) {
        throw new Exception("MySQL connection failed (port " . DB_PORT . "): " . $conn->connect_error . ". Start MySQL in XAMPP.");
    }
    $conn->set_charset("utf8mb4");

    $reset = isset($_GET['reset']) && $_GET['reset'] === '1';
    if ($reset) {
        $conn->query("DROP DATABASE IF EXISTS " . DB_NAME);
    }

    $conn->query("CREATE DATABASE IF NOT EXISTS " . DB_NAME . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $conn->select_db(DB_NAME);

    // Drop tables first if reset, to fix corrupted tablespace
    if ($reset) {
        $conn->query("SET FOREIGN_KEY_CHECKS = 0");
        $conn->query("DROP TABLE IF EXISTS admin_sessions");
        $conn->query("DROP TABLE IF EXISTS admins");
        $conn->query("SET FOREIGN_KEY_CHECKS = 1");
    }

    // Create admins table if not exists
    $conn->query("
        CREATE TABLE IF NOT EXISTS admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP NULL,
            is_active TINYINT(1) DEFAULT 1
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    if ($conn->error) throw new Exception("admins table: " . $conn->error);

    // Create admin_sessions table if not exists
    $conn->query("
        CREATE TABLE IF NOT EXISTS admin_sessions (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    if ($conn->error) throw new Exception("admin_sessions table: " . $conn->error);

    // Insert default admin if none exists (password: admin123)
    $res = $conn->query("SELECT COUNT(*) as n FROM admins");
    $row = $res->fetch_assoc();
    if ($row['n'] == 0) {
        $hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
        $stmt = $conn->prepare("INSERT INTO admins (username, email, password, full_name) VALUES (?, ?, ?, ?)");
        $fn = 'Administrator';
        $stmt->bind_param("ssss", $u = 'admin', $e = 'admin@usnepallegal.com', $hash, $fn);
        $stmt->execute();
        if ($conn->error) throw new Exception("admins insert: " . $conn->error);
    }

    $conn->close();

    echo json_encode([
        'success' => true,
        'message' => 'Database setup complete. You can now login with admin / admin123',
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
    ]);
}
