<?php
/**
 * Creates config.db.php from config.db.php.example.
 * Visit once, then delete this file.
 */
header('Content-Type: text/html; charset=utf-8');

$dir = __DIR__;
$target = $dir . '/config.db.php';
$example = $dir . '/config.db.php.example';

echo "<h2>Create config.db.php</h2>";

if (file_exists($target)) {
    echo "<p style='color:green;'>✅ config.db.php already exists.</p>";
    echo "<p><a href='login-test.php'>Test</a> | <a href='../admin'>Login</a></p>";
    exit;
}

// Copy from existing config if present
foreach (['config.local.php', 'config.cpanel.php'] as $f) {
    if (file_exists($dir . '/' . $f)) {
        $content = file_get_contents($dir . '/' . $f);
        $content = preg_replace("/define\s*\(\s*['\"]DB_PORT['\"]\s*,\s*3308\s*\)/", "define('DB_PORT', 3306)", $content);
        if (file_put_contents($target, $content)) {
            echo "<p style='color:green;'><strong>✅ config.db.php created from $f</strong></p>";
            echo "<p><a href='login-test.php'>Test</a> | <a href='../admin'>Login</a></p>";
            exit;
        }
    }
}

if (!file_exists($example)) {
    echo "<p style='color:red;'>config.db.php.example not found. Upload backend files first.</p>";
    exit;
}

$content = file_get_contents($example);
// For cPanel: change port 3308 to 3306
$content = preg_replace("/define\s*\(\s*['\"]DB_PORT['\"]\s*,\s*3308\s*\)/", "define('DB_PORT', 3306)", $content);

if (file_put_contents($target, $content)) {
    echo "<p style='color:green;'><strong>✅ config.db.php created!</strong></p>";
    echo "<p><strong>Edit config.db.php and add your MySQL username, password, database name.</strong></p>";
    echo "<p><a href='login-test.php'>Test</a> | <a href='../admin'>Login</a></p>";
    echo "<p style='color:orange;'>Delete create-config-cpanel.php after use.</p>";
} else {
    echo "<p style='color:red;'>Could not create. Check folder permissions.</p>";
}
