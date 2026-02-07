<?php
require_once __DIR__ . '/config.php';
$conn = getDBConnection();
ensureAdminTables($conn);
$sqlFile = __DIR__ . '/data_seed.sql';
$sql = file_get_contents($sqlFile);
$sql = preg_replace('/^--.*$/m', '', $sql);
$ok = $conn->multi_query($sql);
if ($ok) {
    do {
        if ($r = $conn->store_result()) $r->free();
    } while ($conn->more_results() && $conn->next_result());
}
echo ($ok || !$conn->error) ? "OK: Data imported.\n" : "Error: " . $conn->error . "\n";
$conn->close();
