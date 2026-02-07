<?php
/**
 * Database connection check. Uses config.db.php (same as all other backend files).
 * Visit: https://yoursite.com/backend/db-check.php
 */
header('Content-Type: text/html; charset=utf-8');

echo "<h2>Database Check</h2>";

$configFile = __DIR__ . '/config.db.php';
if (!file_exists($configFile)) {
    echo "<p style='color:red;'>config.db.php not found. Copy config.db.php.example to config.db.php and add your credentials.</p>";
    exit;
}

require $configFile;

echo "<p>DB_USER: " . htmlspecialchars(DB_USER) . " | DB_NAME: " . htmlspecialchars(DB_NAME) . " | Port: " . DB_PORT . "</p>";

$conn = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
if ($conn->connect_error) {
    echo "<p style='color:red;'><strong>❌ " . htmlspecialchars($conn->connect_error) . "</strong></p>";
} else {
    echo "<p style='color:green;'><strong>✅ Connected</strong></p>";
    $r = $conn->query("SHOW TABLES LIKE 'admins'");
    echo "<p>admins table: " . ($r && $r->num_rows > 0 ? '✅ exists' : '❌ missing') . "</p>";
    $conn->close();
}
