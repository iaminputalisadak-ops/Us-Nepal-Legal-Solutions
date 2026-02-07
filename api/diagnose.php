<?php
/**
 * Database connection diagnostic. Shows exact error and next steps.
 * Visit: https://usnepallegalsolutions.com/api/diagnose.php
 */
header('Content-Type: text/html; charset=utf-8');

$configFile = __DIR__ . '/config.db.php';

echo "<h2>Database Connection Diagnostic</h2>";

if (!file_exists($configFile)) {
    echo "<p style='color:red;'><strong>config.db.php NOT FOUND</strong></p>";
    echo "<p>Visit <a href='setup-database.php'>setup-database.php</a> to create it.</p>";
    exit;
}

require $configFile;

$host = defined('DB_HOST') ? DB_HOST : 'localhost';
$user = defined('DB_USER') ? DB_USER : '';
$pass = defined('DB_PASS') ? DB_PASS : '';
$name = defined('DB_NAME') ? DB_NAME : '';
$port = defined('DB_PORT') ? DB_PORT : 3306;

echo "<p><strong>Config loaded:</strong> DB_HOST={$host} | DB_USER={$user} | DB_NAME={$name} | DB_PORT={$port}</p>";

$conn = @new mysqli($host, $user, $pass, $name, $port);

if ($conn->connect_error) {
    $err = $conn->connect_error;
    echo "<p style='color:red; font-size:1.1em;'><strong>Connection failed:</strong> " . htmlspecialchars($err) . "</p>";
    
    echo "<h3>How to fix:</h3>";
    
    if (strpos($err, 'Access denied') !== false) {
        echo "<ol>";
        echo "<li><strong>Link user to database:</strong> In cPanel → MySQL Databases → <em>Add User To Database</em> → select your user and database → Add → check <strong>ALL PRIVILEGES</strong> → Make Changes</li>";
        echo "<li><strong>Check password:</strong> In config.db.php, ensure DB_PASS matches the password you set in cPanel when creating the MySQL user.</li>";
        echo "<li><strong>Check username/database:</strong> Use exact names from cPanel → MySQL Databases (Current Users, Current Databases). They often have a prefix like <code>cpaneluser_</code>.</li>";
        echo "</ol>";
    } elseif (strpos($err, 'Unknown database') !== false) {
        echo "<p>Database <strong>{$name}</strong> does not exist. Create it in cPanel → MySQL Databases → Create New Database.</p>";
    } elseif (strpos($err, 'Connection refused') !== false || strpos($err, 'No route') !== false) {
        echo "<p>Wrong port. Use <strong>3306</strong> for cPanel. Edit config.db.php: <code>define('DB_PORT', 3306);</code></p>";
    } else {
        echo "<p>Unexpected error. Share the exact error message above for help.</p>";
    }
    
    echo "<p><a href='setup-database.php'>Edit config via setup-database.php</a></p>";
} else {
    echo "<p style='color:green; font-size:1.1em;'><strong>✅ Connected successfully!</strong></p>";
    $r = $conn->query("SHOW TABLES LIKE 'admins'");
    if ($r && $r->num_rows > 0) {
        echo "<p>admins table exists. <a href='../admin'>Go to Admin Login</a></p>";
    } else {
        echo "<p>admins table missing. Import database/schema.sql via phpMyAdmin, or run <a href='setup_full.php'>setup_full.php</a></p>";
    }
    $conn->close();
}
?>
