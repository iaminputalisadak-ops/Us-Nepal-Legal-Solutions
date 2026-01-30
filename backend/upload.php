<?php
require_once 'config.php';

// Allow preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

// Auth (token from Bearer or token field)
$headers = getallheaders();
$token = null;
if (isset($headers['Authorization'])) {
    $token = str_replace('Bearer ', '', $headers['Authorization']);
}
if (!$token && isset($_POST['token'])) $token = $_POST['token'];
if (!$token) {
    $input = json_decode(file_get_contents('php://input'), true);
    $token = $input['token'] ?? null;
}
if (!$token) sendResponse(false, 'Authentication required');

$conn = getDBConnection();
$stmt = $conn->prepare("SELECT admin_id FROM admin_sessions WHERE session_token = ? AND expires_at > NOW()");
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    $stmt->close();
    $conn->close();
    sendResponse(false, 'Invalid or expired session');
}
$stmt->close();
$conn->close();

if (!isset($_FILES['image'])) {
    sendResponse(false, 'No file uploaded (field name must be \"image\")');
}

$file = $_FILES['image'];
if ($file['error'] !== UPLOAD_ERR_OK) {
    sendResponse(false, 'Upload error code: ' . $file['error']);
}

// Basic limits
$maxBytes = 6 * 1024 * 1024; // 6MB
if ($file['size'] > $maxBytes) {
    sendResponse(false, 'File too large (max 6MB)');
}

// Validate file type
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);
$allowed = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/gif'  => 'gif',
    'image/webp' => 'webp',
    'image/svg+xml' => 'svg',
    // Favicons
    'image/x-icon' => 'ico',
    'image/vnd.microsoft.icon' => 'ico',
];
if (!isset($allowed[$mime])) {
    sendResponse(false, 'Unsupported file type: ' . $mime);
}
$ext = $allowed[$mime];

// Store uploads in a persistent folder so files don't disappear when backend code is updated.
// Prefer: <xampp>/htdocs/us-nepal-legal-uploads (served by Apache)
// Fallback: backend/uploads (same folder as this script)
$docRoot = rtrim((string)($_SERVER['DOCUMENT_ROOT'] ?? ''), "/\\");
$uploadsDir = $docRoot
    ? ($docRoot . DIRECTORY_SEPARATOR . 'us-nepal-legal-uploads')
    : (__DIR__ . DIRECTORY_SEPARATOR . 'uploads');
if (!is_dir($uploadsDir)) {
    mkdir($uploadsDir, 0755, true);
}

// Prevent PHP execution in uploads
$htaccessPath = $uploadsDir . DIRECTORY_SEPARATOR . '.htaccess';
if (!file_exists($htaccessPath)) {
    file_put_contents($htaccessPath, "php_flag engine off\nRemoveHandler .php .phtml .php3 .php4 .php5 .php7 .phps\n");
}

$safeName = bin2hex(random_bytes(16)) . '.' . $ext;
$destPath = $uploadsDir . DIRECTORY_SEPARATOR . $safeName;

if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    sendResponse(false, 'Failed to save uploaded file');
}

// Return a URL that works through the Vite proxy in dev (and stays stable)
$url = '/api/uploads/' . $safeName;
sendResponse(true, 'Upload successful', [
    'url' => $url,
    'filename' => $safeName,
    'mime' => $mime,
    'bytes' => $file['size']
]);

