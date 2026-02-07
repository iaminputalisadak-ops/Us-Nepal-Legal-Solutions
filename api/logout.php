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

// Delete session
$stmt = $conn->prepare("DELETE FROM admin_sessions WHERE session_token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();

$stmt->close();
$conn->close();

sendResponse(true, 'Logged out successfully');
