<?php
require_once 'config.php';

// Verify admin session
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

$ensureLawyerImageColumns = function($conn) {
    try {
        $cols = [];
        $res = $conn->query("SHOW COLUMNS FROM lawyers");
        if ($res) {
            while ($row = $res->fetch_assoc()) {
                $cols[strtolower($row['Field'])] = true;
            }
        }
        if (!isset($cols['image_fit'])) {
            $conn->query("ALTER TABLE lawyers ADD COLUMN image_fit VARCHAR(20) DEFAULT 'cover'");
        }
        if (!isset($cols['image_position'])) {
            $conn->query("ALTER TABLE lawyers ADD COLUMN image_position VARCHAR(50) DEFAULT '50% 25%'");
        }
    } catch (Exception $e) {
        // ignore
    }
};

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDBConnection();

if ($method === 'GET') {
    // Public endpoint - get all active lawyers (no authentication required)
    try {
        $ensureLawyerImageColumns($conn);
        $stmt = $conn->prepare("
            SELECT id, name, role, focus, image_url, image_fit, image_position, bio, email, phone, 
                   education, experience, specializations, bar_associations
            FROM lawyers 
            WHERE is_active = 1 
            ORDER BY display_order ASC, name ASC
        ");
        $stmt->execute();
        $result = $stmt->get_result();
        $lawyers = [];
        
        while ($row = $result->fetch_assoc()) {
            $lawyers[] = $row;
        }
        
        $stmt->close();
        $conn->close();
        
        sendResponse(true, 'Lawyers retrieved successfully', $lawyers);
    } catch (Exception $e) {
        $conn->close();
        sendResponse(false, 'Error retrieving lawyers: ' . $e->getMessage());
    }
    
} elseif ($method === 'POST') {
    // Create new lawyer - requires admin authentication
    $conn = verifyAdminSession();
    $ensureLawyerImageColumns($conn);
    $input = json_decode(file_get_contents('php://input'), true);
    
    $name = $input['name'] ?? '';
    $role = $input['role'] ?? '';
    $focus = $input['focus'] ?? '';
    $image_url = $input['image_url'] ?? '';
    $image_fit = $input['image_fit'] ?? 'cover';
    $image_position = $input['image_position'] ?? '50% 25%';
    $bio = $input['bio'] ?? '';
    $email = $input['email'] ?? '';
    $phone = $input['phone'] ?? '';
    $education = $input['education'] ?? '';
    $experience = $input['experience'] ?? '';
    $specializations = $input['specializations'] ?? '';
    $bar_associations = $input['bar_associations'] ?? '';
    $display_order = $input['display_order'] ?? 0;
    $is_active = $input['is_active'] ?? 1;
    
    if (empty($name) || empty($role)) {
        sendResponse(false, 'Name and role are required');
    }
    
    $stmt = $conn->prepare("
        INSERT INTO lawyers (name, role, focus, image_url, image_fit, image_position, bio, email, phone, 
                           education, experience, specializations, bar_associations, 
                           display_order, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    // 13 strings + 2 ints
    $stmt->bind_param("sssssssssssssii", $name, $role, $focus, $image_url, $image_fit, $image_position, $bio, 
                     $email, $phone, $education, $experience, $specializations, 
                     $bar_associations, $display_order, $is_active);
    
    if ($stmt->execute()) {
        $lawyerId = $conn->insert_id;
        $stmt->close();
        $conn->close();
        sendResponse(true, 'Lawyer added successfully', ['id' => $lawyerId]);
    } else {
        $stmt->close();
        $conn->close();
        sendResponse(false, 'Failed to add lawyer');
    }
    
} elseif ($method === 'PUT') {
    // Update lawyer - requires admin authentication
    $conn = verifyAdminSession();
    $ensureLawyerImageColumns($conn);
    $input = json_decode(file_get_contents('php://input'), true);
    
    $id = $input['id'] ?? 0;
    if (!$id) {
        sendResponse(false, 'Lawyer ID is required');
    }
    
    $name = $input['name'] ?? '';
    $role = $input['role'] ?? '';
    $focus = $input['focus'] ?? '';
    $image_url = $input['image_url'] ?? '';
    $image_fit = $input['image_fit'] ?? 'cover';
    $image_position = $input['image_position'] ?? '50% 25%';
    $bio = $input['bio'] ?? '';
    $email = $input['email'] ?? '';
    $phone = $input['phone'] ?? '';
    $education = $input['education'] ?? '';
    $experience = $input['experience'] ?? '';
    $specializations = $input['specializations'] ?? '';
    $bar_associations = $input['bar_associations'] ?? '';
    $display_order = $input['display_order'] ?? 0;
    $is_active = $input['is_active'] ?? 1;
    
    if (empty($name) || empty($role)) {
        sendResponse(false, 'Name and role are required');
    }
    
    $stmt = $conn->prepare("
        UPDATE lawyers 
        SET name = ?, role = ?, focus = ?, image_url = ?, image_fit = ?, image_position = ?, bio = ?, 
            email = ?, phone = ?, education = ?, experience = ?, 
            specializations = ?, bar_associations = ?, display_order = ?, 
            is_active = ?
        WHERE id = ?
    ");
    
    // 13 strings + 3 ints
    $stmt->bind_param("sssssssssssssiii", $name, $role, $focus, $image_url, $image_fit, $image_position, $bio, 
                     $email, $phone, $education, $experience, $specializations, 
                     $bar_associations, $display_order, $is_active, $id);
    
    if ($stmt->execute()) {
        $stmt->close();
        $conn->close();
        sendResponse(true, 'Lawyer updated successfully');
    } else {
        $stmt->close();
        $conn->close();
        sendResponse(false, 'Failed to update lawyer');
    }
    
} elseif ($method === 'DELETE') {
    // Delete lawyer - requires admin authentication
    $conn = verifyAdminSession();
    $input = json_decode(file_get_contents('php://input'), true);
    
    $id = $input['id'] ?? 0;
    if (!$id) {
        sendResponse(false, 'Lawyer ID is required');
    }
    
    $stmt = $conn->prepare("DELETE FROM lawyers WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        $stmt->close();
        $conn->close();
        sendResponse(true, 'Lawyer deleted successfully');
    } else {
        $stmt->close();
        $conn->close();
        sendResponse(false, 'Failed to delete lawyer');
    }
    
} else {
    sendResponse(false, 'Invalid request method');
}
