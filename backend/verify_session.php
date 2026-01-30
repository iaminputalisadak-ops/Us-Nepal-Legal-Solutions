<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['token'])) {
    sendResponse(false, 'Token is required');
}

$token = $input['token'];
$conn = getDBConnection();

// Verify session token
$stmt = $conn->prepare("
    SELECT a.id, a.username, a.email, a.full_name, s.expires_at 
    FROM admin_sessions s
    INNER JOIN admins a ON s.admin_id = a.id
    WHERE s.session_token = ? AND s.expires_at > NOW() AND a.is_active = 1
");

$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    sendResponse(false, 'Invalid or expired session');
}

$admin = $result->fetch_assoc();

$stmt->close();
$conn->close();

sendResponse(true, 'Session valid', [
    'admin' => [
        'id' => $admin['id'],
        'username' => $admin['username'],
        'email' => $admin['email'],
        'full_name' => $admin['full_name']
    ]
]);
