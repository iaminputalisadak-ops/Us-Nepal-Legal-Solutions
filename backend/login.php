<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

// Read raw request body (JSON expected)
$rawInput = file_get_contents('php://input');

// Local-only debug helper
if (
    isset($_GET['debug']) &&
    in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true)
) {
    sendResponse(true, 'Debug request body', [
        'content_type' => $_SERVER['CONTENT_TYPE'] ?? null,
        'content_length' => $_SERVER['CONTENT_LENGTH'] ?? null,
        'raw_length' => strlen($rawInput),
        'raw' => $rawInput,
    ]);
}

// Parse JSON input
$input = json_decode($rawInput, true);

// Fallback: allow form-encoded bodies too (in case client/proxy strips JSON)
if (!is_array($input)) {
    $input = $_POST;
}

if (!isset($input['username']) || !isset($input['password'])) {
    sendResponse(false, 'Username and password are required');
}

$username = trim($input['username']);
$password = $input['password'];

if (empty($username) || empty($password)) {
    sendResponse(false, 'Username and password cannot be empty');
}

$conn = getDBConnection();
ensureAdminTables($conn);

// Prepare statement to prevent SQL injection
$stmt = $conn->prepare("SELECT id, username, email, password, full_name, is_active FROM admins WHERE username = ? OR email = ?");
$stmt->bind_param("ss", $username, $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    sendResponse(false, 'Invalid username or password');
}

$admin = $result->fetch_assoc();

// Check if admin is active
if (!$admin['is_active']) {
    sendResponse(false, 'Your account has been deactivated');
}

// Verify password
if (!password_verify($password, $admin['password'])) {
    sendResponse(false, 'Invalid username or password');
}

// Generate session token
$sessionToken = bin2hex(random_bytes(32));
$expiresAt = date('Y-m-d H:i:s', time() + SESSION_LIFETIME);
$ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';

// Store session in database
$stmt = $conn->prepare("INSERT INTO admin_sessions (admin_id, session_token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("issss", $admin['id'], $sessionToken, $ipAddress, $userAgent, $expiresAt);
$stmt->execute();

// Update last login
$updateStmt = $conn->prepare("UPDATE admins SET last_login = NOW() WHERE id = ?");
$updateStmt->bind_param("i", $admin['id']);
$updateStmt->execute();

// Clean up expired sessions
$conn->query("DELETE FROM admin_sessions WHERE expires_at < NOW()");

$stmt->close();
$updateStmt->close();
$conn->close();

// Return success with session token
sendResponse(true, 'Login successful', [
    'token' => $sessionToken,
    'admin' => [
        'id' => $admin['id'],
        'username' => $admin['username'],
        'email' => $admin['email'],
        'full_name' => $admin['full_name']
    ]
]);
