<?php
/**
 * Database connection diagnostic for cPanel.
 * Visit: https://usnepallegalsolutions.com/backend/db-check.php
 */
header('Content-Type: text/html; charset=utf-8');
$host = $_SERVER['HTTP_HOST'] ?? '';
$isCpanel = $host && preg_match('/usnepallegalsolutions\.com$/i', $host);

echo "<h2>Database Setup Check (cPanel)</h2>";

if (!$isCpanel) {
    echo "<p>This page is for cPanel. On localhost use config.local.php</p>";
    exit;
}

$cpanelConfig = __DIR__ . '/config.cpanel.php';
if (!file_exists($cpanelConfig)) {
    echo "<p style='color:red;'><strong>❌ config.cpanel.php NOT FOUND</strong></p>";
    echo "<ol><li>File Manager → public_html/backend/</li>";
    echo "<li>Copy config.cpanel.php.example → config.cpanel.php</li>";
    echo "<li>Edit config.cpanel.php with your cPanel MySQL user, password, database</li>";
    echo "<li>MySQL Databases → Add User To Database → grant ALL PRIVILEGES</li></ol>";
    exit;
}

require_once $cpanelConfig;
echo "<p style='color:green;'>✅ config.cpanel.php exists</p>";
echo "<p>DB_USER: " . htmlspecialchars(DB_USER) . " | DB_NAME: " . htmlspecialchars(DB_NAME) . " | Port: " . (defined('DB_PORT') ? DB_PORT : 3306) . "</p>";

try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, defined('DB_PORT') ? DB_PORT : 3306);
    if ($conn->connect_error) {
        echo "<p style='color:red;'><strong>❌ Connection failed: " . htmlspecialchars($conn->connect_error) . "</strong></p>";
        echo "<p><strong>Fix:</strong> In cPanel → MySQL Databases → Add User To Database → select your user and database → Add → check ALL PRIVILEGES → Make Changes</p>";
    } else {
        echo "<p style='color:green;'><strong>✅ Database connected successfully!</strong></p>";
        $r = $conn->query("SHOW TABLES LIKE 'admins'");
        if ($r && $r->num_rows > 0) {
            echo "<p style='color:green;'>✅ admins table exists</p>";
        } else {
            echo "<p style='color:orange;'>⚠ admins table missing. Import database/schema.sql via phpMyAdmin</p>";
        }
        $conn->close();
    }
} catch (Throwable $e) {
    echo "<p style='color:red;'><strong>❌ Error: " . htmlspecialchars($e->getMessage()) . "</strong></p>";
}
