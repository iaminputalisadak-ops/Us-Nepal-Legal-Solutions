<?php
require_once 'config.php';

// Verify admin session (same pattern as other endpoints)
function verifyAdminSession() {
    $headers = getallheaders();
    $token = null;
    
    if (isset($headers['Authorization'])) {
        $token = str_replace('Bearer ', '', $headers['Authorization']);
    } elseif (isset($_POST['token'])) {
        $token = $_POST['token'];
    } elseif (isset($_GET['token'])) {
        $token = $_GET['token'];
    }
    
    if (!$token) {
        $input = json_decode(file_get_contents('php://input'), true);
        $token = $input['token'] ?? null;
    }
    
    if (!$token) {
        sendResponse(false, 'Authentication required');
    }
    
    $conn = getDBConnection();
    $stmt = $conn->prepare("
        SELECT admin_id FROM admin_sessions 
        WHERE session_token = ? AND expires_at > NOW()
    ");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        $stmt->close();
        $conn->close();
        sendResponse(false, 'Invalid or expired session');
    }
    
    $stmt->close();
    return $conn;
}

function ensureConsultationsTable($conn) {
    // Older databases may be missing this table. Create it if needed.
    try {
        $conn->query("
            CREATE TABLE IF NOT EXISTS consultation_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                email VARCHAR(200) NOT NULL,
                phone VARCHAR(50) NOT NULL,
                appointment_date DATE NULL,
                appointment_time TIME NULL,
                about VARCHAR(500) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_created (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    } catch (Exception $e) {
        // ignore
    }
}

function readJsonBody() {
    $raw = file_get_contents('php://input');
    if (!$raw) return null;
    $data = json_decode($raw, true);
    return is_array($data) ? $data : null;
}

function cleanStr($v, $maxLen = 500) {
    $s = trim((string)$v);
    if ($maxLen > 0 && strlen($s) > $maxLen) {
        $s = substr($s, 0, $maxLen);
    }
    return $s;
}

$method = $_SERVER['REQUEST_METHOD'];

// POST - Public endpoint to submit consultation
if ($method === 'POST') {
    $input = readJsonBody();
    if (!is_array($input)) $input = $_POST;

    $name = cleanStr($input['name'] ?? '', 200);
    $email = cleanStr($input['email'] ?? '', 200);
    $phone = cleanStr($input['phone'] ?? '', 50);
    $date = cleanStr($input['date'] ?? '', 20);
    $hour = cleanStr($input['hour'] ?? '', 2);
    $minute = cleanStr($input['minute'] ?? '', 2);
    $about = cleanStr($input['about'] ?? '', 500);

    if ($name === '') sendResponse(false, 'Name is required');
    if ($email === '') sendResponse(false, 'Email is required');
    if ($phone === '') sendResponse(false, 'Phone is required');

    $appointment_date = $date ?: null;
    $appointment_time = null;
    if ($hour !== '' || $minute !== '') {
        $h = str_pad(preg_replace('/\D/', '', $hour), 2, '0', STR_PAD_LEFT);
        $m = str_pad(preg_replace('/\D/', '', $minute), 2, '0', STR_PAD_LEFT);
        if ($h !== '' && $m !== '') {
            $appointment_time = "{$h}:{$m}:00";
        }
    }

    $conn = getDBConnection();
    ensureConsultationsTable($conn);
    try {
        $stmt = $conn->prepare("
            INSERT INTO consultation_requests
              (name, email, phone, appointment_date, appointment_time, about)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        // bind nulls safely as strings
        $d = $appointment_date ?? null;
        $t = $appointment_time ?? null;
        $stmt->bind_param("ssssss", $name, $email, $phone, $d, $t, $about);
        if (!$stmt->execute()) {
            $stmt->close();
            $conn->close();
            sendResponse(false, 'Failed to submit request');
        }
        $id = $conn->insert_id;
        $stmt->close();
        $conn->close();
        sendResponse(true, 'Request submitted', ['id' => $id]);
    } catch (Exception $e) {
        $conn->close();
        sendResponse(false, 'Error: ' . $e->getMessage());
    }
}

// GET - Admin only list
if ($method === 'GET') {
    $conn = verifyAdminSession();
    ensureConsultationsTable($conn);
    try {
        $stmt = $conn->prepare("
            SELECT id, name, email, phone, appointment_date, appointment_time, about, created_at
            FROM consultation_requests
            ORDER BY created_at DESC, id DESC
        ");
        $stmt->execute();
        $result = $stmt->get_result();
        $items = [];
        while ($row = $result->fetch_assoc()) $items[] = $row;
        $stmt->close();
        $conn->close();
        sendResponse(true, 'Consultations retrieved successfully', $items);
    } catch (Exception $e) {
        $conn->close();
        sendResponse(false, 'Error retrieving consultations: ' . $e->getMessage());
    }
}

// DELETE - Admin only
if ($method === 'DELETE') {
    $conn = verifyAdminSession();
    ensureConsultationsTable($conn);
    $input = readJsonBody();
    if (!is_array($input)) $input = [];
    $id = (int)($input['id'] ?? 0);
    if (!$id) {
        $conn->close();
        sendResponse(false, 'ID is required');
    }
    try {
        $stmt = $conn->prepare("DELETE FROM consultation_requests WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $stmt->close();
        $conn->close();
        sendResponse(true, 'Deleted successfully');
    } catch (Exception $e) {
        $conn->close();
        sendResponse(false, 'Error deleting: ' . $e->getMessage());
    }
}

sendResponse(false, 'Invalid request method');

