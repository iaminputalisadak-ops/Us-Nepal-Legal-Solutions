<?php
/**
 * One-click database seed - imports default data into empty tables.
 * Run once: http://localhost:8080/backend/run_seed.php
 * Delete this file after use for security.
 */
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$conn = getDBConnection();
ensureAdminTables($conn);

$sqlFile = file_exists(__DIR__ . '/data_seed.sql')
    ? __DIR__ . '/data_seed.sql'
    : dirname(__DIR__) . '/database/data_seed.sql';
if (!file_exists($sqlFile)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'data_seed.sql not found. Path: ' . $sqlFile]);
    exit;
}

$sql = file_get_contents($sqlFile);
$sql = preg_replace('/^--.*$/m', '', $sql);
$sql = preg_replace('/^USE\s+\w+;?\s*/i', '', $sql);

$ok = $conn->multi_query($sql);
if ($ok) {
    do {
        if ($result = $conn->store_result()) $result->free();
    } while ($conn->more_results() && $conn->next_result());
}

$err = $conn->error;
$conn->close();

if ($ok || empty($err)) {
    echo json_encode([
        'success' => true,
        'message' => 'Data imported successfully.',
        'hint' => 'Login at /admin with admin / admin123. Consider deleting run_seed.php after use.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Import failed: ' . $err
    ]);
}
