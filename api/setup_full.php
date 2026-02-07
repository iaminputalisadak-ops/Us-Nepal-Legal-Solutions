<?php
/**
 * Create NEW database with ALL tables and data.
 * Run once: http://localhost:8080/backend/setup_full.php
 *
 * Uses config.db.php for credentials (copy from config.db.php.example first).
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/config.php';

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
