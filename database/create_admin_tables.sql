-- Create admins and admin_sessions tables in us_nepal_legal_db
-- Run this in phpMyAdmin: select us_nepal_legal_db, then Import or paste in SQL tab

USE us_nepal_legal_db;

-- Drop if exists (optional - remove if you want to keep existing data)
DROP TABLE IF EXISTS admin_sessions;
DROP TABLE IF EXISTS admins;

-- Admins table
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin sessions table
CREATE TABLE admin_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
    INDEX idx_token (session_token),
    INDEX idx_admin (admin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default admin (password: admin123)
INSERT INTO admins (username, email, password, full_name) VALUES
('admin', 'admin@usnepallegal.com', '$2y$10$eqF05ovfu/oqXjr.Rqqi6.jHoVC90PibiLvUV/P1BKJWlL5AodB2K', 'Administrator');
