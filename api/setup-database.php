<?php
/**
 * Web setup for database config. Creates config.db.php from form input.
 * Visit: https://usnepallegalsolutions.com/backend/setup-database.php
 * DELETE this file after setup.
 */
header('Content-Type: text/html; charset=utf-8');

$dir = __DIR__;
$configFile = $dir . '/config.db.php';

// If config exists and connection works, show success
if (file_exists($configFile)) {
    require $configFile;
    if (!defined('DB_HOST')) {
        define('DB_HOST', 'localhost');
        define('DB_USER', 'root');
        define('DB_PASS', '');
        define('DB_NAME', 'us_nepal_legal_db');
        define('DB_PORT', 3308);
    }
    $conn = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, defined('DB_PORT') ? DB_PORT : 3306);
    if (!$conn->connect_error) {
        echo "<h2>Database Already Configured</h2>";
        echo "<p style='color:green;'>✅ config.db.php exists and connection works.</p>";
        echo "<p><a href='../admin'>Go to Admin Login</a></p>";
        $conn->close();
        exit;
    }
}

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $host = trim($_POST['host'] ?? 'localhost');
    $user = trim($_POST['user'] ?? '');
    $pass = $_POST['pass'] ?? '';
    $name = trim($_POST['name'] ?? '');
    $port = (int)($_POST['port'] ?? 3306);
    
    if (!$user || !$name) {
        $error = 'Username and Database name are required.';
    } else {
        $content = "<?php\n/** Database config - created by setup-database.php */\n";
        $content .= "define('DB_HOST', " . var_export($host, true) . ");\n";
        $content .= "define('DB_USER', " . var_export($user, true) . ");\n";
        $content .= "define('DB_PASS', " . var_export($pass, true) . ");\n";
        $content .= "define('DB_NAME', " . var_export($name, true) . ");\n";
        $content .= "define('DB_PORT', $port);\n";
        
        if (file_put_contents($configFile, $content)) {
            $conn = @new mysqli($host, $user, $pass, $name, $port);
            if ($conn->connect_error) {
                $error = 'File saved but connection failed: ' . $conn->connect_error;
            } else {
                $success = 'Config saved! Connection OK.';
                $conn->close();
            }
        } else {
            $error = 'Could not create config.db.php. Check folder permissions (755).';
        }
    }
}
?>
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Database Setup</title>
<style>body{font-family:sans-serif;max-width:500px;margin:40px auto;padding:20px}input{width:100%;padding:8px;margin:4px 0}button{background:#1f5e2e;color:white;padding:10px 20px;border:none;cursor:pointer;margin-top:10px}.err{color:red}.ok{color:green}</style>
</head>
<body>
<h2>Database Setup</h2>
<p>Enter your MySQL credentials. This creates <code>config.db.php</code>.</p>

<?php if ($error): ?><p class="err"><?= htmlspecialchars($error) ?></p><?php endif; ?>
<?php if ($success): ?><p class="ok"><?= htmlspecialchars($success) ?> <a href="../admin">Go to Admin</a></p><?php endif; ?>

<form method="post">
  <label>Host</label>
  <input type="text" name="host" value="localhost" required>
  <label>MySQL Username *</label>
  <input type="text" name="user" placeholder="e.g. usnepallegalsolu_nepal" required>
  <label>MySQL Password</label>
  <input type="password" name="pass" placeholder="Your cPanel MySQL password">
  <label>Database Name *</label>
  <input type="text" name="name" placeholder="e.g. usnepallegalsolu_nepal" required>
  <label>Port (3306 for cPanel, 3308 for XAMPP)</label>
  <input type="number" name="port" value="3306">
  <button type="submit">Save & Test</button>
</form>

<p style="margin-top:20px;font-size:0.9em;color:#666">
  Get these from cPanel → MySQL Databases. Link user to database and grant ALL PRIVILEGES.
</p>
</body>
</html>
