<?php
/**
 * Test database connection. Uses config.db.php (same as all other backend files).
 * Visit: https://yoursite.com/backend/login-test.php
 */
header('Content-Type: text/html; charset=utf-8');

echo "<h2>Database Connection Test</h2>";

$configFile = __DIR__ . '/config.db.php';
echo "<p>config.db.php exists: " . (file_exists($configFile) ? 'YES' : 'NO - copy from config.db.php.example') . "</p>";

if (!file_exists($configFile)) {
    echo "<p style='color:orange;'>Create config.db.php first, then refresh.</p>";
    exit;
}
require $configFile;

if (!defined('DB_HOST')) {
    define('DB_HOST', 'localhost');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('DB_NAME', 'us_nepal_legal_db');
    define('DB_PORT', 3308);
}

echo "<p>DB_USER: " . htmlspecialchars(DB_USER) . " | DB_NAME: " . htmlspecialchars(DB_NAME) . " | Port: " . DB_PORT . "</p>";

$conn = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
if ($conn->connect_error) {
    echo "<p style='color:red;'><strong>❌ Connection failed: " . htmlspecialchars($conn->connect_error) . "</strong></p>";
} else {
    echo "<p style='color:green;'><strong>✅ Connection OK</strong></p>";
    $conn->close();
}
