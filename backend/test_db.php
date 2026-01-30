<?php
// Quick database connection test
require_once 'config.php';

header('Content-Type: text/html; charset=utf-8');

echo "<h2>Database Connection Test</h2>";

try {
    $conn = getDBConnection();
    echo "<p style='color: green;'>✅ Database connection successful!</p>";
    
    // Check if database exists
    $result = $conn->query("SHOW DATABASES LIKE 'us_nepal_legal_db'");
    if ($result->num_rows > 0) {
        echo "<p style='color: green;'>✅ Database 'us_nepal_legal_db' exists</p>";
    } else {
        echo "<p style='color: red;'>❌ Database 'us_nepal_legal_db' does NOT exist. Please import database/schema.sql</p>";
    }
    
    // Check if admins table exists
    $conn->select_db('us_nepal_legal_db');
    $result = $conn->query("SHOW TABLES LIKE 'admins'");
    if ($result->num_rows > 0) {
        echo "<p style='color: green;'>✅ Table 'admins' exists</p>";
        
        // Check admin user
        $result = $conn->query("SELECT COUNT(*) as count FROM admins WHERE username = 'admin'");
        $row = $result->fetch_assoc();
        if ($row['count'] > 0) {
            echo "<p style='color: green;'>✅ Admin user exists</p>";
        } else {
            echo "<p style='color: red;'>❌ Admin user does NOT exist. Please import database/schema.sql</p>";
        }
    } else {
        echo "<p style='color: red;'>❌ Table 'admins' does NOT exist. Please import database/schema.sql</p>";
    }
    
    $conn->close();
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}

echo "<hr>";
echo "<p><strong>Next steps:</strong></p>";
echo "<ul>";
echo "<li>If database doesn't exist: Import database/schema.sql in phpMyAdmin</li>";
echo "<li>If connection fails: Check MySQL is running in XAMPP</li>";
echo "<li>If everything is green: Try logging in again!</li>";
echo "</ul>";
