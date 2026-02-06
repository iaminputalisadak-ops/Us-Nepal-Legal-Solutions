<?php
/**
 * Create NEW database with ALL tables and data.
 * Run once: http://localhost:8080/backend/setup_full.php
 *
 * This will:
 * 1. Drop the existing us_nepal_legal_db (if any)
 * 2. Create a fresh database
 * 3. Create all 17 tables
 * 4. Insert all default data (admin, lawyers, practice areas, etc.)
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'us_nepal_legal_db');
define('DB_PORT', 3308);

try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, '', DB_PORT);
    if ($conn->connect_error) {
        throw new Exception("MySQL connection failed (port " . DB_PORT . "): " . $conn->connect_error . ". Start MySQL in XAMPP.");
    }
    $conn->set_charset("utf8mb4");

    // Drop existing database (removes any corrupted tablespaces)
    $conn->query("DROP DATABASE IF EXISTS " . DB_NAME);

    // Load and run full schema
    $schemaFile = __DIR__ . '/full_schema.sql';
    if (!file_exists($schemaFile)) {
        $schemaFile = dirname(__DIR__) . '/database/schema.sql';
    }
    if (!file_exists($schemaFile)) {
        throw new Exception("Schema file not found. Copy backend folder to C:\\xampp\\htdocs\\backend\\");
    }

    $sql = file_get_contents($schemaFile);
    $sql = preg_replace('/^--.*$/m', '', $sql);

    $ok = $conn->multi_query($sql);
    if ($ok) {
        do {
            if ($r = $conn->store_result()) $r->free();
        } while ($conn->more_results() && $conn->next_result());
    }

    $err = $conn->error;
    $conn->close();

    if ($err) {
        throw new Exception("SQL error: " . $err);
    }

    echo json_encode([
        'success' => true,
        'message' => 'New database created successfully with all tables and data.',
        'database' => DB_NAME,
        'login' => 'http://localhost:5175/admin (admin / admin123)',
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
    ]);
}
