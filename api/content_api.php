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

// Allowed content types
$allowedTypes = [
    'practice_areas', 'publications', 'client_logos', 
    'journals', 'insights', 'hero_content', 'feature_strips', 'hero_banners',
    'about_content', 'why_choose_us', 'consultation_fees', 'articles'
];

// Allowed columns per table (security: prevent SQL injection via field names)
$allowedColumns = [
    'practice_areas' => ['title', 'text', 'icon_url', 'display_order', 'is_active'],
    'publications' => ['title', 'text', 'image_url', 'display_order', 'is_active'],
    'client_logos' => ['name', 'image_url', 'website_url', 'display_order', 'is_active'],
    'journals' => ['title', 'image_url', 'description', 'display_order', 'is_active'],
    'insights' => ['title', 'text', 'image_url', 'display_order', 'is_active'],
    'hero_content' => ['eyebrow_text', 'main_title', 'description', 'button_text', 'button_link', 'slider_interval_seconds', 'background_image_url', 'background_fit', 'background_position', 'is_active'],
    'hero_banners' => ['eyebrow_text', 'main_title', 'description', 'button_text', 'button_link', 'display_order', 'background_image_url', 'background_fit', 'background_position', 'is_active'],
    'about_content' => ['title', 'text', 'image_url', 'display_order', 'is_active'],
    'why_choose_us' => ['title', 'text', 'is_active'],
    'consultation_fees' => ['title', 'text', 'is_active'],
    'feature_strips' => ['title', 'display_order', 'is_active'],
    'articles' => ['title', 'slug', 'description', 'text', 'image_url', 'display_order', 'is_active'],
];

function ensureHeroTables($conn) {
    // Create missing hero tables for older databases
    // NOTE: Uses IF NOT EXISTS so it's safe to call repeatedly.
    try {
        $conn->query("
            CREATE TABLE IF NOT EXISTS hero_content (
                id INT AUTO_INCREMENT PRIMARY KEY,
                eyebrow_text VARCHAR(200),
                main_title VARCHAR(500),
                description TEXT,
                button_text VARCHAR(200),
                button_link VARCHAR(500),
                slider_interval_seconds INT DEFAULT 6,
                background_image_url VARCHAR(500),
                background_fit VARCHAR(20) DEFAULT 'cover',
                background_position VARCHAR(50) DEFAULT 'center',
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        $conn->query("
            CREATE TABLE IF NOT EXISTS hero_banners (
                id INT AUTO_INCREMENT PRIMARY KEY,
                eyebrow_text VARCHAR(200),
                main_title VARCHAR(500),
                description TEXT,
                button_text VARCHAR(200),
                button_link VARCHAR(500),
                background_image_url VARCHAR(500),
                background_fit VARCHAR(20) DEFAULT 'cover',
                background_position VARCHAR(50) DEFAULT 'center',
                display_order INT DEFAULT 0,
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_active (is_active),
                INDEX idx_order (display_order)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    } catch (Exception $e) {
        // ignore - if DB user lacks ALTER/CREATE permissions, requests may still fail and return the error
    }
}

function ensureHeroBgColumns($conn, $table) {
    // Add per-slide background fit/position columns if missing.
    // This keeps admin saves from failing when DB was created from an older schema.
    try {
        $cols = [];
        $res = $conn->query("SHOW COLUMNS FROM {$table}");
        if ($res) {
            while ($row = $res->fetch_assoc()) {
                $cols[strtolower($row['Field'])] = true;
            }
        }
        if (!isset($cols['background_fit'])) {
            $conn->query("ALTER TABLE {$table} ADD COLUMN background_fit VARCHAR(20) DEFAULT 'cover'");
        }
        if (!isset($cols['background_position'])) {
            $conn->query("ALTER TABLE {$table} ADD COLUMN background_position VARCHAR(50) DEFAULT 'center'");
        }
        // Only hero_content needs the global slider interval
        if ($table === 'hero_content' && !isset($cols['slider_interval_seconds'])) {
            $conn->query("ALTER TABLE {$table} ADD COLUMN slider_interval_seconds INT DEFAULT 6");
        }
    } catch (Exception $e) {
        // ignore - if ALTER fails, insert/update may fail and return the error to the client
    }
}

function ensureAboutTable($conn) {
    // Create about_content table if missing (for older databases)
    try {
        $conn->query("
            CREATE TABLE IF NOT EXISTS about_content (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(300) NOT NULL,
                text TEXT NOT NULL,
                image_url VARCHAR(500),
                display_order INT DEFAULT 0,
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_active (is_active),
                INDEX idx_order (display_order)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    } catch (Exception $e) {
        // ignore - if DB user lacks ALTER/CREATE permissions, requests may still fail and return the error
    }
}

function ensureWhyChooseTable($conn) {
    // Create why_choose_us table if missing (for older databases)
    try {
        $conn->query("
            CREATE TABLE IF NOT EXISTS why_choose_us (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(300) NOT NULL,
                text TEXT NOT NULL,
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    } catch (Exception $e) {
        // ignore - if DB user lacks ALTER/CREATE permissions, requests may still fail and return the error
    }
}

function ensureConsultationFeesTable($conn) {
    // Create consultation_fees table if missing (single-row content)
    try {
        $conn->query("
            CREATE TABLE IF NOT EXISTS consultation_fees (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(300) NOT NULL,
                text TEXT NOT NULL,
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    } catch (Exception $e) {
        // ignore - if DB user lacks ALTER/CREATE permissions, requests may still fail and return the error
    }
}

function ensureArticlesTable($conn) {
    // Create articles table if missing
    try {
        $conn->query("
            CREATE TABLE IF NOT EXISTS articles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(300) NOT NULL,
                slug VARCHAR(300),
                description TEXT,
                text TEXT,
                image_url VARCHAR(500),
                display_order INT DEFAULT 0,
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_active (is_active),
                INDEX idx_order (display_order)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    } catch (Exception $e) {
        // ignore - if DB user lacks ALTER/CREATE permissions, requests may still fail and return the error
    }
}

$type = $_GET['type'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

if (!in_array($type, $allowedTypes)) {
    sendResponse(false, 'Invalid content type');
}

$conn = getDBConnection();

// GET - Public endpoint (no auth required)
if ($method === 'GET') {
    try {
        $table = $type;
        if ($type === 'hero_content' || $type === 'hero_banners') {
            ensureHeroTables($conn);
            ensureHeroBgColumns($conn, $table);
        }
        if ($type === 'about_content') {
            ensureAboutTable($conn);
        }
        if ($type === 'why_choose_us') {
            ensureWhyChooseTable($conn);
        }
        if ($type === 'consultation_fees') {
            ensureConsultationFeesTable($conn);
        }
        if ($type === 'articles') {
            ensureArticlesTable($conn);
        }
        
        // Hero content has different structure
        if ($type === 'hero_content') {
            $stmt = $conn->prepare("
                SELECT * FROM {$table} 
                WHERE is_active = 1 
                ORDER BY id DESC
                LIMIT 1
            ");
        } elseif ($type === 'consultation_fees' || $type === 'why_choose_us') {
            $stmt = $conn->prepare("
                SELECT * FROM {$table} 
                WHERE is_active = 1 
                ORDER BY id DESC
            ");
        } else {
            $stmt = $conn->prepare("
                SELECT * FROM {$table} 
                WHERE is_active = 1 
                ORDER BY display_order ASC, id ASC
            ");
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $items = [];
        
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
        
        $stmt->close();
        $conn->close();
        
        sendResponse(true, ucfirst(str_replace('_', ' ', $type)) . ' retrieved successfully', $items);
    } catch (Exception $e) {
        $conn->close();
        sendResponse(false, 'Error: ' . $e->getMessage());
    }
}

// POST - Create (requires auth)
elseif ($method === 'POST') {
    $conn = verifyAdminSession();
    $input = json_decode(file_get_contents('php://input'), true);
    
    try {
        $table = $type;
        if ($type === 'hero_content' || $type === 'hero_banners') {
            ensureHeroTables($conn);
            ensureHeroBgColumns($conn, $table);
        }
        if ($type === 'about_content') {
            ensureAboutTable($conn);
        }
        if ($type === 'why_choose_us') {
            ensureWhyChooseTable($conn);
        }
        if ($type === 'consultation_fees') {
            ensureConsultationFeesTable($conn);
        }
        if ($type === 'articles') {
            ensureArticlesTable($conn);
        }
        $fields = [];
        $values = [];
        $placeholders = [];

        // Keep hero_content as "single active" row: when inserting a new active hero,
        // deactivate old ones so the latest one is what the homepage uses.
        if ($type === 'hero_content') {
            $isActive = 1;
            if (isset($input['is_active'])) {
                $isActive = (int)$input['is_active'];
            }
            if ($isActive === 1) {
                $conn->query("UPDATE hero_content SET is_active = 0 WHERE is_active = 1");
            }
        }
        
        // Build dynamic query - whitelist columns only (security)
        $cols = $allowedColumns[$table] ?? [];
        foreach ($input as $key => $value) {
            if ($key !== 'token' && $key !== 'id' && in_array($key, $cols)) {
                $fields[] = $key;
                $values[] = $value;
                $placeholders[] = '?';
            }
        }
        
        if (empty($fields)) {
            sendResponse(false, 'No data provided');
        }
        
        $sql = "INSERT INTO {$table} (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
        $stmt = $conn->prepare($sql);
        
        $types = str_repeat('s', count($values));
        $stmt->bind_param($types, ...$values);
        
        if ($stmt->execute()) {
            $id = $conn->insert_id;
            $stmt->close();
            $conn->close();
            sendResponse(true, 'Item added successfully', ['id' => $id]);
        } else {
            $stmt->close();
            $conn->close();
            sendResponse(false, 'Failed to add item');
        }
    } catch (Exception $e) {
        $conn->close();
        sendResponse(false, 'Error: ' . $e->getMessage());
    }
}

// PUT - Update (requires auth)
elseif ($method === 'PUT') {
    $conn = verifyAdminSession();
    $input = json_decode(file_get_contents('php://input'), true);
    
    $id = $input['id'] ?? 0;
    if (!$id) {
        sendResponse(false, 'ID is required');
    }
    
    try {
        $table = $type;
        if ($type === 'hero_content' || $type === 'hero_banners') {
            ensureHeroTables($conn);
            ensureHeroBgColumns($conn, $table);
        }
        if ($type === 'about_content') {
            ensureAboutTable($conn);
        }
        if ($type === 'why_choose_us') {
            ensureWhyChooseTable($conn);
        }
        if ($type === 'consultation_fees') {
            ensureConsultationFeesTable($conn);
        }
        if ($type === 'articles') {
            ensureArticlesTable($conn);
        }
        $fields = [];
        $values = [];
        $cols = $allowedColumns[$table] ?? [];
        
        foreach ($input as $key => $value) {
            if ($key !== 'token' && $key !== 'id' && in_array($key, $cols)) {
                $fields[] = "{$key} = ?";
                $values[] = $value;
            }
        }
        
        if (empty($fields)) {
            sendResponse(false, 'No data to update');
        }
        
        $values[] = $id;
        $sql = "UPDATE {$table} SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        
        $types = str_repeat('s', count($values) - 1) . 'i';
        $stmt->bind_param($types, ...$values);
        
        if ($stmt->execute()) {
            $stmt->close();
            $conn->close();
            sendResponse(true, 'Item updated successfully');
        } else {
            $stmt->close();
            $conn->close();
            sendResponse(false, 'Failed to update item');
        }
    } catch (Exception $e) {
        $conn->close();
        sendResponse(false, 'Error: ' . $e->getMessage());
    }
}

// DELETE - Delete (requires auth)
elseif ($method === 'DELETE') {
    $conn = verifyAdminSession();
    $input = json_decode(file_get_contents('php://input'), true);
    
    $id = $input['id'] ?? 0;
    if (!$id) {
        sendResponse(false, 'ID is required');
    }
    
    try {
        $table = $type;
        if ($type === 'hero_content' || $type === 'hero_banners') {
            ensureHeroTables($conn);
        }
        if ($type === 'about_content') {
            ensureAboutTable($conn);
        }
        if ($type === 'why_choose_us') {
            ensureWhyChooseTable($conn);
        }
        if ($type === 'consultation_fees') {
            ensureConsultationFeesTable($conn);
        }
        if ($type === 'articles') {
            ensureArticlesTable($conn);
        }
        $stmt = $conn->prepare("DELETE FROM {$table} WHERE id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            $stmt->close();
            $conn->close();
            sendResponse(true, 'Item deleted successfully');
        } else {
            $stmt->close();
            $conn->close();
            sendResponse(false, 'Failed to delete item');
        }
    } catch (Exception $e) {
        $conn->close();
        sendResponse(false, 'Error: ' . $e->getMessage());
    }
} else {
    sendResponse(false, 'Invalid request method');
}
