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

function looksLikeUrl($value) {
    if (!is_string($value)) return false;
    $v = trim($value);
    if ($v === '') return false;
    // Accept absolute and site-relative URLs
    return preg_match('#^(https?://|/)#i', $v) === 1;
}

$method = $_SERVER['REQUEST_METHOD'];

// GET - Public endpoint (no auth required)
if ($method === 'GET') {
    $conn = getDBConnection();
    try {
        $stmt = $conn->prepare("SELECT setting_key, setting_value, setting_type FROM site_settings");
        $stmt->execute();
        $result = $stmt->get_result();
        $settings = [];
        
        while ($row = $result->fetch_assoc()) {
            $key = $row['setting_key'];
            $settings[$key] = $row['setting_value'];
        }
        
        $stmt->close();
        $conn->close();
        sendResponse(true, 'Settings retrieved successfully', $settings);
    } catch (Exception $e) {
        $conn->close();
        sendResponse(false, 'Error retrieving settings: ' . $e->getMessage());
    }
}

// POST/PUT - Upsert settings (requires auth)
if ($method === 'POST' || $method === 'PUT') {
    $conn = verifyAdminSession();
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) $input = [];
    
    $settings = $input['settings'] ?? $input;
    if (!is_array($settings)) {
        $conn->close();
        sendResponse(false, 'Invalid payload. Expected JSON object or { settings: {...} }');
    }
    
    // Remove auth keys
    unset($settings['token']);
    unset($settings['id']);
    unset($settings['settings']);
    
    if (count($settings) === 0) {
        $conn->close();
        sendResponse(false, 'No settings provided');
    }
    
    try {
        $stmt = $conn->prepare("
            INSERT INTO site_settings (setting_key, setting_value, setting_type)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
              setting_value = VALUES(setting_value),
              setting_type = VALUES(setting_type),
              updated_at = CURRENT_TIMESTAMP
        ");
        
        foreach ($settings as $key => $value) {
            if (!is_string($key) || trim($key) === '') continue;
            // Only allow safe key names (alphanumeric + underscore)
            if (!preg_match('/^[a-zA-Z0-9_]+$/', trim($key))) continue;
            if (is_array($value) || is_object($value)) {
                // Store structured values as JSON
                $value = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                $type = 'json';
            } else {
                $value = $value === null ? '' : (string)$value;
                $type = looksLikeUrl($value) ? 'url' : 'text';
            }
            
            $k = trim($key);
            $stmt->bind_param("sss", $k, $value, $type);
            $stmt->execute();
        }
        
        $stmt->close();
        $conn->close();
        sendResponse(true, 'Settings saved successfully');
    } catch (Exception $e) {
        $conn->close();
        sendResponse(false, 'Error saving settings: ' . $e->getMessage());
    }
}

// DELETE - Remove one or multiple keys (requires auth)
if ($method === 'DELETE') {
    $conn = verifyAdminSession();
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) $input = [];
    
    $key = $input['key'] ?? null;
    $keys = $input['keys'] ?? null;
    
    if ($key && !is_array($keys)) $keys = [$key];
    if (!is_array($keys) || count($keys) === 0) {
        $conn->close();
        sendResponse(false, 'Provide key or keys[] to delete');
    }
    
    try {
        $stmt = $conn->prepare("DELETE FROM site_settings WHERE setting_key = ?");
        foreach ($keys as $k) {
            $k = trim((string)$k);
            if ($k === '' || !preg_match('/^[a-zA-Z0-9_]+$/', $k)) continue;
            $stmt->bind_param("s", $k);
            $stmt->execute();
        }
        $stmt->close();
        $conn->close();
        sendResponse(true, 'Settings deleted successfully');
    } catch (Exception $e) {
        $conn->close();
        sendResponse(false, 'Error deleting settings: ' . $e->getMessage());
    }
}

sendResponse(false, 'Invalid request method');

