<?php
/**
 * Creates config.db.php from existing config (config.cpanel.php or config.local.php).
 * Visit: https://usnepallegalsolutions.com/backend/create-config-cpanel.php
 * DELETE this file after use.
 */
header('Content-Type: text/html; charset=utf-8');

$dir = __DIR__;
$target = $dir . '/config.db.php';

echo "<h2>Create config.db.php</h2>";

if (file_exists($target)) {
    echo "<p style='color:green;'>✅ config.db.php exists. <a href='login-test.php'>Test</a> | <a href='../admin'>Login</a></p>";
    exit;
}

$src = null;
foreach (['config.cpanel.php', 'config.local.php'] as $f) {
    if (file_exists($dir . '/' . $f)) {
        $src = $dir . '/' . $f;
        break;
    }
}

if (!$src) {
    $ex = $dir . '/config.db.php.example';
    if (file_exists($ex)) {
        $content = file_get_contents($ex);
        echo "<p>Created from example. <strong>Edit config.db.php and add your password.</strong></p>";
    } else {
        echo "<p style='color:red;'>No config file found. Upload backend files first.</p>";
        exit;
    }
} else {
    $content = file_get_contents($src);
    // Force port 3306 for cPanel (fix if config had 3308)
    $content = preg_replace("/define\s*\(\s*['\"]DB_PORT['\"]\s*,\s*3308\s*\)/", "define('DB_PORT', 3306)", $content);
    echo "<p>Copied from " . basename($src) . " (port set to 3306 for cPanel)</p>";
}

if (isset($content) && file_put_contents($target, $content)) {
    echo "<p style='color:green;'><strong>✅ config.db.php created!</strong></p>";
    echo "<p><a href='login-test.php'>Test connection</a> | <a href='../admin'>Try login</a></p>";
    echo "<p style='color:orange;'>Delete create-config-cpanel.php after use.</p>";
} else {
    echo "<p style='color:red;'>❌ Could not create. Check folder permissions.</p>";
}
