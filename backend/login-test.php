<?php
/**
 * Diagnostic: tests config loading (same as login.php).
 * Visit: https://usnepallegalsolutions.com/backend/login-test.php
 */
header('Content-Type: text/html; charset=utf-8');

echo "<h2>Login Flow Test</h2>";

$configDir = __DIR__;
$loaded = null;
foreach (['config.db.php', 'config.cpanel.php', 'config.local.php'] as $f) {
    $p = $configDir . '/' . $f;
    if (file_exists($p)) {
        require $p;
        $loaded = $f;
        break;
    }
}
if (!$loaded) {
    define('DB_HOST', 'localhost');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('DB_NAME', 'us_nepal_legal_db');
    define('DB_PORT', 3308);
}

echo "<p>Loaded: " . ($loaded ?? 'defaults') . "</p>";

echo "<p>DB_USER: " . htmlspecialchars(DB_USER) . " | DB_NAME: " . htmlspecialchars(DB_NAME) . " | Port: " . DB_PORT . "</p>";

$conn = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, defined('DB_PORT') ? DB_PORT : 3306);
if ($conn->connect_error) {
    echo "<p style='color:red;'><strong>❌ Connection failed: " . htmlspecialchars($conn->connect_error) . "</strong></p>";
} else {
    echo "<p style='color:green;'><strong>✅ Connection OK - if login still fails, upload the latest config.php</strong></p>";
    $conn->close();
}
